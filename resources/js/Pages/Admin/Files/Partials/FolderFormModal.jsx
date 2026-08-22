import { useForm, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function FolderFormModal({ folders, campuses, activeCampusId, onClose }) {
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    parent_id: '',
    campus_id: activeCampusId || '',
  });

  const submit = (e) => {
    e.preventDefault();
    post(route('admin.files.folder.store'), {
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
            <h3 className="text-xl font-bold text-slate-900">Create New Folder</h3>
            <p className="text-sm text-slate-500 mt-1">Organize your files efficiently.</p>
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

            {/* Folder Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Folder Name <span className="text-rose-500">*</span></label>
              <input
                type="text"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                placeholder="e.g. Documents"
                autoFocus
                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
              {errors.name && <p className="text-rose-500 text-xs font-medium mt-1">{errors.name}</p>}
            </div>

            {/* Parent Folder */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Parent Folder</label>
              <select
                value={data.parent_id}
                onChange={(e) => setData('parent_id', e.target.value)}
                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
              >
                <option value="">Root Directory</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
              {errors.parent_id && <p className="text-rose-500 text-xs font-medium mt-1">{errors.parent_id}</p>}
            </div>

          </div>

          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} disabled={processing} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-800 rounded-xl transition-all shadow-sm">
              Cancel
            </button>
            <button type="submit" disabled={processing} className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 disabled:cursor-not-allowed">
              {processing ? 'Creating...' : 'Create Folder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}