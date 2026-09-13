# Parecer de qualidade — O Hermeneuta

Auditoria iniciada em 12/09/2026 e consolidada em 13/09/2026. Revisão conferida ao encerrar: `2d98145` (as mudanças estavam inicialmente locais, sobre `b6d8fa6`). Escopo: código, testes de componentes, regras do Firestore em emulador, navegação local e inventário de dependências. A publicação dessas alterações e o estado de produção não foram verificados.

**Parecer: não recomendo homologar esta revisão enquanto os achados de prioridade alta abaixo permanecerem.** Build e checagem de tipos passaram, mas foram reproduzidos problemas de atribuição de permissões, indisponibilidade entre usuários, persistência e fidelidade do texto bíblico. A suíte existente não cobre todos esses cenários.

As alterações de implementação já presentes no diretório foram preservadas. Os arquivos em `.qa-audit/` são evidências e instrumentos locais de diagnóstico, não correções do produto.

## Evidências e limites

| Verificação | Resultado observado | O que demonstra |
|---|---|---|
| `npm run lint` | Passou | Tipagem com `tsc --noEmit`; não é lint de qualidade React/TS. |
| `npm run build` | Passou; 3.128 módulos transformados | O frontend gera artefatos de produção. Não valida a execução da função serverless nem as permissões publicadas. |
| Suíte unitária existente, dois workers | Inconclusiva: quatro testes passaram e 12 arquivos tiveram erros de inicialização dos workers | A execução nesta auditoria não permite declarar a suíte inteira aprovada. A execução anterior de 45 testes não substitui a validação desta revisão. |
| Suíte existente de regras | 26 testes não executados: timeout de 20 s no `beforeAll`, seguido de erro no `cleanup` de ambiente não inicializado | Falha de preparação da suíte, não 26 falhas funcionais das regras. |
| Provas diretas no emulador | 11 operações de controle/reprodução registradas | Confirmam as correções e os defeitos descritos em QA-01, QA-02, QA-04 e QA-05. |
| Provas adicionais de componentes/serviços | Sete cenários reproduzidos; um cenário de navegação excedeu o timeout inicial de 5 s | Confirmam retorno bem-sucedido de `flush()` após falha, persistência do estudo entre contas, três defeitos de conteúdo e duas lacunas do modal. |
| Navegador Edge local | Landing em 1.440 px e 390 px; entrada como convidado e dashboard sem exceções JavaScript capturadas | Não houve overflow horizontal nessas telas. A captura da rota de novo estudo ainda estava carregando; não comprova a conclusão desse fluxo. |
| `npm audit --omit=dev --json` | 17 entradas: uma crítica, nove altas, cinco moderadas e duas baixas | Inventário de alertas de pacotes, não número de vulnerabilidades exploráveis confirmadas na aplicação. |

O Java 21 foi utilizado de forma portátil em uma pasta temporária. O Firestore Emulator executou projetos `demo-*` em `127.0.0.1:8080`, sem usar dados de produção. As provas de frontend usaram mocks para as falhas de escrita e de provedores bíblicos. Não houve chamada real ao Gemini, login Google real, teste de carga ou auditoria completa de acessibilidade.

## Achados prioritários

### QA-01 — Alta: e-mail editável pode direcionar uma promoção administrativa para a conta errada

**Confirmado no emulador.** A regra de atualização do próprio perfil protege `role` e `isApproved`, mas permite trocar `email` por um e-mail diferente do token autenticado. O serviço administrativo procura a conta por esse campo e atualiza o primeiro documento encontrado.

Na reprodução, `qa-alice` alterou seu e-mail para o endereço de um futuro administrador. A sequência usada pelo cadastro administrativo — consulta por e-mail e atualização do documento encontrado — atribuiu `role: admin` a `qa-alice`. O cenário depende de o administrador cadastrar/promover o endereço escolhido; não é uma autopromoção direta sem essa ação.

Referências: [regra de atualização](../../firestore.rules:144), [consulta e atualização administrativas](../../src/services/adminService.ts:83). Evidência: [operações no emulador](../../.qa-audit/firestore-results.json).

**Critério de aceite:** um usuário não consegue apresentar um e-mail alheio como identidade confiável do seu perfil; cadastrar/promover um endereço não pode alterar uma conta cujo vínculo autenticado com esse endereço não foi verificado. Cobrir criação, atualização e pré-cadastro com testes de regra e integração.

### QA-02 — Alta: um usuário pode bloquear a quota de IA de outro

**Confirmado no emulador.** A criação de `aiUsage/{usageId}` exige que o campo `uid` pertença ao solicitante, mas não vincula o ID do documento a esse UID. Um usuário comum conseguiu criar `aiUsage/qa-victim_daily_2026-09-12` com seu próprio UID no conteúdo. Em seguida, a vítima recebeu `permission-denied` ao ler o caminho reservado à sua quota.

O caminho diário é previsível quando se conhece o UID da vítima. A API consulta esse caminho e trata falhas na reserva como indisponibilidade de quota, impedindo o uso do Instrutor. O bloqueio à exclusão da própria quota corrige o problema anterior, mas não este caso.

Referências: [criação e leitura do contador](../../firestore.rules:226), `api/gemini.ts::reserveUserQuota` e `reserveQuota`. Evidência: [operações no emulador](../../.qa-audit/firestore-results.json).

**Critério de aceite:** nenhuma conta consegue criar, ocupar ou alterar o contador reservado a outra conta, mesmo usando o próprio UID no conteúdo. Testar explicitamente divergência entre caminho e conteúdo.

### QA-03 — Alta: a falha de salvamento ainda não impede sair da etapa

**Reprodução parcial em componente e confirmação do fluxo por código.** O contexto agora relança o erro de gravação, mas `StudyStep.handleSave` captura esse erro e retorna normalmente. A prova confirmou que `flush()` resolve com sucesso apesar da escrita negada e da mensagem de erro visível. O controlador considera essa resolução suficiente para trocar a aba. Os botões de voltar e avançar também chamam a navegação depois de `handleSave`.

Consequência: a etapa pode ser desmontada com texto não persistido. A existência de um aviso de falha não garante preservação do conteúdo. A prova específica do botão avançar excedeu o timeout inicial; a repetição isolada, com prazo maior para o teste, foi impedida por timeout de inicialização do worker. O resultado de `flush()` foi reproduzido, e a navegação subsequente está explícita no código.

Referências: [salvamento e flush](../../src/pages/StudyStep.tsx:119), [troca de abas](../../src/pages/StudyController.tsx:105), [propagação do erro no contexto](../../src/context/StudyContext.tsx:54).

**Critério de aceite:** diante de escrita negada ou falha de rede, abas e botões permanecem na etapa atual, mantêm o texto e permitem tentar novamente. Cobrir também salvamento em andamento, cliques repetidos e saída para outra rota antes do debounce.

### QA-04 — Alta: alunos não conseguem listar suas salas pela consulta utilizada

**Confirmado no emulador.** Um aluno aprovado e membro de uma sala conseguiu ler diretamente `groups/qa-group`, mas a consulta `collectionGroup('members')` filtrada por seu `userId` foi negada. Essa é a consulta usada pelo serviço para os papéis diferentes de `professor`.

A interface captura o erro e mantém somente a sala do Instrutor, o que pode parecer ausência de salas cadastradas. A leitura direta permitida não comprova que a listagem usada pela página funciona.

Referências: [consulta do serviço](../../src/services/groupService.ts:74), [tratamento na página](../../src/pages/GroupsPage.tsx:64), regras de `groups/members`. Evidência: [controle de leitura e consulta negada](../../.qa-audit/firestore-results.json).

**Critério de aceite:** testar a consulta real do serviço com professor, aluno, monitor, colaborador e administrador, garantindo os resultados permitidos e a exclusão de associações de terceiros. O teste deve executar contra o emulador, não apenas contra mocks de `getDocs`.

### QA-05 — Média: pré-cadastros antigos não são compatíveis com o novo vínculo

**Confirmado no emulador para uma fixture no formato anterior.** Novos pré-cadastros usam o e-mail como ID e foram vinculados e removidos com sucesso. Os antigos eram criados com ID aleatório; `hasMatchingPendingInvite()` procura apenas `users/{email}`. A criação do perfil aprovado a partir de um documento antigo foi negada.

Reexecutar o cadastro administrativo não migra necessariamente o documento antigo: quando a consulta por e-mail encontra um registro, o serviço apenas o atualiza no mesmo ID. A existência e quantidade desses registros em produção não foram verificadas.

Referências: [caminho do convite](../../firestore.rules:110), [ramo de atualização de cadastro existente](../../src/services/adminService.ts:85), `AuthContext.tsx` no primeiro login.

**Critério de aceite:** definir e testar migração ou compatibilidade dos pré-cadastros existentes antes de publicar a mudança. Validar que papel, aprovação e identificação continuam corretos após o vínculo.

### QA-06 — Alta: falhas do provedor bíblico podem entrar no estudo como conteúdo válido

**Três cenários reproduzidos com respostas HTTP controladas:**

1. Uma página de erro do provedor, recebida com HTTP 200 e mais de 100 caracteres, foi aceita como texto bíblico após a falha no parsing JSON. A remoção das tags HTML não elimina o conteúdo da página de erro.
2. Ao solicitar NTLH e falhar o primeiro provedor, o fallback da Bíblia Digital usou `ra`/ARA, mas retornou `translationUsed: 'NTLH'`.
3. Quando todos os provedores falharam, o serviço resolveu a promessa com uma mensagem de erro no campo `text`, em vez de comunicar uma falha distinta. Os consumidores podem persistir essa mensagem como texto de referência.

A mudança para `{ text, translationUsed }` melhora o contrato, mas ainda não garante que o conteúdo e o rótulo correspondam ao trecho solicitado. Esse texto também alimenta o Instrutor de IA.

Referências: [fallback de texto arbitrário](../../src/services/bibleService.ts:130), [tradução padrão do provedor](../../src/services/bibleService.ts:266), [retorno em falha total](../../src/services/bibleService.ts:312). Provas: [cenários de provedor](../../.qa-audit/bible.probe.ts).

**Critério de aceite:** aceitar somente conteúdo com estrutura e intervalo bíblico válidos; manter a identidade real da tradução em todos os fallbacks; representar indisponibilidade separadamente do texto bíblico e oferecer recuperação explícita na interface. A identificação da tradução `almeida` como ARC também exige comprovar a edição, não apenas escolher a mais próxima.

### QA-07 — Média: estudo em memória permanece após troca de usuário

**Confirmado em componente.** Ao mudar a identidade de `qa-alice` para `qa-bob` no mesmo provider, `currentStudy` continuou contendo o estudo de Alice. `clearStudy` existe, mas não há integração com a troca de sessão. Também falta proteção contra uma leitura antiga resolver depois de uma troca de estudo/usuário.

Isso é um problema de isolamento de estado no mesmo navegador. A prova não demonstra que Bob consegue ler o estudo de Alice diretamente no Firestore; são camadas diferentes.

Referência: [estado e carregamento do estudo](../../src/context/StudyContext.tsx:17). Prova: [troca de identidade](../../.qa-audit/study.probe.tsx).

**Critério de aceite:** limpar estado sensível quando a identidade mudar e ignorar respostas de carregamentos que já perderam validade. Testar logout/login com contas diferentes e troca rápida entre estudos.

### QA-08 — Média: modal sem comportamento e semântica básicos de diálogo

**Confirmado em componente:** o modal aberto não expõe o papel `dialog`, e Escape não chama seu fechamento. A revisão também não encontrou gestão de foco, retenção de foco dentro do modal ou restauração ao elemento que o abriu. Os dois últimos pontos precisam de teste completo de teclado no navegador.

Referência: [Modal.tsx](../../src/components/ui/Modal.tsx:13). Provas: [semântica e Escape](../../.qa-audit/accessibility.probe.tsx).

**Critério de aceite:** diálogo identificado e nomeado para tecnologia assistiva, foco inicial previsível, navegação por teclado dentro dele, fechamento por Escape quando apropriado e retorno do foco ao acionador. Não foi feita certificação de conformidade de acessibilidade.

## Dependências, testes e manutenção

O alerta crítico de `websocket-driver@0.7.4` entra pela cadeia `firebase → @firebase/database → faye-websocket`. O código revisado usa Auth e Firestore, sem importação de Realtime Database. Portanto, o alerta exige triagem e atualização da árvore, mas esta auditoria não confirmou uma exploração crítica no frontend em execução.

Outros alertas abrangem ferramentas de build e caminhos de servidor de bibliotecas. É necessário avaliar alcance real por componente e ambiente, atualizar de forma controlada e repetir os testes. Não foi executado `npm audit fix`. A saída original está em [npm-audit.json](../../.qa-audit/npm-audit.json).

Já existe [CI no GitHub Actions](../../.github/workflows/ci.yml), com instalação limpa, checagem de tipos, build, testes unitários e um job separado com Java 21 para regras. A ausência de CI, descrita por documentos antigos, não representa mais o código atual. A existência do workflow não comprova que seus checks são obrigatórios para merge/deploy; essa configuração remota não foi inspecionada.

Não foi encontrada cobertura percentual configurada nem uma suíte E2E versionada. Os testes existentes cobrem partes importantes, mas deixam lacunas nas consultas reais dos serviços, nos erros de persistência e na migração de dados. O `afterAll` da suíte de regras chama `testEnv.cleanup()` mesmo quando o `beforeAll` falha, adicionando um erro secundário ao timeout inicial.

O [tsconfig](../../tsconfig.json) não habilita `strict`; há uso de `any` e coerções de dados externos. Passar no typecheck não substitui validação em tempo de execução. Documentos locais ainda citam dependências removidas, animações já corrigidas e ausência de pipeline: devem ser sincronizados após as decisões técnicas.

O build contém uma imagem de abertura de aproximadamente 1,84 MB. É uma oportunidade de otimização para dispositivos móveis; não foi medido impacto em LCP, velocidade de rede real ou Core Web Vitals, portanto não é apresentado como regressão de desempenho comprovada.

## Critérios para a próxima homologação

- Encerrar QA-01 e QA-02 com testes diretos de acesso, incluindo identidade adulterada e divergência entre ID do documento e conteúdo.
- Garantir que falha de gravação preserve texto e impeça navegação, incluindo abas, botões e saída de rota.
- Validar as consultas reais de salas por papel e a migração de pré-cadastros antigos.
- Impedir que erros de provedores ou traduções incorretas sejam tratados como texto bíblico válido.
- Obter execução completa das suítes em ambiente estável e registrar seus resultados; adicionar regressões dos cenários reproduzidos.
- Executar ao menos um fluxo completo de estudo, salvar, reabrir e finalizar, com usuário autenticado de teste e convidado, incluindo teclado e tela móvel.

Os scripts em `.qa-audit/*.probe.*` afirmam o comportamento defeituoso observado para documentar sua reprodução; não são testes de aceite do produto. Uma reprodução que passa confirma o achado, não a qualidade da funcionalidade. O script do emulador registra cada operação e limpa apenas os dados fictícios do projeto de teste. Os logs e resultados devem ser lidos individualmente: o código de saída do agregador `run-rules.mjs` não representa aprovação de toda a suíte.
