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

  const inputClass = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all";

  return (
    // Responsive Overlay
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      
      {/* Responsive Modal Box */}
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0 rounded-t-2xl">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-black font-mono text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">{ticket.ticket_number}</span>
              <span className={`inline-flex px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase border ${
                ticket.status === 'Open' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                ticket.status === 'In Progress' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                'bg-slate-100 text-slate-600 border-slate-200'
              }`}>{ticket.status}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-2">{ticket.subject}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm shrink-0">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Custom Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-6 shrink-0">
          <button 
            onClick={() => setActiveTab('chat')} 
            className={`py-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'chat' ? 'border-indigo-600 text-indigo-600 bg-white shadow-sm' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon name="chat" className="w-4 h-4" /> Discussion &amp; Replies
          </button>
          <button 
            onClick={() => setActiveTab('settings')} 
            className={`py-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'settings' ? 'border-indigo-600 text-indigo-600 bg-white shadow-sm' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon name="settings" className="w-4 h-4" /> Ticket Details &amp; Status
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-5">
          {activeTab === 'chat' && (
            <div className="flex flex-col h-[400px]">

              {/* Original Ticket Description & Replies Container */}
              <div className="overflow-y-auto flex-1 space-y-4 pr-1 custom-scrollbar">
                
                {/* Original Request Box */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1.5">
                    <span>{ticket.requester_name} (Original Request)</span>
                  </div>
                  <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
                </div>

                {/* Replies / Chat History */}
                {ticket.replies?.map((reply, idx) => {
                  const isAdmin = reply.sender === 'Admin';
                  return (
                    <div key={idx} className={`p-4 rounded-xl border shadow-sm ${
                      isAdmin 
                        ? 'bg-indigo-50/60 border-indigo-100 ml-6' 
                        : 'bg-white border-slate-200 mr-6'
                    }`}>
                      <div className="flex justify-between items-center text-xs font-semibold text-slate-500 mb-1.5">
                        <span className={`font-bold ${isAdmin ? 'text-indigo-700' : 'text-slate-700'}`}>{reply.sender}</span>
                        <span className="font-mono text-[10px]">{new Date(reply.date).toLocaleString()}</span>
                      </div>
                      <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{reply.message}</div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Input Form */}
              {ticket.status !== 'Closed' ? (
                <form onSubmit={submitReply} className="mt-4 pt-4 border-t border-slate-200 flex gap-3 shrink-0">
                  <input 
                    type="text" 
                    value={replyForm.data.message} 
                    onChange={e => replyForm.setData('message', e.target.value)} 
                    required 
                    placeholder="Type your reply..." 
                    className={inputClass} 
                  />
                  <button type="submit" disabled={replyForm.processing} className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 active:scale-95 shrink-0">
                    <Icon name="send" className="w-4 h-4" /> Reply
                  </button>
                </form>
              ) : (
                <div className="mt-4 p-3 text-center text-xs font-bold bg-rose-50 text-rose-700 rounded-xl border border-rose-200 shrink-0">
                  This ticket is Closed. No further replies allowed.
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <form onSubmit={updateStatus} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Update Status</label>
                <select value={statusForm.data.status} onChange={e => statusForm.setData('status', e.target.value)} className={`${inputClass} bg-white`}>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Update Priority</label>
                <select value={statusForm.data.priority} onChange={e => statusForm.setData('priority', e.target.value)} className={`${inputClass} bg-white`}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High (Urgent)</option>
                </select>
              </div>

              <div className="pt-2">
                <button type="submit" disabled={statusForm.processing} className="w-full flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 active:scale-95">
                  <Icon name="save" className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end rounded-b-2xl shrink-0">
          <button type="button" className="px-6 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-all shadow-sm active:scale-95" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}