import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import DeviceFormModal from './Partials/DeviceFormModal';
import Swal from 'sweetalert2';

export default function Index({ devices, campuses, activeCampusId, filters }) {
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
    router.get(route('admin.biometric-devices.index'), { search, per_page: perPage }, { preserveState: true, replace: true });
  }

  useEffect(() => {
    if (perPage !== (filters.per_page ?? '10')) applyFilters();
  }, [perPage]);

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div><span className="eyebrow">System / Biometric Devices</span><h1>Device Registry</h1></div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => { setEditingItem(null); setIsFormOpen(true); }}>
              <Icon name="plus" /> Add Device
            </button>
          </div>
        </div>
      }
    >
      <Head title="Biometric Devices" />
      <div className="card mm-card">

        <div className="mm-filters" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '14px', color: '#64748b' }}>Show</span>
            <select value={perPage} onChange={(e) => setPerPage(e.target.value)} style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
              <option value="10">10</option><option value="25">25</option><option value="50">50</option>
              <option value="100">100</option><option value="All">All</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div className="search">
              <Icon name="search" />
              <input placeholder="Search device name, IP, Serial..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
            </div>
            <button className="btn btn-outline" onClick={applyFilters}>Filter</button>
          </div>
        </div>

        <div className="mm-table-wrap mt-3">
          <table className="mm-table">
            <thead>
              <tr>
                <th style={{width: '60px'}}>SL</th>
                <th>Device Name</th>
                <th>IP & Port</th>
                <th>Serial No.</th>
                <th>Status</th>
                <th>Last Sync</th>
                <th className="mm-actions-col">Action</th>
              </tr>
            </thead>
            <tbody>
              {devices.data.length === 0 && <tr><td colSpan={7} className="mm-empty">No devices registered.</td></tr>}
              {devices.data.map((item, index) => (
                <tr key={item.id}>
                  <td>{(devices.from ?? 1) + index}</td>
                  <td><strong style={{ color: '#0f172a' }}>{item.name}</strong></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Icon name="globe" style={{ width: '14px', height: '14px', color: '#64748b' }} />
                      <span style={{ color: '#4f46e5', fontWeight: 'bold' }}>{item.ip_address}</span>
                      <span style={{ color: '#64748b', fontSize: '12px' }}>:{item.port}</span>
                    </div>
                  </td>
                  <td>{item.serial_number}</td>
                  <td>
                    <span className={`badge-outline ${item.status === 'Online' ? 'border-green-600 text-green-600' : (item.status === 'Maintenance' ? 'border-orange-600 text-orange-600' : 'border-red-600 text-red-600')}`}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '13px', color: '#64748b' }}>
                    {item.last_sync ? new Date(item.last_sync).toLocaleString() : 'Never synced'}
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
        <Pagination meta={devices} />
      </div>

      {isFormOpen && <DeviceFormModal item={editingItem} campuses={campuses} activeCampusId={activeCampusId} onClose={() => setIsFormOpen(false)} />}

      {deletingItem && (
        <ConfirmDeleteModal item={{ name: deletingItem.name }} onCancel={() => setDeletingItem(null)} onConfirm={() => {
            router.delete(route('admin.biometric-devices.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) });
        }} />
      )}
    </AuthenticatedLayout>
  );
}
