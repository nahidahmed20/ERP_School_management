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

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal mm-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit/Return Book' : 'Issue New Book'}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>

        <form onSubmit={submit} className="mm-form">
          <div className="mm-form-grid">
            
            <label style={{ gridColumn: '1 / -1' }}>
              <span>Assign to Campus *</span>
              <select value={data.campus_id || ''} onChange={(e) => setData('campus_id', e.target.value)} disabled={!isSuperAdmin} required>
                <option value="" disabled>Select Campus</option>
                {campuses?.map(campus => <option key={campus.id} value={campus.id}>{campus.name}</option>)}
              </select>
              {errors.campus_id && <em>{errors.campus_id}</em>}
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Select Borrower (User) *</span>
              <select value={data.user_id} onChange={(e) => setData('user_id', e.target.value)} disabled={isEdit} required>
                <option value="" disabled>Search or select user...</option>
                {users?.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
              </select>
              {errors.user_id && <em>{errors.user_id}</em>}
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Select Book *</span>
              <select value={data.book_id} onChange={(e) => setData('book_id', e.target.value)} disabled={isEdit} required>
                <option value="" disabled>Select Book</option>
                {books?.map(b => (
                  <option key={b.id} value={b.id} disabled={b.available < 1 && !isEdit}>
                    {b.title} (Stock: {b.available})
                  </option>
                ))}
              </select>
              {errors.book_id && <em>{errors.book_id}</em>}
            </label>

            <label>
              <span>Issue Date *</span>
              <input type="date" value={data.issue_date} onChange={(e) => setData('issue_date', e.target.value)} required />
              {errors.issue_date && <em>{errors.issue_date}</em>}
            </label>

            <label>
              <span>Due Date (Return by) *</span>
              <input type="date" value={data.due_date} onChange={(e) => setData('due_date', e.target.value)} required />
              {errors.due_date && <em>{errors.due_date}</em>}
            </label>

            <label>
              <span>Status *</span>
              <select value={data.status} onChange={handleStatusChange} required>
                <option value="Issued">Issued (Not Returned)</option>
                <option value="Returned">Returned</option>
                <option value="Overdue">Overdue</option>
                <option value="Lost">Lost</option>
              </select>
            </label>

            <label>
              <span>Actual Return Date</span>
              <input type="date" value={data.return_date || ''} onChange={(e) => setData('return_date', e.target.value)} disabled={data.status === 'Issued'} />
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Fine Amount (If applicable)</span>
              <input type="number" value={data.fine_amount} onChange={(e) => setData('fine_amount', e.target.value)} min="0" step="0.01" />
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Notes</span>
              <textarea rows="2" value={data.note} onChange={(e) => setData('note', e.target.value)} placeholder="Condition of the book, fine details etc..." />
            </label>

          </div>

          <div className="mm-modal-foot mt-2">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={processing}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>{processing ? 'Saving...' : (isEdit ? 'Update' : 'Issue Book')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}