import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import AiFormModal from './Partials/AiFormModal';
import Swal from 'sweetalert2';

export default function Index({ assistants, filters }) {
  const { flash } = usePage().props;
  const [search, setSearch] = useState(filters.search ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '10');

  const [editingItem, setEditingItem] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);

  useEffect(() => {
    if (flash?.success) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000 });
  }, [flash]);

  function applyFilters() {
    router.get(route('admin.saas.ai.index'), { search, per_page: perPage }, { preserveState: true, replace: true });
  }

  useEffect(() => {
    if (perPage !== (filters.per_page ?? '10')) applyFilters();
  }, [perPage]);

  // Provider colors
  const getProviderStyle = (provider) => {
    if (provider === 'OpenAI') return 'border-green-600 text-green-700 bg-green-50';
    if (provider === 'Gemini') return 'border-blue-600 text-blue-700 bg-blue-50';
    if (provider === 'Claude') return 'border-purple-600 text-purple-700 bg-purple-50';
    return 'border-gray-600 text-gray-700';
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div><span className="eyebrow">SaaS, AI & Backups</span><h1>AI Assistants & Prompts</h1></div>
          <div className="mm-head-actions">
            <button className="btn" style={{ background: '#4f46e5' }} onClick={() => { setEditingItem(null); setIsFormOpen(true); }}>
              <Icon name="sparkles" /> Create AI Assistant
            </button>
          </div>
        </div>
      }
    >
      <Head title="AI Assistants" />
      <div className="card mm-card">

        <div className="mm-filters" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '14px', color: '#64748b' }}>Show</span>
            <select value={perPage} onChange={(e) => setPerPage(e.target.value)} style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
              <option value="10">10</option><option value="25">25</option><option value="50">50</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div className="search">
              <Icon name="search" />
              <input placeholder="Search AI tools..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
            </div>
            <button className="btn btn-outline" onClick={applyFilters}>Filter</button>
          </div>
        </div>

        <div className="mm-table-wrap mt-3">
          <table className="mm-table">
            <thead>
              <tr>
                <th style={{width: '60px'}}>SL</th>
                <th>Tool Name</th>
                <th>AI Provider</th>
                <th>Model Info</th>
                <th>Status</th>
                <th className="mm-actions-col">Action</th>
              </tr>
            </thead>
            <tbody>
              {assistants.data.length === 0 && <tr><td colSpan={6} className="mm-empty">No AI Assistants created yet.</td></tr>}
              {assistants.data.map((item, index) => (
                <tr key={item.id}>
                  <td>{(assistants.from ?? 1) + index}</td>
                  <td>
                    <strong style={{ color: '#0f172a', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Icon name="cpu" style={{ width: '16px', height: '16px', color: '#4f46e5' }} /> {item.name}
                    </strong>
                  </td>
                  <td>
                    <span className={`badge-outline ${getProviderStyle(item.provider)}`}>
                      {item.provider}
                    </span>
                  </td>
                  <td>
                    <code style={{ fontSize: '13px', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: '#334155' }}>
                      {item.model_name}
                    </code>
                  </td>
                  <td>
                    <span className={`badge-outline ${item.is_active ? 'border-green-600 text-green-600' : 'border-gray-500 text-gray-500'}`}>
                      {item.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td>
                    <div className="mm-row-actions">
                      <button className="icon-btn" onClick={() => { setEditingItem(item); setIsFormOpen(true); }}><Icon name="edit" /></button>
                      <button className="icon-btn icon-btn-danger" onClick={() => setDeletingItem(item)}><Icon name="trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination meta={assistants} />
      </div>

      {isFormOpen && <AiFormModal item={editingItem} onClose={() => setIsFormOpen(false)} />}

      {deletingItem && (
        <ConfirmDeleteModal
          item={{ name: deletingItem.name }}
          message="Are you sure you want to remove this AI configuration?"
          onCancel={() => setDeletingItem(null)}
          onConfirm={() => {
            router.delete(route('admin.saas.ai.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) });
          }}
        />
      )}
    </AuthenticatedLayout>
  );
}
