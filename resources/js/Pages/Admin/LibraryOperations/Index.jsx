import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';
import Icon from '@/Components/Icons';
import Swal from 'sweetalert2';

const InputClass = 'mt-1 w-full rounded-xl border-slate-300 text-sm focus:ring-indigo-500 focus:border-indigo-500';

const Box = ({ title, children, icon }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <h2 className="mb-4 font-bold text-slate-800 flex items-center gap-2">
      {icon && <Icon name={icon} className="w-5 h-5 text-indigo-500" />} {title}
    </h2>
    {children}
  </section>
);

export default function Index({ books, reservations, issues, stockChecks, users }) {
  const [scan, setScan] = useState('');
  const [found, setFound] = useState(null);

  // Forms
  const cp = useForm({ book_id: '', accession_no: '', barcode: '', acquired_at: '', purchase_price: '', condition: 'good' });
  const mem = useForm({ user_id: '', card_no: '', barcode: '', valid_until: '', max_books: 3 });
  const issue = useForm({ book_copy_id: '', library_member_id: '', issue_date: new Date().toISOString().slice(0, 10), due_date: '' });
  const master = useForm({ type: 'authors', name: '', description: '' });
  const stock = useForm({ code: '', condition: 'good' });

  const submit = (formInstance, url) => e => {
    e.preventDefault();
    formInstance.post(route(url), {
      preserveScroll: true,
      onSuccess: () => {
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Action Successful', showConfirmButton: false, timer: 3000 });
        formInstance.reset();
        if(url === 'admin.library.issue') { setFound(null); setScan(''); }
      }
    });
  };

  // Scan Logic
  const doScan = async () => {
    if (!scan) return;
    try {
      const r = await fetch(route('admin.library.scan', { code: scan }));
      const data = await r.json();
      setFound(prev => ({ ...prev, ...data })); // Merge new scan with previous scans
      
      // Auto Assign to Issue Form
      if (data.copy) issue.setData('book_copy_id', data.copy.id);
      if (data.member) issue.setData('library_member_id', data.member.id);
      
      setScan('');
    } catch (error) {
      console.error("Scan Failed");
    }
  };

  return (
    <AuthenticatedLayout>
      <Head title="Library Operations" />
      <main className="mx-auto max-w-7xl space-y-8 p-6">
        
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">LMS Library</span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Library Circulation & Operations</h1>
          <p className="text-sm text-slate-500 mt-1">Accession copies, scan-based issue/return, members, and physical stock.</p>
        </div>

        {/* Master Scanner */}
        <Box title="Barcode / QR Master Scanner" icon="maximize">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="search" className="w-5 h-5 text-slate-400" />
              </div>
              <input 
                autoFocus 
                className="w-full pl-10 py-3 rounded-xl border-slate-300 focus:ring-indigo-500 text-sm font-mono shadow-inner" 
                value={scan} 
                onChange={e => setScan(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && doScan()} 
                placeholder="Scan book barcode, QR, accession or member card..."
              />
            </div>
            <button onClick={doScan} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-8 py-3 text-white font-bold transition-all shadow-md active:scale-95">
              Scan
            </button>
          </div>
        </Box>

        {/* Issue Book via Scan */}
        <Box title="Issue Scanned Book" icon="book-open">
          <form onSubmit={submit(issue, 'admin.library.issue')} className="space-y-5">
            
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Selected Copy Indicator */}
              <div className={`p-4 rounded-xl border ${issue.data.book_copy_id ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200 border-dashed'}`}>
                <p className="text-xs text-slate-500 font-bold uppercase mb-1">Scanned Book Copy</p>
                <div className="font-semibold text-slate-800">
                  {issue.data.book_copy_id 
                    ? (found?.copy ? `${found.copy.accession_no} - ${found.copy.book.title}` : 'Selected via scan') 
                    : <span className="text-rose-500 text-sm">Waiting for book scan...</span>}
                </div>
              </div>

              {/* Selected Member Indicator */}
              <div className={`p-4 rounded-xl border ${issue.data.library_member_id ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200 border-dashed'}`}>
                <p className="text-xs text-slate-500 font-bold uppercase mb-1">Scanned Member Card</p>
                <div className="font-semibold text-slate-800">
                  {issue.data.library_member_id 
                    ? (found?.member ? `${found.member.card_no} - ${found.member.user.name}` : 'Selected via scan') 
                    : <span className="text-rose-500 text-sm">Waiting for member scan...</span>}
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 items-end">
              <div>
                <label className="text-xs font-bold text-slate-600">Issue Date</label>
                <input className={InputClass} type="date" value={issue.data.issue_date} onChange={e => issue.setData('issue_date', e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600">Due Date <span className="text-rose-500">*</span></label>
                <input className={InputClass} type="date" value={issue.data.due_date} onChange={e => issue.setData('due_date', e.target.value)} required />
              </div>
              <button disabled={!issue.data.book_copy_id || !issue.data.library_member_id} className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 disabled:opacity-50 transition-all">
                Confirm Issue
              </button>
            </div>
          </form>
        </Box>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Reservation Approvals */}
          <Box title="Online Reservation Approvals" icon="clock">
            <div className="space-y-3">
              {reservations.length === 0 && <p className="text-sm text-slate-400">No pending reservations.</p>}
              {reservations.map(x => (
                <div key={x.id} className="flex justify-between items-center bg-slate-50 border border-slate-100 p-3 rounded-lg text-sm">
                  <div className="font-medium text-slate-800">{x.book?.title} <span className="text-xs ml-2 bg-amber-100 text-amber-700 px-2 py-0.5 rounded">{x.status}</span></div>
                  {x.status === 'Pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => router.patch(route('admin.library.reservation', x.id), { status: 'Approved' })} className="px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded font-bold text-xs">Approve</button>
                      <button onClick={() => router.patch(route('admin.library.reservation', x.id), { status: 'Rejected' })} className="px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded font-bold text-xs">Reject</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Box>

          {/* Current Issues & Returns */}
          <Box title="Current Issues, Returns & Charges" icon="repeat">
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {issues.length === 0 && <p className="text-sm text-slate-400">No active book issues.</p>}
              {issues.map(x => (
                <div key={x.id} className="border border-slate-200 p-4 rounded-xl text-sm bg-white shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <b className="text-indigo-900 text-base block">{x.book?.title}</b>
                      <span className="text-slate-500 font-medium">Member: {x.user?.name}</span>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${x.status === 'Overdue' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>
                      {x.status}
                    </span>
                  </div>
                  
                  <div className="bg-slate-50 p-2 rounded text-xs text-slate-600 mb-3 font-mono">
                    Fine: ৳{x.fine_amount} | Chg: ৳{x.replacement_charge} | Paid: ৳{x.fine_paid}
                  </div>

                  {['Issued', 'Overdue'].includes(x.status) && (
                    <div className="flex flex-wrap gap-2 mt-2 pt-3 border-t border-slate-100">
                      <button onClick={() => router.patch(route('admin.library.return', x.id), { condition_on_return: 'good', replacement_charge: 0 })} className="text-xs font-bold px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-md">Return Good</button>
                      <button onClick={() => router.patch(route('admin.library.return', x.id), { condition_on_return: 'damaged', replacement_charge: x.book?.price || 0 })} className="text-xs font-bold px-3 py-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-md">Return Damaged</button>
                      <button onClick={() => router.patch(route('admin.library.return', x.id), { condition_on_return: 'lost', replacement_charge: x.book?.price || 0 })} className="text-xs font-bold px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-md">Mark Lost</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Box>
        </div>

        {/* Configurations Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Box title="Book Copy / Accession" icon="plus-circle">
            <form onSubmit={submit(cp, 'admin.library.copies')} className="grid gap-3">
              <select className={InputClass} value={cp.data.book_id} onChange={e => cp.setData('book_id', e.target.value)} required>
                <option value="">Select Book Title</option>
                {books.map(x => <option key={x.id} value={x.id}>{x.title}</option>)}
              </select>
              <input className={InputClass} placeholder="Accession No (Required)" value={cp.data.accession_no} onChange={e => cp.setData('accession_no', e.target.value)} required />
              <input className={InputClass} placeholder="Custom Barcode (Auto if blank)" value={cp.data.barcode} onChange={e => cp.setData('barcode', e.target.value)} />
              <select className={InputClass} value={cp.data.condition} onChange={e => cp.setData('condition', e.target.value)}>
                {['new', 'good', 'fair', 'damaged'].map(x => <option key={x} value={x}>{x.charAt(0).toUpperCase() + x.slice(1)}</option>)}
              </select>
              <button className="rounded-xl bg-indigo-600 hover:bg-indigo-700 py-2.5 text-white font-bold transition-colors">Add Book Copy</button>
            </form>
          </Box>

          <Box title="Member / Library Card" icon="credit-card">
            <form onSubmit={submit(mem, 'admin.library.members')} className="grid gap-3">
              <select className={InputClass} value={mem.data.user_id} onChange={e => mem.setData('user_id', e.target.value)} required>
                <option value="">Select Student / Staff</option>
                {users.map(x => <option key={x.id} value={x.id}>{x.name} ({x.email})</option>)}
              </select>
              <input className={InputClass} placeholder="Card No (Required)" value={mem.data.card_no} onChange={e => mem.setData('card_no', e.target.value)} required />
              <div className="flex gap-2">
                <input className={InputClass} title="Valid Until" type="date" value={mem.data.valid_until} onChange={e => mem.setData('valid_until', e.target.value)} />
                <input className={InputClass} title="Max Books Allowed" type="number" value={mem.data.max_books} onChange={e => mem.setData('max_books', e.target.value)} placeholder="Max Books" />
              </div>
              <button className="rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2.5 text-white font-bold transition-colors">Create Member Card</button>
            </form>
          </Box>

          <Box title="Library Master Setup" icon="settings">
            <form onSubmit={submit(master, 'admin.library.masters')} className="grid gap-3">
              <select className={InputClass} value={master.data.type} onChange={e => master.setData('type', e.target.value)}>
                <option value="authors">Author</option>
                <option value="publishers">Publisher</option>
                <option value="categories">Category</option>
              </select>
              <input className={InputClass} placeholder="Name" value={master.data.name} onChange={e => master.setData('name', e.target.value)} required />
              <textarea rows="2" className={InputClass} placeholder="Description (Optional)" value={master.data.description} onChange={e => master.setData('description', e.target.value)} />
              <button className="rounded-xl bg-slate-800 hover:bg-slate-900 py-2.5 text-white font-bold transition-colors">Save Master Data</button>
            </form>
          </Box>
        </div>

        {/* Physical Stock Audit */}
        <Box title="Physical Stock Verification (Audit)" icon="check-square">
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-100">
            <p className="text-sm text-slate-500 flex-1">Annual or monthly stock check. Scan all physical books to identify missing items.</p>
            <button onClick={() => router.post(route('admin.library.stock.start'))} className="rounded-xl bg-rose-600 hover:bg-rose-700 px-6 py-2.5 text-white font-bold text-sm shadow-sm transition-all">
              Start New Audit
            </button>
          </div>
          
          <div className="space-y-3">
            {stockChecks.length === 0 && <p className="text-sm text-slate-400 italic">No previous stock checks found.</p>}
            {stockChecks.map(x => (
              <div key={x.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div>
                  <b className="text-slate-800 block text-sm">{x.reference_no}</b>
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${x.status === 'open' ? 'text-amber-600' : 'text-emerald-600'}`}>{x.status}</span>
                </div>
                
                {x.status === 'open' && (
                  <div className="flex gap-2 w-full md:w-auto">
                    <input className={`${InputClass} !mt-0 md:w-48`} placeholder="Scan copy barcode" value={stock.data.code} onChange={e => stock.setData('code', e.target.value)} />
                    <button onClick={() => stock.post(route('admin.library.stock.scan', x.id))} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors">Count</button>
                    <button onClick={() => { if(confirm("Are you sure? Unscanned items will be marked as missing!")) router.patch(route('admin.library.stock.complete', x.id)) }} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors">Finish Audit</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Box>

      </main>
    </AuthenticatedLayout>
  );
}