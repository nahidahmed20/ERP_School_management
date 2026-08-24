import { useForm, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function CertificateFormModal({ templates, users, campuses, activeCampusId, onClose }) {
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  const { data, setData, post, processing, errors, reset } = useForm({
    campus_id: activeCampusId,
    certificate_template_id: '',
    user_id: '',
    issue_date: new Date().toISOString().split('T')[0],
  });

  function submit(e) {
    e.preventDefault();
    post(route('admin.documents.certificates.store'), {
      onSuccess: () => {
        reset();
        onClose();
      }
    });
  }

  // Selected Template Details
  const selectedTemplate = templates.find(t => t.id == data.certificate_template_id);

  const inputClass = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    // Responsive Overlay
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      
      {/* Responsive Modal Box */}
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0 rounded-t-2xl">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Issue New Certificate</h3>
            <p className="text-sm text-slate-500 mt-1">Select a student and template to generate.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm shrink-0">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={submit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
            
            <div className="grid grid-cols-1 gap-5">
              
              {/* Campus Selection */}
              <div>
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

              {/* Certificate Template Selection */}
              <div>
                <label className={labelClass}>Select Certificate Template <span className="text-rose-500">*</span></label>
                <select
                  value={data.certificate_template_id}
                  onChange={e => setData('certificate_template_id', e.target.value)}
                  required
                  className={`${inputClass} bg-white`}
                >
                  <option value="" disabled>-- Select Template Type --</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.template_type})
                    </option>
                  ))}
                </select>
                {errors.certificate_template_id && <p className="text-rose-500 text-xs mt-1">{errors.certificate_template_id}</p>}
              </div>

              {/* Student Selection */}
              <div>
                <label className={labelClass}>Select Student <span className="text-rose-500">*</span></label>
                <select
                  value={data.user_id}
                  onChange={e => setData('user_id', e.target.value)}
                  required
                  className={`${inputClass} bg-white`}
                >
                  <option value="" disabled>-- Search or Select Student --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
                {errors.user_id && <p className="text-rose-500 text-xs mt-1">{errors.user_id}</p>}
              </div>

              {/* Issue Date */}
              <div>
                <label className={labelClass}>Issue Date <span className="text-rose-500">*</span></label>
                <input
                  type="date"
                  value={data.issue_date}
                  onChange={e => setData('issue_date', e.target.value)}
                  required
                  className={`${inputClass} font-mono`}
                />
                {errors.issue_date && <p className="text-rose-500 text-xs mt-1">{errors.issue_date}</p>}
              </div>

              {/* Live Notice / Info Box */}
              {selectedTemplate && (
                <div className="bg-indigo-50/60 border border-indigo-100 p-4 rounded-xl flex items-start gap-3">
                  <Icon name="info" className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-xs font-bold text-indigo-700 uppercase tracking-wider block mb-1">Selected Template Note:</strong>
                    <span className="text-sm font-medium text-slate-700 leading-relaxed">
                      {selectedTemplate.content_body.substring(0, 150)}{selectedTemplate.content_body.length > 150 ? '...' : ''}
                    </span>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 shrink-0 rounded-b-2xl">
            <button type="button" onClick={onClose} disabled={processing} className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-800 rounded-xl transition-all shadow-sm">
              Cancel
            </button>
            <button type="submit" disabled={processing} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 active:scale-95">
              <Icon name="check-circle" className="w-4 h-4" />
              {processing ? 'Generating...' : 'Generate & Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}