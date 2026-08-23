// Fonte: "Princípios do Cavar & Descobrir", Edição 5.0 (WordPartners, 2023),
// tradução de Eloisa Pasquini / revisão de Eros Pasquini Jr. Licenciado sob
// Creative Commons Attribution-ShareAlike 4.0 International
// (https://creativecommons.org/licenses/by-sa/4.0/).
//
// Texto extraído do PDF oficial e limpo de artefatos de diagramação
// (cabeçalhos repetidos, numeração de página, boilerplate de licença) - o
// conteúdo doutrinário/pedagógico não foi parafraseado, apenas transcrito.
// A tabela de "características por gênero" (uma página em layout de colunas
// que a extração de texto do PDF embaralhou) foi transcrita manualmente a
// partir do original, fornecida pelo dono do produto, e incorporada dentro
// do princípio "genero" abaixo.
//
// Esta é a fonte única de verdade do método injetada no Instrutor de IA
// (ver getMethodContextForStage/getFullMethodText, usados em api/gemini.ts).
// Mudar o CONTEÚDO abaixo é uma mudança doutrinária/pedagógica, não técnica
// - ver skill padrao-prompt-ia antes de editar.

export type PrincipleKey =
  | 'linha'
  | 'boas_perguntas'
  | 'genero'
  | 'estrutura'
  | 'contexto'
  | 'ideia_principal_intento_transformador'
  | 'teologia_biblica'
  | 'texto_estrutura'
  | 'estude_o_sermao';

export const CAVAR_E_DESCOBRIR_ATTRIBUTION =
  'Baseado em "Princípios do Cavar & Descobrir", Edição 5.0, © WordPartners, 2023, ' +
  'tradução de Eloisa Pasquini / revisão de Eros Pasquini Jr. ' +
  'Licenciado sob Creative Commons Attribution-ShareAlike 4.0 International ' +
  '(https://creativecommons.org/licenses/by-sa/4.0/).';

export const CAVAR_E_DESCOBRIR_PRINCIPLES: Record<PrincipleKey, { title: string; text: string }> = {
  linha: {
    title: 'A Linha',
    text: `A linha representa a Palavra de Deus. A tarefa do pregador ou professor é ficar na linha. Ele não deve ir acima dela, dizendo mais do que Deus diz, ou descer abaixo dela, dizendo menos do que Deus diz. Ele deve permanecer na linha, dizendo o que Deus diz.

Como isto funciona:
- Em muitos países, antes que uma pessoa possa testemunhar em um tribunal, ela precisa fazer um juramento: "Você jura dizer a verdade, toda a verdade, e nada além da verdade?" Uma testemunha fiel não dirá mais que a verdade ou menos que a verdade. Ela dirá a verdade.
- Subir acima da linha e dizer mais é acrescentar ao que Deus disse. Este é o erro do legalismo.
- Descer abaixo da linha e dizer menos é subtrair do que Deus disse. Este é o erro do liberalismo e da permissividade.
- Adicionar ou subtrair da linha pode soar diferente, mas partilham do mesmo problema fundamental: eles estão fora da linha e distorcem o que Deus disse.
- Pregar e ensinar a Palavra de Deus requer que ouçamos atentamente ao que Deus disse (Deuteronômio 4.1-2; Provérbios 30.5-6; Apocalipse 22.18-19).

Por que isto é importante:
- Deus falou. Desde o início dos tempos, Suas palavras soberanas provaram ser poderosas para trazer vida (Gênesis 1.1-2.3; Salmo 19.7-11; Isaías 55.9-11; João 1.1-5).
- Está escrito. Deus registrou sua Palavra, trabalhando por meio de homens para preservá-la para cada geração (Êxodo 34.27-33; Deuteronômio 29.29; 31.9-13; 2 Timóteo 3.16-17; 2 Pedro 1.16-21).
- Pregue a Palavra. Deus ordena que Sua Palavra seja proclamada, deixando claro que seus porta-vozes devem dizer o que Ele disse - nada mais e nada menos (Êxodo 4.10-16; Deuteronômio 4.1-2; 1 Samuel 3.1-21; Josué 1.7-8; 2 Timóteo 2.14-19; 4.1-8; Apocalipse 22.18-19).
- Esta palavra é sua vida. Deus concede vida por meio de Sua Palavra - nossas palavras, opiniões e pensamentos não possuem poder de transformar vidas (Gênesis 1.1-3; Deuteronômio 32.45-47; Ezequiel 36.1-38; João 3.1-17; Atos 1.8; Atos 2.1-48; 2 Coríntios 3.1-18; 2 Pedro 1.21).`,
  },

  boas_perguntas: {
    title: 'Boas Perguntas',
    text: `Uma boa pergunta nos conduz pelo caminho do pensamento do autor e nos ajuda a descobrir sua intenção.

Como isto funciona:
- O autor nos leva por um caminho rumo a um destino (sua intenção). Boas perguntas nos levam por esse caminho. Outras perguntas podem ser interessantes, mas nos desviarão do curso. Devemos ter o cuidado de responder as boas perguntas e deixar as falaciosas para trás.
- Boas perguntas são imprescindíveis para fazer boas observações sobre o texto.
- Existem dois tipos de boas perguntas: básicas e vigorosas.
  - As perguntas básicas formam um alicerce fundamental e nos dão um ponto de partida. Elas nos ajudam a identificar informações e ideias no texto. Tais perguntas são geralmente sobre quem, o quê, quando e onde.
  - Perguntas vigorosas vão além das básicas. Elas nos ensinam a entender o raciocínio e a intenção do texto. Tais perguntas são, via de regra, sobre o porquê e sobre como.
  - Comece pelas perguntas básicas; e então certifique-se de passar para as mais vigorosas. Perguntas vigorosas requerem mais curiosidade, discernimento e perseverança que as básicas.

Por que isto é importante:
- É o ponto de partida para permanecer na linha e é uma técnica usada em todos os princípios seguintes.
- Leva a observações astutas e aguçadas que levam à ideia principal e ao intento transformador do autor.
- Ajuda nossa pregação a ir além de ideias e informações sobre o texto para a mensagem exata e a mudança que Deus deseja a partir do texto.`,
  },

  genero: {
    title: 'Gênero',
    text: `Na literatura, gênero é um tipo específico de escrita.

Como isto funciona:
- Tipos diferentes de frutas têm características distintas, e "abordamos" cada uma de forma diferente para comê-las. Gêneros diferentes têm características distintas, e abordamos cada um de forma diferente à medida que estudamos.
- Gêneros diferentes incluem história (narrativa), poesia, carta, etc. A Bíblia inclui muitos tipos de gêneros - podemos classificar cada livro por um gênero principal (narrativa, profecia, epístola, etc.), e muitos incluem subgêneros (ex: as genealogias de Gênesis são parte de uma narrativa) ou outros gêneros (ex: a poesia em Jonas 2).
- Existe um espectro que compara o uso da língua entre os gêneros: em uma ponta, uso direto, concreto e propositivo (Lei, Epístola); no meio, Narrativa e Profecia; na outra ponta, uso pictórico, imaginativo e emotivo (Poesia, Evangelho, Sabedoria, Apocalíptico). Um gênero tende a se inclinar em uma direção, mas pode apresentar características do outro lado.
- O autor escolheu intencionalmente o gênero para se adequar à sua mensagem e propósito.

Tom e Humor:
- Incorporado em cada mensagem está o tom do autor: sua atitude em relação ao seu tema (alegria, encorajamento, repreensão, tristeza, etc.), expressa por meio das descrições, verbos e expressões que ele usa.
- O autor intencionalmente usa o tom para criar um estado de espírito no leitor - esse humor é a atitude com a qual o autor pretende que o leitor reaja (ex: tom de repreensão visando arrependimento, tom de alegria visando gratidão). A transformação pretendida não é apenas de ações, mas também de atitudes.
- A pregação de qualquer gênero deve ser feita com o tom do autor e visa criar no ouvinte o estado de espírito almejado, a fim de pastorear a transformação que Deus pretende.

Por que isto é importante:
- É uma das primeiras perguntas que deve ser feita, porque conduz a um entendimento natural e correto da mensagem, propósito e tom do autor.
- Norteia a enxergar a estrutura inerente no texto.
- Desenvolve nossa habilidade de proclamar a Palavra de Deus de forma que capte e esclareça a mensagem, o propósito e o tom do autor.

Características principais por gênero:
- Lei: relação de aliança - as partes de uma aliança (história, estipulações, promessas de bênçãos e maldições); instrução; reflete o caráter e os propósitos de Deus.
- Poesia: paralelismo; imagens e metáforas; emoção; expressão do coração humano; facilmente lembrado; cânticos e orações. Para o tom, procure imagens estendidas, expressões emocionais, perguntas.
- Profecia: relação de aliança; juízo com promessas de esperança; camadas de cumprimento; emoções; imagens; grandeza e santidade de Deus; atividade de Deus no mundo. Para o tom, procure imagens intensas, acusações, advertências, promessas.
- Evangelho: biográfico com perspectivas distintas da teologia bíblica; chegada do rei prometido; proclamação e chamada à reação; enredo. Para o tom, procure ações, reações, perguntas, andamento.
- Narrativa Histórica: as partes de uma história, incluindo o clímax e a resolução; histórias menores que se desmembram numa história maior; personagens principais e secundários; Deus, o personagem supremo; diálogo; cenas; o narrador enquadrando a história. Para o tom, procure descrições de personagens e configurações, ações, reações.
- Literatura de Sabedoria: poética, figurativa e fácil de lembrar em vez de literal e precisa; princípios gerais em vez de promessas absolutas; preocupada com a vida prática e a realidade em vez de ideias puramente teológicas; fundada no temor do Senhor. Para o tom, procure descrições, contrastes, resultados.
- Parábola: ilustração da verdade espiritual projetada para surpreender e desafiar; juízo para alguns, encorajamento e clareza para outros; detalhes que sustentam um ponto principal geral; pode ilustrar um ensinamento que vem antes ou depois. Para o tom, procure surpresas, descrições de personagens e configurações.
- Epístola: situação; verdades teológicas ligadas à ocasião; verdade proposicional com um fluxo lógico de pensamento; verdade levando à aplicação. Para o tom, procure descrições do público e ambiente, verbos vigorosos.
- Apocalíptico: imagens simbólicas; fim dos tempos; o julgamento vindouro de Deus e a salvação; um chamado para perseverar, acreditar. Para o tom, procure imagens intensas, ação dramática, ameaças, promessas.`,
  },

  estrutura: {
    title: 'Estrutura',
    text: `Estrutura refere-se a unidades de pensamento organizadas de maneira específica para atingir o propósito do autor.

Como isto funciona:
O escritor usa uma estrutura adequada ao gênero. Embora o gênero influencie a maneira como abordamos a estrutura, alguns elementos são comuns em todos os gêneros:
- Unidades de Pensamento: uma unidade é uma porção de material que se mantém por uma unidade de pensamento. Reconhece-se uma nova unidade de duas maneiras: (1) existe uma mudança de assunto ou desenvolvimento de pensamento; (2) essa mudança é muitas vezes sinalizada por palavras-chave (entretanto, mas, portanto, além disso, finalmente, etc.).
- Organizada de maneira específica: em boa escrita, as unidades ostentam um relacionamento mútuo. Reconhece-se esse modelo procurando padrões como repetições, progressões, contrastes/comparações, transições/declarações resumidas, clímax e resoluções, ordens, perguntas feitas e respondidas, ou mudança de orador, hora ou local. Pergunte: Como a passagem começa? Como termina? Como uma unidade se conecta à outra? Qual é a forma geral da estrutura?
- Atingir o Propósito do Autor: o autor escolheu intencionalmente a estrutura - ela sustenta e revela a ideia e o intento transformador do autor.

Passos para encontrar a estrutura:
1. Identifique o gênero e como ele molda a estrutura (ex: um gênero narrativo será estruturado por introdução, aumento da tensão, clímax e resolução).
2. Compare o fim com o começo - leia até o final natural da passagem, depois olhe para o final à luz do começo.
3. Procure padrões e mudanças de pensamento: repetições, progressões, contrastes/comparações, transições/declarações resumidas, ordens (especialmente epístolas), clímax e solução (especialmente narrativa), perguntas feitas e respondidas.
4. Identifique as unidades de pensamento que refletem o desenvolvimento dos pensamentos do autor.
5. Descreva a ideia principal de cada unidade de pensamento do texto.
6. Encontre as conexões entre as ideias principais das unidades - como elas se conectam e revelam a ênfase do pensamento do autor.

Por que isto é importante:
- Está inserida no gênero e nos conduz pelo caminho da mensagem do autor.
- Ajuda a distinguir as partes do todo e a enfatizar a ideia principal.
- Assegura que a forma do sermão reflita a forma da mensagem do autor.
- Traz confiança ao pregador e clareza, propósito e poder ao que ele proclama.`,
  },

  contexto: {
    title: 'Instruções de Viagem (Contexto e Aplicação / "Sem Rota Direta")',
    text: `Este princípio diz respeito à relação entre contexto e aplicação. Antes de podermos explicar o texto devemos observá-lo cuidadosamente em seu contexto - isso nos ajuda a descobrir a ideia principal e o intento transformador do autor, para então fazer aplicações precisas e convincentes, alinhadas com a intenção do autor.

Como isto funciona:
- Sem rota direta: muitas vezes somos tentados a ler a Palavra de Deus e aplicá-la imediatamente em nossas vidas ("nós hoje" direto para a "Palavra de Deus"). Este é um atalho que não devemos pegar.
- O contexto original: em vez disso, devemos fazer o trabalho árduo de entender o texto em seu contexto bíblico original, para entender o intento transformador do autor para o público original. O contexto original inclui:
  - A situação do público original e o relacionamento com o autor (ex: Efésios nos orienta a voltar a Atos). Pergunte: "Qual era a intenção desta mensagem para eles?"
  - As unidades de pensamento imediatamente antes e depois da passagem. Pergunte: "Por que o autor diz isso aqui? Como isso se conecta à ideia principal mais ampla?"
  - O uso de conexões literárias com outras partes das Escrituras (ex: Paulo usa Números 16 para enfatizar um ponto em 2 Timóteo 2.14-19).
  - A chave é entender as partes certas do contexto: O que o autor diz? Por que ele diz isso dessa maneira? Por que ele diz isso aqui? O que há de surpreendente nisso?
- Nós hoje: só depois desse trabalho nossa aplicação do texto será precisa e convincente, moldada pela intenção do autor. Pergunte-se: "À luz do intento transformador do autor para seu público original, como devemos reagir?"

Por que isto é importante:
- O objetivo da pregação é a transformação que o autor está tencionando.
- Se pegarmos o atalho ("rota direta"), provavelmente interpretaremos e aplicaremos mal o texto.
- Percorrendo o caminho pelo contexto original, ganhamos confiança de que entendemos o que o autor realmente disse e o propósito para o qual o disse, e fazemos aplicações precisas e convincentes moldadas pelo intento transformador do autor.`,
  },

  ideia_principal_intento_transformador: {
    title: 'A Ideia Principal & Intento Transformador',
    text: `Deus tem um propósito em cada livro e passagem da Bíblia. A tarefa do pregador é proclamar a mensagem de Deus, pastoreando as pessoas com seu propósito. Este princípio é sobre o alinhamento da mensagem do autor no texto (a linha) e o sermão do pregador - a linha do texto é a linha do sermão voltada para o coração.

Como isto funciona:
Todos os princípios anteriores nos ajudam a chegar à ideia principal e ao intento transformador. Deus tem propósito em Sua mensagem - os elementos dessa mensagem são:
- Ideia Principal: uma declaração resumida da mensagem do autor, com seu tom (atitude do autor em relação à sua mensagem). Pergunte: "O que o autor está dizendo?" - qual é a ideia geral e o que ele diz especificamente sobre ela. Escreva uma frase concisa, mas completa.
- Tom e Humor: pergunte "Como o autor diz isso?" - que perspectiva, convicção, sentimentos o autor expressa, e que perspectiva/sentimento ele pretende criar no leitor. Reafirme a ideia principal de uma forma que expresse esse tom e humor.
- Intento Transformador: a mudança que Deus busca através da mensagem do autor, com o humor pretendido (a atitude do leitor em resposta). Pergunte: "Por que o autor diz isso?" - que mudança ou resposta Deus busca no ouvinte (pensamentos, atitudes, comportamento). Reafirme a ideia principal direcionada para essa transformação pretendida.
- Os três estão integralmente conectados: o tom informa a ideia principal; o tom e a ideia principal moldam o intento transformador. A ideia principal e o intento transformador devem ser gerais o suficiente para expressar todo o pensamento do autor, mas específicos o suficiente para diferenciá-lo de outros livros ou passagens.

Nós devemos proclamar a mensagem de Deus com seu propósito:
- Deixe clara a ideia principal e o intento transformador, e organize o sermão em torno deles.
- Exponha de forma mais didática (instrutiva) e menos descritiva (informativa).
- Pregue com o tom do autor.
- Pastoreie as pessoas com aplicações precisas e atraentes que fluem do intento transformador.

Por que isto é importante:
- É o ponto culminante de todos os princípios anteriores.
- Ajuda-nos a ouvir a mensagem tencionada por Deus e a sermos transformados por ela.
- Ajuda-nos a pregar essa mensagem e a comunicar o poder transformador de Deus aos outros.`,
  },

  teologia_biblica: {
    title: 'Teologia Bíblica',
    text: `A teologia bíblica enxerga a Bíblia como uma história que encontra seu foco e cumprimento em Jesus. Essa maneira de ler a Bíblia é fiel à sua natureza e ao propósito de Deus.

Três partes da definição:
- Uma história: a Bíblia é uma biblioteca de sessenta e seis livros escritos por cerca de quarenta autores ao longo de mil e quatrocentos anos. Cada livro serve a um propósito único, mas também contribui para uma história coesa e progressiva, cujo grande tema encontramos no clímax: Deus habitará com o homem; Ele será o seu Deus e eles serão o Seu povo (Apocalipse 21.1-3).
- O foco e o cumprimento em Jesus: cada parte da história revela a obra de Deus para realizar esse grande tema por meio de Seu Filho.
- Fiel à natureza das Escrituras e ao propósito de Deus nela: esta é a maneira que Jesus leu e ensinou a Bíblia (Lucas 24.25-27,44-49; João 5.39-40) e a maneira que os discípulos vieram a lê-la e ensiná-la.

Estradas Principais em um Mapa: podemos pensar na Bíblia como um mapa em que todas as estradas do Antigo Testamento levam a Cristo. Nem todas são rodovias principais - as estradas principais são passagens com conexão direta e clara com Cristo; as menores eventualmente se conectam às principais. Ao estudar uma passagem numa estrada lateral, pergunte: "Como esta passagem me leva até a estrada principal?"

Quatro Perguntas para fazer Teologia Bíblica:
1. Qual é a ideia principal e o intento transformador desta passagem ou deste livro?
2. Como os temas-chave na ideia principal e no intento transformador se desenvolveram através da história da Bíblia até este ponto?
3. O que isso nos diz a respeito de como Deus opera?
4. Como Deus realizou essas coisas por meio de Jesus?

Seis maneiras pelas quais uma passagem pode encontrar seu foco e cumprimento em Cristo:
1. Profecias e promessas que Jesus realiza.
2. Temas e imagens que Jesus cumpre (sistema sacrificial, descanso, aliança, templo/habitação, realeza, esperança, etc.).
3. Padrões de como Deus opera, que Jesus realiza (usar o fraco/inesperado, o bem por meio do sofrimento, reversões soberanas, etc.).
4. Tensões que só são resolvidas em Jesus (juízo/salvação, líderes que fracassam, inclusão de gentios, etc.).
5. O caráter de Deus sendo plenamente expresso em Jesus.
6. Explicações e aplicações da obra de Jesus que nos fortalecem na Nova Aliança.

A natureza distinta de cada Testamento:
- Antigo Testamento: muitos temas que se unem como fios de uma corda; progressão através da história de Israel rumo a Cristo; expectativa crescente apesar do fracasso e juízo, com esperança nas promessas de Deus; incompletude - a história está inacabada e à procura de solução.
- Novo Testamento: cumprimento - Jesus veio e revela como cumpriu e cumprirá as promessas de Deus; nova aliança - o Novo Testamento revela como Jesus cumpre a antiga aliança e inaugura a nova; já-mas-ainda-não - o cumprimento chegou em Jesus, mas a plena realidade aguarda Sua volta.

Por que isto é importante:
- Ajuda-nos a ver o texto, a ideia principal e o intento transformador à luz da Bíblia toda.
- É a maneira pela qual Jesus e os discípulos entenderam a Bíblia.
- Ajuda-nos a proclamar as glórias de Cristo e o Evangelho como foco e cumprimento das Escrituras.
- Garante que sirvamos como ministros da nova aliança de forma norteada pela graça.

Atenção pastoral: use esta conexão apenas quando houver base textual suficiente - nunca force Cristo no texto de modo artificial.`,
  },

  texto_estrutura: {
    title: 'Texto e Estrutura ("O Texto É Rei")',
    text: `O texto é uma passagem da Bíblia. A "estrutura" aqui (sentido diferente do princípio "Estrutura" das unidades de pensamento) é a nossa compreensão de como as coisas são e como funcionam - nossas estruturas mentais, teológicas e culturais pré-existentes. Devemos permitir que o texto questione e molde nossas estruturas, e não o contrário. O texto é rei.

Como isto funciona:
- Todo mundo tem uma estrutura. Estruturas são necessárias para organizar e expressar nosso pensamento; desenvolvem-se ao longo do tempo pelo que nos é ensinado, pelo que experimentamos e por nosso lugar na história. À medida que novas informações chegam, decidimos rejeitá-las ou permitir que reformulem nossas estruturas. Algumas estruturas são consistentes com a Palavra de Deus; outras não. Ao longo da vida, nossas estruturas podem ser moldadas pela Palavra de Deus.
- As estruturas influenciam a forma como lemos a Bíblia - a maneira como pensamos acerca de Deus, do homem, do pecado, do sofrimento, da salvação e de muitas outras coisas. Algumas estruturas refletem com precisão o texto bíblico; outras não. Devemos reconhecer a distinção entre texto e estrutura, e a influência que nossas estruturas exercem sobre nós.
- A Bíblia confronta nossas estruturas. O texto é rei! As palavras de Deus devem governar e moldar nossas estruturas: trabalhe para entender nossas estruturas, peça a Deus para revelar onde elas diferem do texto, e peça a Deus para nos modificar e alinhar mente, emoção e vontade com a Dele.
- A pregação aplica o texto às estruturas de nosso público. A transformação que Deus pretende está no nível do coração dessas estruturas - a aplicação específica e convincente é feita abordando o texto para as estruturas do público.

Por que isto é importante:
- A natureza das Escrituras: há uma singularidade nas palavras de Deus - somente elas podem produzir vida e cumprir Seus propósitos (Salmo 19.7-11; Isaías 55.9-11; 2 Timóteo 3.16-17).
- O chamado em nossas vidas: Deus nos ordena dar ouvidos à Sua Palavra, servi-la e proclamá-la (Salmo 34.11; Isaías 55.1-3; Marcos 4.3-25; 2 Timóteo 2.14-19, especialmente v.15).
- O resultado que é produzido: onde as estruturas governam, a Palavra de Deus é anulada (Marcos 7.1-13); onde o texto é rei, a Palavra de Deus confere vida.
- A tarefa à mão: ajuda a pensar por meio de nossas estruturas, aplicar a ideia principal e o intento transformador, e alinhar mente, emoção e vontade com o próprio coração de Deus.`,
  },

  estude_o_sermao: {
    title: 'Estude o Sermão (Elaborando o Sermão)',
    text: `Este processo ajuda a passar da compreensão do texto para a proclamação, visando a transformação que Deus tenciona. Pregação expositiva significa que a mensagem transformadora do texto da Escritura é a razão do sermão.

Convicções sobre Pregar para Transformar:
- A Palavra: a linha da Palavra de Deus nos impele a pregar e pastorear pessoas com a ideia principal e o intento transformador do autor.
- O Espírito: o Espírito de Deus trabalha através de Sua Palavra para produzir a transformação que Ele tenciona.
- O pregador: precisa depender do Espírito de Deus em oração para que Ele opere por meio de Sua Palavra.

Elaborando o Sermão (ilustração do alvo - o objetivo é acertar):
- Alvo (objetivo): a transformação que Deus tenciona a partir do texto.
- Objetivo: proclamar e pastorear os ouvintes com a ideia principal e o intento transformador do autor.
- Abordagem: trabalhe o texto usando todos os princípios deste método antes de escrever o sermão; o sermão deve fluir naturalmente da estrutura, da ideia principal e do intento transformador do texto - transforme o intento do autor no seu próprio intento.

Processo:
1. Indique claramente a ideia principal e o intento transformador - o que Deus está procurando realizar na vida do ouvinte deve nortear o sermão do começo ao fim.
2. Mostre a estrutura do autor.
3. Selecione cuidadosamente o material que ajudará a estabelecer, explicar e aplicar a ideia principal, o intento transformador e a estrutura do texto - considerando como isso se relaciona com a teologia bíblica (proclamar Cristo) e como coloca em cheque as estruturas existentes do público.
4. Escreva a introdução e a conclusão por último: a introdução abre a porta para a ideia principal e o intento transformador; a conclusão oferece um resumo e desafio final.

Considerações adicionais sobre aplicação e pastoreio:
- A transformação leva tempo e deve ser buscada por meio da dependência de Deus em oração.
- A aplicação precisa e convincente flui e é moldada pela ideia principal e pelo intento transformador. Pergunte: "À luz disso, como devemos reagir?"
- A boa aplicação apascenta as pessoas com a graça de Deus presente na nova aliança, levando ao arrependimento, fé e adoração.
- A aplicação pode ter muitas formas: perguntas, instruções, imperativos, exemplos ou ilustrações - considerando estruturas existentes, questões atuais, circunstâncias pessoais, faixas etárias e tipos de personalidade.
- A aplicação deve fluir para a oração de encerramento, pedindo a Deus para realizar a mudança que Ele deseja.

Por que isto é importante:
- Esclarece a tarefa do pregador ou professor da Palavra de Deus.
- Ajuda a alinhar a mensagem para comunicar e pastorear a mudança que Deus pretende.
- Traz confiança ao pregador e ao ouvinte de que a Palavra de Deus foi proclamada corretamente e aplicada de maneira convincente.

Aviso do próprio livreto: não usar estes elementos-chave de maneira mecânica - boa comunicação incorpora criatividade e variedade de estilo.`,
  },
};

// Mapeia o rótulo de etapa que o frontend envia (STEPS[].label em
// src/pages/StudyController.tsx, repassado como `stage` em stageFeedback)
// para os princípios do livreto relevantes àquela etapa. "linha" é sempre
// incluída à parte (ver getMethodContextForStage) - é o princípio-guarda-
// -chuva, válido em qualquer etapa.
const STAGE_LABEL_TO_PRINCIPLES: Record<string, PrincipleKey[]> = {
  'Observação': ['boas_perguntas'],
  'Perguntas': ['boas_perguntas'],
  'Gênero & Estilo': ['genero', 'estrutura'],
  'Contexto': ['contexto'],
  'Ideia Principal': ['ideia_principal_intento_transformador'],
  'Intento': ['ideia_principal_intento_transformador', 'teologia_biblica'],
  'Esboço': ['estrutura', 'estude_o_sermao'],
  'Sermão': ['texto_estrutura', 'estude_o_sermao'],
};

function renderPrinciples(keys: PrincipleKey[]): string {
  return keys
    .map((key) => {
      const principle = CAVAR_E_DESCOBRIR_PRINCIPLES[key];
      return `### ${principle.title}\n${principle.text}`;
    })
    .join('\n\n');
}

// Usado por stageFeedback: injeta só "Linha" + o(s) princípio(s) da etapa
// atual, em vez do livreto inteiro - a etapa já é conhecida com certeza
// (vem do app, não de busca semântica), então não há necessidade de RAG.
export function getMethodContextForStage(stageLabel?: string): string {
  const stageKeys = (stageLabel && STAGE_LABEL_TO_PRINCIPLES[stageLabel]) || [];
  const keys = Array.from(new Set<PrincipleKey>(['linha', ...stageKeys]));
  return `TEXTO OFICIAL DO MÉTODO (fonte primária, mais autoritativa que sua própria síntese):\n\n${renderPrinciples(keys)}`;
}

// Usado por askInstructor/generalChat: não há uma etapa única conhecida,
// então injeta o livreto completo (~9 mil palavras, cabe folgado no contexto
// do modelo).
export function getFullMethodText(): string {
  const allKeys = Object.keys(CAVAR_E_DESCOBRIR_PRINCIPLES) as PrincipleKey[];
  return `TEXTO OFICIAL DO MÉTODO (fonte primária, mais autoritativa que sua própria síntese):\n\n${renderPrinciples(allKeys)}`;
}
