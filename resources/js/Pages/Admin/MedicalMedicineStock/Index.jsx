import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import StockFormModal from './Partials/StockFormModal';
import Swal from 'sweetalert2';

export default function Index({ stocks, rooms, campuses, activeCampusId, filters }) {
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
    router.get(route('admin.medical.medicine-stock.index'), { search }, { preserveState: true, replace: true });
  }

  const isExpired = (dateString) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div><span className="eyebrow">Medical Room</span><h1>Medicine Stock</h1></div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => { setEditingItem(null); setIsModalOpen(true); }}><Icon name="plus" /> Add Medicine</button>
          </div>
        </div>
      }
    >
      <Head title="Medicine Stock" />
      <div className="card mm-card">
        <div className="mm-filters">
          <div className="search">
            <Icon name="search" />
            <input placeholder="Search Medicine..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
          </div>
          <button className="btn btn-outline" onClick={applyFilters}>Filter</button>
        </div>

        <div className="mm-table-wrap">
          <table className="mm-table">
            <thead>
              <tr>
                <th style={{width: '60px'}}>SL</th>
                <th>Medicine Name</th>
                <th>Category</th>
                <th>Room No</th>
                <th>Quantity</th>
                <th>Expiry Date</th>
                <th className="mm-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stocks.data.length === 0 && <tr><td colSpan={7} className="mm-empty">No medicines found in stock.</td></tr>}
              {stocks.data.map((item, index) => {
                const expired = isExpired(item.expiry_date);
                return (
                  <tr key={item.id}>
                    <td>{(stocks.from ?? 1) + index}</td>
                    <td><strong>{item.medicine_name}</strong></td>
                    <td><span className="badge-outline">{item.category || 'General'}</span></td>
                    <td>{item.room?.room_number}</td>
                    <td><strong style={{ color: item.quantity <= 5 ? '#b91c1c' : '#0f172a' }}>{item.quantity} units</strong></td>
                    <td>
                      {item.expiry_date ? (
                        <span style={{ color: expired ? '#b91c1c' : '#475569', fontWeight: expired ? 'bold' : 'normal' }}>
                          {new Date(item.expiry_date).toLocaleDateString()} {expired && '(Expired)'}
                        </span>
                      ) : '-'}
                    </td>
                    <td>
                      <div className="mm-row-actions">
                        <button className="icon-btn" onClick={() => { setEditingItem(item); setIsModalOpen(true); }}><Icon name="edit" /></button>
                        <button className="icon-btn icon-btn-danger" onClick={() => setDeletingItem(item)}><Icon name="trash" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination meta={stocks} />
      </div>

      {isModalOpen && <StockFormModal item={editingItem} rooms={rooms} campuses={campuses} activeCampusId={activeCampusId} onClose={() => setIsModalOpen(false)} />}
      {deletingItem && (
        <ConfirmDeleteModal item={{ name: deletingItem.medicine_name }} onCancel={() => setDeletingItem(null)} onConfirm={() => {
            router.delete(route('admin.medical.medicine-stock.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) });
        }} />
      )}
    </AuthenticatedLayout>
  );
}