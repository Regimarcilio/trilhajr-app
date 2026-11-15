#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# MailChat — backup criptografado do Postgres (pg_dump custom + GPG)
#
# Uso:
#   sudo BACKUP_GPG_RECIPIENT=ops@example.com ./backup.sh
#   sudo ./backup.sh --check     # valida dependências/config sem tocar no banco
#
# Variáveis (ver backup.env.example):
#   BACKUP_DIR                destino local (default /var/backups/mailchat)
#   BACKUP_RETENTION_DAYS     retenção em dias (default 14)
#   BACKUP_GPG_RECIPIENT      destinatário da chave pública GPG (obrigatório)
#   BACKUP_COMPOSE_FILE       compose de produção
#   BACKUP_COMPOSE_ENV_FILE   .env de interpolação do Compose (0600; opcional)
#   BACKUP_DB_SERVICE         serviço Postgres no compose (default postgres)
#   BACKUP_MODE               docker (default) | host
#   BACKUP_TEXTFILE_DIR       diretório do node_exporter textfile collector
#   DATABASE_URL              obrigatório apenas no modo host
#
# Garantias:
#   - senha do banco nunca aparece em argv/log (modo docker usa env do container).
#   - dump em texto claro existe só em tmpfs/tmp com umask 077 e é apagado no exit.
#   - verificação estrutural (`pg_restore --list`) antes de criptografar.
#   - checksum SHA-256 do arquivo criptografado + metadados.
#   - retenção só é aplicada após sucesso.
#   - métricas textfile para alertas de backup atrasado/falho.
# ─────────────────────────────────────────────────────────────────────────────
set -Eeuo pipefail

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
DEFAULT_COMPOSE="${SCRIPT_DIR}/../compose.prod.yml"

COMPOSE_FILE=${BACKUP_COMPOSE_FILE:-$DEFAULT_COMPOSE}
COMPOSE_ENV_FILE=${BACKUP_COMPOSE_ENV_FILE:-}
DB_SERVICE=${BACKUP_DB_SERVICE:-postgres}
BACKUP_DIR=${BACKUP_DIR:-/var/backups/mailchat}
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-14}
GPG_RECIPIENT=${BACKUP_GPG_RECIPIENT:-}
TEXTFILE_DIR=${BACKUP_TEXTFILE_DIR:-}
MODE=${BACKUP_MODE:-docker}
PREFIX=mailchat

TMP_DIR=""
FINAL_TS=0
FINAL_SIZE=0
FINAL_DURATION=0

umask 077

log() {
    printf '%s %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*" >&2
}

die() {
    log "ERRO: $*"
    exit "${2:-1}"
}

usage() {
    sed -n '2,32p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
}

need() {
    command -v "$1" >/dev/null 2>&1 || die "comando ausente: $1" 2
}

write_metrics() {
    local rc=$1
    [ -n "$TEXTFILE_DIR" ] || return 0
    if [ ! -d "$TEXTFILE_DIR" ]; then
        install -d -m 0755 "$TEXTFILE_DIR" 2>/dev/null || true
    fi
    if [ ! -d "$TEXTFILE_DIR" ] || [ ! -w "$TEXTFILE_DIR" ]; then
        log "AVISO: textfile collector indisponível em ${TEXTFILE_DIR}"
        return 0
    fi
    # Métricas não contêm segredo; 0644/0755 permite leitura pelo node_exporter.
    chmod 0755 "$TEXTFILE_DIR" 2>/dev/null || true

    # Status é sempre atualizado; o arquivo de sucesso só é reescrito em caso de
    # sucesso, para que `MailchatBackupStale` continue calculável após uma falha.
    local status_tmp
    status_tmp=$(mktemp "${TEXTFILE_DIR}/.mailchat-backup-status.XXXXXX") || return 0
    {
        echo '# HELP mailchat_backup_last_exit_code Código de saída do último backup (0 = sucesso).'
        echo '# TYPE mailchat_backup_last_exit_code gauge'
        echo "mailchat_backup_last_exit_code ${rc}"
    } >"$status_tmp"
    mv -f "$status_tmp" "${TEXTFILE_DIR}/mailchat-backup-status.prom"
    chmod 0644 "${TEXTFILE_DIR}/mailchat-backup-status.prom" 2>/dev/null || true

    if [ "$rc" -eq 0 ] && [ "$FINAL_TS" -ne 0 ]; then
        local success_tmp
        success_tmp=$(mktemp "${TEXTFILE_DIR}/.mailchat-backup.XXXXXX") || return 0
        {
            echo '# HELP mailchat_backup_last_success_timestamp_seconds Unix timestamp do último backup concluído.'
            echo '# TYPE mailchat_backup_last_success_timestamp_seconds gauge'
            echo "mailchat_backup_last_success_timestamp_seconds ${FINAL_TS}"
            echo '# HELP mailchat_backup_size_bytes Tamanho do último arquivo criptografado.'
            echo '# TYPE mailchat_backup_size_bytes gauge'
            echo "mailchat_backup_size_bytes ${FINAL_SIZE}"
            echo '# HELP mailchat_backup_duration_seconds Duração do último backup.'
            echo '# TYPE mailchat_backup_duration_seconds gauge'
            echo "mailchat_backup_duration_seconds ${FINAL_DURATION}"
        } >"$success_tmp"
        mv -f "$success_tmp" "${TEXTFILE_DIR}/mailchat-backup.prom"
        chmod 0644 "${TEXTFILE_DIR}/mailchat-backup.prom" 2>/dev/null || true
    fi
}

on_exit() {
    local rc=$?
    trap - EXIT
    if [ -n "$TMP_DIR" ] && [ -d "$TMP_DIR" ]; then
        rm -rf -- "$TMP_DIR"
    fi
    write_metrics "$rc" || true
    exit "$rc"
}

trap on_exit EXIT

case "${1:-}" in
    --check)
        CHECK_ONLY=true
        ;;
    -h | --help)
        usage
        exit 0
        ;;
    "")
        CHECK_ONLY=false
        ;;
    *)
        die "argumento desconhecido: $1 (use --help)" 2
        ;;
esac

case "$MODE" in
    docker | host) ;;
    *) die "BACKUP_MODE inválido: $MODE (use docker|host)" 2 ;;
esac

[ -n "$GPG_RECIPIENT" ] || die "BACKUP_GPG_RECIPIENT não definido" 2
[ -r "$COMPOSE_FILE" ] || die "compose não encontrado/legível: $COMPOSE_FILE" 2
if [ "$CHECK_ONLY" = false ] && [ -n "$COMPOSE_ENV_FILE" ] && [ ! -r "$COMPOSE_ENV_FILE" ]; then
    die "env do Compose não encontrado/legível: $COMPOSE_ENV_FILE" 2
fi
if ! [ "$RETENTION_DAYS" -ge 1 ] 2>/dev/null; then
    die "BACKUP_RETENTION_DAYS inválido: $RETENTION_DAYS" 2
fi

need flock
need gpg
need sha256sum
need stat
need find
need mktemp
need date

if [ "$MODE" = docker ]; then
    need docker
else
    need pg_dump
    need pg_restore
fi

# ── Modo verificação (offline) ─────────────────────────────────────────────
if [ "$CHECK_ONLY" = true ]; then
    if ! gpg --batch --list-keys "$GPG_RECIPIENT" >/dev/null 2>&1; then
        log "AVISO: chave pública '${GPG_RECIPIENT}' ausente do keyring (importe antes do 1º backup)."
    fi
    if [ ! -d "$BACKUP_DIR" ]; then
        log "AVISO: BACKUP_DIR ainda não existe: ${BACKUP_DIR}"
    fi
    if [ -n "$COMPOSE_ENV_FILE" ] && [ ! -r "$COMPOSE_ENV_FILE" ]; then
        log "AVISO: BACKUP_COMPOSE_ENV_FILE não legível: ${COMPOSE_ENV_FILE}"
    fi
    log "check OK (modo=${MODE}, destino=${BACKUP_DIR}, retenção=${RETENTION_DAYS}d)"
    exit 0
fi

# ── Pré-condições de execução ──────────────────────────────────────────────
[ -d "$BACKUP_DIR" ] || die "diretório de backup não existe: $BACKUP_DIR (crie com 0700)" 2
[ -w "$BACKUP_DIR" ] || die "sem permissão de escrita em: $BACKUP_DIR" 2

LOCK_FILE="${BACKUP_DIR}/.${PREFIX}-backup.lock"
exec 9>"$LOCK_FILE"
flock -n 9 || die "outro backup já está em execução" 6

if [ -n "$COMPOSE_ENV_FILE" ]; then
    COMPOSE=(docker compose --env-file "$COMPOSE_ENV_FILE" -f "$COMPOSE_FILE")
else
    COMPOSE=(docker compose -f "$COMPOSE_FILE")
fi

TMP_DIR=$(mktemp -d "${TMPDIR:-/tmp}/${PREFIX}-backup.XXXXXX")
DUMP_FILE="${TMP_DIR}/dump.pgsql"

START_EPOCH=$(date +%s)
TS=$(date -u +%Y%m%dT%H%M%SZ)
BASE="${PREFIX}-${TS}"
ENC_FILE="${BACKUP_DIR}/${BASE}.dump.gpg"

log "iniciando backup ${BASE} (modo=${MODE})"

# ── Dump ────────────────────────────────────────────────────────────────────
if [ "$MODE" = docker ]; then
    "${COMPOSE[@]}" exec -T "$DB_SERVICE" sh -ec '
        : "${POSTGRES_USER:?}" "${POSTGRES_DB:?}" "${POSTGRES_PASSWORD:?}"
        PGPASSWORD="$POSTGRES_PASSWORD" pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
          --format=custom --no-owner --no-privileges --compress=9
    ' >"$DUMP_FILE"
else
    [ -n "${DATABASE_URL:-}" ] || die "DATABASE_URL não definida no modo host" 2
    pg_dump "$DATABASE_URL" \
        --format=custom --no-owner --no-privileges --compress=9 >"$DUMP_FILE"
fi

[ -s "$DUMP_FILE" ] || die "pg_dump produziu arquivo vazio" 3

# ── Verificação estrutural ─────────────────────────────────────────────────
log "verificando integridade do dump (pg_restore --list)"
if [ "$MODE" = docker ]; then
    "${COMPOSE[@]}" exec -T "$DB_SERVICE" pg_restore --list <"$DUMP_FILE" >/dev/null ||
        die "pg_restore --list rejeitou o dump" 5
else
    pg_restore --list "$DUMP_FILE" >/dev/null ||
        die "pg_restore --list rejeitou o dump" 5
fi

# ── Criptografia (chave pública; chave privada fica offline) ───────────────
log "criptografando com GPG (${GPG_RECIPIENT})"
gpg --batch --yes --no-tty --trust-model always \
    --cipher-algo AES256 --compress-algo none \
    --recipient "$GPG_RECIPIENT" \
    --output "$ENC_FILE" --encrypt "$DUMP_FILE" ||
    die "falha ao criptografar o dump" 4

# ── Checksum + metadados ───────────────────────────────────────────────────
(
    cd "$BACKUP_DIR"
    sha256sum "$(basename -- "$ENC_FILE")" >"$(basename -- "$ENC_FILE").sha256"
)

SIZE=$(stat -c '%s' "$ENC_FILE")
END_EPOCH=$(date +%s)
DURATION=$((END_EPOCH - START_EPOCH))
SHA=$(awk '{print $1}' "${ENC_FILE}.sha256")

{
    echo "created_at=${TS}"
    echo "source=${DB_SERVICE}"
    echo "format=custom"
    echo "retention_days=${RETENTION_DAYS}"
    echo "size_bytes=${SIZE}"
    echo "sha256=${SHA}"
} >"${ENC_FILE}.meta"

# ── Retenção (somente após sucesso) ────────────────────────────────────────
log "aplicando retenção de ${RETENTION_DAYS} dias"
find "$BACKUP_DIR" -maxdepth 1 -type f -name "${PREFIX}-*.dump.gpg*" \
    -mtime +"$RETENTION_DAYS" -print -delete

FINAL_TS=$END_EPOCH
FINAL_SIZE=$SIZE
FINAL_DURATION=$DURATION

log "backup concluído: ${ENC_FILE} (${SIZE} bytes, ${DURATION}s, sha256=${SHA})"
