import { useForm, router } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function FormModal({ item, onClose }) {
  const isEdit = !!item;

  const { data, setData, post, processing, errors, reset } = useForm({
    title: item?.title || '',
    date: item?.date || '',
    time: item?.time || '',
    location: item?.location || '',
    status: item?.status || 'Upcoming',
    description: item?.description || '',
    cover_photo: null,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      router.post(route('admin.alumni.events.update', item.id), {
        ...data,
        _method: 'PUT',
      }, {
        onSuccess: () => { reset(); onClose(); },
      });
    } else {
      post(route('admin.alumni.events.store'), {
        onSuccess: () => { reset(); onClose(); },
      });
    }
  };

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
            <h3 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Event' : 'Create New Event'}</h3>
            <p className="text-sm text-slate-500 mt-1">Configure alumni event and reunion details.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col max-h-[80vh]" encType="multipart/form-data">
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              <div className="sm:col-span-2">
                <label className={labelClass}>Event Title <span className="text-rose-500">*</span></label>
                <input 
                  value={data.title} 
                  onChange={(e) => setData('title', e.target.value)} 
                  placeholder="e.g. Grand Reunion 2026" 
                  className={inputClass} 
                  required 
                  autoFocus
                />
                {errors.title && <p className="text-rose-500 text-xs mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className={labelClass}>Date <span className="text-rose-500">*</span></label>
                <input 
                  type="date" 
                  value={data.date} 
                  onChange={(e) => setData('date', e.target.value)} 
                  className={`${inputClass} font-mono`} 
                  required 
                />
              </div>

              <div>
                <label className={labelClass}>Time <span className="text-rose-500">*</span></label>
                <input 
                  type="time" 
                  value={data.time} 
                  onChange={(e) => setData('time', e.target.value)} 
                  className={`${inputClass} font-mono`} 
                  required 
                />
              </div>

              <div>
                <label className={labelClass}>Location / Venue</label>
                <input 
                  value={data.location} 
                  onChange={(e) => setData('location', e.target.value)} 
                  placeholder="e.g. School Auditorium" 
                  className={inputClass} 
                />
              </div>

              <div>
                <label className={labelClass}>Status <span className="text-rose-500">*</span></label>
                <select value={data.status} onChange={(e) => setData('status', e.target.value)} required className={inputClass}>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Event Description</label>
                <textarea 
                  rows="3" 
                  value={data.description} 
                  onChange={(e) => setData('description', e.target.value)} 
                  placeholder="ইভেন্টের বিস্তারিত তথ্য..." 
                  className={`${inputClass} resize-none`} 
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Cover Photo / Banner <span className="text-slate-400 font-normal">(Optional)</span></label>
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 hover:border-indigo-400 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Icon name="upload" className="w-6 h-6 text-slate-400 mb-1" />
                    <p className="text-sm text-slate-500 font-semibold">{data.cover_photo ? data.cover_photo.name : 'Click to select image or drag and drop'}</p>
                  </div>
                  <input type="file" onChange={(e) => setData('cover_photo', e.target.files[0])} accept=".jpg,.jpeg,.png" className="hidden" />
                </label>
                {isEdit && !data.cover_photo && (
                  <p className="text-xs text-slate-500 mt-1.5 italic">Leave empty to keep the current banner.</p>
                )}
                {errors.cover_photo && <p className="text-rose-500 text-xs mt-1">{errors.cover_photo}</p>}
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
              {processing ? 'Saving...' : 'Save Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}