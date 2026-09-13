# Revisão de arquitetura e engenharia — O Hermeneuta

Data: 2026-09-13. Complemento à [análise de qualidade](../qa/ANALISE_QUALIDADE_2026-09-13.md).

Base: leitura do código com HEAD `51d32df`, incluindo a árvore de trabalho disponível durante a revisão. Havia alterações locais em `firestore.rules` e, durante a análise, também em `src/test/firestore.rules.test.ts`. As referências abaixo correspondem ao conteúdo consultado; esta análise não homologa essas alterações.

Método: revisão estática dos fluxos e contratos, após consulta a `CLAUDE.md`, `AGENTS.md`, ao papel de arquiteto e à skill `precedencia-e-gaps`. Os comportamentos derivados do código abaixo ainda precisam dos testes de aceitação indicados. Não foram repetidos testes, build ou testes em produção nesta revisão. Nenhum código da aplicação, regra ou conteúdo do Instrutor foi alterado.

**Parecer:** manter React, TypeScript, Firebase e a API serverless. O investimento mais útil agora é tornar explícitos os contratos de identidade, estudo, salas e IA; controlar concorrência; e garantir que o ambiente de validação represente o de implantação. Extrair responsabilidades gradualmente, em mudanças pequenas com critérios de aceite.

O relatório de QA continua sendo o histórico dos defeitos daquela revisão. Este documento acrescenta problemas e propostas arquiteturais; não considera automaticamente pendentes os achados que receberam correções posteriores. A limitação de quota de convidados em memória é uma decisão já registrada no gap 8, não uma nova regressão.

## Correções adicionais prioritárias

### ARQ-01 — Alta: o vínculo do convite não preserva a identidade nas salas

**Evidência:** `adminService.registerUserAccount` cria o pré-cadastro em `users/{email}`. `groupService.addStudentByEmail` usa o ID desse documento como identidade do membro. No primeiro login, `AuthContext` cria `users/{uid}` e apaga o pré-cadastro, sem atualizar as associações de salas.

**Cenário:** pré-cadastrar uma pessoa, adicioná-la a uma sala e depois realizar seu primeiro login. A associação continua em `members/{email}`, mas o usuário autenticado passa a ser identificado pelo UID. A regra `isMember` procura `members/{request.auth.uid}`. Isso é distinto do QA-05: afeta também pré-cadastros no formato novo.

**Proposta:** representar convite pendente separadamente de usuário autenticado e executar uma operação explícita, idempotente, de aceitação do convite. A operação deve vincular perfil e associações e permitir retomar uma execução interrompida. Para migrações com muitos documentos, usar processamento em lotes com estado de conclusão, em vez de assumir uma única transação ilimitada. Também reconciliar as associações antigas antes de encerrar a migração.

**Aceite:** convite → associação → login → acesso à sala; repetir a aceitação sem duplicar membros; interromper e retomar sem perder a associação. A evolução do modelo e das permissões deve ser aprovada antes da implementação.

Referências: [cadastro](../../src/services/adminService.ts:74), [associação](../../src/services/groupService.ts), [vínculo no login](../../src/context/AuthContext.tsx:128), [identidade do membro](../../firestore.rules:93).

### ARQ-02 — Alta: propriedade da sala e papel do usuário estão misturados

**Evidência:** a interface permite criar salas como `professor`, `monitor` e `admin`. `createGroup` grava o proprietário em `professorId`, sem criar associação em `members`. Porém, `listUserGroups` consulta por proprietário somente quando o papel é exatamente `professor`; os demais passam pela consulta de membros.

**Cenário:** um monitor ou administrador cria uma sala. Ela aparece imediatamente porque a tela a acrescenta ao estado local, mas pode desaparecer após recarregar, pois não existe associação desse proprietário. Corrigir apenas a autorização da consulta de membros, tratada em QA-04, não resolve esse caminho.

Há outra inconsistência: `assignProfessorToGroup` altera somente o documento da sala; as cópias de `professorId` nos membros continuam antigas, e a listagem utiliza essas cópias.

**Proposta:** separar papel global, propriedade e participação. Listar as salas pertencentes ao usuário e aquelas em que participa, sem duplicação, de acordo com as permissões aprovadas. Definir quais dados de sala podem ser copiados nos membros e como serão sincronizados. Usar capacidades nomeadas na interface para reduzir comparações de papéis espalhadas pelo código; as regras permanecem uma implementação independente, verificada por testes.

**Aceite:** criar e reabrir sala como professor, monitor e administrador; transferir professor; verificar dados atualizados e resultados distintos para proprietário e membro. A equivalência entre `contributor`, `monitor` e `professor` precisa de definição de produto, pois hoje o hook normaliza esses papéis e os serviços os distinguem.

Referências: [criação e botão](../../src/pages/GroupsPage.tsx:162), [papéis do botão](../../src/pages/GroupsPage.tsx:316), [serviço de salas](../../src/services/groupService.ts), [normalização](../../src/hooks/usePermissions.ts:16).

### ARQ-03 — Alta: a quota de IA não é reservada atomicamente

**Evidência:** `reserveUserQuota` lê a contagem e depois grava `currentCount + 1`. Para um documento existente, a precondição verifica apenas `exists: true`, sem comparar sua versão. As regras permitem manter a mesma contagem (`>=`).

**Cenário derivado do código:** com contagem 29 e limite 30, duas chamadas leem 29, ambas gravam 30 e ambas podem seguir para o Gemini. O contador passa a representar menos execuções do que realmente ocorreram. A precondição de criação protege uma disputa pelo documento inexistente, mas não essa disputa em um documento existente.

**Proposta:** leitura, verificação do teto e reserva numa transação ou operação com comparação de versão e repetição limitada. Incrementar atomicamente sem verificar o teto na mesma operação não basta. A chamada ao Gemini deve ficar fora do callback transacional, que pode ser executado novamente. Esse comportamento de repetição é documentado pelo [Firebase](https://firebase.google.com/docs/firestore/manage-data/transactions).

Além disso, a reserva acontece antes de verificar a chave do provedor e gerar a resposta. Falhas do provedor podem consumir quota, e erros de leitura/gravação do contador viram a mesma resposta 429 de limite atingido. Definir a política de cobrança de tentativas, falhas e cancelamentos; distinguir indisponibilidade de limite efetivamente alcançado; considerar identificador idempotente por solicitação.

**Aceite:** a partir de 29, duas reservas simultâneas permitem somente uma execução; repetir a mesma solicitação respeita a política definida; indisponibilidade do Firestore retorna erro de serviço, sem liberar uso nem anunciar falsamente consumo total. Testar com emulador e provedor simulado, incluindo concorrência real entre requisições.

Referências: [reserva](../../api/gemini.ts:372), [tratamento de falha](../../api/gemini.ts:467), [ordem da execução](../../api/gemini.ts:946), [regra do contador](../../firestore.rules:259).

### ARQ-04 — Alta: o formulário e a persistência discordam sobre os campos do estudo

**Evidência:** a etapa “Gênero & Estilo” pede gênero e estrutura no mesmo texto e salva tudo em `genre`. As regras limitam `genre` a 100 caracteres e já oferecem `structure` com até 10.000. A interface genérica não aplica os limites específicos dos campos. Também há limites distintos para ideia principal, intento e sermão.

**Consequência:** um preenchimento natural da instrução da tela pode ser recusado no salvamento. A experiência local do convidado pode aceitar conteúdo que falha posteriormente na persistência remota.

**Proposta:** definir um contrato explícito por etapa: identificador, campos editáveis, formato, limites e validação. Recomendo separar gênero de estrutura usando os campos já existentes, sujeito à validação da experiência pedagógica. Avisar sobre o limite durante a edição e preservar o rascunho se houver rejeição. Evitar simplesmente ampliar o limite de uma regra para acomodar dois conceitos diferentes.

**Aceite:** gênero e estrutura sobrevivem ao salvamento e à reabertura; limites têm testes de fronteira; a interface explica a rejeição antes de perder o texto; estudos existentes são preservados.

Referências: [definição da etapa](../../src/pages/StudyController.tsx:34), [limites](../../firestore.rules:66), [modelo](../../src/types.ts:23), [edição e autosave](../../src/pages/StudyStep.tsx:34).

### ARQ-05 — Alta: respostas atrasadas podem contaminar o estado de outra conversa ou estudo

**Evidência:** `ChatOverlay` e `GroupsPage` aguardam a IA e depois acrescentam a resposta ao estado corrente de mensagens, sem verificar se a conversa selecionada ainda é a mesma. A paginação de mensagens também não invalida uma busca quando muda a sala. No estudo, a recuperação após falha de gravação substitui todo o `currentStudy` pela leitura remota, sem conferir se outra edição ou navegação ocorreu enquanto a chamada aguardava.

**Cenários:** pedir algo à IA, trocar para uma sala humana e receber a resposta na lista dessa sala; buscar mensagens antigas e trocar de sala antes do retorno; editar novamente enquanto uma gravação anterior falha. Não foi demonstrada gravação da resposta da IA no Firestore da outra sala: o primeiro problema identificado é de estado e apresentação.

**Proposta:** associar cada operação a usuário, recurso e versão da solicitação. Descartar resultados obsoletos e cancelar operações de rede quando possível. Extrair um controlador de conversa compartilhado entre as duas interfaces. No estudo, serializar as gravações por estudo/campo e manter separados rascunho, conteúdo confirmado e revisão em envio. Preservar o debounce de 3 segundos e `updateCurrentStudy`, conforme a regra do projeto.

**Aceite:** testes com respostas deliberadamente invertidas e troca de sala/estudo; uma resposta antiga nunca substitui a revisão nova. Este item amplia o problema de salvamento do QA-03 e o de sessão do QA-07: corrigir somente a propagação do erro ou limpar o contexto no logout não controla essas concorrências.

Referências: [resposta no overlay](../../src/components/ChatOverlay.tsx:151), [resposta na página](../../src/pages/GroupsPage.tsx:195), [paginação](../../src/pages/GroupsPage.tsx:131), [recuperação do estudo](../../src/context/StudyContext.tsx:40).

### ARQ-06 — Média: “Excluir usuário” apaga somente o documento de perfil

**Evidência:** `adminService.deleteUser` executa apenas `deleteDoc(users/{uid})`. A interface apresenta “Excluir Usuário?” e diz que a ação não pode ser desfeita. O código de login cria um perfil quando não encontra o documento do usuário.

**Consequência:** a operação não representa exclusão da identidade no Firebase Auth nem tratamento dos estudos e associações. No próximo login, o fluxo pode criar novamente um perfil, normalmente pendente de aprovação. Não se deve tratar essa ação como revogação completa do acesso ou eliminação de todos os dados.

**Proposta:** distinguir desativar acesso, remover pré-cadastro e excluir conta. Definir o destino dos estudos, das mensagens e das salas antes de implementar exclusão. Operações que precisem administrar identidades devem ocorrer em ambiente servidor autorizado, com registro de execução, tratamento de falhas parciais e possibilidade de retomada.

**Aceite:** comportamento inequívoco ao entrar novamente; dados relacionados tratados conforme a política aprovada; falha intermediária não aparece como conclusão bem-sucedida. Não executar exclusões reais como parte desta revisão.

Referências: [serviço](../../src/services/adminService.ts:54), [confirmação](../../src/pages/AdminPanel.tsx:438), [recriação no login](../../src/context/AuthContext.tsx:128).

## Melhorias de arquitetura que eu faria em seguida

### ARQ-07 — Estados explícitos de sessão e carregamento

`ProtectedRoute` só bloqueia aprovação quando existe `profile`; uma falha ao buscar o perfil deixa usuário autenticado com perfil nulo e pode renderizar a área interna. Isso não prova acesso indevido ao banco, que continua dependente das regras. `StudyController` usa a mesma animação para carregamento e ausência de estudo: um ID inexistente não tem saída própria.

Adotaria estados discriminados para sessão (`loading`, `guest`, `pending`, `ready`, `error`) e carregamento do estudo (`loading`, `ready`, `notFound`, `forbidden`, `error`). Cada estado teria uma ação útil: tentar novamente, entrar, aguardar aprovação ou voltar. Separaria a identidade local de convidado do tipo `User` do Firebase, eliminando a necessidade de fabricar esse objeto com cast.

Aceite: erro de perfil não entra no estado aprovado; estudo inexistente ou inacessível encerra o carregamento e apresenta ação; resposta antiga de autenticação não restaura uma sessão anterior.

Referências: [proteção de rota](../../src/components/AuthRoutes.tsx:22), [falha de perfil](../../src/context/AuthContext.tsx:204), [carregamento do estudo](../../src/pages/StudyController.tsx:70).

### ARQ-08 — Contratos de domínio e módulos com responsabilidades menores

`api/gemini.ts` concentra protocolo HTTP, autenticação, quota, normalização, prompt, chamada ao provedor, validação da saída, formatação e atualização do perfil. Cliente e servidor declaram separadamente ações e históricos. Os serviços de dados fazem conversões e casts locais; `Study` ainda aceita representações estruturadas e de texto para os mesmos conceitos.

Extrairia primeiro contratos compartilhados de requisição/resposta e validadores de entrada; depois autenticação, quota, adaptador do provedor e parsing/formatação. O handler ficaria responsável por compor a operação. Organizaria o frontend gradualmente por funcionalidades — estudos, salas, contas e academia — com serviços e componentes próximos do domínio. Contratos compartilhados devem conter apenas os tipos e validadores necessários, sem importar prompt ou implementação servidor para o cliente.

O envelope de resposta deveria diferenciar sucesso válido, erro do provedor e resposta que violou o contrato. Hoje uma falha de parsing pode terminar em texto genérico com HTTP 200; além disso, `geminiService` retorna uma mensagem genérica quando um sucesso não contém `text`. Acrescentaria prazo máximo, cancelamento e códigos de erro estáveis, com texto amigável na interface. Preservaria o contrato pedagógico durante a extração.

Criaria adaptadores explícitos de leitura/escrita do Firestore e uma estratégia de versão/migração para documentos. O gap 9 já registra a divergência entre representação estruturada e texto livre; remover campos ou converter dados exige definir compatibilidade. O gap 15 registra erro silencioso no chat da página de salas e deve entrar na unificação do controlador.

Aceite: testes de contrato executados nos dois lados; dados antigos convertidos ou rejeitados de forma recuperável; resposta inválida nunca registrada como resposta bem-sucedida do mentor; extração não muda o conteúdo doutrinário.

Referências: [API](../../api/gemini.ts), [cliente](../../src/services/geminiService.ts:47), [leitura de estudos](../../src/services/studyService.ts:41), [tipos](../../src/types.ts).

### ARQ-09 — Progresso persistido e retomada do trabalho

O percentual mostrado é a posição da aba; visitar a finalização produz 100% independentemente do conteúdo. A conclusão grava apenas `status: completed`. A etapa corrente não é persistida. Os rascunhos locais permanecem no navegador após login, com comentário de que a migração fica para um fluxo futuro.

Separaria posição de navegação, conteúdo preenchido e conclusão declarada. Persistiria a última etapa e ofereceria retomada dos rascunhos locais, com vínculo de proprietário e importação idempotente. Uma política de recuperação de edições deve complementar o controlador de salvamento, especialmente em falhas de rede e fechamento da página.

**Decisão de produto necessária:** quais campos são obrigatórios para concluir e se o aluno pode concluir com etapas incompletas. Não presumir requisitos pedagógicos. A importação de rascunhos em uma conta também deve ser uma escolha clara do usuário do produto.

Aceite: reabrir na etapa prevista; percentual corresponde à definição aprovada; importar duas vezes não duplica o estudo; nenhum texto local é removido antes da confirmação de persistência remota.

Referências: [progresso](../../src/pages/StudyController.tsx:100), [conclusão](../../src/pages/StudyController.tsx:147), [rascunhos após login](../../src/context/AuthContext.tsx:246).

### ARQ-10 — Consultas paginadas e índices reproduzíveis

`listUserStudies` lê todo o histórico do usuário, incluindo o conteúdo completo dos estudos; `getAllUsers` lê todos os usuários e ainda repete a consulta sem ordenação se a primeira falha. O repositório consultado não define um arquivo de índices no `firebase.json`. Isso não significa que os índices estejam ausentes no ambiente remoto, mas impede verificá-los e reproduzi-los apenas pelo código.

Introduziria paginação por cursor nas listagens e filtros coerentes com as consultas autorizadas. Para estudos com texto extenso, avaliaria separar um resumo de listagem do corpo após medir tamanho e volume reais. Versionaria os índices necessários e validaria as consultas com cada papel permitido. A [documentação do Firebase](https://firebase.google.com/docs/firestore/query-data/query-cursors) descreve paginação por cursores; o serviço de mensagens do próprio projeto já usa essa abordagem.

Aceite: tamanho limitado por página, ordenação determinística para empates, mudança de filtro reinicia o cursor, e ambiente novo consegue executar as consultas com os índices documentados. Não introduzir uma segunda cópia do resumo sem um mecanismo definido de consistência.

Referências: [estudos](../../src/services/studyService.ts:62), [usuários](../../src/services/adminService.ts:16), [configuração](../../firebase.json).

### ARQ-11 — Paridade de ambientes e validação do artefato servidor

Cliente e API importam a mesma configuração Firebase estática. O código não escolhe um projeto por ambiente. O CI já tem tipos, build, testes de componentes e regras; porém, `npm run build` executa Vite e não demonstra por si só que a função serverless empacotada inicia corretamente. `npm run dev` inicia Vite e não apresenta configuração local do endpoint servidor nessa configuração.

Definiria configuração validada para desenvolvimento, homologação e produção; ambiente isolado para previews; e um comando documentado que suba frontend e API localmente. Acrescentaria um teste de inicialização e requisição HTTP do artefato servidor no runtime de implantação, com Gemini simulado e dados de teste. A checagem deve capturar erros de imports ESM, configuração e roteamento que mocks e transformação do Vitest podem esconder.

Aceite: a configuração declara inequivocamente projeto e banco de destino; preview usa o destino de teste aprovado; o artefato servidor responde a uma requisição real; rollback de frontend, API e regras tem procedimento compatível. As configurações remotas de Vercel, proteção de branch e projetos Firebase não foram inspecionadas nesta revisão.

Referências: [inicialização Firebase](../../src/lib/firebase.ts:1), [configuração da API](../../api/gemini.ts:5), [CI existente](../../.github/workflows/ci.yml), [scripts](../../package.json), [Vite](../../vite.config.ts).

### ARQ-12 — Observabilidade e trilha das operações administrativas

Os erros são principalmente mensagens de console. O helper Firestore empacota contexto de autenticação, incluindo e-mail, numa string de erro. Alterações administrativas de papel e aprovação não registram, na implementação consultada, um evento próprio com autor e resultado.

Adicionaria identificador de requisição e eventos estruturados de operação, duração, resultado e categoria de falha; métricas de salvamento, latência da IA, rejeição de schema e erro de quota; trilha das operações administrativas em um ponto confiável. Evitaria enviar texto de estudos, prompts, tokens e dados pessoais desnecessários aos logs. Definiria procedimentos verificáveis de recuperação de dados e falhas parciais. Não há evidência nesta revisão sobre a existência ou ausência de backups configurados na nuvem.

Aceite: um relato do usuário pode ser correlacionado à falha correspondente; diferenciar quota esgotada de Firestore indisponível e de falha do Gemini; identificar autor e resultado de mudança administrativa; realizar um exercício de recuperação em ambiente isolado.

Referências: [tratamento Firestore](../../src/lib/firebase.ts:51), [operações administrativas](../../src/services/adminService.ts:34), [erros da API](../../api/gemini.ts:961).

## Ordem sugerida de execução

| Ordem | Entrega | Resultado esperado |
|---|---|---|
| 1 | Revalidar correções do QA e fechar ARQ-01 a ARQ-05 | Identidade consistente, salas recuperáveis, quota correta e proteção contra perda ou mistura de estado |
| 2 | Definir ciclo de vida de conta e estados de sessão/carregamento, ARQ-06 e ARQ-07 | Acesso e falhas previsíveis; sem operações administrativas de significado ambíguo |
| 3 | Extrair contratos e controladores durante as correções; completar ARQ-08 e ARQ-09 | Evolução do fluxo com menos duplicação e retomada confiável |
| 4 | ARQ-10 a ARQ-12, antecipando ambiente isolado e teste do servidor antes de publicar mudanças | Custo controlado, implantação reproduzível e diagnóstico operacional |

Cada entrega deve incluir o cenário de falha correspondente e seu critério de aceite. A aceitação de contratos, migrações, regras de acesso e decisões pedagógicas precede sua implementação; este documento apresenta propostas para revisão, não decisões já aplicadas.
