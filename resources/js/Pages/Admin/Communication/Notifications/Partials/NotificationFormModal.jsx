import { useForm, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function NotificationFormModal({ item, campuses, activeCampusId, onClose }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin';

  const { data, setData, post, put, processing, errors, reset } = useForm({
    campus_id: item?.campus_id ?? activeCampusId,
    title: item?.title ?? '',
    message: item?.message ?? '',
    notification_type: item?.notification_type ?? 'App Push',
    target_audience: item?.target_audience ?? 'All',
    status: item?.status ?? 'Sent',
  });

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };
    if (isEdit) put(route('admin.communication-notifications.update', item.id), options);
    else post(route('admin.communication-notifications.store'), options);
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={e => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Notification' : 'Create New Notification'}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        <form onSubmit={submit} className="mm-form">
          <div className="mm-form-grid">

            <label style={{ gridColumn: '1 / -1' }}><span>Select Campus (Optional)</span>
              <select value={data.campus_id || ''} onChange={(e) => setData('campus_id', e.target.value)} disabled={!isSuperAdmin}>
                <option value="">Global / All Campuses</option>
                {campuses?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>

            <label style={{ gridColumn: '1 / -1' }}><span>Notification Title *</span>
              <input type="text" value={data.title} onChange={e => setData('title', e.target.value)} required autoFocus placeholder="e.g. School will remain closed tomorrow" />
            </label>

            <label><span>Notification Type *</span>
              <select value={data.notification_type} onChange={e => setData('notification_type', e.target.value)}>
                <option value="App Push">App Push Notification</option>
                <option value="System">System Noticeboard</option>
                <option value="Email">Email Blast</option>
                <option value="SMS">SMS Notice</option>
              </select>
            </label>

            <label><span>Target Audience *</span>
              <select value={data.target_audience} onChange={e => setData('target_audience', e.target.value)}>
                <option value="All">Everyone (All)</option>
                <option value="Students">Students Only</option>
                <option value="Teachers">Teachers / Staff Only</option>
                <option value="Parents">Parents Only</option>
              </select>
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Message / Notice Body *</span>
              <textarea rows="4" value={data.message} onChange={e => setData('message', e.target.value)} required placeholder="Type the detailed notice here..."></textarea>
            </label>

            <label style={{ gridColumn: '1 / -1' }}><span>Status *</span>
              <select value={data.status} onChange={e => setData('status', e.target.value)}>
                <option value="Sent">Send Now (Active)</option>
                <option value="Draft">Save as Draft</option>
              </select>
            </label>

          </div>
          <div className="mm-modal-foot mt-2">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>
              <Icon name={data.status === 'Sent' ? 'send' : 'save'} />
              {processing ? 'Processing...' : (data.status === 'Sent' ? (isEdit ? 'Update & Send' : 'Send Notification') : 'Save Draft')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
