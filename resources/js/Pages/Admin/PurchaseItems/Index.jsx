import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ItemFormModal from './Partials/ItemFormModal';
import ItemShowModal from './Partials/ItemShowModal';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import AttributeManagerModal from './Partials/AttributeManagerModal';
import Swal from 'sweetalert2';

export default function Index({ items, campuses, sizes, colors, filters }) {
  const { flash, auth } = usePage().props;

  const [search, setSearch] = useState(filters.search ?? '');
  const [category, setCategory] = useState(filters.category ?? '');
  const [status, setStatus] = useState(filters.status ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '10');

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [attrModalOpen, setAttrModalOpen] = useState(false); // Size & Color Modal State

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000, timerProgressBar: true });
    }
  }, [flash]);

  function applyFilters(overrides = {}) {
    router.get(route('admin.purchase.items.index'), {
      search, category, status, per_page: perPage, ...overrides,
    }, { preserveState: true, replace: true });
  }

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div>
            <span className="eyebrow">Inventory & Assets</span>
            <h1>Products & Items</h1>
            <p className="desc">স্কুলের ইনভেন্টরি, স্টেশনারি ও বিক্রয়যোগ্য সামগ্রীর তালিকা।</p>
          </div>
          <div className="mm-head-actions">
            <button className="btn btn-outline" onClick={() => setAttrModalOpen(true)}>
              <Icon name="settings" /> Manage Size & Color
            </button>
            <button className="btn" onClick={() => { setEditingItem(null); setFormOpen(true); }}>
              <Icon name="plus" /> Add Item
            </button>
          </div>
        </div>
      }
    >
      <Head title="Products & Items" />

      <div className="card mm-card">
        <div className="mm-filters" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select value={perPage} onChange={(e) => { setPerPage(e.target.value); applyFilters({ per_page: e.target.value }); }}>
            <option value="10">10 / page</option>
            <option value="50">50 / page</option>
            <option value="all">Show All</option>
          </select>

          <div className="search">
            <Icon name="search" />
            <input placeholder="Search name or code..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
          </div>

          <select value={category} onChange={(e) => { setCategory(e.target.value); applyFilters({ category: e.target.value }); }}>
            <option value="">All Categories</option>
            <option value="Books">Books</option>
            <option value="Uniforms">Uniforms</option>
            <option value="Stationery">Stationery</option>
            <option value="Electronics">Electronics</option>
            <option value="Furniture">Furniture</option>
            <option value="Cleaning Supplies">Cleaning Supplies</option>
            <option value="Sports">Sports</option>
            <option value="Others">Others</option>
          </select>

          <select value={status} onChange={(e) => { setStatus(e.target.value); applyFilters({ status: e.target.value }); }}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button className="btn btn-outline" onClick={() => applyFilters()}>Filter</button>
        </div>

        <div className="mm-table-wrap">
          <table className="mm-table">
            <thead>
              <tr>
                <th>Item Name & Code</th>
                <th>Category</th>
                <th>Attributes</th>
                <th>Sell Price</th>
                <th>Current Stock</th>
                <th>Status</th>
                <th className="mm-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.data.length === 0 && (
                <tr><td colSpan={7} className="mm-empty">কোনো আইটেম পাওয়া যায়নি।</td></tr>
              )}
              {items.data.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="mm-label-cell">
                      <Icon name="box" className="mm-row-icon" />
                      <div>
                        <span style={{ fontWeight: 500, display: 'block' }}>{item.name}</span>
                        {item.item_code && <span style={{ fontSize: '12px', color: '#4f46e5' }}>Code: {item.item_code}</span>}
                      </div>
                    </div>
                  </td>
                  <td>{item.category}</td>
                  <td>
                    <div style={{ fontSize: '12px', color: '#475569' }}>
                      {item.size && item.size.length > 0 && (
                          <div style={{ marginBottom: '2px' }}>
                              Sizes: <strong style={{ color: '#0f172a' }}>{item.size.join(', ')}</strong>
                          </div>
                      )}
                      {item.color && item.color.length > 0 && (
                          <div>
                              Colors: <strong style={{ color: '#0f172a' }}>{item.color.join(', ')}</strong>
                          </div>
                      )}
                      {(!item.size || item.size.length === 0) && (!item.color || item.color.length === 0) && <span>-</span>}
                    </div>
                  </td>
                  <td>
                    <strong style={{ color: '#0f172a' }}>৳ {item.selling_price}</strong>
                  </td>
                  <td>
                    <strong style={{ color: item.quantity <= 5 ? '#b91c1c' : '#047857' }}>
                      {item.quantity} {item.unit}
                    </strong>
                    {item.quantity <= 5 && <span style={{ marginLeft: '8px', fontSize: '10px', color: '#b91c1c', backgroundColor: '#fee2e2', padding: '2px 6px', borderRadius: '4px' }}>Low Stock</span>}
                  </td>
                  <td>
                    <span className={`mm-status ${item.is_active ? 'is-active' : 'is-inactive'}`}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="mm-row-actions">
                      <button className="icon-btn" title="View" onClick={() => setViewingItem(item)}>
                        <Icon name="eye" />
                      </button>
                      <button className="icon-btn" title="Edit" onClick={() => { setEditingItem(item); setFormOpen(true); }}>
                        <Icon name="edit" />
                      </button>
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
        <Pagination meta={items} />
      </div>

      {formOpen && <ItemFormModal item={editingItem} campuses={campuses} sizes={sizes} colors={colors} activeCampusId={auth?.active_campus_id} onClose={() => setFormOpen(false)} />}

      {attrModalOpen && <AttributeManagerModal sizes={sizes} colors={colors} onClose={() => setAttrModalOpen(false)} />}

      {viewingItem && <ItemShowModal item={viewingItem} onClose={() => setViewingItem(null)} />}

      {deletingItem && (
        <ConfirmDeleteModal item={{ name: deletingItem.name }} onCancel={() => setDeletingItem(null)} onConfirm={() => {
            router.delete(route('admin.purchase.items.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) });
        }} />
      )}
    </AuthenticatedLayout>
  );
}
