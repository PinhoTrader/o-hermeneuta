const STUDY_STEPS=[
{id:'observation',label:'Observação',desc:'O que o texto diz? Note repetições, contrastes e conectivos.',placeholder:'Ex: Repetição da palavra "Verbo" (v.1, 14)...',tip:'Mantenha-se na LINHA. Liste fatos objetivos que seus olhos vêem. Não tente interpretar ou aplicar ainda.'},
{id:'questions',label:'Perguntas',desc:'O que você quer perguntar ao texto? O que não está claro?',placeholder:'Ex: Por que João chama Jesus de "O Verbo"?',tip:'Vá além das perguntas básicas. Faça perguntas VIGOROSAS que buscam a racionalidade e o intento do autor.'},
{id:'genre',label:'Gênero',desc:'Identifique o gênero literário e como o autor organiza as ideias.',placeholder:'Gênero: Narrativa/Poesia/Epístola...',tip:'Identifique o TOM (atitude do autor) e o HUMOR (estado de espírito pretendido no leitor).'},
{id:'context',label:'Contexto',desc:'Explore o pano de fundo histórico, cultural e literário.',placeholder:'Contexto Histórico: Escrito por volta de...',tip:'NÃO pegue o atalho da aplicação imediata. Entenda a situação do público original.'},
{id:'main_idea',label:'Ideia Principal',desc:'Sintetize a mensagem central do texto em uma frase concisa.',placeholder:'A ideia principal deste texto é...',tip:'Síntese fiel: o que o autor diz + o TOM dele.'},
{id:'intent',label:'Intento',desc:'Qual é o propósito prático e transformador para os ouvintes?',placeholder:'Este texto visa transformar a vida do crente ao...',tip:'Por que o autor diz isso? Qual a mudança que Deus busca no coração do ouvinte?'},
{id:'outline',label:'Esboço',desc:'Organize os pontos principais do sermão.',placeholder:'I. Introdução\nII. Ponto 1...',tip:'A estrutura do sermão deve fluir da estrutura do texto.'},
{id:'sermon',label:'Sermão',desc:'Elabore o conteúdo completo, ilustrações e aplicações.',placeholder:'Texto final do sermão...',tip:'O TEXTO É REI. Aplique o texto pastoreando com aplicações que fluem da nova aliança em Jesus.'}
];
function StudyStepScreen({bibleRef,onFinish}){
const {Button,StepTabs}=window.OHermeneutaDesignSystem_375223;
const {Icon}=window;
const [idx,setIdx]=React.useState(0);
const [content,setContent]=React.useState('');
const [aiOpen,setAiOpen]=React.useState(false);
const [refCollapsed,setRefCollapsed]=React.useState(false);
const step=STUDY_STEPS[idx];
const tabLabels=[...STUDY_STEPS.map(s=>s.label),'Finalização'];
const next=()=>{setContent('');setAiOpen(false);if(idx<STUDY_STEPS.length-1)setIdx(idx+1);else onFinish();};
return React.createElement('div',{style:{maxWidth:1100,margin:'0 auto',padding:'32px 20px 80px'}},
React.createElement('div',{style:{borderBottom:'1px solid var(--border-default)',paddingBottom:20,marginBottom:24}},
React.createElement('h1',{style:{fontSize:19,fontWeight:700,margin:0}},'Estudo: ',bibleRef),
React.createElement('p',{style:{fontSize:11,color:'var(--text-secondary)',fontWeight:600,margin:'4px 0 12px'}},'Progresso: ',Math.round(idx/(STUDY_STEPS.length)*100),'%'),
React.createElement(StepTabs,{steps:tabLabels,activeIndex:idx,onSelect:setIdx})),
React.createElement('div',{style:{display:'grid',gridTemplateColumns:'2fr 1fr',gap:32}},
React.createElement('div',{style:{display:'flex',flexDirection:'column',gap:20}},
React.createElement('div',null,React.createElement('h2',{style:{fontFamily:'var(--font-serif)',fontSize:24,fontWeight:700,margin:0}},step.label),React.createElement('p',{style:{color:'var(--text-secondary)',fontSize:13,margin:'4px 0 0'}},step.desc)),
React.createElement('div',{style:{padding:24,background:'#fff',border:'1px solid var(--border-subtle)',borderRadius:16}},
React.createElement('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:refCollapsed?0:8}},
React.createElement('h4',{style:{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',color:'color-mix(in oklch,var(--color-brand-primary) 60%,transparent)',margin:0}},'Texto de Referência'),
React.createElement('button',{onClick:()=>setRefCollapsed(!refCollapsed),title:refCollapsed?'Expandir':'Minimizar',style:{border:'none',background:'none',cursor:'pointer',color:'var(--text-tertiary)',padding:4}},React.createElement(Icon,{name:refCollapsed?'chevron-down':'chevron-up',size:16}))),
!refCollapsed&&React.createElement('p',{style:{fontFamily:'var(--font-serif)',fontSize:17,fontStyle:'italic',color:'var(--text-primary)',lineHeight:1.6,margin:0}},'"No princípio era o Verbo, e o Verbo estava com Deus, e o Verbo era Deus." ',React.createElement('span',{style:{fontFamily:'var(--font-sans)',fontStyle:'normal',fontWeight:700,color:'var(--color-brand-primary)'}},'— ',bibleRef))),
React.createElement('textarea',{value:content,onChange:e=>setContent(e.target.value),placeholder:step.placeholder,style:{width:'100%',minHeight:220,padding:20,borderRadius:16,border:'1px solid rgba(255,255,255,0.2)',background:'rgba(255,255,255,0.8)',backdropFilter:'blur(8px)',fontFamily:'var(--font-sans)',fontSize:14,lineHeight:1.6,outline:'none',resize:'vertical'}}),
React.createElement('div',{style:{display:'flex',justifyContent:'space-between'}},
React.createElement(Button,{variant:'ghost',size:'sm'},React.createElement(Icon,{name:'save',size:16}),'Salvar rascunho'),
React.createElement('div',{style:{display:'flex',gap:12}},
React.createElement(Button,{variant:'outline',onClick:()=>setIdx(Math.max(0,idx-1))},React.createElement(Icon,{name:'chevron-left',size:18}),'Voltar'),
React.createElement(Button,{onClick:next},idx===STUDY_STEPS.length-1?'Finalizar':'Próximo Passo',React.createElement(Icon,{name:'chevron-right',size:18,color:'#fff'}))))),
React.createElement('div',null,
React.createElement('div',{className:'glass-card',style:{padding:24,borderRadius:16}},
React.createElement('div',{style:{display:'flex',alignItems:'center',gap:12,marginBottom:16}},
React.createElement('div',{style:{width:40,height:40,borderRadius:999,background:'var(--color-brand-primary)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center'}},React.createElement(Icon,{name:'sparkles',size:20,color:'#fff'})),
React.createElement('div',null,React.createElement('h3',{style:{fontWeight:700,fontSize:14,margin:0}},'Instrutor de IA'),React.createElement('p',{style:{fontSize:9,color:'var(--text-tertiary)',fontWeight:700,textTransform:'uppercase',margin:0}},'O Hermeneuta'))),
!aiOpen?React.createElement(React.Fragment,null,
React.createElement('p',{style:{fontSize:13,color:'var(--text-secondary)',fontStyle:'italic',lineHeight:1.6}},'Precisa de ajuda para aprofundar sua análise nesta etapa? Peça uma revisão pedagógica baseada no seu texto.'),
React.createElement(Button,{style:{width:'100%',background:'var(--slate-900)'},onClick:()=>setAiOpen(true)},React.createElement(Icon,{name:'sparkles',size:16,color:'#fff'}),'Revisar com IA')):
React.createElement(React.Fragment,null,
React.createElement('p',{style:{fontSize:13,color:'var(--text-secondary)',lineHeight:1.6}},'Ótima observação sobre as repetições! Considere também investigar o contraste entre luz e trevas nos versículos seguintes — isso reforça o tema central do autor.'),
React.createElement(Button,{variant:'outline',size:'sm',style:{width:'100%'},onClick:()=>setAiOpen(false)},'Entendi, obrigado!'))),
React.createElement('div',{style:{marginTop:20,padding:24,background:'var(--amber-050)',borderRadius:16,border:'1px solid var(--amber-100)'}},
React.createElement('div',{style:{display:'flex',alignItems:'center',gap:8,marginBottom:8,color:'var(--amber-700)'}},React.createElement(Icon,{name:'sparkles',size:14}),React.createElement('span',{style:{fontSize:9,fontWeight:900,textTransform:'uppercase',letterSpacing:'0.15em'}},'Dica de Ouro do Método')),
React.createElement('p',{style:{fontSize:13,color:'#78350f',fontWeight:500,lineHeight:1.6,margin:0}},step.tip)))));
}
window.StudyStepScreen=StudyStepScreen;
