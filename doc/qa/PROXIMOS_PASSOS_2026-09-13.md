# Próximos passos — continuação em outra máquina

Ponto de partida: `main` no GitHub em `bad08a3` (já com push feito). Tudo que
está descrito como "fechado" abaixo já está commitado, testado e publicado em
produção (Firestore rules via Firebase CLI). Nada fica pendente de deploy.

## Já fechado nesta sessão (não repetir)

1. **Reskin evergreen + design system do handoff** (`cf96a9e`, `e633bb5`) —
   tokens, componentes `Card`/`Badge`/`Modal`/`Input`/`StepTabs`, páginas
   `Account`/`Settings`/`EditProfile`, fluxo de "Novo Estudo" direto pra
   seleção bíblica, sanitização de texto bíblico, avatar do Instrutor de IA.
2. **Falhas de segurança do raio-X do Codex** (`2d98145`, `51d32df`,
   `d926800`, `bad08a3`):
   - QA-01 a QA-08 (ver `doc/qa/ANALISE_QUALIDADE_2026-09-13.md`) — todos
     fechados, exceto nenhum pendente desse lote.
   - ARQ-02 a ARQ-06 (ver `doc/stack/04_REVISAO_ARQUITETURAL_2026-09-13.md`)
     — todos fechados.
   - `firestore.rules` está publicado em produção (projeto
     `gen-lang-client-0860065051`, banco nomeado
     `ai-studio-9096b2f1-8519-43e9-a451-732bdd171b00` — **não é o banco
     `(default)`**, cuidado ao usar o Firebase CLI, precisa do
     `"database": "..."` em `firebase.json` ou do `--project` certo).

## Pendente — a única coisa que falta

### ARQ-01 (Alta) — decisão de produto necessária antes de codar

**Não corrigido de propósito.** Ver
`doc/stack/04_REVISAO_ARQUITETURAL_2026-09-13.md`, seção ARQ-01.

**O bug**: o pré-cadastro de usuário (`adminService.registerUserAccount`)
cria o convite pendente em `users/{e-mail}` (mudança feita nesta sessão pra
corrigir o QA-05). `groupService.addStudentByEmail` usa o ID desse MESMO
documento como identidade do membro da sala. Se um admin pré-cadastra
alguém E já adiciona essa pessoa a uma sala antes dela logar, a associação
fica em `groups/{id}/members/{e-mail}`. No primeiro login, `AuthContext.tsx`
cria o perfil em `users/{uid-real}` e apaga `users/{e-mail}` — mas não toca
na associação da sala, que fica presa ao e-mail pra sempre. A pessoa perde
acesso à sala que foi "adicionada" antes de logar. É regressão direta da
correção do QA-05 desta mesma sessão.

**Por que não corrigi**: o próprio relatório (e eu concordo) diz que a
correção completa exige repensar o modelo — representar convite pendente
separado de usuário autenticado, com uma operação explícita e idempotente
de "aceitar convite" que vincula perfil E associações de sala juntos, mais
decidir o que fazer com convites/associações já existentes em produção
(migração). Isso é decisão de produto, não só bug técnico — não deve ser
inventado sem aprovação.

**Próximo passo sugerido**: acionar o agente `arquiteto-de-produto` (ou
pedir pra próxima sessão do Claude fazer isso) com o contexto acima, pra
decidir o modelo antes de qualquer código. Critério de aceite já está
descrito no ARQ-01 do documento de arquitetura.

## Limitações conhecidas desta sessão (não são bugs, são do ambiente)

- Sem Java disponível → não rodei `npm run test:rules` (suíte do Firestore
  Emulator) nesta máquina. As regras foram validadas por leitura + `firebase
  deploy --dry-run` antes de cada publicação, nunca só por inspeção visual.
- CDN do Playwright ficou inacessível em um momento desta sessão — se
  precisar de verificação visual via navegador headless numa sessão nova,
  pode ser necessário reinstalar `playwright install chromium` de novo.
- `.qa-audit/` na raiz do repo é scratch/evidência de diagnóstico (rodado
  pelo Codex com um Java portátil temporário) — não é código do produto,
  não foi commitado de propósito. Pode limpar com segurança se atrapalhar.

## Referência rápida

- `doc/qa/ANALISE_QUALIDADE_2026-09-13.md` — relatório QA-01 a QA-08 (Codex)
- `doc/stack/04_REVISAO_ARQUITETURAL_2026-09-13.md` — relatório ARQ-01 a
  ARQ-12 (Codex) — só ARQ-01 a ARQ-06 foram tratados; ARQ-07 a ARQ-12 são
  propostas de reorganização mais ampla, não bugs urgentes, ver a tabela
  "Ordem sugerida de execução" no fim do documento pra continuar depois.
