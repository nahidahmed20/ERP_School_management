import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import FoodItemFormModal from './Partials/FoodItemFormModal';
import Swal from 'sweetalert2';

export default function Index({ items, outlets, campuses, activeCampusId, filters }) {
  const { flash } = usePage().props;
  const [search, setSearch] = useState(filters.search ?? '');
  const [editingItem, setEditingItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000 });
    }
  }, [flash]);

  function applyFilters() {
    router.get(route('admin.cafeteria.menu-items.index'), { search }, { preserveState: true, replace: true });
  }

  const handleStatusToggle = (item) => {
    router.put(route('admin.cafeteria.menu-items.update', item.id), {
      campus_id: item.campus_id,
      cafeteria_outlet_id: item.cafeteria_outlet_id,
      name: item.name,
      category: item.category,
      price: item.price,
      is_available: !item.is_available
    }, { preserveScroll: true, preserveState: true });
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div><span className="eyebrow">Cafeteria</span><h1>Food Menu Items</h1></div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => { setEditingItem(null); setIsModalOpen(true); }}><Icon name="plus" /> Add Food Item</button>
          </div>
        </div>
      }
    >
      <Head title="Menu Items" />
      <div className="card mm-card">
        <div className="mm-filters">
          <div className="search">
            <Icon name="search" />
            <input placeholder="Search Food..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
          </div>
          <button className="btn btn-outline" onClick={applyFilters}>Filter</button>
        </div>

        <div className="mm-table-wrap">
          <table className="mm-table">
            <thead>
              <tr>
                <th style={{width: '60px'}}>SL</th>
                <th>Item Name</th>
                <th>Category</th>
                <th>Outlet</th>
                <th>Price</th>
                <th>Status</th>
                <th className="mm-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.data.length === 0 && <tr><td colSpan={7} className="mm-empty">No food items found.</td></tr>}
              {items.data.map((item, index) => (
                <tr key={item.id}>
                  <td>{(items.from ?? 1) + index}</td>
                  <td><strong>{item.name}</strong></td>
                  <td><span className="badge-outline">{item.category}</span></td>
                  <td>{item.outlet?.name || '-'}</td>
                  <td><strong>৳ {Number(item.price).toFixed(2)}</strong></td>
                  <td>
                    <button 
                      onClick={() => handleStatusToggle(item)}
                      className={`mm-badge ${item.is_available ? 'badge-active' : 'badge-inactive'}`}
                      style={{ border: 'none', cursor: 'pointer' }}
                    >
                      {item.is_available ? 'Available' : 'Unavailable'}
                    </button>
                  </td>
                  <td>
                    <div className="mm-row-actions">
                      <button className="icon-btn" onClick={() => { setEditingItem(item); setIsModalOpen(true); }}><Icon name="edit" /></button>
                      <button className="icon-btn icon-btn-danger" onClick={() => setDeletingItem(item)}><Icon name="trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination meta={items} />
      </div>

      {isModalOpen && <FoodItemFormModal item={editingItem} outlets={outlets} campuses={campuses} activeCampusId={activeCampusId} onClose={() => setIsModalOpen(false)} />}
      {deletingItem && (
        <ConfirmDeleteModal item={{ name: deletingItem.name }} onCancel={() => setDeletingItem(null)} onConfirm={() => {
            router.delete(route('admin.cafeteria.menu-items.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) });
        }} />
      )}
    </AuthenticatedLayout>
  );
}