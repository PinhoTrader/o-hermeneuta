function BibleSelectionScreen({onConfirm}){
const {Button,Input,Select}=window.OHermeneutaDesignSystem_375223;
const {Icon}=window;
const [book,setBook]=React.useState('João');
const [chapter,setChapter]=React.useState(1);
const BOOKS=['Gênesis','Salmos','Isaías','Mateus','João','Romanos','Efésios','Apocalipse'];
return React.createElement('div',{style:{maxWidth:640,margin:'0 auto',padding:'48px 20px'}},
React.createElement('div',{style:{textAlign:'center',marginBottom:32}},
React.createElement('h2',{style:{fontFamily:'var(--font-serif)',fontSize:28,fontWeight:700,margin:0}},'Escolha o Texto Bíblico'),
React.createElement('p',{style:{color:'var(--text-secondary)',margin:'8px 0 0'}},'Selecione o trecho que você deseja cavar e descobrir.')),
React.createElement('div',{className:'glass-card',style:{padding:32,borderRadius:28,display:'flex',flexDirection:'column',gap:24}},
React.createElement('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}},
React.createElement(Select,{label:'Livro',options:BOOKS,value:book,onChange:e=>setBook(e.target.value)}),
React.createElement(Input,{label:'Capítulo',type:'number',value:chapter,onChange:e=>setChapter(e.target.value)})),
React.createElement('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:20}},
React.createElement(Input,{label:'Versículo Inicial',type:'number',defaultValue:1}),
React.createElement(Input,{label:'Versículo Final',type:'number',defaultValue:18}),
React.createElement(Select,{label:'Tradução',options:['ARA','NVI','NVT','ARC','NAA']})),
React.createElement(Button,{style:{width:'100%',height:56,fontSize:17},onClick:()=>onConfirm(`${book} ${chapter}:1-18`)},'Confirmar Seleção e Iniciar',React.createElement(Icon,{name:'chevron-right',size:20,color:'#fff'}))),
React.createElement('div',{style:{marginTop:24,padding:20,background:'color-mix(in oklch,var(--color-brand-primary) 5%,transparent)',borderRadius:16,border:'1px solid color-mix(in oklch,var(--color-brand-primary) 10%,transparent)'}},
React.createElement('p',{style:{fontSize:12,fontStyle:'italic',color:'var(--color-brand-primary)',textAlign:'center',margin:0}},'"A erva seca, e a flor cai, mas a palavra do nosso Deus permanece para sempre." — Isaías 40:8')));
}
window.BibleSelectionScreen=BibleSelectionScreen;
