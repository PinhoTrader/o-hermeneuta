function Icon({name,size=18,color='currentColor',style}){
return React.createElement('img',{src:`https://unpkg.com/lucide-static@latest/icons/${name}.svg`,style:{width:size,height:size,filter:color==='#fff'?'invert(1)':'none',...style},alt:''});
}
function Topbar({active,onNav,role}){
const {Button}=window.OHermeneutaDesignSystem_375223;
const [menuOpen,setMenuOpen]=React.useState(false);
const items=[{id:'dashboard',label:'Meus Estudos',icon:'layout-dashboard'},{id:'academy',label:'Academia',icon:'graduation-cap'},{id:'bible',label:'Novo Estudo',icon:'book-open'},{id:'groups',label:'Salas Virtuais',icon:'message-square'}];
return React.createElement('header',{style:{height:64,borderBottom:'1px solid rgba(255,255,255,0.08)',background:'var(--slate-900)',position:'sticky',top:0,zIndex:40}},
React.createElement('div',{style:{maxWidth:1100,margin:'0 auto',padding:'0 20px',height:'100%',display:'flex',alignItems:'center',justifyContent:'space-between'}},
React.createElement('div',{style:{display:'flex',alignItems:'center',gap:36}},
React.createElement('h1',{onClick:()=>onNav('dashboard'),style:{fontFamily:'var(--font-serif)',fontWeight:700,fontSize:20,color:'#fff',cursor:'pointer',margin:0}},'O Hermeneuta'),
React.createElement('nav',{style:{display:'flex',gap:24}},items.map(it=>React.createElement('button',{key:it.id,onClick:()=>onNav(it.id),style:{display:'flex',alignItems:'center',gap:8,fontSize:14,fontWeight:500,color:active===it.id?'#fff':'rgba(255,255,255,0.65)',background:'none',border:'none',cursor:'pointer'}},React.createElement(Icon,{name:it.icon,size:18,color:'#fff'}),it.label)))),
React.createElement('div',{style:{position:'relative'}},
React.createElement('button',{onClick:()=>setMenuOpen(!menuOpen),style:{display:'flex',alignItems:'center',gap:10,padding:'6px 10px',borderRadius:12,border:'1px solid rgba(255,255,255,0.15)',background:menuOpen?'rgba(255,255,255,0.1)':'none',cursor:'pointer'}},
React.createElement('div',{style:{width:32,height:32,borderRadius:999,background:'var(--color-brand-primary)',display:'flex',alignItems:'center',justifyContent:'center'}},React.createElement(Icon,{name:'user',size:16,color:'#fff'})),
React.createElement('div',{style:{textAlign:'left'}},React.createElement('div',{style:{fontSize:12,fontWeight:600,color:'#fff'}},'Convidado(a)'),React.createElement('div',{style:{fontSize:10,color:'rgba(255,255,255,0.6)'}},'modo visitante')),
React.createElement(Icon,{name:'chevron-down',size:14,color:'#fff'})),
menuOpen&&React.createElement('div',{style:{position:'absolute',top:52,right:0,width:220,background:'#fff',borderRadius:14,boxShadow:'var(--shadow-lg)',border:'1px solid var(--border-subtle)',padding:8,zIndex:50}},
[{icon:'user',label:'Minha Conta'},{icon:'settings',label:'Configurações'},{icon:'edit-3',label:'Editar Perfil'}].map(m=>React.createElement('button',{key:m.label,style:{display:'flex',alignItems:'center',gap:10,width:'100%',padding:'10px 12px',border:'none',background:'none',borderRadius:8,fontSize:13,fontWeight:500,color:'var(--text-primary)',cursor:'pointer',textAlign:'left'}},React.createElement(Icon,{name:m.icon,size:16}),m.label)),
React.createElement('div',{style:{height:1,background:'var(--border-subtle)',margin:'6px 0'}}),
React.createElement('button',{onClick:()=>onNav('landing'),style:{display:'flex',alignItems:'center',gap:10,width:'100%',padding:'10px 12px',border:'none',background:'none',borderRadius:8,fontSize:13,fontWeight:600,color:'#dc2626',cursor:'pointer',textAlign:'left'}},React.createElement(Icon,{name:'log-out',size:16}),'Sair')))));
}
window.Icon=Icon;window.Topbar=Topbar;
