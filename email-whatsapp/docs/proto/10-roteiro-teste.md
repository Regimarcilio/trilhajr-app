# Roteiro de Teste — MailChat

## 1. Tarefas (3)

1. **Carregar conversa e localizar artefato** — clique em um remetente na lista, leia a conversa e
   identifique um anexo (PDF, planilha ou log).
2. **Responder** — digite uma resposta no campo inferior e envie (Enter ou botão); confira o tick de leitura.
3. **Anexar e-mail a compromisso** — no topo da conversa, clique no botão de calendário, preencha o
   post-it (título, data, horário, cor) e salve; depois clique no chip do e-mail no post-it para voltar à conversa.

## 2. Teste de 5 segundos

Ao abrir a tela, o usuário deve responder em até 5s:
"O que é este produto e o que posso fazer aqui?" — espera-se que identifique: lista de e-mails à esquerda,
conversa no centro e agenda à direita.

## 3. SUS simplificado (após as tarefas)

1. Eu gostaria de usar este sistema com frequência.
2. O sistema foi desnecessariamente complexo.
3. O sistema foi fácil de usar.
4. Precisaria de ajuda para usar este sistema.
5. As funções estavam bem integradas.

Escala 1 (discordo) a 5 (concordo). Meta: média ≥ 4.0.

## 4. Checklist Nielsen (10 heurísticas)

| # | Heurística | Verificação |
|---|---|---|
| 1 | Visibilidade do status | ticks, não lidos, toasts, calendário com dia atual |
| 2 | Linguagem do usuário | pt-BR, termos de e-mail/agenda |
| 3 | Controle e liberdade | voltar (mobile), fechar modal (Esc), remover post-it |
| 4 | Consistência | bolhas, post-its e calendário seguem o padrão visual |
| 5 | Prevenção de erro | validação de título no post-it, aviso ao enviar sem conversa |
| 6 | Reconhecimento | avatar, nome, e-mail e assunto sempre visíveis |
| 7 | Flexibilidade | busca, 5 paletas, atalhos (Enter, Esc) |
| 8 | Estética minimalista | sem elementos fora de escopo |
| 9 | Recuperação de erro | mensagens de vazio e de validação |
| 10 | Ajuda | tooltips, hint na agenda, hub com instruções |

## 5. Acessibilidade e responsivo

- Contraste AA nos pares texto/fundo principais; `:focus-visible` com destaque; `aria-label` nos botões de ícone;
  `aria-live` nos toasts; `role="dialog"` no modal; `prefers-reduced-motion` desligando animações.
- Responsivo em 360 / 768 / 1280: ≤900px lista em tela cheia, chat e agenda em overlay; ≤1100px agenda em overlay.

## 6. Métricas e resultado

| Métrica | Meta | Resultado |
|---|---|---|
| Tempo até concluir as 3 tarefas | < 60s | validado em navegador (sem usuários) |
| Taxa de conclusão das tarefas | ≥ 80% | 3/3 no roteiro automatizado |
| Links quebrados | 0 | 0 |
| Erros de console | 0 | 0 |

**Decisão:** **APROVADA** em 2026-11-14. Evidências: prints em `docs/proto/prints/` e auto-teste em navegador
(3/3 tarefas concluídas, 5 paletas e modais funcionando, 0 erros de console). Próximo passo: implementação —
`@frontdev` espelha o protótipo (mapa tela→rota→componente em `docs/proto/`).
