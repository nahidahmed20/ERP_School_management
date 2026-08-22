import { useForm, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function UploadFormModal({ folders, campuses, activeCampusId, onClose }) {
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  const { data, setData, post, processing, errors, reset } = useForm({
    file: null,
    folder_id: '',
    campus_id: activeCampusId || '', 
  });

  const submit = (e) => {
    e.preventDefault();
    post(route('admin.files.store'), { 
      forceFormData: true, // Required for File Uploads via multipart/form-data
      onSuccess: () => { reset(); onClose(); },
    });
  };

  return (
    <div 
      className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all flex flex-col ring-1 ring-slate-900/5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Upload File</h3>
            <p className="text-sm text-slate-500 mt-1">Add a new file to your system.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-slate-100">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={submit}>
          <div className="p-6 bg-white space-y-4">
            
            {/* Campus Select */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Assign to Campus</label>
              <select 
                value={data.campus_id} 
                onChange={(e) => setData('campus_id', e.target.value)}
                disabled={!isSuperAdmin}
                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="" disabled>Select Campus</option>
                {campuses?.map(campus => (
                  <option key={campus.id} value={campus.id}>{campus.name}</option>
                ))}
              </select>
              {errors.campus_id && <p className="text-rose-500 text-xs font-medium mt-1">{errors.campus_id}</p>}
            </div>

            {/* Folder Select */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Destination Folder</label>
              <select
                value={data.folder_id}
                onChange={(e) => setData('folder_id', e.target.value)}
                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
              >
                <option value="">No Folder (Root Directory)</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
              {errors.folder_id && <p className="text-rose-500 text-xs font-medium mt-1">{errors.folder_id}</p>}
            </div>

            {/* File Input (Modern Tailwind Custom Design) */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select File <span className="text-rose-500">*</span></label>
              <div className="relative">
                <input
                  type="file"
                  onChange={(e) => setData('file', e.target.files[0])}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all border border-slate-200 rounded-xl bg-slate-50 cursor-pointer"
                />
              </div>
              {errors.file && <p className="text-rose-500 text-xs font-medium mt-1.5">{errors.file}</p>}
            </div>

          </div>

          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} disabled={processing} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-800 rounded-xl transition-all shadow-sm">
              Cancel
            </button>
            <button type="submit" disabled={processing || !data.file} className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 disabled:cursor-not-allowed">
              {processing ? 'Uploading...' : 'Upload File'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}