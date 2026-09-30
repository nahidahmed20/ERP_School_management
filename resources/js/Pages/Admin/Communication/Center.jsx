import { Head, router, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useMemo, useEffect } from 'react';
import Icon from '@/Components/Icons';
import Swal from 'sweetalert2';

const inputClass = 'mt-1 block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all';
const labelClass = 'block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5';

const Box = ({ title, icon, children, action }) => (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col">
        <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Icon name={icon} className="w-4 h-4" />
                </div>
                <h2 className="font-bold text-slate-800">{title}</h2>
            </div>
            {action && <div>{action}</div>}
        </div>
        <div className="flex-1">{children}</div>
    </section>
);

const calculateMetrics = (s, rate = 0) => {
    if (!s) return { unicode: false, n: 0, segments: 0, cost: '0.00' };
    const unicode = /[^\x00-\x7F]/.test(s);
    const n = Array.from(s).length;
    const a = unicode ? 70 : 160;
    const b = unicode ? 67 : 153;
    const segments = n <= a ? 1 : Math.ceil(n / b);
    return { unicode, n, segments, cost: (segments * rate).toFixed(2) };
};

export default function Center({ templates, segments, campaigns, providers }) {
    const { flash } = usePage().props;

    useEffect(() => {
        if (flash?.success) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000 });
        if (flash?.error) Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: flash.error, showConfirmButton: false, timer: 4000 });
    }, [flash]);

    // Forms
    const tForm = useForm({ key: '', name: '', channel: 'sms', category: 'general', subject: '', body: '', estimated_cost_per_segment: 0.50, is_active: true });
    const sForm = useForm({ name: '', audience_type: 'guardians', rules: {} });
    const cForm = useForm({ name: '', channel: 'sms', category: 'general', subject: '', body: '', audience_segment_id: '', scheduled_at: '' });

    const metrics = useMemo(() => calculateMetrics(cForm.data.body, 0.50), [cForm.data.body]);

    const submit = (f, url) => e => {
        e.preventDefault();
        f.post(route(url), { preserveScroll: true, onSuccess: () => f.reset() });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Communication Center" />
            
            <main className="mx-auto max-w-7xl space-y-8 py-8 px-4 sm:px-6 lg:px-8">
                
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">Messaging & Notifications</span>
                        <h1 className="text-3xl font-black text-slate-900 mt-1">Communication Center</h1>
                        <p className="text-sm text-slate-500 mt-1">Manage SMS, Email, WhatsApp campaigns and track delivery status.</p>
                    </div>
                    <button onClick={() => router.post(route('admin.communication-center.balance'))} className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md active:scale-95">
                        <Icon name="refresh-cw" className="w-4 h-4" /> Check Balance
                    </button>
                </div>

                {/* Top Row: Segments & Provider Health */}
                <div className="grid gap-6 lg:grid-cols-2">
                    
                    <Box title="Audience Segments" icon="users">
                        <form onSubmit={submit(sForm, 'admin.communication-center.segments')} className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4 grid sm:grid-cols-2 gap-3">
                            <div className="sm:col-span-2">
                                <label className={labelClass}>Segment Name *</label>
                                <input className={inputClass} placeholder="e.g. Class 10 Parents" value={sForm.data.name} onChange={e => sForm.setData('name', e.target.value)} required />
                            </div>
                            <div>
                                <label className={labelClass}>Audience Type</label>
                                <select className={`${inputClass} bg-white`} value={sForm.data.audience_type} onChange={e => sForm.setData('audience_type', e.target.value)}>
                                    <option value="guardians">Guardians</option>
                                    <option value="students">Students</option>
                                    <option value="staff">Staff</option>
                                </select>
                            </div>
                            <div className="flex items-end">
                                <button disabled={sForm.processing} className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 font-bold text-white shadow-md hover:bg-emerald-700 disabled:opacity-70">
                                    Create Segment
                                </button>
                            </div>
                        </form>

                        <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                            {segments.length === 0 && <p className="text-sm text-slate-400 italic">No segments created yet.</p>}
                            {segments.map(x => (
                                <div key={x.id} className="flex justify-between items-center p-3 border border-slate-100 rounded-xl bg-white shadow-sm">
                                    <strong className="text-sm text-slate-800">{x.name}</strong>
                                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{x.audience_type}</span>
                                </div>
                            ))}
                        </div>
                    </Box>

                    <Box title="Provider API Health" icon="activity">
                        <div className="grid gap-3">
                            {providers.length ? providers.map(x => (
                                <div key={x.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${x.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                                        <div>
                                            <b className="text-sm text-slate-900 uppercase">{x.channel}</b>
                                            <p className="text-[10px] text-slate-500 truncate max-w-[150px]">{x.last_response || 'No recent ping'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${x.status === 'online' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{x.status}</span>
                                        <div className="text-lg font-black font-mono text-slate-800 mt-1">{x.balance ?? '—'} <span className="text-xs text-slate-500">{x.currency}</span></div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-8 text-slate-500 text-sm">
                                    <Icon name="server" className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                                    No provider configured yet.<br/>Click "Check Balance" to initialize.
                                </div>
                            )}
                        </div>
                    </Box>
                </div>

                {/* Templates & Campaign Composer */}
                <div className="grid gap-6 lg:grid-cols-12">
                    
                    {/* Template Form */}
                    <div className="lg:col-span-4">
                        <Box title="Message Templates" icon="file-text">
                            <form onSubmit={submit(tForm, 'admin.communication-center.templates')} className="grid gap-4">
                                <div><label className={labelClass}>Template Key</label><input className={inputClass} placeholder="e.g. absent_alert" value={tForm.data.key} onChange={e => tForm.setData('key', e.target.value.toLowerCase().replace(/\s/g, '_'))} required /></div>
                                <div><label className={labelClass}>Template Name</label><input className={inputClass} placeholder="e.g. Daily Absent Notice" value={tForm.data.name} onChange={e => tForm.setData('name', e.target.value)} required /></div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={labelClass}>Channel</label>
                                        <select className={`${inputClass} bg-white`} value={tForm.data.channel} onChange={e => tForm.setData('channel', e.target.value)}>
                                            <option value="sms">SMS</option>
                                            <option value="email">Email</option>
                                            <option value="whatsapp">WhatsApp</option>
                                        </select>
                                    </div>
                                    <div><label className={labelClass}>Category</label><input className={inputClass} placeholder="e.g. alert" value={tForm.data.category} onChange={e => tForm.setData('category', e.target.value)} /></div>
                                </div>
                                <div><label className={labelClass}>Message Body</label><textarea rows="4" className={`${inputClass} resize-none`} placeholder="Hi {name}, your ward {student} is absent today." value={tForm.data.body} onChange={e => tForm.setData('body', e.target.value)} required /></div>
                                <button disabled={tForm.processing} className="w-full rounded-xl bg-slate-900 px-4 py-2.5 font-bold text-white shadow-md hover:bg-slate-800 disabled:opacity-70">Save Template</button>
                            </form>
                        </Box>
                    </div>

                    {/* Campaign Composer */}
                    <div className="lg:col-span-8">
                        <Box title="Compose New Campaign" icon="send">
                            <form onSubmit={submit(cForm, 'admin.communication-center.campaigns')} className="grid gap-4 md:grid-cols-2">
                                <div className="md:col-span-2"><label className={labelClass}>Campaign Name *</label><input className={inputClass} placeholder="e.g. Eid Holiday Notice" value={cForm.data.name} onChange={e => cForm.setData('name', e.target.value)} required /></div>
                                
                                <div>
                                    <label className={labelClass}>Target Segment *</label>
                                    <select className={`${inputClass} bg-white`} value={cForm.data.audience_segment_id} onChange={e => cForm.setData('audience_segment_id', e.target.value)} required>
                                        <option value="" disabled>Select Audience Segment</option>
                                        {segments.map(x => <option key={x.id} value={x.id}>{x.name} ({x.audience_type})</option>)}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className={labelClass}>Broadcast Channel</label>
                                    <select className={`${inputClass} bg-white`} value={cForm.data.channel} onChange={e => cForm.setData('channel', e.target.value)}>
                                        <option value="sms">SMS</option>
                                        <option value="email">Email</option>
                                        <option value="whatsapp">WhatsApp</option>
                                    </select>
                                </div>

                                <div><label className={labelClass}>Category</label><input className={inputClass} placeholder="e.g. Notice" value={cForm.data.category} onChange={e => cForm.setData('category', e.target.value)} /></div>
                                <div><label className={labelClass}>Schedule (Optional)</label><input type="datetime-local" className={inputClass} value={cForm.data.scheduled_at} onChange={e => cForm.setData('scheduled_at', e.target.value)} /></div>

                                {cForm.data.channel === 'email' && (
                                    <div className="md:col-span-2"><label className={labelClass}>Email Subject</label><input className={inputClass} placeholder="Email Subject line" value={cForm.data.subject} onChange={e => cForm.setData('subject', e.target.value)} /></div>
                                )}

                                <div className="md:col-span-2">
                                    <label className={labelClass}>Message Content *</label>
                                    <textarea rows="5" className={`${inputClass} resize-none font-mono text-sm leading-relaxed`} value={cForm.data.body} onChange={e => cForm.setData('body', e.target.value)} placeholder="Type your broadcast message here..." required />
                                    
                                    {/* Real-time SMS Metrics */}
                                    {cForm.data.channel === 'sms' && (
                                        <div className="mt-3 flex flex-wrap items-center gap-3 bg-blue-50 border border-blue-100 p-3 rounded-xl text-xs font-semibold text-blue-800">
                                            <span className="bg-white px-2 py-1 rounded shadow-sm">Type: {metrics.unicode ? 'Unicode (Bangla)' : 'GSM (English)'}</span>
                                            <span className="bg-white px-2 py-1 rounded shadow-sm">Chars: {metrics.n}</span>
                                            <span className="bg-white px-2 py-1 rounded shadow-sm">Segments: <b className="text-rose-600">{metrics.segments}</b></span>
                                            <span className="bg-white px-2 py-1 rounded shadow-sm ml-auto">Est. Cost: <b className="text-emerald-700">{metrics.cost} BDT/Person</b></span>
                                        </div>
                                    )}
                                </div>

                                <div className="md:col-span-2 border-t border-slate-100 pt-4 flex justify-end">
                                    <button disabled={cForm.processing} className="rounded-xl bg-indigo-600 px-8 py-3 font-bold text-white shadow-md hover:bg-indigo-700 disabled:opacity-70 flex items-center gap-2">
                                        <Icon name="edit" className="w-4 h-4" /> Save as Draft
                                    </button>
                                </div>
                            </form>
                        </Box>
                    </div>
                </div>

                {/* Campaign Table */}
                <Box title="Campaign Approvals & Delivery Status" icon="list">
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Campaign Name</th>
                                    <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Channel</th>
                                    <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Delivery Stats</th>
                                    <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {campaigns.length === 0 && (
                                    <tr><td colSpan="5" className="px-5 py-8 text-center text-slate-500">No campaigns created yet.</td></tr>
                                )}
                                {campaigns.map(x => (
                                    <tr key={x.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-5 py-3">
                                            <strong className="text-slate-800">{x.name}</strong>
                                            <div className="text-[10px] text-slate-400 mt-0.5">{x.scheduled_at ? `Scheduled: ${new Date(x.scheduled_at).toLocaleString()}` : 'Immediate Dispatch'}</div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className="uppercase text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">{x.channel}</span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className={`uppercase text-[10px] font-bold px-2.5 py-1 rounded-full ${x.status === 'draft' ? 'bg-amber-100 text-amber-700' : x.status === 'approved' ? 'bg-sky-100 text-sky-700' : x.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                                {x.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 font-mono text-xs">
                                            <span className="text-emerald-600 font-bold">{x.sent_count} sent</span> <span className="text-slate-300">/</span> <span className="text-rose-600">{x.failed_count} fail</span>
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            {x.status === 'draft' && <button onClick={() => router.patch(route('admin.communication-center.approve', x.id))} className="px-4 py-1.5 text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors">Approve</button>}
                                            {x.status === 'approved' && <button onClick={() => router.post(route('admin.communication-center.dispatch', x.id))} className="px-4 py-1.5 text-xs font-bold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1 ml-auto"><Icon name="send" className="w-3 h-3" /> Queue</button>}
                                            {['queued', 'completed', 'scheduled'].includes(x.status) && <span className="text-[10px] text-slate-400 font-semibold italic">Locked</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Box>

            </main>
        </AuthenticatedLayout>
    );
}