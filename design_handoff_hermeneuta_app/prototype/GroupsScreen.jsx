function GroupsScreen(){
const {Button}=window.OHermeneutaDesignSystem_375223;
const {Icon}=window;
const AI={id:'ai',name:'Instrutor de IA (Global)'};
const ROOM={id:'r1',name:'Turma de Homilética - 2026'};
const [selected,setSelected]=React.useState(AI);
const [messages,setMessages]=React.useState([{id:1,who:'ai',text:'Olá! Eu sou o Instrutor de IA. Como posso ajudar você a "Cavar & Descobrir" hoje?'}]);
const [text,setText]=React.useState('');
const send=()=>{if(!text.trim())return;const um={id:Date.now(),who:'me',text};setMessages(m=>[...m,um]);setText('');
if(selected.id==='ai')setTimeout(()=>setMessages(m=>[...m,{id:Date.now()+1,who:'ai',text:'Boa pergunta — releia o versículo 14 e note o conector "e": ele liga a encarnação diretamente à revelação da glória de Deus.'}]),600);};
return React.createElement('div',{style:{maxWidth:1100,margin:'0 auto',padding:'32px 20px 80px',height:'calc(100vh - 200px)'}},
React.createElement('div',{style:{display:'flex',height:'100%',background:'#fff',borderRadius:24,overflow:'hidden',border:'1px solid var(--border-default)',boxShadow:'var(--shadow-sm)'}},
React.createElement('div',{style:{width:280,borderRight:'1px solid var(--border-default)',background:'var(--surface-sunken)',display:'flex',flexDirection:'column'}},
React.createElement('div',{style:{padding:20,borderBottom:'1px solid var(--border-default)',fontWeight:700,display:'flex',alignItems:'center',gap:8}},React.createElement(Icon,{name:'users',size:18,color:'#3F6B4F'}),'Salas Virtuais'),
React.createElement('div',{style:{padding:12,display:'flex',flexDirection:'column',gap:6}},
[AI,ROOM].map(g=>React.createElement('button',{key:g.id,onClick:()=>{setSelected(g);setMessages(g.id==='ai'?[{id:1,who:'ai',text:'Olá! Eu sou o Instrutor de IA. Como posso ajudar você a "Cavar & Descobrir" hoje?'}]:[{id:1,who:'them',name:'Prof. Ana',text:'Bom dia turma! Não esqueçam de enviar o esboço até sexta.'}]);},
style:{display:'flex',alignItems:'center',gap:12,padding:12,borderRadius:12,border:'none',cursor:'pointer',textAlign:'left',background:selected.id===g.id?'var(--color-brand-primary)':'transparent',color:selected.id===g.id?'#fff':'var(--text-secondary)'}},
React.createElement('div',{style:{width:36,height:36,borderRadius:999,background:selected.id===g.id?'rgba(255,255,255,0.2)':'var(--slate-200)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:13}},g.name[0]),
React.createElement('span',{style:{fontWeight:700,fontSize:13}},g.name))))),
React.createElement('div',{style:{flex:1,display:'flex',flexDirection:'column'}},
React.createElement('div',{style:{padding:20,borderBottom:'1px solid var(--border-default)',fontWeight:700}},selected.name),
React.createElement('div',{style:{flex:1,overflowY:'auto',padding:24,display:'flex',flexDirection:'column',gap:16,background:'var(--surface-sunken)'}},
messages.map(m=>React.createElement('div',{key:m.id,style:{display:'flex',flexDirection:'column',alignItems:m.who==='me'?'flex-end':'flex-start'}},
React.createElement('span',{style:{fontSize:10,fontWeight:700,textTransform:'uppercase',color:m.who==='ai'?'var(--amber-600)':'var(--text-tertiary)',marginBottom:4}},m.who==='me'?'Você':m.who==='ai'?'Instrutor de IA':m.name),
React.createElement('div',{style:{maxWidth:'70%',padding:14,borderRadius:16,fontSize:14,lineHeight:1.5,background:m.who==='me'?'var(--color-brand-primary)':m.who==='ai'?'var(--amber-050)':'#fff',color:m.who==='me'?'#fff':'var(--text-primary)',border:m.who!=='me'?'1px solid var(--border-subtle)':'none'}},m.text)))),
React.createElement('div',{style:{padding:20,borderTop:'1px solid var(--border-default)',display:'flex',gap:12}},
React.createElement('input',{value:text,onChange:e=>setText(e.target.value),onKeyDown:e=>e.key==='Enter'&&send(),placeholder:'Escreva sua mensagem...',style:{flex:1,padding:'14px 20px',borderRadius:16,border:'1px solid var(--border-default)',background:'var(--surface-sunken)',outline:'none',fontSize:14}}),
React.createElement(Button,{onClick:send},React.createElement(Icon,{name:'send',size:18,color:'#fff'}),'Enviar')))));
}
window.GroupsScreen=GroupsScreen;
