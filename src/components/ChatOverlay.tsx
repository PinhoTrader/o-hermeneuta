import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  MessageSquare, 
  Users, 
  Hash, 
  Send, 
  Search,
  ChevronLeft,
  MessageCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  listUserGroups, 
  subscribeToMessages, 
  sendMessage 
} from '../services/groupService';
import { generalAIChat } from '../services/geminiService';
import { Group, Message } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from './ui/Button';

interface ChatOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatOverlay({ isOpen, onClose }: ChatOverlayProps) {
  const { profile, user } = useAuth();
  const [view, setView] = useState<'list' | 'chat'>('list');
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatError, setChatError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingAi, setLoadingAi] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const AI_GROUP: Group = {
    id: 'ai-instructor',
    name: 'Instrutor de IA (Mentor)',
    professorId: 'ai',
    createdAt: Date.now()
  };

  useEffect(() => {
    const isApproved = profile?.isApproved || profile?.role === 'admin' || profile?.email === 'escoladetradersead@gmail.com';

    if (isOpen && profile?.uid && isApproved) {
      setLoading(true);
      listUserGroups(profile.uid, profile.role)
        .then(userGroups => {
          setGroups([AI_GROUP, ...userGroups]);
        })
        .finally(() => setLoading(false));
    } else if (isOpen && (user?.isGuest || (profile?.uid && !isApproved))) {
      setGroups([AI_GROUP]);
      setLoading(false);
    }
  }, [isOpen, profile, user]);

  useEffect(() => {
    if (selectedGroup) setChatError(null);
    if (selectedGroup && selectedGroup.id !== 'ai-instructor') {
      const unsubscribe = subscribeToMessages(selectedGroup.id, 50, (newMsgs) => {
        setMessages(prev => {
          const existingIds = new Set(newMsgs.map(m => m.id));
          const older = prev.filter(m => !existingIds.has(m.id));
          return [...older, ...newMsgs].sort((a, b) => a.timestamp - b.timestamp);
        });
      }, (error) => {
        setMessages([]);
        setChatError(error.message);
        if (error.code === 'permission-denied' || error.code === 'unauthenticated') {
          setSelectedGroup(null);
          setView('list');
        }
      });
      return () => unsubscribe();
    } else if (selectedGroup?.id === 'ai-instructor') {
      setMessages([{
        id: 'welcome',
        content: `Olá! Eu sou seu Instrutor de IA. Em que posso ajudar você hoje? Precisando de alguma ideia para seu estudo bíblico?`,
        senderId: 'ai',
        senderName: 'Instrutor de IA',
        timestamp: Date.now(),
        groupId: 'ai-instructor'
      }]);
    }
  }, [selectedGroup]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSelectGroup = (group: Group) => {
    setSelectedGroup(group);
    setView('chat');
  };

  const handleBack = () => {
    setView('list');
    setSelectedGroup(null);
    setMessages([]);
    setChatError(null);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup || !newMessage.trim()) return;

    const content = newMessage;
    setNewMessage('');

    if (selectedGroup.id === 'ai-instructor') {
      const userMsg: Message = {
        id: Date.now().toString(),
        content,
        senderId: profile?.uid || 'guest',
        senderName: profile?.displayName || 'Convidado',
        timestamp: Date.now(),
        groupId: 'ai-instructor'
      };
      
      setMessages(prev => [...prev, userMsg]);
      setLoadingAi(true);

      try {
        const history = messages.slice(-6).map(m => ({
          role: (m.senderId === 'ai' ? 'model' : 'user') as 'user' | 'model',
          content: m.content
        }));
        
        const aiResponse = await generalAIChat(content, history);
        
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
    await sendMessage(selectedGroup.id, profile.uid, profile.displayName || 'Usuário', content);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/20 backdrop-blur-[2px] z-[60]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-[70] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                {view === 'chat' && (
                  <button 
                    onClick={handleBack}
                    className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg"
                  >
                    <ChevronLeft size={20} />
                  </button>
                )}
                <div>
                  <h2 className="text-xl font-bold font-serif text-slate-900">
                    {view === 'list' ? 'Suas Conversas' : selectedGroup?.name}
                  </h2>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    {view === 'list' ? 'Ativas Agora' : 'Chat Online'}
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {view === 'list' ? (
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      disabled
                      placeholder="Pesquisar conversas..." 
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all opacity-50 cursor-not-allowed"
                    />
                  </div>

                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 mb-2">Destaque</p>
                  {chatError && (
                    <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
                      {chatError}
                    </div>
                  )}
                  
                  {/* AI Mentor is always first */}
                  <button
                    onClick={() => handleSelectGroup(AI_GROUP)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-amber-50 hover:bg-amber-100 transition-colors border border-amber-100 text-left relative group overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-1 bg-amber-200 text-[8px] font-black text-amber-700 rounded-bl-lg uppercase">AI Mentor</div>
                    <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-amber-200">
                      <Hash size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-0.5">
                        <h3 className="font-bold text-slate-800 truncate">Instrutor de IA</h3>
                        <span className="text-[10px] text-amber-600 font-bold uppercase">Online</span>
                      </div>
                      <p className="text-xs text-slate-500 truncate italic">Discuta suas ideias de estudo aqui...</p>
                    </div>
                  </button>

                  <div className="h-4" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 mb-2">Aulas e Grupos</p>

                  {loading ? (
                    <div className="space-y-3">
                      {[1,2,3].map(n => (
                        <div key={n} className="h-20 bg-slate-50 animate-pulse rounded-2xl" />
                      ))}
                    </div>
                  ) : groups.filter(g => g.id !== 'ai-instructor').length > 0 ? (
                    groups.filter(g => g.id !== 'ai-instructor').map(group => (
                      <button
                        key={group.id}
                        onClick={() => handleSelectGroup(group)}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white hover:bg-slate-50 transition-colors border border-slate-100 text-left group"
                      >
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-brand-primary group-hover:text-white transition-colors shrink-0">
                          {group.name[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-800 truncate">{group.name}</h3>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                            <Clock size={10} />
                            {format(group.createdAt, 'EE, d MMM', { locale: ptBR })}
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-12 px-6">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="text-slate-300" size={32} />
                      </div>
                      <p className="text-sm text-slate-400 italic">Você ainda não participa de nenhuma sala virtual.</p>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Message List */}
                  <div 
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30"
                  >
                    {chatError && (
                      <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
                        {chatError}
                      </div>
                    )}

                    {messages.map((msg, i) => {
                      const isOwn = msg.senderId === (profile?.uid || user?.uid || 'guest');
                      const isAi = msg.senderId === 'ai';
                      return (
                        <div key={msg.id} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                          <div className="flex items-center gap-2 mb-1 px-1">
                             <span className={`text-[10px] font-black uppercase tracking-widest ${isAi ? 'text-amber-600' : 'text-slate-400'}`}>
                               {isOwn ? 'Você' : msg.senderName}
                             </span>
                          </div>
                          <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
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
                        <div className="flex items-center gap-2 mb-1 px-1">
                           <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">AI Mentor</span>
                        </div>
                        <div className="bg-amber-50 p-4 rounded-2xl rounded-tl-none border border-amber-100">
                          <div className="flex gap-1">
                            {[1,2,3].map(d => (
                              <div key={d} className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: `${d * 0.15}s` }} />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    {messages.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4">
                        <MessageCircle size={48} className="opacity-20" />
                        <p className="italic text-sm">Nenhuma mensagem ainda.</p>
                      </div>
                    )}
                  </div>

                  {/* Input area */}
                  <form onSubmit={handleSendMessage} className="p-6 border-t border-slate-100 bg-white">
                    <div className="flex gap-2">
                      <input 
                        autoFocus
                        className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all text-sm"
                        placeholder="Escreva sua mensagem..."
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        disabled={loadingAi}
                      />
                      <button 
                        type="submit" 
                        disabled={!newMessage.trim() || loadingAi}
                        className="w-12 h-12 bg-brand-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand-primary/20 disabled:opacity-50 disabled:shadow-none hover:scale-105 active:scale-95 transition-all"
                      >
                        <Send size={20} />
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
