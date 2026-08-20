const MODULES=[
{order:1,title:'Módulo 1: O Alicerce',desc:'A base espiritual e o coração do estudioso da Bíblia.',lessons:[{id:'l1',title:'O Coração do Pregador',order:1}]},
{order:2,title:'Módulo 2: Cavar (Observação)',desc:'Aprendendo a olhar antes de concluir.',lessons:[{id:'l2',title:'A Arte de Observar',order:1}]},
{order:3,title:'Módulo 3: Entender (Interpretação)',desc:'O que o texto significava para os leitores originais?',lessons:[{id:'l3',title:'A Ponte entre Mundos',order:1}]}
];
function AcademyScreen(){
const {Button}=window.OHermeneutaDesignSystem_375223;
const {Icon}=window;
const [lesson,setLesson]=React.useState(null);
const [quiz,setQuiz]=React.useState(null);
if(lesson)return React.createElement('div',{style:{maxWidth:900,margin:'0 auto',padding:'32px 20px 80px'}},
React.createElement('button',{onClick:()=>{setLesson(null);setQuiz(null);},style:{display:'flex',alignItems:'center',gap:8,background:'none',border:'none',color:'var(--text-tertiary)',fontWeight:700,fontSize:11,textTransform:'uppercase',letterSpacing:'0.1em',cursor:'pointer',marginBottom:24}},React.createElement(Icon,{name:'arrow-left',size:16}),'Voltar à Trilha'),
React.createElement('div',{style:{background:'#fff',padding:40,borderRadius:32,border:'1px solid var(--border-subtle)',marginBottom:24}},
React.createElement('h1',{style:{fontFamily:'var(--font-serif)',fontSize:28,fontWeight:700,margin:'0 0 16px'}},lesson.title),
React.createElement('p',{style:{lineHeight:1.7,color:'var(--text-primary)'}},'O estudo da Bíblia não é apenas um exercício intelectual, mas uma jornada espiritual. Antes de "cavar" o texto, precisamos preparar o terreno do nosso coração.'),
React.createElement('p',{style:{fontStyle:'italic',color:'var(--text-secondary)'}},'"Abre os meus olhos para que eu veja as maravilhas da tua lei." (Salmo 119:18)')),
!quiz?React.createElement('div',{style:{padding:48,borderRadius:32,background:'var(--color-brand-primary)',color:'#fff',textAlign:'center'}},
React.createElement('h3',{style:{fontFamily:'var(--font-serif)',fontStyle:'italic',fontSize:26,margin:'0 0 12px'}},'Hora do Desafio!'),
React.createElement('p',{style:{opacity:0.9,margin:'0 0 20px'}},'Vamos testar seus conhecimentos sobre esta lição.'),
React.createElement(Button,{style:{background:'#fff',color:'var(--color-brand-primary)'},onClick:()=>setQuiz('open')},'Começar Exercício')):
React.createElement('div',{style:{background:'#fff',padding:40,borderRadius:32,border:'1px solid var(--border-subtle)',textAlign:'center'}},
React.createElement('div',{style:{width:80,height:80,borderRadius:999,background:'var(--state-success-bg)',color:'var(--state-success-text)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}},React.createElement(Icon,{name:'check-circle-2',size:40})),
React.createElement('h3',{style:{fontFamily:'var(--font-serif)',fontSize:24,fontWeight:700,margin:'0 0 8px'}},'Excelente Trabalho!'),
React.createElement('p',{style:{color:'var(--text-secondary)',margin:'0 0 20px'}},'Lição concluída com sucesso.'),
React.createElement(Button,{onClick:()=>{setLesson(null);setQuiz(null);}},'Voltar à Trilha')));
return React.createElement('div',{style:{maxWidth:900,margin:'0 auto',padding:'32px 20px 80px'}},
React.createElement('div',{style:{textAlign:'center',marginBottom:40}},
React.createElement('div',{style:{display:'inline-flex',alignItems:'center',gap:8,padding:'6px 14px',borderRadius:999,background:'color-mix(in oklch,var(--color-brand-primary) 10%,transparent)',color:'var(--color-brand-primary)',fontSize:11,fontWeight:700,textTransform:'uppercase',marginBottom:16}},React.createElement(Icon,{name:'sparkles',size:14}),'Academia do Método'),
React.createElement('h1',{style:{fontFamily:'var(--font-serif)',fontStyle:'italic',fontSize:36,fontWeight:700,margin:0}},'Trilha O Hermeneuta'),
React.createElement('p',{style:{color:'var(--text-secondary)',maxWidth:520,margin:'12px auto 0'}},'Domine as ferramentas da hermenêutica bíblica através de um guia passo a passo.')),
MODULES.map(mod=>React.createElement('div',{key:mod.order,style:{display:'flex',gap:24,marginBottom:32}},
React.createElement('div',{style:{width:56,height:56,borderRadius:16,background:'var(--color-brand-primary)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:18,flexShrink:0}},mod.order),
React.createElement('div',{style:{flex:1}},
React.createElement('h2',{style:{fontFamily:'var(--font-serif)',fontSize:20,fontWeight:700,margin:'0 0 4px'}},mod.title),
React.createElement('p',{style:{fontSize:13,color:'var(--text-secondary)',margin:'0 0 16px'}},mod.desc),
React.createElement('div',{style:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:12}},
mod.lessons.map(l=>React.createElement('button',{key:l.id,onClick:()=>setLesson(l),style:{textAlign:'left',padding:20,borderRadius:16,border:'1px solid var(--border-subtle)',background:'#fff',cursor:'pointer'}},
React.createElement('div',{style:{width:36,height:36,borderRadius:10,background:'var(--surface-sunken)',color:'var(--text-tertiary)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:12}},React.createElement(Icon,{name:'book-open',size:18})),
React.createElement('h3',{style:{fontWeight:700,fontSize:14,margin:'0 0 4px'}},l.title),
React.createElement('span',{style:{fontSize:11,color:'var(--text-tertiary)'}},'Lição ',l.order,' • ~10 min'))))))));
}
window.AcademyScreen=AcademyScreen;
