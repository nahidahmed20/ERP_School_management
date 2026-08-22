import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import Swal from 'sweetalert2';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import UploadFormModal from './Partials/UploadFormModal';
import FolderFormModal from './Partials/FolderFormModal';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Pagination from '@/Components/Pagination';

export default function Index({ files, folders, campuses, filters }) {
  const { flash, errors, auth } = usePage().props;

  const [search, setSearch] = useState(filters.search ?? '');
  const [folderId, setFolderId] = useState(filters.folder_id ?? '');
  const [type, setType] = useState(filters.type ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '10');

  const [uploadOpen, setUploadOpen] = useState(false);
  const [folderFormOpen, setFolderFormOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);

  function applyFilters(overrides = {}) {
    router.get(route('admin.files.index'), {
      search, folder_id: folderId, type, per_page: perPage, ...overrides,
    }, { preserveState: true, replace: true });
  }

  function confirmDelete() {
    router.delete(route('admin.files.destroy', deletingItem.id), {
      onSuccess: () => setDeletingItem(null),
    });
  }

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000, timerProgressBar: true });
    }
    if (flash?.error) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: flash.error, showConfirmButton: false, timer: 4000 });
    }
    if (errors && Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: firstError, showConfirmButton: false, timer: 4000 });
    }
  }, [flash, errors]);

  function viewFile(item) {
    const isImage = item.mime_type?.startsWith('image');

    Swal.fire({
      title: `<span style="font-size: 18px; color: #0f172a; font-weight: 700;">${item.original_name}</span>`,
      html: `
        ${isImage ? `<img src="${item.url}" style="max-width:100%; max-height:280px; border-radius:12px; margin-bottom:16px; object-fit:contain; border: 1px solid #e2e8f0;" />` : ''}
        <div style="text-align:left; font-size:14px; line-height:1.8; color: #475569; background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #f1f5f9;">
          <b style="color: #1e293b;">Type:</b> ${item.mime_type ?? '—'}<br/>
          <b style="color: #1e293b;">Size:</b> <span style="color: #ef4444; font-weight: 600;">${item.human_size ?? item.size}</span><br/>
          <b style="color: #1e293b;">Folder:</b> ${item.folder?.name ?? '—'}<br/>
          <b style="color: #1e293b;">Uploaded By:</b> ${item.uploader?.name ?? '—'}<br/>
          <b style="color: #1e293b;">Uploaded At:</b> ${item.created_at}<br/>
          <b style="color: #1e293b;">URL:</b> <a href="${item.url}" target="_blank" rel="noreferrer" style="color:#4f46e5; text-decoration: underline; word-break:break-all;">Click to open link</a>
        </div>
      `,
      confirmButtonText: 'Close',
      confirmButtonColor: '#4f46e5',
      width: 480,
      customClass: { popup: 'rounded-2xl' }
    });
  }

  return (
    <AuthenticatedLayout>
      <Head title="File Manager" />

      <div className="w-full space-y-6 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">Settings & Registry</span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">File Manager</h1>
            <p className="text-sm text-slate-500 mt-1">সিস্টেমের সব আপলোডকৃত ফাইল ও ফোল্ডার এখান থেকে নিয়ন্ত্রণ করুন।</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={() => setFolderFormOpen(true)}
              className="flex-1 sm:flex-none inline-flex justify-center items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm active:scale-95"
            >
              <Icon name="folder" className="w-4 h-4 text-indigo-500" /> New Folder
            </button>
            <button
              onClick={() => setUploadOpen(true)}
              className="flex-1 sm:flex-none inline-flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-500/20 active:scale-95"
            >
              <Icon name="plus" className="w-4 h-4" /> Upload File
            </button>
          </div>
        </div>

        {/* Unified Modern Toolbar */}
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex flex-col lg:flex-row items-center justify-between gap-4">
          
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            
            {/* Per Page */}
            <select
              value={perPage}
              onChange={e => { setPerPage(e.target.value); applyFilters({ per_page: e.target.value }); }}
              className="appearance-none bg-none pr-3 py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer text-center"
              style={{ backgroundImage: 'none' }}
            >
              <option value="10">10 / Page</option>
              <option value="20">20 / Page</option>
              <option value="50">50 / Page</option>
              <option value="all">All</option>
            </select>

            <div className="hidden sm:block w-px h-6 bg-slate-200"></div>

            {/* Folder Select */}
            <select 
              value={folderId} 
              onChange={(e) => { setFolderId(e.target.value); applyFilters({ folder_id: e.target.value }); }}
              className="w-full sm:w-40 py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
            >
              <option value="">All Folders</option>
              {folders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>

            {/* Type Select */}
            <select 
              value={type} 
              onChange={(e) => { setType(e.target.value); applyFilters({ type: e.target.value }); }}
              className="w-full sm:w-36 py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
            >
              <option value="">All Types</option>
              <option value="image">Images</option>
              <option value="application">Documents</option>
              <option value="video">Video</option>
            </select>

            {/* Search Input */}
            <div className="relative w-full sm:w-56 lg:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="search" className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search by file name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                className="block w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            {/* Apply Button */}
            <button
              onClick={() => applyFilters()}
              className="w-full sm:w-auto px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              Filter
            </button>
          </div>
        </div>

        {/* Main Table Card */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">File Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Folder</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Uploaded By</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {files.data.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      কোনো ফাইল পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  files.data.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                            <Icon name="file" className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-bold text-slate-900 truncate max-w-[200px]" title={item.original_name}>
                            {item.original_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {item.folder?.name ?? <span className="text-slate-400">Root</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide uppercase bg-slate-100 text-slate-600 border border-slate-200">
                          {item.mime_type ? item.mime_type.split('/')[1] || item.mime_type : 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                        {item.human_size ?? item.size}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {item.uploader?.name ?? '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {item.created_at}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => viewFile(item)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="View Info">
                            <Icon name="eye" className="w-4 h-4" />
                          </button>
                          <a href={item.url} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Download">
                            <Icon name="download" className="w-4 h-4" />
                          </a>
                          <button onClick={() => setDeletingItem(item)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete File">
                            <Icon name="trash" className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-100 bg-white px-6 py-4 rounded-b-2xl">
            <Pagination meta={files} />
          </div>
        </div>
      </div>

      {/* Modals */}
      {uploadOpen && (
        <UploadFormModal 
          folders={folders} 
          campuses={campuses}
          activeCampusId={auth?.active_campus_id}
          onClose={() => setUploadOpen(false)} 
        />
      )}

      {folderFormOpen && (
        <FolderFormModal 
          folders={folders} 
          campuses={campuses}
          activeCampusId={auth?.active_campus_id}
          onClose={() => setFolderFormOpen(false)} 
        />
      )}

      {deletingItem && (
        <ConfirmDeleteModal
          item={deletingItem}
          onCancel={() => setDeletingItem(null)}
          onConfirm={confirmDelete}
        />
      )}
    </AuthenticatedLayout>
  );
}