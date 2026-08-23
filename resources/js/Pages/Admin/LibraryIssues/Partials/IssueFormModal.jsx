import { useForm, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function IssueFormModal({ item, books, users, campuses, activeCampusId, onClose }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  const { data, setData, post, put, processing, errors, reset } = useForm({
    campus_id: item?.campus_id ?? activeCampusId,
    book_id: item?.book_id ?? '',
    user_id: item?.user_id ?? '',
    issue_date: item?.issue_date ?? new Date().toISOString().split('T')[0],
    due_date: item?.due_date ?? '',
    return_date: item?.return_date ?? '',
    fine_amount: item?.fine_amount ?? '0',
    status: item?.status ?? 'Issued',
    note: item?.note ?? '',
  });

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setData(data => ({
      ...data,
      status: newStatus,
      return_date: newStatus === 'Returned' && !data.return_date ? new Date().toISOString().split('T')[0] : data.return_date
    }));
  };

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };
    if (isEdit) put(route('admin.library-issues.update', item.id), options);
    else post(route('admin.library-issues.store'), options);
  }

  const inputClass = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    // Responsive Overlay
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>

      {/* Responsive Modal Box */}
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0 rounded-t-2xl">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit/Return Book' : 'Issue New Book'}</h3>
            <p className="text-sm text-slate-500 mt-1">Configure book issuance, due dates, and returns.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm shrink-0">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={submit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              <div className="sm:col-span-2">
                <label className={labelClass}>Assign to Campus <span className="text-rose-500">*</span></label>
                <select
                  value={data.campus_id || ''}
                  onChange={(e) => setData('campus_id', e.target.value)}
                  disabled={!isSuperAdmin}
                  required
                  className={`${inputClass} ${!isSuperAdmin ? 'bg-slate-100 opacity-70' : 'bg-white'}`}
                >
                  <option value="" disabled>Select Campus</option>
                  {campuses?.map(campus => <option key={campus.id} value={campus.id}>{campus.name}</option>)}
                </select>
                {errors.campus_id && <p className="text-rose-500 text-xs mt-1">{errors.campus_id}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Select Borrower (User) <span className="text-rose-500">*</span></label>
                <select
                  value={data.user_id}
                  onChange={(e) => setData('user_id', e.target.value)}
                  disabled={isEdit}
                  required
                  className={`${inputClass} ${isEdit ? 'bg-slate-100 opacity-70' : 'bg-white'}`}
                >
                  <option value="" disabled>Search or select user...</option>
                  {users?.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                </select>
                {errors.user_id && <p className="text-rose-500 text-xs mt-1">{errors.user_id}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Select Book <span className="text-rose-500">*</span></label>
                <select
                  value={data.book_id}
                  onChange={(e) => setData('book_id', e.target.value)}
                  disabled={isEdit}
                  required
                  className={`${inputClass} ${isEdit ? 'bg-slate-100 opacity-70' : 'bg-white'}`}
                >
                  <option value="" disabled>Select Book</option>
                  {books?.map(b => (
                    <option key={b.id} value={b.id} disabled={b.available < 1 && !isEdit}>
                      {b.title} (Stock: {b.available})
                    </option>
                  ))}
                </select>
                {errors.book_id && <p className="text-rose-500 text-xs mt-1">{errors.book_id}</p>}
              </div>

              <div>
                <label className={labelClass}>Issue Date <span className="text-rose-500">*</span></label>
                <input
                  type="date"
                  value={data.issue_date}
                  onChange={(e) => setData('issue_date', e.target.value)}
                  required
                  className={`${inputClass} font-mono`}
                />
                {errors.issue_date && <p className="text-rose-500 text-xs mt-1">{errors.issue_date}</p>}
              </div>

              <div>
                <label className={labelClass}>Due Date (Return by) <span className="text-rose-500">*</span></label>
                <input
                  type="date"
                  value={data.due_date}
                  onChange={(e) => setData('due_date', e.target.value)}
                  required
                  className={`${inputClass} font-mono`}
                />
                {errors.due_date && <p className="text-rose-500 text-xs mt-1">{errors.due_date}</p>}
              </div>

              <div>
                <label className={labelClass}>Status <span className="text-rose-500">*</span></label>
                <select value={data.status} onChange={handleStatusChange} required className={`${inputClass} bg-white`}>
                  <option value="Issued">Issued (Not Returned)</option>
                  <option value="Returned">Returned</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Actual Return Date</label>
                <input
                  type="date"
                  value={data.return_date || ''}
                  onChange={(e) => setData('return_date', e.target.value)}
                  disabled={data.status === 'Issued'}
                  className={`${inputClass} font-mono ${data.status === 'Issued' ? 'bg-slate-100 opacity-70' : 'bg-white'}`}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Fine Amount (৳)</label>
                <input
                  type="number"
                  value={data.fine_amount}
                  onChange={(e) => setData('fine_amount', e.target.value)}
                  min="0"
                  step="0.01"
                  className={`${inputClass} font-mono font-bold text-rose-600`}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Notes</label>
                <textarea
                  rows="2"
                  value={data.note}
                  onChange={(e) => setData('note', e.target.value)}
                  placeholder="Condition of the book, fine details etc..."
                  className={`${inputClass} resize-none`}
                />
              </div>

            </div>
          </div>

          {/* Footer - Stacked on Mobile, Row on Desktop */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 shrink-0 rounded-b-2xl">
            <button type="button" onClick={onClose} disabled={processing} className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm">
              Cancel
            </button>
            <button type="submit" disabled={processing} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 active:scale-95">
              <Icon name="save" className="w-4 h-4" />
              {processing ? 'Saving...' : (isEdit ? 'Update Record' : 'Issue Book')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
