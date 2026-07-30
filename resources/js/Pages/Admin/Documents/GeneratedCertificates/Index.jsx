import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import CertificateFormModal from './Partials/CertificateFormModal';
import CertificatePrintModal from './Partials/CertificatePrintModal';
import Swal from 'sweetalert2';

export default function Index({ certificates, templates, users, campuses, activeCampusId, filters }) {
  const { flash } = usePage().props;
  const [search, setSearch] = useState(filters.search ?? '');
  const [viewingItem, setViewingItem] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000 });
    }
  }, [flash]);

  function applyFilters() {
    router.get(route('admin.documents.certificates.index'), { search }, { preserveState: true, replace: true });
  }

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div><span className="eyebrow">Documents & Certificates</span><h1>Generated Certificates</h1></div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => setIsFormOpen(true)}><Icon name="plus" /> Issue Certificate</button>
          </div>
        </div>
      }
    >
      <Head title="Generated Certificates" />
      <div className="card mm-card">
        <div className="mm-filters">
          <div className="search">
            <Icon name="search" />
            <input placeholder="Search Certificate No or Student..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
          </div>
          <button className="btn btn-outline" onClick={applyFilters}>Filter</button>
        </div>

        <div className="mm-table-wrap">
          <table className="mm-table">
            <thead>
              <tr>
                <th style={{width: '60px'}}>SL</th>
                <th>Certificate No</th>
                <th>Student Name</th>
                <th>Template Title</th>
                <th>Issue Date</th>
                <th className="mm-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {certificates.data.length === 0 && <tr><td colSpan={6} className="mm-empty">No generated certificates found.</td></tr>}
              {certificates.data.map((item, index) => (
                <tr key={item.id}>
                  <td>{(certificates.from ?? 1) + index}</td>
                  <td><strong>{item.certificate_no}</strong></td>
                  <td>{item.student?.name}</td>
                  <td><span className="badge-outline">{item.template?.title}</span></td>
                  <td>{new Date(item.issue_date).toLocaleDateString()}</td>
                  <td>
                    <div className="mm-row-actions">
                      <button className="icon-btn" title="View / Print" onClick={() => setViewingItem(item)}><Icon name="eye" /></button>
                      <button className="icon-btn icon-btn-danger" title="Delete" onClick={() => setDeletingItem(item)}><Icon name="trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination meta={certificates} />
      </div>

      {isFormOpen && <CertificateFormModal templates={templates} users={users} campuses={campuses} activeCampusId={activeCampusId} onClose={() => setIsFormOpen(false)} />}
      {viewingItem && <CertificatePrintModal item={viewingItem} onClose={() => setViewingItem(null)} />}
      {deletingItem && (
        <ConfirmDeleteModal item={{ name: `Certificate ${deletingItem.certificate_no}` }} onCancel={() => setDeletingItem(null)} onConfirm={() => {
            router.delete(route('admin.documents.certificates.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) });
        }} />
      )}
    </AuthenticatedLayout>
  );
}