import { useForm, router } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function FormModal({ item, onClose }) {
  const isEdit = !!item;

  const { data, setData, post, processing, errors, reset } = useForm({
    type: item?.type || 'Receive',
    reference_no: item?.reference_no || '',
    title: item?.title || '',
    address: item?.address || '',
    date: item?.date || new Date().toISOString().split('T')[0],
    note: item?.note || '',
    attachment: null,
    _method: isEdit ? 'PUT' : 'POST'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const routeName = isEdit ? route('admin.frontoffice.postal.update', item.id) : route('admin.frontoffice.postal.store');

    post(routeName, {
      forceFormData: true,
      onSuccess: () => { reset(); onClose(); },
    });
  };

  const inputClass = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    // Responsive Overlay
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>

      {/* Responsive Modal Box */}
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Postal Record' : 'Add Postal Record'}</h3>
            <p className="text-sm text-slate-500 mt-1">Log details of received or dispatched documents.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm shrink-0">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden" encType="multipart/form-data">
          <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              <div>
                <label className={labelClass}>Type <span className="text-rose-500">*</span></label>
                <select value={data.type} onChange={(e) => setData('type', e.target.value)} required className={inputClass}>
                  <option value="Receive">Receive (চিঠি এসেছে)</option>
                  <option value="Dispatch">Dispatch (চিঠি পাঠানো হয়েছে)</option>
                </select>
                {errors.type && <p className="text-rose-500 text-xs mt-1">{errors.type}</p>}
              </div>

              <div>
                <label className={labelClass}>Reference / Tracking No</label>
                <input
                  value={data.reference_no}
                  onChange={(e) => setData('reference_no', e.target.value)}
                  placeholder="e.g. TRK123456"
                  className={`${inputClass} font-mono`}
                />
                {errors.reference_no && <p className="text-rose-500 text-xs mt-1">{errors.reference_no}</p>}
              </div>

              <div>
                <label className={labelClass}>Title / To / From <span className="text-rose-500">*</span></label>
                <input
                  value={data.title}
                  onChange={(e) => setData('title', e.target.value)}
                  placeholder="কার কাছ থেকে এসেছে / কাকে পাঠানো হচ্ছে"
                  className={inputClass}
                  required
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
                {errors.date && <p className="text-rose-500 text-xs mt-1">{errors.date}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Address</label>
                <textarea
                  rows="2"
                  value={data.address}
                  onChange={(e) => setData('address', e.target.value)}
                  placeholder="ঠিকানা..."
                  className={`${inputClass} resize-none`}
                />
                {errors.address && <p className="text-rose-500 text-xs mt-1">{errors.address}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Note / Description</label>
                <textarea
                  rows="2"
                  value={data.note}
                  onChange={(e) => setData('note', e.target.value)}
                  placeholder="বিস্তারিত..."
                  className={`${inputClass} resize-none`}
                />
                {errors.note && <p className="text-rose-500 text-xs mt-1">{errors.note}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Attachment (File/Image)</label>
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 hover:border-indigo-400 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Icon name="upload" className="w-6 h-6 text-slate-400 mb-1" />
                    <p className="text-sm text-slate-500 font-semibold mt-1 px-4 text-center">
                      {data.attachment ? data.attachment.name : 'Click to select or drag and drop'}
                    </p>
                  </div>
                  <input type="file" onChange={(e) => setData('attachment', e.target.files[0])} accept=".pdf,.jpg,.jpeg,.png" className="hidden" />
                </label>
                {isEdit && !data.attachment && (
                  <p className="text-xs text-slate-500 mt-1.5 italic">Leave empty to keep the current attachment.</p>
                )}
                {errors.attachment && <p className="text-rose-500 text-xs mt-1">{errors.attachment}</p>}
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
            <button type="button" onClick={onClose} disabled={processing} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm">
              Cancel
            </button>
            <button type="submit" disabled={processing} className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 active:scale-95">
              <Icon name="save" className="w-4 h-4" />
              {processing ? 'Saving...' : 'Save Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
