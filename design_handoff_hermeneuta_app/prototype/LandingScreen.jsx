function FeatureCard({f,Icon}){
const [hover,setHover]=React.useState(false);
return React.createElement('div',{onMouseEnter:()=>setHover(true),onMouseLeave:()=>setHover(false),style:{padding:28,borderRadius:24,background:hover?'rgba(255,255,255,0.1)':'rgba(255,255,255,0.05)',border:hover?'1px solid rgba(63,107,79,0.4)':'1px solid rgba(255,255,255,0.1)',transition:'all .5s ease'}},
React.createElement('div',{style:{width:48,height:48,borderRadius:14,background:'rgba(63,107,79,0.3)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:20,transform:hover?'scale(1.1)':'scale(1)',transition:'transform .3s ease'}},React.createElement(Icon,{name:f.icon,size:22,color:'#fff'})),
React.createElement('h3',{style:{fontFamily:'var(--font-serif)',fontSize:18,fontWeight:700,color:'#fff',textTransform:'uppercase',margin:'0 0 10px'}},f.title),
React.createElement('p',{style:{fontSize:14,color:'#94a3b8',lineHeight:1.6,margin:0}},f.desc));
}
function LandingScreen({onEnter}){
const {Button}=window.OHermeneutaDesignSystem_375223;
const {Icon}=window;
const features=[
{title:'Método Estruturado',desc:'Um guia passo a passo da observação à aplicação prática do texto bíblico.',icon:'search'},
{title:'Instrutor de IA',desc:'Feedback imediato e pedagógico para aprofundar suas análises hermenêuticas.',icon:'sparkles'},
{title:'Fidelidade Textual',desc:'Foco total na mensagem original e intenção do autor bíblico.',icon:'shield-check'}];
return React.createElement('div',{style:{minHeight:'100%',position:'relative',background:'var(--slate-950)',overflow:'hidden'}},
React.createElement('img',{src:'assets/hero-mentorship.png',style:{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',opacity:0.95}}),
React.createElement('div',{style:{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(2,6,23,0.45),rgba(2,6,23,0.2),rgba(2,6,23,0.8))'}}),
React.createElement('div',{style:{position:'relative',zIndex:1,padding:'24px 48px',display:'flex',justifyContent:'space-between',alignItems:'center'}},
React.createElement('div',{style:{display:'flex',alignItems:'center',gap:12}},
React.createElement('div',{style:{width:40,height:40,background:'#fff',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center'}},React.createElement(Icon,{name:'book-open',size:22,color:'var(--color-brand-primary)',style:{filter:'none'}})),
React.createElement('h1',{style:{fontFamily:'var(--font-serif)',fontSize:20,fontWeight:700,color:'#fff',margin:0}},'O Hermeneuta')),
React.createElement(Button,{variant:'ghost',style:{color:'#e2e8f0'},onClick:onEnter},'Entrar')),
React.createElement('main',{style:{position:'relative',zIndex:1,maxWidth:900,margin:'0 auto',textAlign:'center',padding:'40px 24px 80px'}},
React.createElement('div',{style:{animation:'fadeSlideUp 0.8s ease-out both'}},
React.createElement('div',{style:{display:'inline-flex',alignItems:'center',gap:8,padding:'6px 16px',borderRadius:999,background:'rgba(255,255,255,0.12)',border:'1px solid rgba(255,255,255,0.2)',color:'#fff',fontSize:11,fontWeight:700,letterSpacing:'0.15em',textTransform:'uppercase',marginBottom:24}},React.createElement(Icon,{name:'sparkles',size:14,color:'var(--amber-300)'}),'Um método que transforma sua pregação'),
React.createElement('h2',{style:{fontFamily:'var(--font-serif)',fontSize:56,fontWeight:900,lineHeight:0.95,color:'#fff',letterSpacing:'-0.02em',margin:'0 0 24px'}},'Trabalhe o Texto.',React.createElement('br'),React.createElement('span',{style:{fontStyle:'italic',color:'var(--amber-300)'}},'Pregue com Vida.')),
React.createElement('p',{style:{fontSize:19,color:'#cbd5e1',maxWidth:560,margin:'0 auto 32px',lineHeight:1.6,fontWeight:300}},'O ambiente de treinamento prático que guia você através da observação, exegese e aplicação bíblica profunda.'),
React.createElement('div',{style:{display:'flex',gap:20,justifyContent:'center',flexWrap:'wrap'}},
React.createElement(Button,{size:'lg',style:{fontSize:16,padding:'16px 40px',borderRadius:16},onClick:onEnter},'Começar Estudo Grátis'),
React.createElement('button',{onClick:onEnter,style:{background:'none',border:'none',color:'#cbd5e1',fontWeight:600,fontSize:15,display:'flex',alignItems:'center',gap:8,cursor:'pointer'}},'Crie sua conta',React.createElement(Icon,{name:'chevron-right',size:18,color:'#fff'})))),
React.createElement('div',{style:{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20,marginTop:80,textAlign:'left',animation:'fadeSlideUp2 0.8s ease-out 0.3s both'}},
features.map(f=>React.createElement(FeatureCard,{key:f.title,f,Icon}))),
React.createElement('footer',{style:{marginTop:100,paddingTop:32,borderTop:'1px solid rgba(255,255,255,0.1)',display:'flex',flexWrap:'wrap',justifyContent:'space-between',alignItems:'center',gap:16,fontSize:13,color:'#94a3b8'}},
React.createElement('span',null,'Desenvolvido para a glória de Deus'),
React.createElement('div',{style:{display:'flex',gap:24,flexWrap:'wrap'}},
React.createElement('a',{href:'#',style:{color:'#94a3b8',textDecoration:'none'}},'Política de Privacidade'),
React.createElement('a',{href:'#',style:{color:'#94a3b8',textDecoration:'none'}},'Termos de Uso'),
React.createElement('a',{href:'#',style:{color:'#94a3b8',textDecoration:'none'}},'Licenças')))));
}
window.LandingScreen=LandingScreen;
