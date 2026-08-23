import { useForm, router } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function FormModal({ item, onClose }) {
  const isEdit = !!item;

  const { data, setData, post, processing, errors, reset } = useForm({
    name: item?.name || '',
    passing_year: item?.passing_year || '',
    phone: item?.phone || '',
    email: item?.email || '',
    current_profession: item?.current_profession || '',
    organization: item?.organization || '',
    address: item?.address || '',
    photo: null,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      router.post(route('admin.alumni.directory.update', item.id), {
        ...data,
        _method: 'PUT',
      }, {
        onSuccess: () => { reset(); onClose(); },
      });
    } else {
      post(route('admin.alumni.directory.store'), {
        onSuccess: () => { reset(); onClose(); },
      });
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 35 }, (_, i) => currentYear - i);

  const inputClass = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div 
        className="mm-modal" 
        onClick={(e) => e.stopPropagation()}
        style={{ padding: 0, overflow: 'hidden', maxWidth: '800px', width: '100%' }}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Alumni Record' : 'Add New Alumni'}</h3>
            <p className="text-sm text-slate-500 mt-1">Configure profile and professional details.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col max-h-[80vh]" encType="multipart/form-data">
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              <div>
                <label className={labelClass}>Full Name <span className="text-rose-500">*</span></label>
                <input 
                  value={data.name} 
                  onChange={(e) => setData('name', e.target.value)} 
                  placeholder="শিক্ষার্থীর নাম" 
                  className={inputClass} 
                  required 
                  autoFocus
                />
                {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className={labelClass}>Passing Year <span className="text-rose-500">*</span></label>
                <select value={data.passing_year} onChange={(e) => setData('passing_year', e.target.value)} required className={`${inputClass} font-mono`}>
                  <option value="">-- পাসের বছর --</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                {errors.passing_year && <p className="text-rose-500 text-xs mt-1">{errors.passing_year}</p>}
              </div>

              <div>
                <label className={labelClass}>Phone Number <span className="text-rose-500">*</span></label>
                <input 
                  value={data.phone} 
                  onChange={(e) => setData('phone', e.target.value)} 
                  placeholder="01XXXXXXXXX" 
                  className={`${inputClass} font-mono`} 
                  required 
                />
                {errors.phone && <p className="text-rose-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className={labelClass}>Email Address</label>
                <input 
                  type="email" 
                  value={data.email} 
                  onChange={(e) => setData('email', e.target.value)} 
                  placeholder="example@email.com" 
                  className={inputClass} 
                />
                {errors.email && <p className="text-rose-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className={labelClass}>Current Profession</label>
                <input 
                  value={data.current_profession} 
                  onChange={(e) => setData('current_profession', e.target.value)} 
                  placeholder="e.g. Software Engineer" 
                  className={inputClass} 
                />
              </div>

              <div>
                <label className={labelClass}>Organization / Company</label>
                <input 
                  value={data.organization} 
                  onChange={(e) => setData('organization', e.target.value)} 
                  placeholder="e.g. Google / Govt. Service" 
                  className={inputClass} 
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Current Address</label>
                <textarea 
                  rows="2" 
                  value={data.address} 
                  onChange={(e) => setData('address', e.target.value)} 
                  placeholder="বর্তমান ঠিকানা..." 
                  className={`${inputClass} resize-none`} 
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Upload Photo <span className="text-slate-400 font-normal">(Optional)</span></label>
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 hover:border-indigo-400 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Icon name="upload" className="w-6 h-6 text-slate-400 mb-1" />
                    <p className="text-sm text-slate-500 font-semibold">{data.photo ? data.photo.name : 'Click to select image or drag and drop'}</p>
                  </div>
                  <input type="file" onChange={(e) => setData('photo', e.target.files[0])} accept=".jpg,.jpeg,.png" className="hidden" />
                </label>
                {isEdit && !data.photo && (
                  <p className="text-xs text-slate-500 mt-1.5 italic">Leave empty to keep the current photo.</p>
                )}
                {errors.photo && <p className="text-rose-500 text-xs mt-1">{errors.photo}</p>}
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0 rounded-b-2xl">
            <button type="button" onClick={onClose} disabled={processing} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm">
              Cancel
            </button>
            <button type="submit" disabled={processing} className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 active:scale-95">
              <Icon name="save" className="w-4 h-4" />
              {processing ? 'Saving...' : 'Save Alumni Info'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}