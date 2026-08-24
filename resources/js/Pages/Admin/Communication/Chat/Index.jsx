import { useState, useEffect, useRef } from 'react';
import { Head, router, usePage, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';

export default function ChatIndex({ users, activeUser, messages }) {
  const { auth } = usePage().props;
  const currentUserId = auth.user.id;
  const messagesEndRef = useRef(null);

  const { data, setData, post, processing, reset } = useForm({
    receiver_id: activeUser?.id ?? '',
    message: '',
  });

  // activeUser পরিবর্তন হলে ফর্মে receiver_id সিঙ্ক করে নেওয়া
  useEffect(() => {
    if (activeUser?.id) {
      setData('receiver_id', activeUser.id);
    }
  }, [activeUser]);

  // Auto scroll to bottom of chat when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle User selection from sidebar
  const selectUser = (userId) => {
    setData('receiver_id', userId);
    router.get(route('admin.communication.chat'), { user_id: userId }, { preserveState: true, preserveScroll: true });
  };

  // Send Message
  const sendMessage = (e) => {
    e.preventDefault();
    if (!data.message.trim() || !data.receiver_id) return;

    post(route('admin.communication.chat.store'), {
      preserveScroll: true,
      onSuccess: () => reset('message'),
    });
  };

  return (
    <AuthenticatedLayout>
      <Head title="Chat" />

      <div className="w-full sm:px-6 lg:px-8 py-6">
        
        {/* Page Header */}
        <div className="mb-6">
          <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">Communication</span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Internal Chat</h1>
        </div>

        {/* CHAT INTERFACE: Flexbox Layout for 100% Stability */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row overflow-hidden h-[calc(100vh-220px)] min-h-[550px]">

          {/* ================= LEFT SIDEBAR (Staff Directory) ================= */}
          <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col bg-slate-50/50 shrink-0 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-white">
              <h3 className="font-bold text-slate-800 text-sm">Staff Directory ({users.length})</h3>
            </div>

            <div className="overflow-y-auto flex-1 divide-y divide-slate-100 custom-scrollbar">
              {users.length === 0 && (
                <div className="p-6 text-center text-slate-400 text-sm">No users found.</div>
              )}

              {users.map(user => {
                const isActive = activeUser?.id === user.id;
                return (
                  <div
                    key={user.id}
                    onClick={() => selectUser(user.id)}
                    className={`p-3.5 flex items-center gap-3 cursor-pointer transition-all border-l-4 ${
                      isActive ? 'bg-indigo-50 border-indigo-600 shadow-sm' : 'bg-white hover:bg-slate-50 border-transparent'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden flex-1">
                      <div className={`font-bold text-sm truncate ${isActive ? 'text-indigo-900' : 'text-slate-900'}`}>
                        {user.name}
                      </div>
                      <div className="text-xs text-slate-500 truncate mt-0.5">{user.email}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ================= RIGHT SIDEBAR (Chat Window) ================= */}
          <div className="flex-1 flex flex-col bg-white overflow-hidden">

            {activeUser ? (
              <>
                {/* Chat Header */}
                <div className="px-6 py-3.5 border-b border-slate-200 flex items-center gap-3 bg-white shrink-0 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-700 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    {activeUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base leading-tight">{activeUser.name}</h3>
                    <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> Available
                    </div>
                  </div>
                </div>

                {/* Chat Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 flex flex-col gap-4 custom-scrollbar">
                  {messages.length === 0 && (
                    <div className="m-auto text-center text-slate-400">
                      <div className="w-16 h-16 bg-slate-100 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-200 shadow-inner">
                        <Icon name="chat" className="w-8 h-8" />
                      </div>
                      <p className="text-sm font-semibold text-slate-600">Start a conversation with {activeUser.name}</p>
                      <p className="text-xs text-slate-400 mt-1">Send a message below to begin chatting.</p>
                    </div>
                  )}

                  {messages.map((msg, idx) => {
                    const isMine = msg.sender_id === currentUserId;
                    return (
                      <div key={idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] lg:max-w-[60%] px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed ${
                          isMine 
                            ? 'bg-indigo-600 text-white rounded-br-none' 
                            : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none'
                        }`}>
                          <div>{msg.message}</div>
                          <div className={`text-[10px] text-right mt-1 font-mono ${isMine ? 'text-indigo-200' : 'text-slate-400'}`}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {/* Dummy div to scroll to bottom */}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input Area */}
                <div className="p-4 border-t border-slate-200 bg-white shrink-0">
                  <form onSubmit={sendMessage} className="flex items-center gap-3">
                    <input
                      type="text"
                      value={data.message}
                      onChange={e => setData('message', e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all shadow-inner"
                      autoFocus
                    />
                    <button 
                      type="submit" 
                      disabled={processing || !data.message.trim()}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-2xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shrink-0"
                    >
                      <Icon name="send" className="w-4 h-4" /> Send
                    </button>
                  </form>
                </div>
              </>
            ) : (
              /* State when no user is selected */
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 p-6 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 border border-slate-200 shadow-sm text-slate-300">
                  <Icon name="chat" className="w-10 h-10" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-1">Internal Chat System</h2>
                <p className="text-sm text-slate-500 max-w-sm">Select a staff member from the left directory to start a secure direct conversation.</p>
              </div>
            )}

          </div>

        </div>
      </div>
    </AuthenticatedLayout>
  );
}