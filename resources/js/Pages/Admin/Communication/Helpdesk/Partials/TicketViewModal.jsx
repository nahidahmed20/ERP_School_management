import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';
import { useState } from 'react';

export default function TicketViewModal({ ticket, onClose }) {
  const [activeTab, setActiveTab] = useState('chat');

  // Form for changing Status/Priority
  const statusForm = useForm({ status: ticket.status, priority: ticket.priority });

  // Form for adding a Reply
  const replyForm = useForm({ message: '' });

  function updateStatus(e) {
    e.preventDefault();
    statusForm.put(route('admin.communication.helpdesk.update', ticket.id));
  }

  function submitReply(e) {
    e.preventDefault();
    replyForm.post(route('admin.communication.helpdesk.reply', ticket.id), {
      preserveScroll: true,
      onSuccess: () => { replyForm.reset('message'); }
    });
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>

        <div className="mm-modal-head" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
          <div>
            <h3 style={{ margin: 0 }}>{ticket.ticket_number}</h3>
            <div style={{ fontSize: '13px', color: '#64748b' }}>{ticket.subject}</div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>

        {/* Custom Tabs */}
        <div style={{ display: 'flex', gap: '15px', padding: '10px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <button onClick={() => setActiveTab('chat')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px 10px', borderBottom: activeTab === 'chat' ? '2px solid #4f46e5' : '2px solid transparent', fontWeight: activeTab === 'chat' ? 'bold' : 'normal', color: activeTab === 'chat' ? '#4f46e5' : '#64748b' }}>
            Discussion & Replies
          </button>
          <button onClick={() => setActiveTab('settings')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px 10px', borderBottom: activeTab === 'settings' ? '2px solid #4f46e5' : '2px solid transparent', fontWeight: activeTab === 'settings' ? 'bold' : 'normal', color: activeTab === 'settings' ? '#4f46e5' : '#64748b' }}>
            Ticket Details & Status
          </button>
        </div>

        <div style={{ padding: '20px' }}>
          {activeTab === 'chat' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '400px' }}>

              {/* Original Ticket Description */}
              <div style={{ overflowY: 'auto', flex: 1, paddingRight: '10px' }}>
                <div style={{ background: '#f1f5f9', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                  <strong style={{ fontSize: '12px', color: '#475569' }}>{ticket.requester_name} (Original Request)</strong>
                  <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#0f172a' }}>{ticket.description}</p>
                </div>

                {/* Replies / Chat History */}
                {ticket.replies?.map((reply, idx) => (
                  <div key={idx} style={{ background: reply.sender === 'Admin' ? '#eef2ff' : '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '10px', border: reply.sender === 'Admin' ? '1px solid #c7d2fe' : '1px solid #e2e8f0', marginLeft: reply.sender === 'Admin' ? '30px' : '0', marginRight: reply.sender === 'Admin' ? '0' : '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                      <strong>{reply.sender}</strong>
                      <span>{new Date(reply.date).toLocaleString()}</span>
                    </div>
                    <div style={{ fontSize: '13.5px', color: '#1e293b' }}>{reply.message}</div>
                  </div>
                ))}
              </div>

              {/* Reply Input Form */}
              {ticket.status !== 'Closed' ? (
                <form onSubmit={submitReply} style={{ marginTop: '15px', borderTop: '1px solid #e2e8f0', paddingTop: '15px', display: 'flex', gap: '10px' }}>
                  <input type="text" value={replyForm.data.message} onChange={e => replyForm.setData('message', e.target.value)} required placeholder="Type your reply..." style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} />
                  <button type="submit" className="btn" disabled={replyForm.processing}><Icon name="send" /> Reply</button>
                </form>
              ) : (
                <div style={{ marginTop: '15px', padding: '10px', textAlign: 'center', background: '#fef2f2', color: '#991b1b', borderRadius: '6px' }}>This ticket is Closed. No further replies allowed.</div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <form onSubmit={updateStatus} className="mm-form">
              <div className="mm-form-grid">
                <label><span>Update Status</span>
                  <select value={statusForm.data.status} onChange={e => statusForm.setData('status', e.target.value)}>
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Closed">Closed</option>
                  </select>
                </label>
                <label><span>Update Priority</span>
                  <select value={statusForm.data.priority} onChange={e => statusForm.setData('priority', e.target.value)}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </label>
              </div>
              <div className="mt-4">
                <button type="submit" className="btn" disabled={statusForm.processing}>Save Changes</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
