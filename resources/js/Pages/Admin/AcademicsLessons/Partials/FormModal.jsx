import { useForm, router } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function FormModal({ item, classes, subjects, onClose }) {
  const isEdit = !!item;
  
  const { data, setData, post, processing, errors } = useForm({
    class_id: item?.class_id || '',
    subject_id: item?.subject_id || '',
    title: item?.title || '',
    description: item?.description || '',
    status: item?.status || 'Pending',
    attachment: null,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      router.post(route('admin.lesson-plans.update', item.id), {
        ...data,
        _method: 'PUT',
      }, {
        onSuccess: () => onClose(),
      });
    } else {
      post(route('admin.lesson-plans.store'), {
        onSuccess: () => onClose(),
      });
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] shadow-2xl overflow-hidden transform transition-all flex flex-col ring-1 ring-slate-900/5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Lesson Plan' : 'Add New Lesson Plan'}</h3>
            <p className="text-sm text-slate-500 mt-1">Configure class syllabus and lesson info.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-slate-100">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden" encType="multipart/form-data">
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              {/* Select Class */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select Class <span className="text-rose-500">*</span></label>
                <select 
                  value={data.class_id} 
                  onChange={(e) => setData('class_id', e.target.value)} 
                  className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                  required
                >
                  <option value="" disabled>-- ক্লাস সিলেক্ট করুন --</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errors.class_id && <p className="text-rose-500 text-xs mt-1">{errors.class_id}</p>}
              </div>

              {/* Select Subject */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select Subject <span className="text-rose-500">*</span></label>
                <select 
                  value={data.subject_id} 
                  onChange={(e) => setData('subject_id', e.target.value)} 
                  className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                  required
                >
                  <option value="" disabled>-- বিষয় সিলেক্ট করুন --</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                {errors.subject_id && <p className="text-rose-500 text-xs mt-1">{errors.subject_id}</p>}
              </div>

              {/* Title */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Lesson Title / Topic Name <span className="text-rose-500">*</span></label>
                <input 
                  value={data.title} 
                  onChange={(e) => setData('title', e.target.value)} 
                  placeholder="e.g. Chapter 1: Introduction" 
                  className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  required 
                />
                {errors.title && <p className="text-rose-500 text-xs mt-1">{errors.title}</p>}
              </div>

              {/* Description */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description / Notes</label>
                <textarea 
                  rows="3" 
                  value={data.description} 
                  onChange={(e) => setData('description', e.target.value)} 
                  placeholder="এই লেসনে কী কী পড়ানো হবে..." 
                  className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status <span className="text-rose-500">*</span></label>
                <select 
                  value={data.status} 
                  onChange={(e) => setData('status', e.target.value)} 
                  className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                  required
                >
                  <option value="Pending">Pending (পড়ানো বাকি)</option>
                  <option value="Ongoing">Ongoing (চলমান)</option>
                  <option value="Completed">Completed (শেষ হয়েছে)</option>
                </select>
              </div>

              {/* Attachment File */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Attach Syllabus File <span className="text-slate-400 font-normal">(Optional)</span></label>
                <input 
                  type="file" 
                  onChange={(e) => setData('attachment', e.target.files[0])} 
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all border border-slate-200 rounded-xl bg-slate-50 cursor-pointer" 
                  accept=".pdf,.doc,.docx,.jpg,.png" 
                />
                {errors.attachment && <p className="text-rose-500 text-xs mt-1">{errors.attachment}</p>}
              </div>

            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
            <button type="button" onClick={onClose} disabled={processing} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-800 rounded-xl transition-all shadow-sm">
              Cancel
            </button>
            <button type="submit" disabled={processing} className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95">
              {processing ? 'Saving...' : 'Save Lesson'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}