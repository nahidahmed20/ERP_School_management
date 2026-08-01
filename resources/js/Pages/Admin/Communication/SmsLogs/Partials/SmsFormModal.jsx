import { useForm, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function SmsFormModal({ campuses, activeCampusId, onClose }) {
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin';

  const { data, setData, post, processing, errors, reset } = useForm({
    campus_id: activeCampusId,
    recipient_name: '',
    phone_number: '',
    message: '',
  });

  function submit(e) {
    e.preventDefault();
    post(route('admin.sms-logs.store'), {
      onSuccess: () => { reset(); onClose(); }
    });
  }

  // Calculate SMS parts (standard GSM is 160 chars per SMS)
  const smsLength = data.message.length;
  const smsParts = Math.ceil(smsLength / 160) || 1;

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={e => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>Send Custom SMS</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        <form onSubmit={submit} className="mm-form">
          <div className="mm-form-grid">

            <label style={{ gridColumn: '1 / -1' }}><span>Campus (Optional)</span>
              <select value={data.campus_id || ''} onChange={(e) => setData('campus_id', e.target.value)} disabled={!isSuperAdmin}>
                <option value="">Global / No Specific Campus</option>
                {campuses?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>

            <label><span>Recipient Name (Optional)</span>
              <input value={data.recipient_name} onChange={e => setData('recipient_name', e.target.value)} placeholder="e.g. John Doe" />
            </label>

            <label><span>Phone Number *</span>
              <input type="text" value={data.phone_number} onChange={e => setData('phone_number', e.target.value)} required placeholder="e.g. 017XXXXXXXX" autoFocus />
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Message Body *</span>
                <span style={{ fontSize: '11px', color: smsLength > 160 ? '#b91c1c' : '#64748b' }}>
                  Chars: {smsLength} | Parts: {smsParts}
                </span>
              </div>
              <textarea
                rows="4"
                value={data.message}
                onChange={e => setData('message', e.target.value)}
                required
                placeholder="Type your message here..."
              ></textarea>
            </label>

          </div>
          <div className="mm-modal-foot mt-2">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>
              <Icon name="send" /> {processing ? 'Sending...' : 'Send SMS'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
