import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Plus, Send, Users, MessageCircle, Hash, Search, UserPlus } from 'lucide-react';
import { 
  listUserGroups, 
  createGroup, 
  subscribeToMessages, 
  sendMessage,
  joinGroup,
  listAllProfessors,
  findGroupsByProfessor,
  addStudentByEmail,
  searchGroupsByName,
  assignProfessorToGroup,
  fetchOlderMessages
} from '../services/groupService';
import { generalAIChat } from '../services/geminiService';
import { Group, Message, UserProfile } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function GroupsPage() {
  const { profile, user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [isDiscoveryOpen, setIsDiscoveryOpen] = useState(false);
  const [professors, setProfessors] = useState<UserProfile[]>([]);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteStatus, setInviteStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [roomSearchQuery, setRoomSearchQuery] = useState('');
  const [searchedRooms, setSearchedRooms] = useState<Group[]>([]);
  const [isSearchingRooms, setIsSearchingRooms] = useState(false);
  const [selectedRoomToLink, setSelectedRoomToLink] = useState<Group | null>(null);
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkStatus, setLinkStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const AI_GROUP: Group = {
    id: 'ai-instructor',
    name: 'Instrutor de IA (Global)',
    professorId: 'ai',
    createdAt: Date.now()
  };

  useEffect(() => {
    if (profile?.uid) {
      listUserGroups(profile.uid, profile.role).then(userGroups => {
        setGroups([AI_GROUP, ...userGroups]);
      });
    } else if (user?.isGuest) {
      setGroups([AI_GROUP]);
      setSelectedGroup(AI_GROUP);
      setShowSidebar(false);
    }
  }, [profile, user]);

  useEffect(() => {
    setMessages([]);
    setLastDoc(null);
    setHasMore(true);

    if (selectedGroup && selectedGroup.id !== 'ai-instructor') {
      const unsubscribe = subscribeToMessages(selectedGroup.id, 25, (newMsgs, doc) => {
        setMessages(prev => {
          // Merge and deduplicate
          const existingIds = new Set(newMsgs.map(m => m.id));
          const older = prev.filter(m => !existingIds.has(m.id));
          return [...older, ...newMsgs].sort((a, b) => a.timestamp - b.timestamp);
        });
        setLastDoc(prev => prev || doc); // Set lastDoc only on first load
      });
      return () => unsubscribe();
    } else if (selectedGroup?.id === 'ai-instructor') {
      setMessages([{
        id: 'welcome',
        content: `Olá! Eu sou o Instrutor de IA. Como posso ajudar você a "Cavar & Descobrir" hoje? ${user?.isGuest ? '(Acesso Convidado)' : ''}`,
        senderId: 'ai',
        senderName: 'Instrutor de IA',
        timestamp: Date.now(),
        groupId: 'ai-instructor'
      }]);
    }
  }, [selectedGroup]);

  // Adjust scroll only when new messages arrive at the bottom
  const [prevMsgCount, setPrevMsgCount] = useState(0);
  useEffect(() => {
    if (scrollRef.current && messages.length > prevMsgCount) {
      // If we just loaded more historical messages, don't scroll to bottom
      // But for new messages, scroll. We'll simplify and always scroll for now
      // unless we implement a more complex check.
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    setPrevMsgCount(messages.length);
  }, [messages]);

  const handleLoadMore = async () => {
    if (!selectedGroup || !lastDoc || loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const { messages: older, nextLastDoc } = await fetchOlderMessages(selectedGroup.id, lastDoc, 25);
      if (older.length < 25) setHasMore(false);
      
      setMessages(prev => {
        const existingIds = new Set(prev.map(m => m.id));
        const uniqueOlder = older.filter(m => !existingIds.has(m.id));
        return [...uniqueOlder, ...prev].sort((a, b) => a.timestamp - b.timestamp);
      });
      setLastDoc(nextLastDoc);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!profile || !newGroupName.trim()) return;
    const id = await createGroup(newGroupName, profile.uid);
    const newGroup: Group = { id, name: newGroupName, professorId: profile.uid, createdAt: Date.now() };
    setGroups([...groups, newGroup]);
    setNewGroupName('');
    setIsCreating(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup || !newMessage.trim()) return;
    
    if (selectedGroup.id === 'ai-instructor') {
      const userMsg: Message = {
        id: Date.now().toString(),
        content: newMessage,
        senderId: profile?.uid || 'guest',
        senderName: profile?.displayName || 'Convidado',
        timestamp: Date.now(),
        groupId: 'ai-instructor'
      };
      
      setMessages(prev => [...prev, userMsg]);
      setNewMessage('');
      setLoadingAi(true);

      try {
        const history = messages.slice(-6).map(m => ({
          role: (m.senderId === 'ai' ? 'model' : 'user') as 'user' | 'model',
          content: m.content
        }));
        
        const aiResponse = await generalAIChat(userMsg.content, history);
        
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          content: aiResponse,
          senderId: 'ai',
          senderName: 'Instrutor de IA',
          timestamp: Date.now(),
          groupId: 'ai-instructor'
        };
        setMessages(prev => [...prev, aiMsg]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingAi(false);
      }
      return;
    }

    if (!profile) return;
    const content = newMessage;
    setNewMessage('');
    await sendMessage(selectedGroup.id, profile.uid, profile.displayName || 'Anônimo', content);
  };

  const [isJoining, setIsJoining] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  const [joinError, setJoinError] = useState<string | null>(null);

  const handleJoinGroup = async (groupId: string) => {
    if (!profile) return;
    setJoinError(null);
    try {
      await joinGroup(groupId, profile.uid);
      const updatedGroups = await listUserGroups(profile.uid, profile.role);
      setGroups([AI_GROUP, ...updatedGroups]);
      setIsDiscoveryOpen(false);
      setIsJoining(false);
      setJoinCode('');
    } catch (error: any) {
      console.error(error);
      setJoinError(error.message || 'Erro ao entrar na sala.');
    }
  };

  const handleOpenDiscovery = async () => {
    setIsDiscoveryOpen(true);
    const profs = await listAllProfessors();
    setProfessors(profs);
    setSearchedRooms([]);
    setRoomSearchQuery('');
    setSelectedRoomToLink(null);
  };

  const handleSearchRooms = async () => {
    if (!roomSearchQuery.trim()) return;
    setIsSearchingRooms(true);
    try {
      const results = await searchGroupsByName(roomSearchQuery);
      setSearchedRooms(results);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearchingRooms(false);
    }
  };

  const handleLinkProfessor = async (professorId: string) => {
    if (!selectedRoomToLink) return;
    setLinkLoading(true);
    setLinkStatus(null);
    try {
      await assignProfessorToGroup(selectedRoomToLink.id, professorId);
      setLinkStatus({ type: 'success', message: 'Professor vinculado com sucesso!' });
      
      // Delay before closing to let user see success message
      setTimeout(() => {
        setLinkStatus(null);
        setSelectedRoomToLink(null);
        setIsDiscoveryOpen(false);
        setSearchedRooms([]);
        setRoomSearchQuery('');
      }, 2000);
    } catch (error) {
      console.error(error);
      setLinkStatus({ type: 'error', message: 'Erro ao vincular professor.' });
    } finally {
      setLinkLoading(false);
    }
  };

  const handleInviteStudent = async () => {
    if (!selectedGroup || !inviteEmail.trim()) return;
    setInviteLoading(true);
    setInviteStatus(null);
    try {
      const result = await addStudentByEmail(selectedGroup.id, inviteEmail);
      if (result.success) {
        setInviteStatus({ type: 'success', message: result.message });
        setInviteEmail('');
        setTimeout(() => {
          setIsInviting(false);
          setInviteStatus(null);
        }, 2000);
      } else {
        setInviteStatus({ type: 'error', message: result.message });
      }
    } catch (error) {
      setInviteStatus({ type: 'error', message: 'Erro ao processar convite.' });
    } finally {
      setInviteLoading(false);
    }
  };

  const formatDate = (date: any) => {
    if (!date) return '';
    try {
      const d = typeof date.toDate === 'function' ? date.toDate() : new Date(date);
      return format(d, 'HH:mm', { locale: ptBR });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] md:h-[calc(100vh-120px)] bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm relative">
      {/* Sidebar: Groups List */}
      <div className={`${showSidebar ? 'flex' : 'hidden'} md:flex w-full md:w-80 border-r border-slate-200 flex-col bg-slate-50 z-20 absolute md:relative inset-0 md:inset-auto`}>
        <div className="p-4 md:p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <Users size={20} className="text-brand-primary" />
            Salas Virtuais
          </h2>
          <div className="flex gap-1">
            <button 
              onClick={handleOpenDiscovery}
              className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors text-slate-600"
              title="Descobrir Professores"
            >
              <Search size={18} />
            </button>
            <button 
              onClick={() => setIsJoining(true)}
              className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors text-slate-600"
              title="Entrar em uma sala por ID"
            >
              <Hash size={18} />
            </button>
            {(profile?.role === 'professor' || profile?.role === 'monitor') && (
              <button 
                onClick={() => setIsCreating(true)}
                className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors text-slate-600"
                title="Criar nova sala"
              >
                <Plus size={18} />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {isCreating && (
            <div className="p-3 bg-white rounded-xl border border-brand-primary shadow-sm space-y-3 mb-4">
              <input 
                autoFocus
                className="w-full text-sm p-2 outline-none border-b border-slate-100"
                placeholder="Nome da Sala..."
                value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" onClick={() => setIsCreating(false)}>Cancelar</Button>
                <Button size="sm" onClick={handleCreateGroup}>Criar</Button>
              </div>
            </div>
          )}

          {isJoining && (
            <div className="p-3 bg-white rounded-xl border border-blue-500 shadow-sm space-y-3 mb-4">
              <input 
                autoFocus
                className="w-full text-sm p-2 outline-none border-b border-slate-100"
                placeholder="ID da Sala..."
                value={joinCode}
                onChange={e => setJoinCode(e.target.value)}
              />
              {joinError && <p className="text-[10px] font-bold text-red-500 px-1">{joinError}</p>}
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" onClick={() => {
                  setIsJoining(false);
                  setJoinError(null);
                }}>Cancelar</Button>
                <Button size="sm" onClick={() => handleJoinGroup(joinCode)}>Entrar</Button>
              </div>
            </div>
          )}

          {isDiscoveryOpen && (
            <div className="p-4 bg-white rounded-xl border border-amber-500 shadow-xl space-y-4 mb-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Descoberta e Vínculo</p>
                <Button size="sm" variant="ghost" onClick={() => setIsDiscoveryOpen(false)}>Fechar</Button>
              </div>

              {/* Room Search Section */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input 
                    type="text"
                    className="flex-1 text-xs p-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Pesquisar sala por nome..."
                    value={roomSearchQuery}
                    onChange={e => setRoomSearchQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearchRooms()}
                  />
                  <Button size="sm" onClick={handleSearchRooms} loading={isSearchingRooms}>
                    <Search size={16} />
                  </Button>
                </div>

                {searchedRooms.length > 0 && (
                  <div className="space-y-1 mt-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase px-1">Salas Encontradas</p>
                    {searchedRooms.map(room => (
                      <div key={room.id} className={`p-2 rounded-lg border flex items-center justify-between transition-all ${selectedRoomToLink?.id === room.id ? 'border-amber-500 bg-amber-50' : 'border-slate-100 hover:border-amber-200'}`}>
                        <span className="text-xs font-medium text-slate-700">{room.name}</span>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="text-[10px]" onClick={() => handleJoinGroup(room.id)}>Entrar</Button>
                          {profile?.role === 'admin' && (
                            <Button 
                              size="sm" 
                              variant={selectedRoomToLink?.id === room.id ? 'primary' : 'ghost'} 
                              className="text-[10px]" 
                              onClick={() => setSelectedRoomToLink(room)}
                            >
                              Vincular Prof.
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Professor Selection for Linking (Admin only) */}
              {selectedRoomToLink && profile?.role === 'admin' && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 space-y-3 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-amber-600 uppercase">Vincular Professor a: {selectedRoomToLink.name}</p>
                    <button onClick={() => setSelectedRoomToLink(null)} className="text-amber-500 hover:text-amber-700">
                      <Plus size={14} className="rotate-45" />
                    </button>
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {professors.map(prof => (
                      <div key={prof.uid} className="p-2 hover:bg-white rounded-lg flex items-center justify-between group">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center text-[8px] font-bold text-amber-700">
                            {prof.displayName ? prof.displayName[0] : 'P'}
                          </div>
                          <span className="text-[10px] font-medium text-slate-600">{prof.displayName}</span>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-[9px] h-6 px-2 opacity-0 group-hover:opacity-100" 
                          onClick={() => handleLinkProfessor(prof.uid)}
                          loading={linkLoading}
                        >
                          Confirmar
                        </Button>
                      </div>
                    ))}
                  </div>
                  {linkStatus && (
                    <p className={`text-[10px] font-bold text-center py-1 ${linkStatus.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                      {linkStatus.message}
                    </p>
                  )}
                </div>
              )}

              {/* Default Professor List (Discovery) */}
              {!selectedRoomToLink && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase px-1">Professores Sugeridos</p>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {professors.map(prof => (
                      <div key={prof.uid} className="p-2 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-100 transition-all">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-brand-primary/10 flex items-center justify-center text-[10px] font-bold text-brand-primary">
                              {prof.displayName ? prof.displayName[0] : 'P'}
                            </div>
                            <span className="text-sm font-medium text-slate-700">{prof.displayName}</span>
                          </div>
                          <Button size="sm" variant="ghost" className="text-[10px]" onClick={async () => {
                            const profGroups = await findGroupsByProfessor(prof.uid);
                            if (profGroups.length > 0) {
                              handleJoinGroup(profGroups[0].id);
                            } else {
                              alert('Este professor ainda no criou salas públicas.');
                            }
                          }}>Ver Sala</Button>
                        </div>
                      </div>
                    ))}
                    {professors.length === 0 && <p className="text-[10px] text-center text-slate-400 py-4">Nenhum professor encontrado.</p>}
                  </div>
                </div>
              )}
            </div>
          )}

          {groups.map(group => (
            <button
              key={group.id}
              onClick={() => {
                setSelectedGroup(group);
                if (window.innerWidth < 768) setShowSidebar(false);
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                selectedGroup?.id === group.id 
                  ? 'bg-brand-primary text-white shadow-md' 
                  : 'hover:bg-white text-slate-600'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                selectedGroup?.id === group.id ? 'bg-white/20' : 'bg-slate-200'
              }`}>
                {group.name[0].toUpperCase()}
              </div>
              <div className="text-left overflow-hidden">
                <p className="font-bold text-sm truncate">{group.name}</p>
                <p className={`text-[10px] ${selectedGroup?.id === group.id ? 'text-white/70' : 'text-slate-400'}`}>
                  {profile?.role === 'professor' ? 'Professor(a)' : 'Aluno(a)'}
                </p>
              </div>
            </button>
          ))}

          {groups.length === 0 && !isCreating && (
            <div className="text-center py-12 px-6">
              <p className="text-sm text-slate-400 italic">Nenhuma sala encontrada.</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content: Chat */}
      <div className={`flex-1 flex flex-col bg-white ${!showSidebar ? 'flex' : 'hidden'} md:flex`}>
        {selectedGroup ? (
          <>
            {/* Chat Header */}
            <div className="p-4 md:p-6 border-b border-slate-200 flex items-center justify-between bg-white z-10">
              <div className="flex items-center gap-2 md:gap-3">
                <button 
                  onClick={() => setShowSidebar(true)}
                  className="md:hidden p-2 -ml-2 text-slate-400 hover:text-brand-primary"
                >
                  <Plus size={20} className="rotate-45" /> {/* Use Plus rotated for "back" look or just another icon */}
                </button>
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center ${
                  selectedGroup.id === 'ai-instructor' ? 'bg-amber-100 text-amber-600' : 'bg-brand-primary/10 text-brand-primary'
                }`}>
                  {selectedGroup.id === 'ai-instructor' ? <Hash size={18} /> : <Hash size={18} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm md:text-base text-slate-800 truncate max-w-[120px] sm:max-w-none">{selectedGroup.name}</h3>
                    {(profile?.role === 'admin' || profile?.role === 'professor' || profile?.role === 'monitor') && selectedGroup.id !== 'ai-instructor' && (
                      <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 border border-slate-200 uppercase tracking-tighter" title="ID da Sala para convite">
                        ID: {selectedGroup.id}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <span className={`w-1.5 h-1.5 rounded-full ${selectedGroup.id === 'ai-instructor' ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`} />
                    {selectedGroup.id === 'ai-instructor' ? (
                      <span className="flex items-center gap-2">
                        AI Mentor Online
                        {user?.isGuest && <span className="bg-amber-100 text-amber-600 px-1 rounded font-black">Free</span>}
                      </span>
                    ) : 'Sala Ativa'}
                  </div>
                </div>
              </div>

              {/* Professor invitation button */}
              {(profile?.role === 'admin' || profile?.role === 'professor' || profile?.role === 'monitor') && selectedGroup.id !== 'ai-instructor' && (
                <div className="relative">
                  <button 
                    onClick={() => setIsInviting(!isInviting)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-brand-primary"
                    title="Convidar aluno"
                  >
                    <UserPlus size={20} />
                  </button>
                  
                  {isInviting && (
                    <div className="absolute right-0 top-12 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-50">
                      <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Convidar Aluno</h4>
                      <div className="space-y-3">
                        <input 
                          type="email"
                          className="w-full text-xs p-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary"
                          placeholder="Email do aluno..."
                          value={inviteEmail}
                          onChange={e => setInviteEmail(e.target.value)}
                        />
                        {inviteStatus && (
                          <p className={`text-[10px] font-bold ${inviteStatus.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                            {inviteStatus.message}
                          </p>
                        )}
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => setIsInviting(false)}>Cancelar</Button>
                          <Button size="sm" onClick={handleInviteStudent} loading={inviteLoading}>Convidar</Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 bg-slate-50/50"
            >
              {hasMore && selectedGroup.id !== 'ai-instructor' && (
                <div className="flex justify-center pb-4">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={handleLoadMore} 
                    loading={loadingMore}
                    className="text-[10px] uppercase tracking-widest font-bold text-slate-400 hover:text-brand-primary"
                  >
                    Carregar mensagens anteriores
                  </Button>
                </div>
              )}

              {messages.map((msg, i) => {
                const isOwn = msg.senderId === (profile?.uid || 'guest');
                const isAi = msg.senderId === 'ai';
                return (
                  <div key={msg.id} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-1 px-2">
                       <span className={`text-[10px] font-bold uppercase tracking-tight ${isAi ? 'text-amber-600' : 'text-slate-400'}`}>
                         {isOwn ? 'Você' : msg.senderName}
                       </span>
                       <span className="text-[10px] text-slate-300">
                         {formatDate(msg.timestamp)}
                       </span>
                    </div>
                    <div className={`max-w-[85%] md:max-w-[70%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      isOwn 
                        ? 'bg-brand-primary text-white rounded-tr-none' 
                        : isAi 
                          ? 'bg-amber-50 text-slate-800 border border-amber-100 rounded-tl-none ring-4 ring-amber-50/50'
                          : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                );
              })}
              {loadingAi && (
                <div className="flex flex-col items-start">
                   <div className="flex items-center gap-2 mb-1 px-2">
                      <span className="text-[10px] font-bold text-amber-600 uppercase tracking-tight">Instrutor de IA</span>
                   </div>
                   <div className="bg-amber-50 p-4 rounded-2xl rounded-tl-none border border-amber-100">
                     <div className="flex gap-1">
                       <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                       <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                       <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" />
                     </div>
                   </div>
                </div>
              )}
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                  <MessageCircle size={48} className="opacity-20" />
                  <p className="italic text-sm">Nenhuma mensagem ainda. Inicie a conversa!</p>
                </div>
              )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 md:p-6 border-t border-slate-200 bg-white">
              <div className="flex gap-2 md:gap-4">
                <input 
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 md:px-6 py-3 md:py-4 outline-none focus:ring-2 focus:ring-brand-primary transition-all text-sm md:text-base text-slate-800"
                  placeholder={selectedGroup.id === 'ai-instructor' ? "Diga algo..." : "Escreva sua mensagem..."}
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  disabled={loadingAi}
                />
                <Button type="submit" disabled={!newMessage.trim() || loadingAi} loading={loadingAi} className="px-4 md:px-8">
                  <Send size={18} className="md:mr-2" />
                  <span className="hidden md:inline">Enviar</span>
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-6">
            <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center">
               <Users size={40} className="opacity-20" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-slate-800">Suas Salas Virtuais</h3>
              <p className="text-sm max-w-xs mx-auto">
                Selecione uma sala ao lado para interagir com seu professor e colegas.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
