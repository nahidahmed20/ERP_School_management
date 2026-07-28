import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function StatusUpdateModal({ item, classes, onClose }) {
  const appliedClass = classes?.find(c => c.id === item.class_id);
  const sections = appliedClass?.sections || [];

  const { data, setData, put, processing, errors, reset } = useForm({
    status: item.status,
    section_id: '',
    notes: item.notes || '',
  });

  function submit(e) {
    e.preventDefault();
    put(route('admin.students.admissions.update', item.id), {
      onSuccess: () => {
        reset();
        onClose();
      }
    });
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>Update Application Status</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>

        <form onSubmit={submit} className="mm-form">
          <div className="mm-form-grid" style={{ gridTemplateColumns: '1fr' }}>
            
            <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', marginBottom: '10px' }}>
              <div style={{ fontSize: '13px', color: '#64748b' }}>Applicant:</div>
              <strong style={{ fontSize: '16px', color: '#0f172a' }}>{item.first_name} {item.last_name || ''}</strong>
              <div style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>
                Class: {appliedClass?.name} | Guardian: {item.guardian_name}
              </div>
            </div>

            <label>
              <span>Application Status *</span>
              <select 
                value={data.status} 
                onChange={(e) => setData('status', e.target.value)}
                style={{ 
                  border: data.status === 'Approved' ? '2px solid #16a34a' : data.status === 'Rejected' ? '2px solid #dc2626' : '1px solid #cbd5e1',
                  background: data.status === 'Approved' ? '#f0fdf4' : data.status === 'Rejected' ? '#fef2f2' : '#fff'
                }}
              >
                <option value="Pending">Pending (অপেক্ষমান)</option>
                <option value="Approved">Approved (ভর্তি নিশ্চিত করুন)</option>
                <option value="Rejected">Rejected (বাতিল করুন)</option>
              </select>
              {errors.status && <em>{errors.status}</em>}
            </label>

            {data.status === 'Approved' && (
              <label className="fade-in">
                <span>Assign Section <span style={{color: 'red'}}>*</span></span>
                <select value={data.section_id} onChange={(e) => setData('section_id', e.target.value)} required>
                  <option value="">-- সেকশন সিলেক্ট করুন --</option>
                  {sections.map(sec => (
                    <option key={sec.id} value={sec.id}>{sec.name}</option>
                  ))}
                </select>
                {errors.section_id && <em>{errors.section_id}</em>}
                <div style={{ fontSize: '12px', color: '#16a34a', marginTop: '6px', fontWeight: '500' }}>
                  <Icon name="check-circle" style={{fontSize: '12px'}}/> 
                  অ্যাপ্রুভ করলে স্বয়ংক্রিয়ভাবে স্টুডেন্ট এবং প্যারেন্ট অ্যাকাউন্ট তৈরি হয়ে যাবে।
                </div>
              </label>
            )}

            <label>
              <span>Admin Notes / Remarks</span>
              <textarea rows="3" value={data.notes} onChange={(e) => setData('notes', e.target.value)} placeholder="ভর্তি বাতিল বা এপ্রুভ করার কোনো নোট থাকলে লিখুন..." />
            </label>

          </div>

          <div className="mm-modal-foot mt-4">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={processing}>Cancel</button>
            <button type="submit" className="btn" disabled={processing} style={{ background: data.status === 'Approved' ? '#16a34a' : data.status === 'Rejected' ? '#dc2626' : '#0f172a' }}>
              {processing ? 'Processing...' : 'Confirm Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}