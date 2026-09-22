import { useForm, usePage } from '@inertiajs/react';
import WorkingCampusField from '@/Components/WorkingCampusField';
import Icon from '@/Components/Icons';

export default function IdCardFormModal({ item, campuses, activeCampusId, onClose }) {
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  // 🟢 FIX 1: _method যুক্ত করা হলো এবং ডিফল্ট campus_id সেট করা হলো
  const { data, setData, post, processing, errors, transform } = useForm({
    _method: item ? 'PUT' : 'POST', // 🟢 ফাইল আপলোডের জন্য PUT-কে POST দিয়ে বাইপাস করা হচ্ছে
    campus_id: item?.campus_id ?? auth?.active_campus_id ?? activeCampusId ?? '',
    title: item?.title ?? '',
    audience: item?.audience ?? 'student',
    layout_type: item?.layout_type ?? 'Portrait',
    design_template: item?.design_template ?? 'default',
    text_align: item?.text_align ?? 'left',
    photo_align: item?.photo_align ?? 'center',
    theme_color: item?.theme_color ?? '#1e293b',
    back_side_content: item?.back_side_content ?? 'If found, please return to the school administration.',
    show_blood_group: item?.show_blood_group ?? true,
    show_address: item?.show_address ?? false,
    show_phone: item?.show_phone ?? true,
    is_active: item?.is_active ?? true,
    logo_image: null,
    signature_image: null,
    background_image: null,
  });

  function submit(e) {
    e.preventDefault();

    transform((currentData) => ({
      ...currentData,
      campus_id: currentData.campus_id || auth?.active_campus_id || activeCampusId || ''
    }));

    // 🟢 FIX 2: আপডেট বা ক্রিয়েট— উভয়ের জন্যই post() ব্যবহার করতে হবে
    if (item) {
      post(route('admin.documents.idcards.update', item.id), { onSuccess: onClose });
    } else {
      post(route('admin.documents.idcards.store'), { onSuccess: onClose });
    }
  }

  const inputClass = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      
      <div 
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0 rounded-t-2xl">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{item ? 'Edit ID Card' : 'Create ID Card'}</h3>
            <p className="text-sm text-slate-500 mt-1">Quick configuration settings.</p>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm shrink-0">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={submit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
            <div className="grid grid-cols-1 gap-5">
              
              <div>
                <label className={labelClass}>Assign to Campus <span className="text-rose-500">*</span></label>
                <WorkingCampusField value={data.campus_id} campuses={campuses} className={`${inputClass} ${!isSuperAdmin ? 'bg-slate-100 opacity-70' : 'bg-white'}`} />
                {errors.campus_id && <p className="text-rose-500 text-xs mt-1">{errors.campus_id}</p>}
              </div>

              <div>
                <label className={labelClass}>Template Title <span className="text-rose-500">*</span></label>
                <input value={data.title} onChange={e => setData('title', e.target.value)} required placeholder="e.g. Standard ID Card" className={inputClass} />
                {errors.title && <p className="text-rose-500 text-xs mt-1">{errors.title}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Layout Type <span className="text-rose-500">*</span></label>
                  <select value={data.layout_type} onChange={e => setData('layout_type', e.target.value)} required className={`${inputClass} bg-white`}>
                    <option value="Portrait">Portrait (Vertical)</option>
                    <option value="Landscape">Landscape (Horizontal)</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Audience <span className="text-rose-500">*</span></label>
                  <select value={data.audience} onChange={e => setData('audience', e.target.value)} required className={`${inputClass} bg-white`}>
                    <option value="student">Student</option>
                    <option value="staff">Staff</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Theme Color <span className="text-rose-500">*</span></label>
                <div className="flex items-center gap-3">
                  <input type="color" value={data.theme_color} onChange={e => setData('theme_color', e.target.value)} className="w-12 h-10 p-0.5 rounded cursor-pointer border border-slate-300" />
                  <input type="text" value={data.theme_color} onChange={e => setData('theme_color', e.target.value)} className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Back Side Terms/Info</label>
                <textarea rows="3" value={data.back_side_content} onChange={e => setData('back_side_content', e.target.value)} placeholder="Terms and conditions..." className={`${inputClass} resize-none`}></textarea>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-center gap-3 cursor-pointer group w-max">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={data.is_active}
                      onChange={(e) => setData('is_active', e.target.checked)}
                      className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded focus:ring-0 checked:bg-indigo-600 checked:border-indigo-600 cursor-pointer transition-colors"
                    />
                    <svg className="absolute w-3.5 h-3.5 top-[3px] left-[3px] text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">Active Template</span>
                </label>
              </div>

            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 shrink-0 rounded-b-2xl">
            <button type="button" onClick={onClose} disabled={processing} className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm">
              Cancel
            </button>
            <button type="submit" disabled={processing} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 active:scale-95">
              <Icon name="save" className="w-4 h-4" />
              {processing ? 'Saving...' : 'Save Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
