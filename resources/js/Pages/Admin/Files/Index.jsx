import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import UploadFormModal from './Partials/UploadFormModal';
import FolderFormModal from './Partials/FolderFormModal';
import ConfirmDeleteModal from './Partials/ConfirmDeleteModal';
import Pagination from '@/Components/Pagination';

export default function Index({ files, folders, filters }) {
  const { flash } = usePage().props;

  const [search, setSearch] = useState(filters.search ?? '');
  const [folderId, setFolderId] = useState(filters.folder_id ?? '');
  const [type, setType] = useState(filters.type ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '10');

  const [uploadOpen, setUploadOpen] = useState(false);
  const [folderFormOpen, setFolderFormOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);

  function applyFilters(overrides = {}) {
    router.get(route('admin.files'), {
      search, folder_id: folderId, type, per_page: perPage, ...overrides,
    }, { preserveState: true, replace: true });
  }

  function confirmDelete() {
    router.delete(route('admin.files.destroy', deletingItem.id), {
      onSuccess: () => setDeletingItem(null),
    });
  }

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div>
            <span className="eyebrow">Settings &amp; Registry</span>
            <h1>File Manager</h1>
            <p className="desc">সিস্টেমের সব আপলোডকৃত ফাইল ও ফোল্ডার এখান থেকে নিয়ন্ত্রণ করুন।</p>
          </div>
          <div className="mm-head-actions">
            <button className="btn btn-ghost" onClick={() => setFolderFormOpen(true)}>
              <Icon name="folder" /> New Folder
            </button>
            <button className="btn" onClick={() => setUploadOpen(true)}>
              <Icon name="plus" /> Upload File
            </button>
          </div>
        </div>
      }
    >
      <Head title="File Manager" />

      {flash?.success && (
        <div className="mm-toast">{flash.success}</div>
      )}

      <div className="card mm-card">
        <div className="mm-filters">
          <div className="search">
            <Icon name="search" />
            <input
              placeholder="Search by file name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            />
          </div>

          <select value={folderId} onChange={(e) => { setFolderId(e.target.value); applyFilters({ folder_id: e.target.value }); }}>
            <option value="">All Folders</option>
            {folders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>

          <select value={type} onChange={(e) => { setType(e.target.value); applyFilters({ type: e.target.value }); }}>
            <option value="">All Types</option>
            <option value="image">Images</option>
            <option value="application">Documents</option>
            <option value="video">Video</option>
          </select>

          <select value={perPage} onChange={(e) => { setPerPage(e.target.value); applyFilters({ per_page: e.target.value }); }}>
            <option value="10">10 / page</option>
            <option value="20">20 / page</option>
            <option value="50">50 / page</option>
            <option value="all">Show All</option>
          </select>

          <button className="btn btn-outline" onClick={() => applyFilters()}>Filter</button>
        </div>

        <div className="mm-table-wrap">
          <table className="mm-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Folder</th>
                <th>Type</th>
                <th>Size</th>
                <th>Uploaded By</th>
                <th>Uploaded At</th>
                <th className="mm-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.data.length === 0 && (
                <tr><td colSpan={7} className="mm-empty">কোনো ফাইল পাওয়া যায়নি।</td></tr>
              )}
              {files.data.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="mm-label-cell">
                      <Icon name="file" className="mm-row-icon" />
                      <span>{item.original_name}</span>
                    </div>
                  </td>
                  <td>{item.folder?.name ?? '—'}</td>
                  <td>{item.mime_type ?? '—'}</td>
                  <td>{item.human_size ?? item.size}</td>
                  <td>{item.uploader?.name ?? '—'}</td>
                  <td>{item.created_at}</td>
                  <td>
                    <div className="mm-row-actions">
                      <a className="icon-btn" title="Download" href={item.url} target="_blank" rel="noreferrer">
                        <Icon name="download" />
                      </a>
                      <button className="icon-btn icon-btn-danger" title="Delete" onClick={() => setDeletingItem(item)}>
                        <Icon name="trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination meta={files} />
      </div>

      {uploadOpen && (
        <UploadFormModal folders={folders} onClose={() => setUploadOpen(false)} />
      )}

      {folderFormOpen && (
        <FolderFormModal folders={folders} onClose={() => setFolderFormOpen(false)} />
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
