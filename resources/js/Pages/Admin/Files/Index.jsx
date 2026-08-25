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
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: flash.error, showConfirmButton: false, timer: 4000, timerProgressBar: true });
    }
    if (errors && Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: firstError, showConfirmButton: false, timer: 4000, timerProgressBar: true });
    }
  }, [flash, errors]);

  useEffect(() => {
    if (perPage !== (filters.per_page ?? '10')) {
      applyFilters({ per_page: perPage });
    }
  }, [perPage]);

  function viewFile(item) {
    const isImage = item.mime_type?.startsWith('image');

    Swal.fire({
      title: `<span style="font-size: 18px; color: #0f172a; font-weight: 700;">${item.original_name}</span>`,
      html: `
        ${isImage ? `<img src="${item.url}" style="max-width:100%; max-height:280px; border-radius:12px; margin-bottom:16px; object-fit:contain; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.1);" />` : ''}
        <div style="text-align:left; font-size:14px; line-height:1.8; color: #475569; background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0;">
          <div style="display:flex; justify-content:space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 8px;">
            <b style="color: #1e293b;">Type:</b> <span>${item.mime_type ?? '—'}</span>
          </div>
          <div style="display:flex; justify-content:space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 8px;">
            <b style="color: #1e293b;">Size:</b> <span style="color: #4f46e5; font-weight: 700;">${item.human_size ?? item.size}</span>
          </div>
          <div style="display:flex; justify-content:space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 8px;">
            <b style="color: #1e293b;">Folder:</b> <span>${item.folder?.name ?? 'Root Directory'}</span>
          </div>
          <div style="display:flex; justify-content:space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 8px;">
            <b style="color: #1e293b;">Uploaded By:</b> <span>${item.uploader?.name ?? '—'}</span>
          </div>
          <div style="display:flex; justify-content:space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 8px;">
            <b style="color: #1e293b;">Uploaded At:</b> <span>${item.created_at}</span>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <b style="color: #1e293b;">URL:</b> 
            <a href="${item.url}" target="_blank" rel="noreferrer" style="color:#ffffff; background: #4f46e5; padding: 4px 10px; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: 600;">Open Link</a>
          </div>
        </div>
      `,
      confirmButtonText: 'Close',
      confirmButtonColor: '#64748b',
      width: 480,
      customClass: { popup: 'rounded-2xl' }
    });
  }

  // --- Export Functions ---
  const handlePrint = () => window.print();

  const exportToCSV = () => {
    if (!files.data.length) return Swal.fire({ icon: 'warning', title: 'No Data!', text: 'Export করার মতো কোনো ডেটা নেই।' });
    const headers = ['File Name', 'Folder', 'Type', 'Size', 'Uploaded By', 'Date'];
    const rows = files.data.map(item => [
      item.original_name || 'N/A',
      item.folder?.name || 'Root',
      item.mime_type ? (item.mime_type.split('/')[1] || item.mime_type) : 'Unknown',
      item.human_size ?? item.size,
      item.uploader?.name || 'N/A',
      item.created_at || 'N/A'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `File_Manager_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = () => {
    if (!files.data.length) return;
    let text = "File Name\tFolder\tType\tSize\tUploaded By\tDate\n";
    files.data.forEach(item => {
      text += `${item.original_name}\t${item.folder?.name || 'Root'}\t${item.mime_type ? (item.mime_type.split('/')[1] || item.mime_type) : 'Unknown'}\t${item.human_size ?? item.size}\t${item.uploader?.name || 'N/A'}\t${item.created_at}\n`;
    });
    navigator.clipboard.writeText(text);
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Data copied to clipboard!', showConfirmButton: false, timer: 2000 });
  };

  return (
    <AuthenticatedLayout>
      <Head title="File Manager" />

      {/* Print Specific CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          nav, aside, header, .no-print, button, a, select, input { display: none !important; }
          body, html { background: #f8fafc !important; }
          .print-table-wrapper { width: 100% !important; border: none !important; box-shadow: none !important; }
          .print-title { display: block !important; font-size: 24px !important; font-weight: bold !important; margin-bottom: 20px !important; }
        }
        @media screen { .print-title { display: none; } }
      `}} />

      <div className="print-title">System File Manager - {new Date().toLocaleDateString('en-GB')}</div>

      <div className="w-full space-y-6 sm:px-6 lg:px-8 py-8 no-print">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">Settings & Registry</span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">File Manager</h1>
            <p className="text-sm text-slate-500 mt-1">সিস্টেমের সব আপলোডকৃত ফাইল ও ফোল্ডার এখান থেকে নিয়ন্ত্রণ করুন।</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
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
              <Icon name="upload" className="w-4 h-4" /> Upload File
            </button>
          </div>
        </div>

        {/* Unified Modern Toolbar */}
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex flex-col xl:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            
            {/* Per Page */}
            <select
              value={perPage}
              onChange={e => { setPerPage(e.target.value); applyFilters({ per_page: e.target.value }); }}
              className="appearance-none bg-none pr-3 py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer text-center font-mono"
              style={{ backgroundImage: 'none' }}
            >
              <option value="10">10 / Page</option>
              <option value="25">25 / Page</option>
              <option value="50">50 / Page</option>
              <option value="100">100 / Page</option>
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
            <div className="relative flex-1 min-w-[200px] sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="search" className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search file name..."
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

          {/* Export Actions */}
          <div className="flex items-center justify-end gap-1.5 bg-slate-50 border border-slate-200 p-1 rounded-xl w-full xl:w-auto shadow-sm shrink-0 ml-auto">
            <button onClick={copyToClipboard} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded-lg transition-all flex items-center gap-1.5" title="Copy to Clipboard">Copy</button>
            <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
            <button onClick={exportToCSV} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-600 hover:bg-white hover:shadow-sm rounded-lg transition-all flex items-center gap-1.5" title="Export CSV">CSV</button>
            <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
            <button onClick={() => alert('Backend Excel plugin needed')} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-green-600 hover:bg-white hover:shadow-sm rounded-lg transition-all flex items-center gap-1.5" title="Export Excel">Excel</button>
            <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
            <button onClick={() => alert('Backend PDF plugin needed')} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-white hover:shadow-sm rounded-lg transition-all flex items-center gap-1.5" title="Export PDF">PDF</button>
            <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
            <button onClick={handlePrint} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-amber-600 hover:bg-white hover:shadow-sm rounded-lg transition-all flex items-center gap-1.5" title="Print List">Print</button>
          </div>
        </div>

        {/* Main Table Card */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5 print-table-wrapper">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">SL</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[30%]">File Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Folder</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Uploaded By</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right no-print">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {files.data.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                      <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3 border border-slate-100">
                        <Icon name="file" className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-sm font-semibold text-slate-600">কোনো ফাইল পাওয়া যায়নি।</p>
                      <p className="text-xs text-slate-400 mt-1">Start by uploading a new file.</p>
                    </td>
                  </tr>
                ) : (
                  files.data.map((item, index) => {
                    const isImage = item.mime_type?.startsWith('image');
                    const fileTypeIcon = isImage ? 'image' : (item.mime_type?.includes('pdf') ? 'file-text' : 'file');
                    
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-slate-500 font-mono">
                          {(files.from ?? 1) + index}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border shadow-sm ${
                              isImage ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                            }`}>
                              <Icon name={fileTypeIcon} className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold text-slate-900 truncate max-w-[200px]" title={item.original_name}>
                              {item.original_name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg w-max shadow-sm">
                            <Icon name="folder" className="w-3.5 h-3.5 text-amber-500" />
                            {item.folder?.name ?? <span className="italic text-slate-400">Root</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide uppercase bg-sky-50 text-sky-700 border border-sky-200">
                            {item.mime_type ? (item.mime_type.split('/')[1] || item.mime_type) : 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <code className="text-xs font-bold text-slate-700 font-mono tracking-tight bg-slate-100 px-2 py-1 rounded border border-slate-200">
                            {item.human_size ?? item.size}
                          </code>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-slate-800">{item.uploader?.name ?? <span className="text-slate-400 italic">Unknown</span>}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-medium text-slate-500 whitespace-nowrap block">{item.created_at}</span>
                        </td>
                        <td className="px-6 py-4 text-right no-print">
                          <div className="flex items-center justify-end gap-1.5">
                            <button onClick={() => viewFile(item)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="View Info">
                              <Icon name="eye" className="w-4 h-4" />
                            </button>
                            <a href={item.url} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors inline-block" title="Download">
                              <Icon name="download" className="w-4 h-4" />
                            </a>
                            <button onClick={() => setDeletingItem(item)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete File">
                              <Icon name="trash" className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="no-print border-t border-slate-100 bg-white px-6 py-4 rounded-b-2xl">
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
          item={{ name: deletingItem.original_name }}
          onCancel={() => setDeletingItem(null)}
          onConfirm={confirmDelete}
        />
      )}
    </AuthenticatedLayout>
  );
}