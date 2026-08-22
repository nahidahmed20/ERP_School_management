import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function AdmissionFormModal({ classes, onClose }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    class_id: '',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: 'male',
    previous_school: '',
    guardian_name: '',
    phone: '',
    email: '',
    address: '',
    application_date: new Date().toISOString().split('T')[0],
  });

  function submit(e) {
    e.preventDefault();
    post(route('admin.students.admissions.store'), {
      onSuccess: () => {
        reset();
        onClose();
      }
    });
  }

  return (
    <div 
      className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] shadow-2xl overflow-hidden transform transition-all flex flex-col ring-1 ring-slate-900/5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-900">New Admission Application</h3>
            <p className="text-sm text-slate-500 mt-1">Fill in the details to register a new student application.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-slate-100">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={submit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-8 flex-1">
            
            {/* Section: Academic Info */}
            <section>
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                <Icon name="book" className="w-4 h-4 text-indigo-500" /> Academic Info
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Apply For Class <span className="text-rose-500">*</span></label>
                  <select 
                    value={data.class_id} 
                    onChange={(e) => setData('class_id', e.target.value)} 
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                    required
                  >
                    <option value="" disabled>-- সিলেক্ট ক্লাস --</option>
                    {classes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  {errors.class_id && <p className="text-rose-500 text-xs font-medium mt-1">{errors.class_id}</p>}
                </div>
              </div>
            </section>

            {/* Section: Student Info */}
            <section>
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                <Icon name="users" className="w-4 h-4 text-indigo-500" /> Student Info
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">First Name <span className="text-rose-500">*</span></label>
                  <input 
                    value={data.first_name} 
                    onChange={(e) => setData('first_name', e.target.value)} 
                    placeholder="e.g. John"
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    required 
                  />
                  {errors.first_name && <p className="text-rose-500 text-xs font-medium mt-1">{errors.first_name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Last Name</label>
                  <input 
                    value={data.last_name} 
                    onChange={(e) => setData('last_name', e.target.value)} 
                    placeholder="e.g. Doe"
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date of Birth <span className="text-rose-500">*</span></label>
                  <input 
                    type="date" 
                    value={data.date_of_birth} 
                    onChange={(e) => setData('date_of_birth', e.target.value)} 
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    required 
                  />
                  {errors.date_of_birth && <p className="text-rose-500 text-xs font-medium mt-1">{errors.date_of_birth}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Gender <span className="text-rose-500">*</span></label>
                  <select 
                    value={data.gender} 
                    onChange={(e) => setData('gender', e.target.value)} 
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                    required
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Previous School <span className="text-slate-400 font-normal">(Optional)</span></label>
                  <input 
                    value={data.previous_school} 
                    onChange={(e) => setData('previous_school', e.target.value)} 
                    placeholder="স্টুডেন্ট আগে কোন স্কুলে পড়তো?"
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>
            </section>

            {/* Section: Guardian Info */}
            <section>
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                <Icon name="users" className="w-4 h-4 text-indigo-500" /> Guardian Info
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Guardian Name <span className="text-rose-500">*</span></label>
                  <input 
                    value={data.guardian_name} 
                    onChange={(e) => setData('guardian_name', e.target.value)} 
                    placeholder="e.g. Richard Doe"
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    required 
                  />
                  {errors.guardian_name && <p className="text-rose-500 text-xs font-medium mt-1">{errors.guardian_name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number <span className="text-rose-500">*</span></label>
                  <input 
                    value={data.phone} 
                    onChange={(e) => setData('phone', e.target.value)} 
                    placeholder="01XXXXXXXXX"
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    required 
                  />
                  {errors.phone && <p className="text-rose-500 text-xs font-medium mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address <span className="text-slate-400 font-normal">(Optional)</span></label>
                  <input 
                    type="email" 
                    value={data.email} 
                    onChange={(e) => setData('email', e.target.value)} 
                    placeholder="info@example.com"
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Application Date <span className="text-rose-500">*</span></label>
                  <input 
                    type="date" 
                    value={data.application_date} 
                    onChange={(e) => setData('application_date', e.target.value)} 
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    required 
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Current Address</label>
                  <textarea 
                    rows="2" 
                    value={data.address} 
                    onChange={(e) => setData('address', e.target.value)} 
                    placeholder="বর্তমান ঠিকানা..."
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                  />
                </div>
              </div>
            </section>

          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
            <button type="button" onClick={onClose} disabled={processing} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-800 rounded-xl transition-all shadow-sm">
              Cancel
            </button>
            <button type="submit" disabled={processing} className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95">
              {processing ? 'Saving...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}