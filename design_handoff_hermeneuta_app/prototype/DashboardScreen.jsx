function DashboardScreen({studies,onOpenStudy,onNewStudy}){
const {Button,Input}=window.OHermeneutaDesignSystem_375223;
const {Icon}=window;
const [query,setQuery]=React.useState('');
const [statusFilter,setStatusFilter]=React.useState('all');
const filtered=studies.filter(s=>{
const matchesQuery=!query.trim()||s.title.toLowerCase().includes(query.toLowerCase())||(s.ref||'').toLowerCase().includes(query.toLowerCase());
const matchesStatus=statusFilter==='all'||s.status===statusFilter;
return matchesQuery&&matchesStatus;
});
const FILTERS=[{id:'all',label:'Todos'},{id:'draft',label:'Em andamento'},{id:'completed',label:'Concluídos'}];
return React.createElement('div',{style:{maxWidth:1100,margin:'0 auto',padding:'0 0 80px'}},
React.createElement('div',{style:{position:'relative',height:220,margin:'0 0 32px',overflow:'hidden'}},
React.createElement('image-slot',{id:'dashboard-library-bg',shape:'rect',src:'assets/library-shelf.jpg',placeholder:'Foto de uma biblioteca / estante de livros',style:{position:'absolute',inset:0}}),
React.createElement('div',{style:{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(2,6,23,0.75),rgba(2,6,23,0.25))',pointerEvents:'none'}}),
React.createElement('div',{style:{position:'absolute',inset:0,display:'flex',flexDirection:'column',justifyContent:'flex-end',padding:'0 32px 24px'}},
React.createElement('h2',{style:{fontFamily:'var(--font-sans)',fontSize:30,fontWeight:800,color:'#fff',margin:0}},'Seus Estudos'),
React.createElement('p',{style:{fontSize:14,color:'rgba(255,255,255,0.85)',margin:'4px 0 0'}},'Seu acervo de sermões e estudos — gerencie, pesquise e retome de onde parou.'))),
React.createElement('div',{style:{padding:'0 20px'}},
React.createElement('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:20,flexWrap:'wrap',gap:16}},
React.createElement('div',{style:{display:'flex',gap:12,alignItems:'flex-end',flexWrap:'wrap'}},
React.createElement('div',{style:{width:260}},React.createElement(Input,{placeholder:'Pesquisar por título ou referência...',value:query,onChange:e=>setQuery(e.target.value)})),
React.createElement('div',{style:{display:'flex',gap:6}},FILTERS.map(f=>React.createElement('button',{key:f.id,onClick:()=>setStatusFilter(f.id),style:{padding:'10px 14px',borderRadius:'var(--radius-md)',border:'1px solid var(--border-default)',fontSize:12,fontWeight:600,cursor:'pointer',background:statusFilter===f.id?'var(--color-brand-primary)':'#fff',color:statusFilter===f.id?'#fff':'var(--text-secondary)'}},f.label)))),
React.createElement(Button,{variant:'outline',size:'sm',onClick:onNewStudy},React.createElement(Icon,{name:'plus',size:16}),'Novo Estudo')),
React.createElement('div',{style:{padding:16,background:'var(--amber-050)',border:'1px solid var(--amber-100)',borderRadius:16,color:'#92400e',fontSize:13,display:'flex',gap:12,alignItems:'center',marginBottom:24}},
React.createElement(Icon,{name:'book-open',size:20}),React.createElement('p',{style:{margin:0}},React.createElement('strong',null,'Modo Convidado.'),' Seus estudos não serão salvos permanentemente. ',React.createElement('span',{style:{textDecoration:'underline',fontWeight:700,cursor:'pointer'}},'Faça login com Google'),' para salvar seu progresso.')),
filtered.length===0?React.createElement('div',{style:{padding:60,textAlign:'center',color:'var(--text-tertiary)'}},React.createElement(Icon,{name:'search-x',size:32}),React.createElement('p',{style:{marginTop:12,fontSize:14}},'Nenhum estudo encontrado para "',query,'".')):
React.createElement('div',{style:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:10}},
filtered.map(s=>React.createElement('div',{key:s.id,onClick:()=>onOpenStudy(s),className:'glass-card',style:{padding:12,borderRadius:10,cursor:'pointer',position:'relative'}},
React.createElement('div',{style:{display:'flex',justifyContent:'space-between',marginBottom:8}},
React.createElement('div',{style:{padding:4,borderRadius:5,background:s.status==='completed'?'var(--state-success-bg)':'color-mix(in oklch,var(--color-brand-primary) 10%,transparent)',color:s.status==='completed'?'var(--state-success-text)':'var(--color-brand-primary)'}},React.createElement(Icon,{name:s.status==='completed'?'check-circle-2':'clock',size:10})),
React.createElement(Icon,{name:'more-vertical',size:9,color:'#94a3b8'})),
React.createElement('h3',{style:{fontFamily:'var(--font-sans)',fontSize:9,fontWeight:700,color:'var(--text-primary)',margin:'0 0 4px'}},s.title),
s.ref?React.createElement('p',{style:{fontSize:6,fontWeight:600,color:'var(--color-brand-primary)',margin:'0 0 8px'}},s.ref):React.createElement('p',{style:{fontSize:6,color:'var(--text-tertiary)',fontStyle:'italic',margin:'0 0 8px'}},'Texto não selecionado'),
React.createElement('div',{style:{display:'flex',justifyContent:'space-between',fontSize:5,color:'var(--text-tertiary)'}},React.createElement('span',null,'Última atualização: ',s.updated),React.createElement(Icon,{name:'chevron-right',size:7})))))));
}
window.DashboardScreen=DashboardScreen;
