# Restore — MailChat (Postgres + GPG)

- **Issue:** [#22](https://github.com/Regimarcilio/trilhajr-app/issues/22)
- **Requisitos:** SR-38, ST-30
- **Status deste documento:** procedimento de **preparação**. Nenhum restore foi
  executado em produção. O primeiro ensaio deve ser feito em ambiente isolado e
  registrado na tabela §8.
- **RPO/RTO alvo (a aprovar):** RPO 24 h (backup diário) · RTO 2 h.
  Ajuste após o primeiro ensaio cronometrado.

> ⚠️ O dump contém metadados de e-mail, auditoria e tokens **cifrados**.
> A chave privada GPG do backup é separada da `TOKEN_ENCRYPTION_KEY`.
> Sem a `TOKEN_ENCRYPTION_KEY` original, os `refresh_token` restaurados são
> inutilizáveis (os usuários precisam reconectar) — isso é esperado e não é
> corrupção do backup.

## 1. Pré-requisitos

- Backup `.dump.gpg` recente + `.sha256` + `.meta` (gerados por `backup.sh`).
- **Chave privada GPG** de descriptografia, custodiada offline (HSM, cofre ou
  mídia física). Nunca armazenar no servidor de produção.
- Docker/Compose no host de restore **ou** `postgresql-client-18` + servidor
  Postgres limpo. A versão do `pg_restore` deve ser >= versão do servidor.
- `TOKEN_ENCRYPTION_KEY` e `SESSION_SECRET` originais, se for validar a
  aplicação após o restore (não são necessárias para validar o dump).
- Aprovação explícita e registro de data/responsável.

## 2. Selecionar e verificar o arquivo

No host de restore, defina apenas caminhos (sem credenciais):

```bash
export BACKUP_DIR=/var/backups/mailchat
export BACKUP_FILE="$BACKUP_DIR/mailchat-20261116T031500Z.dump.gpg"

cat "${BACKUP_FILE}.meta"
# created_at=... size_bytes=... sha256=...
```

Confira o checksum **antes** de descriptografar:

```bash
cd "$BACKUP_DIR"
sha256sum -c "$(basename "$BACKUP_FILE").sha256"
# esperado: mailchat-....dump.gpg: OK
```

Abortar se o checksum falhar. Não sobrescrever o backup com falha.

## 3. Descriptografar em área temporária

Use um `GNUPGHOME` isolado e temporário; importe a chave privada a partir da
mídia offline (não copie a chave para o repositório nem para `/tmp` sem
permissão restrita):

```bash
export RESTORE_TMP
RESTORE_TMP=$(mktemp -d /tmp/mailchat-restore.XXXXXX)
chmod 700 "$RESTORE_TMP"
export GNUPGHOME="$RESTORE_TMP/gnupg"
install -d -m 700 "$GNUPGHOME"

gpg --import /caminho/offline/mailchat-backup-private.asc
gpg --batch --yes --trust-model always \
  --output "$RESTORE_TMP/dump.pgsql" \
  --decrypt "$BACKUP_FILE"
chmod 600 "$RESTORE_TMP/dump.pgsql"
```

Valide a estrutura antes de tocar em qualquer banco:

```bash
pg_restore --list "$RESTORE_TMP/dump.pgsql" | sed -n '1,40p'
```

## 4. Provisionar ambiente limpo e isolado

Nunca restaure direto em produção e **não use `compose.prod.yml`** para isso:
o volume `mailchat-pgdata` tem nome fixo e seria reutilizado. Use container,
volume e porta dedicados (ex.: 55432), publicados apenas em loopback:

```bash
cd /caminho/para/email-whatsapp/infra

export RESTORE_DB=mailchat_restore
export RESTORE_PORT=55432
export RESTORE_VOLUME=mailchat-restore-pgdata
export RESTORE_ENV="$PWD/.env.restore"   # 0600; não versionar

umask 077
cat > "$RESTORE_ENV" <<'EOF'
POSTGRES_DB=mailchat_restore
POSTGRES_USER=mailchat_owner
POSTGRES_PASSWORD=__TROQUE_POR_SENHA_FORTE__
POSTGRES_HOST_AUTH_METHOD=scram-sha-256
MAILCHAT_APP_USER=mailchat_app
MAILCHAT_APP_PASSWORD=__TROQUE_POR_OUTRA_SENHA_FORTE__
EOF
chmod 600 "$RESTORE_ENV"

docker volume create "$RESTORE_VOLUME"
docker run -d --name mailchat-restore-db \
  --env-file "$RESTORE_ENV" \
  -p "127.0.0.1:${RESTORE_PORT}:5432" \
  -v "${RESTORE_VOLUME}:/var/lib/postgresql" \
  -v "$PWD/postgres/init:/docker-entrypoint-initdb.d:ro" \
  postgres:18-alpine

until docker exec mailchat-restore-db \
  pg_isready -U mailchat_owner -d mailchat_restore >/dev/null 2>&1; do
  sleep 1
done
```

O init script cria `mailchat_app` apenas no primeiro boot do volume novo.

Alternativa nativa (banco já provisionado, com os papéis criados):

```bash
createdb -h 127.0.0.1 -p 55432 -U mailchat_owner "$RESTORE_DB"
```

## 5. Restaurar

Com o banco limpo (sem schema/tabelas):

```bash
# Opção A — pg_restore no host (cliente 18+)
pg_restore \
  --host 127.0.0.1 --port 55432 --username mailchat_owner \
  --dbname "$RESTORE_DB" \
  --no-owner --no-privileges --exit-on-error \
  "$RESTORE_TMP/dump.pgsql"

# Opção B — dentro do container de restore dedicado
docker exec -i mailchat-restore-db \
  pg_restore -U mailchat_owner -d mailchat_restore \
  --no-owner --no-privileges --exit-on-error < "$RESTORE_TMP/dump.pgsql"
```

`--no-owner --no-privileges` é intencional: os papéis são recriados pelo
bootstrap (`postgres/init/10-app-role.sh`) e as permissões padrão do owner são
reaplicadas aos objetos restaurados.

## 6. Validar integridade

Execute como owner/administrador do banco de restore:

```sql
-- Objetos esperados do F0
\dt
SELECT count(*) AS migrations FROM drizzle.__drizzle_migrations;

-- Contagens por tabela F0 (compare com o .meta/expectativa do dia)
SELECT 'users' AS t, count(*) FROM users
UNION ALL SELECT 'sessions', count(*) FROM sessions
UNION ALL SELECT 'connected_accounts', count(*) FROM connected_accounts
UNION ALL SELECT 'oauth_tokens', count(*) FROM oauth_tokens
UNION ALL SELECT 'sync_state', count(*) FROM sync_state;

-- Tokens continuam cifrados (sem ciphertext/IV/tag vazios)
SELECT count(*) FROM oauth_tokens
WHERE refresh_ciphertext IS NULL OR refresh_iv IS NULL OR refresh_tag IS NULL;

-- F2/F4: quando threads/audit_log existirem, validar user_id/isolation.
```

Checklist objetivo:

- [ ] `pg_restore --exit-on-error` terminou com exit 0.
- [ ] As 5 tabelas do schema F0 existem.
- [ ] `__drizzle_migrations` contém a(s) migration(ões) aplicadas.
- [ ] Contagens compatíveis com o período do backup (sem tabelas vazias
      inesperadas).
- [ ] `oauth_tokens` só contém ciphertext/IV/tag (sem token em claro).
- [ ] (F2/F4) Nenhuma query retornou `user_id NULL` em tabelas de domínio.
- [ ] Aplicação sobe apontando para o restore e responde `/health` (sem
      reutilizar credenciais de produção).
- [ ] Com as chaves originais, um token de teste descriptografa (quando houver
      conta de teste); sem as chaves, registrar a limitação.

## 7. Smoke test da aplicação no restore (isolado)

```bash
# Use um env de restore próprio; porta loopback alternativa.
NODE_ENV=production HOST=127.0.0.1 PORT=18787 \
DATABASE_URL='postgres://mailchat_app:<senha-do-restore>@127.0.0.1:55432/mailchat_restore' \
node dist/index.js
```

```bash
curl -fsS http://127.0.0.1:18787/health
# {"status":"ok"}
```

Não aponte o frontend/`mailchat.service` (3100) para o restore.

## 8. Registro de evidência (obrigatório)

| Data | Backup (arquivo) | SHA-256 | Responsável | Ambiente | Resultado | Tempo |
|---|---|---|---|---|---|---|
| _pendente_ | _pendente_ | _pendente_ | _pendente_ | _isolado_ | _pendente_ | _pendente_ |

O teste de restore trimestral (checklist §4) deve atualizar esta tabela e o
`docs/dev-log.md`.

## 9. Limpeza

```bash
gpgconf --kill gpg-agent || true
rm -rf -- "$RESTORE_TMP"
docker rm -f mailchat-restore-db || true
docker volume rm "${RESTORE_VOLUME:-mailchat-restore-pgdata}" || true
rm -f "${RESTORE_ENV:-$PWD/.env.restore}"
```

Confirme que o dump em claro foi removido (`ls "$RESTORE_TMP"` deve falhar), que
o container/volume de restore foi destruído e que o `.env.restore` sumiu. A
chave privada permanece somente na custódia offline. **Nunca** rode
`docker compose -f compose.prod.yml down -v` para limpar o restore: o volume de
produção tem nome fixo.

## 10. Falhas comuns

| Sintoma | Causa provável | Ação |
|---|---|---|
| `sha256sum: FAILED` | arquivo corrompido/truncado | descartar e usar backup anterior; investigar disco/rede |
| `gpg: decryption failed` | chave privada errada ou backup de outro keyring | localizar a chave correta na custódia |
| `pg_restore: unsupported version` | cliente mais antigo que o servidor | usar `postgres:18-alpine`/cliente 18 |
| `role "mailchat_app" does not exist` | restore sem bootstrap de papéis | rodar §5.2 do runbook ou criar papel antes |
| `permission denied for schema public` | restore como usuário sem privilégio | usar owner/administrador no restore |
| Aplicação sobe mas tokens falham | `TOKEN_ENCRYPTION_KEY` diferente | usar a chave original ou aceitar reconexão |

## 11. O que este documento NÃO faz

- Não executa restore, não cria banco, não descriptografa nada neste momento.
- Não define o destino offsite (pendência do usuário no runbook).
- Não substitui o teste trimestral real com evidência datada.
