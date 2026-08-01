import { useEffect, useRef } from 'react';
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

  // Auto scroll to bottom of chat when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle User selection from sidebar
  const selectUser = (userId) => {
    router.get(route('admin.communication.chat'), { user_id: userId }, { preserveState: true });
    setData('receiver_id', userId);
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
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div><span className="eyebrow">Communication</span><h1>Internal Chat</h1></div>
        </div>
      }
    >
      <Head title="Chat" />

      {/* CHAT INTERFACE: Two Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px', height: 'calc(100vh - 200px)', minHeight: '500px' }}>

        {/* ================= LEFT SIDEBAR (Users List) ================= */}
        <div className="card mm-card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '15px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <h3 style={{ margin: 0, fontSize: '16px' }}>Staff Directory</h3>
          </div>

          <div style={{ overflowY: 'auto', flex: 1 }}>
            {users.length === 0 && <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No users found.</div>}

            {users.map(user => (
              <div
                key={user.id}
                onClick={() => selectUser(user.id)}
                style={{
                  padding: '12px 15px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #f1f5f9',
                  background: activeUser?.id === user.id ? '#eef2ff' : '#fff',
                  borderLeft: activeUser?.id === user.id ? '4px solid #4f46e5' : '4px solid transparent',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '14px', color: activeUser?.id === user.id ? '#4f46e5' : '#0f172a' }}>{user.name}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{user.email}</div>
                </div>
              </div>
            ))}
          </div>
        </div>


        {/* ================= RIGHT SIDEBAR (Chat Window) ================= */}
        <div className="card mm-card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {activeUser ? (
            <>
              {/* Chat Header */}
              <div style={{ padding: '15px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px', background: '#fff' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
                  {activeUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px' }}>{activeUser.name}</h3>
                  <div style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }}></div> Available
                  </div>
                </div>
              </div>

              {/* Chat Messages Area */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {messages.length === 0 && (
                  <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: 'auto', marginBottom: 'auto' }}>
                    <Icon name="chat" style={{ fontSize: '40px', opacity: 0.2 }} />
                    <p>Start conversation with {activeUser.name}</p>
                  </div>
                )}

                {messages.map((msg, idx) => {
                  const isMine = msg.sender_id === currentUserId;
                  return (
                    <div key={idx} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '70%',
                        padding: '10px 15px',
                        borderRadius: '12px',
                        background: isMine ? '#4f46e5' : '#fff',
                        color: isMine ? '#fff' : '#0f172a',
                        border: isMine ? 'none' : '1px solid #e2e8f0',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        borderBottomRightRadius: isMine ? '0' : '12px',
                        borderBottomLeftRadius: isMine ? '12px' : '0',
                      }}>
                        <div style={{ fontSize: '14px', lineHeight: '1.4' }}>{msg.message}</div>
                        <div style={{ fontSize: '10px', textAlign: 'right', marginTop: '5px', opacity: isMine ? 0.8 : 0.5 }}>
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
              <div style={{ padding: '15px 20px', borderTop: '1px solid #e2e8f0', background: '#fff' }}>
                <form onSubmit={sendMessage} style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    value={data.message}
                    onChange={e => setData('message', e.target.value)}
                    placeholder="Type a message..."
                    style={{ flex: 1, padding: '12px 15px', border: '1px solid #cbd5e1', borderRadius: '20px', outline: 'none' }}
                    autoFocus
                  />
                  <button type="submit" className="btn" disabled={processing} style={{ borderRadius: '20px', padding: '0 20px' }}>
                    <Icon name="send" /> Send
                  </button>
                </form>
              </div>
            </>
          ) : (
            // State when no user is selected
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b', background: '#f8fafc' }}>
              <div style={{ width: '80px', height: '80px', background: '#e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' }}>
                <Icon name="chat" style={{ width: '40px', height: '40px', color: '#94a3b8' }} />
              </div>
              <h2 style={{ fontSize: '20px', color: '#334155', margin: '0 0 10px 0' }}>Internal Chat System</h2>
              <p style={{ margin: 0 }}>Select a user from the left directory to start chatting.</p>
            </div>
          )}

        </div>
      </div>

    </AuthenticatedLayout>
  );
}
