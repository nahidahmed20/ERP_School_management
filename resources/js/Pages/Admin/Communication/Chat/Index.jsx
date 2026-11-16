import { useState, useEffect, useRef } from 'react';
import { Head, router, usePage, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';

export default function ChatIndex({ users, activeUser, messages }) {
  const { auth } = usePage().props;
  const currentUserId = auth.user.id;
  const messagesEndRef = useRef(null);
  
  const [searchTerm, setSearchTerm] = useState(''); 
  const [isTyping, setIsTyping] = useState(false);

  const { data, setData, post, processing, reset } = useForm({
    receiver_id: activeUser?.id ?? '',
    message: '',
  });

  useEffect(() => {
    if (activeUser?.id) setData('receiver_id', activeUser.id);
  }, [activeUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Only reload messages and users quietly in the background every 5 seconds
      router.reload({ only: ['messages', 'users'], preserveScroll: true, preserveState: true });
    }, 5000);
    return () => clearInterval(interval);
  }, [activeUser]);

  const selectUser = (userId) => {
    setData('receiver_id', userId);
    router.get(route('admin.communication.chat.index'), { user_id: userId }, { preserveState: true, preserveScroll: true });
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!data.message.trim() || !data.receiver_id) return;

    post(route('admin.communication.chat.store'), {
      preserveScroll: true,
      onSuccess: () => reset('message'),
    });
  };

  // Filter users based on search
  const filteredUsers = users.filter(user => user.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <AuthenticatedLayout>
      <Head title="Internal Chat" />

      <div className="w-full sm:px-6 lg:px-8 py-6">
        
        <div className="mb-6">
          <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">Communication</span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Internal Chat</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row overflow-hidden h-[calc(100vh-200px)] min-h-[550px]">

          {/* ================= LEFT SIDEBAR (Staff Directory) ================= */}
          <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col bg-slate-50/50 shrink-0 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-white">
              <h3 className="font-bold text-slate-800 text-sm mb-3">Staff Directory ({users.length})</h3>
              
              {/* 🟢 Search Box Added */}
              <div className="relative">
                <Icon name="search" className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input 
                  type="text" 
                  placeholder="Search name..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="overflow-y-auto flex-1 divide-y divide-slate-100 custom-scrollbar">
              {filteredUsers.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-sm italic">No users found.</div>
              ) : (
                filteredUsers.map(user => {
                  const isActive = activeUser?.id === user.id;
                  const hasUnread = user.unread_count > 0; // 🟢 Check Unread

                  return (
                    <div
                      key={user.id}
                      onClick={() => selectUser(user.id)}
                      className={`p-3.5 flex items-center gap-3 cursor-pointer transition-all border-l-4 ${
                        isActive ? 'bg-indigo-50 border-indigo-600 shadow-sm' : 'bg-white hover:bg-slate-50 border-transparent'
                      }`}
                    >
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        {/* 🟢 Unread Badge Indicator */}
                        {hasUnread && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full shadow-sm ring-2 ring-white animate-bounce">
                            {user.unread_count}
                          </div>
                        )}
                      </div>
                      
                      <div className="overflow-hidden flex-1">
                        <div className={`font-bold text-sm truncate flex justify-between items-center ${isActive ? 'text-indigo-900' : hasUnread ? 'text-slate-900' : 'text-slate-700'}`}>
                          <span>{user.name}</span>
                          {hasUnread && <span className="w-2 h-2 bg-rose-500 rounded-full ml-2"></span>}
                        </div>
                        <div className={`text-xs truncate mt-0.5 ${hasUnread ? 'text-indigo-600 font-semibold' : 'text-slate-500'}`}>
                          {hasUnread ? 'New message waiting...' : user.email}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ================= RIGHT SIDEBAR (Chat Window) ================= */}
          <div className="flex-1 flex flex-col bg-white overflow-hidden">

            {activeUser ? (
              <>
                {/* Chat Header */}
                <div className="px-6 py-3.5 border-b border-slate-200 flex items-center gap-3 bg-white shrink-0 shadow-sm z-10">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-700 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    {activeUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base leading-tight">{activeUser.name}</h3>
                    <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> Online
                    </div>
                  </div>
                </div>

                {/* Chat Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 flex flex-col gap-4 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
                  
                  {messages.length === 0 && (
                    <div className="m-auto text-center text-slate-400 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                      <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-200 shadow-inner">
                        <Icon name="message-square" className="w-8 h-8" />
                      </div>
                      <p className="text-sm font-bold text-slate-700">Start conversation with {activeUser.name}</p>
                      <p className="text-xs text-slate-400 mt-1">End-to-end internal communication.</p>
                    </div>
                  )}

                  {messages.map((msg, idx) => {
                    const isMine = msg.sender_id === currentUserId;
                    // Optional: Adding a small visual tweak for consecutive messages
                    const isLastMine = idx > 0 && messages[idx - 1].sender_id === currentUserId;

                    return (
                      <div key={idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'} ${isMine && isLastMine ? '-mt-2' : ''}`}>
                        <div className={`max-w-[75%] lg:max-w-[65%] px-4 py-3 shadow-sm text-sm leading-relaxed ${
                          isMine 
                            ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm' 
                            : 'bg-white text-slate-800 border border-slate-200/80 rounded-2xl rounded-tl-sm'
                        }`}>
                          <div className="whitespace-pre-wrap">{msg.message}</div>
                          <div className={`text-[9px] text-right mt-1.5 font-bold uppercase tracking-wider ${isMine ? 'text-indigo-200' : 'text-slate-400'}`}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                            {isMine && <span className="ml-1 opacity-80">{msg.is_read ? '✓✓' : '✓'}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input Area */}
                <div className="p-4 border-t border-slate-200 bg-white shrink-0 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.02)]">
                  <form onSubmit={sendMessage} className="flex items-end gap-3">
                    <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:bg-white transition-all shadow-inner">
                      <textarea
                        value={data.message}
                        onChange={e => setData('message', e.target.value)}
                        placeholder="Type your message here..."
                        className="w-full px-4 py-3 text-sm bg-transparent border-none focus:ring-0 resize-none outline-none custom-scrollbar"
                        rows={data.message.split('\n').length > 1 ? 3 : 1}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage(e);
                          }
                        }}
                        autoFocus
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={processing || !data.message.trim()}
                      className="inline-flex items-center justify-center h-[46px] w-[46px] sm:w-auto sm:px-6 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-2xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shrink-0"
                    >
                      <Icon name="send" className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Send</span>
                    </button>
                  </form>
                  <div className="text-center mt-2 text-[10px] text-slate-400 font-medium">Press <kbd className="bg-slate-100 border border-slate-200 px-1 py-0.5 rounded font-mono">Enter</kbd> to send, <kbd className="bg-slate-100 border border-slate-200 px-1 py-0.5 rounded font-mono">Shift + Enter</kbd> for new line.</div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 p-6 text-center">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 border border-slate-200 shadow-sm text-indigo-300">
                  <Icon name="message-circle" className="w-10 h-10" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-1">Internal Chat Workspace</h2>
                <p className="text-sm text-slate-500 max-w-sm">Select a colleague from the left directory to start a secure direct conversation.</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}