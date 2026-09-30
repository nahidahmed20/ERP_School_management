import { useForm, usePage } from '@inertiajs/react';
import WorkingCampusField from '@/Components/WorkingCampusField';
import Icon from '@/Components/Icons';
import { CARD_TEMPLATES } from './idCardTemplates'; 

export default function IdCardFormModal({ item, campuses, activeCampusId, onClose }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  const { data, setData, post, processing, errors, transform } = useForm({
    _method: isEdit ? 'PUT' : 'POST',
    campus_id: item?.campus_id ?? auth?.active_campus_id ?? activeCampusId ?? '',
    title: item?.title ?? '',
    audience: item?.audience ?? 'student',
    layout_type: item?.layout_type ?? 'Portrait',
    design_template: item?.design_template ?? 'classic-solid',
    text_align: item?.text_align ?? 'center',
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

    if (isEdit) {
      post(route('admin.documents.idcards.update', item.id), { onSuccess: onClose });
    } else {
      post(route('admin.documents.idcards.store'), { onSuccess: onClose });
    }
  }

  const inputClass = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0 rounded-t-2xl">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit ID Card Template' : 'Create ID Card Template'}</h3>
            <p className="text-sm text-slate-500 mt-1">Configure ID Card layouts and designs.</p>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 bg-white border shadow-sm">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={submit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
            
            {/* Campus & Title */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Assign to Campus <span className="text-rose-500">*</span></label>
                <WorkingCampusField value={data.campus_id} campuses={campuses} className={`${inputClass} ${!isSuperAdmin ? 'bg-slate-100 opacity-70' : 'bg-white'}`} />
                {errors.campus_id && <p className="text-rose-500 text-xs mt-1">{errors.campus_id}</p>}
              </div>
              <div>
                <label className={labelClass}>Template Title <span className="text-rose-500">*</span></label>
                <input value={data.title} onChange={e => setData('title', e.target.value)} required placeholder="e.g. Student ID Card" className={inputClass} />
                {errors.title && <p className="text-rose-500 text-xs mt-1">{errors.title}</p>}
              </div>
            </div>

            {/* Layout & Design */}
            <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Select Design <span className="text-rose-500">*</span></label>
                <select value={data.design_template} onChange={e => setData('design_template', e.target.value)} className={`${inputClass} bg-white font-bold text-indigo-700`}>
                  {CARD_TEMPLATES.map(t => (
                    <option key={t.key} value={t.key}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Layout Setup</label>
                <select value={data.layout_type} onChange={e => setData('layout_type', e.target.value)} className={`${inputClass} bg-white`}>
                  <option value="Portrait">Portrait (Vertical)</option>
                  <option value="Landscape">Landscape (Horizontal)</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Theme Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={data.theme_color} onChange={e => setData('theme_color', e.target.value)} className="w-10 h-10 p-0.5 rounded cursor-pointer border" />
                  <input type="text" value={data.theme_color} onChange={e => setData('theme_color', e.target.value)} className={inputClass} />
                </div>
              </div>
            </div>

            {/* Alignments & Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className={labelClass}>Audience</label>
                <select value={data.audience} onChange={e => setData('audience', e.target.value)} className={`${inputClass} bg-white`}>
                  <option value="student">Student Only</option>
                  <option value="staff">Staff Only</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Text Alignment</label>
                <select value={data.text_align} onChange={e => setData('text_align', e.target.value)} className={`${inputClass} bg-white`}>
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Photo Alignment</label>
                <select value={data.photo_align} onChange={e => setData('photo_align', e.target.value)} className={`${inputClass} bg-white`}>
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </div>

            <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl">
              <strong className="text-xs font-bold text-slate-800 block border-b border-slate-200 pb-2 mb-3">Toggle Display Fields</strong>
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={data.show_blood_group} onChange={e => setData('show_blood_group', e.target.checked)} className="rounded text-indigo-600" /> Blood Group</label>
                <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={data.show_phone} onChange={e => setData('show_phone', e.target.checked)} className="rounded text-indigo-600" /> Phone Number</label>
                <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={data.show_address} onChange={e => setData('show_address', e.target.checked)} className="rounded text-indigo-600" /> Address</label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
               <div>
                  <label className={labelClass}>Upload Logo (Optional)</label>
                  <input type="file" accept="image/*" onChange={e => setData('logo_image', e.target.files[0])} className="block w-full text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-indigo-50 file:text-indigo-700 cursor-pointer border rounded-xl bg-slate-50" />
               </div>
               <div>
                  <label className={labelClass}>Authorized Signature</label>
                  <input type="file" accept="image/*" onChange={e => setData('signature_image', e.target.files[0])} className="block w-full text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-indigo-50 file:text-indigo-700 cursor-pointer border rounded-xl bg-slate-50" />
               </div>
            </div>

            <div>
              <label className={labelClass}>Back Side Content</label>
              <textarea rows="3" value={data.back_side_content} onChange={e => setData('back_side_content', e.target.value)} className={`${inputClass} resize-none`}></textarea>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer w-max">
                <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500" />
                <span className="text-sm font-bold text-slate-700">Active Template</span>
              </label>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0 rounded-b-2xl">
            <button type="button" onClick={onClose} disabled={processing} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm">
              Cancel
            </button>
            <button type="submit" disabled={processing} className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all disabled:opacity-70 active:scale-95">
              {processing ? 'Saving...' : <><Icon name="save" className="w-4 h-4" /> Save Template</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}