import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import BranchFormModal from './Partials/BranchFormModal';
import BranchViewModal from './Partials/BranchViewModal';
import Pagination from '@/Components/Pagination';
import Swal from 'sweetalert2';

export default function Index({ branches, filters }) {
  const { flash } = usePage().props;

  const [search, setSearch] = useState(filters.search ?? '');
  const [status, setStatus] = useState(filters.status ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '10');

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);

  useEffect(() => {
    if (flash?.success) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000 });
    if (flash?.error) Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: flash.error, showConfirmButton: false, timer: 4000 });
  }, [flash]);

  function applyFilters(overrides = {}) {
    router.get(route('admin.branches.index'), { search, status, per_page: perPage, ...overrides }, { preserveState: true, replace: true });
  }

  function confirmDelete(item) {
    Swal.fire({
      title: 'আপনি কি নিশ্চিত?', text: "এই শাখাটি মুছে ফেললে তা আর ফিরে পাওয়া যাবে না!", icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#A6342B', cancelButtonColor: '#5C6B60', confirmButtonText: 'হ্যাঁ, মুছে ফেলুন!'
    }).then((result) => {
      if (result.isConfirmed) router.delete(route('admin.branches.destroy', item.id));
    });
  }

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div>
            <span className="eyebrow">Settings &amp; Registry</span>
            <h1>School Branches</h1>
            <p className="desc">প্রতিষ্ঠানের সকল Branch/শাখা এখান থেকে নিয়ন্ত্রণ করুন।</p>
          </div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => { setEditingItem(null); setFormOpen(true); }}>
              <Icon name="plus" /> Add Branch
            </button>
          </div>
        </div>
      }
    >
      <Head title="School Branches" />

      <div className="card mm-card">
        <div className="mm-filters">
          <div className="search">
            <Icon name="search" />
            <input placeholder="Search branches..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
          </div>
          <button className="btn btn-outline" onClick={() => applyFilters()}>Filter</button>
        </div>

        <div className="mm-table-wrap">
          <table className="mm-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Code</th>
                <th>Phone</th>
                <th>Status</th>
                <th className="mm-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {branches.data.length === 0 && (<tr><td colSpan={5} className="mm-empty">কোনো Branch পাওয়া যায়নি।</td></tr>)}
              {branches.data.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="mm-label-cell">
                      <Icon name="building" className="mm-row-icon" />
                      <span>{item.name}</span>
                      {item.is_main && <span className="mm-tag mm-tag-parent">Main</span>}
                    </div>
                  </td>
                  <td><code>{item.code}</code></td>
                  <td>{item.phone ?? '—'}</td>
                  <td><span className={`mm-status ${item.status ? 'is-active' : 'is-inactive'}`}>{item.status ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    <div className="mm-row-actions">
                      <button className="icon-btn" onClick={() => setViewingItem(item)}><Icon name="eye" /></button>
                      <button className="icon-btn" onClick={() => { setEditingItem(item); setFormOpen(true); }}><Icon name="edit" /></button>
                      <button className="icon-btn icon-btn-danger" onClick={() => confirmDelete(item)}><Icon name="trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination meta={branches} />
      </div>

      {formOpen && <BranchFormModal item={editingItem} onClose={() => setFormOpen(false)} />}
      {viewingItem && <BranchViewModal item={viewingItem} onClose={() => setViewingItem(null)} />}
    </AuthenticatedLayout>
  );
}
