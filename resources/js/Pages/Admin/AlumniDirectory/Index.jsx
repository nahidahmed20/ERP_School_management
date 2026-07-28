import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import FormModal from './Partials/FormModal';
import ShowModal from './Partials/ShowModal';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Swal from 'sweetalert2';

export default function Index({ alumnis, filters }) {
  const { flash } = usePage().props;

  const [search, setSearch] = useState(filters.search ?? '');
  const [yearFilter, setYearFilter] = useState(filters.passing_year ?? '');

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showItem, setShowItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000 });
      setFormOpen(false);
    }
  }, [flash]);

  const applyFilters = () => {
    router.get(route('admin.alumni.directory.index'), { search, passing_year: yearFilter }, { preserveState: true });
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      router.delete(route('admin.alumni.directory.destroy', deleteId), {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  // Generate an array of years for the filter (e.g., from 1990 to current year)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 35 }, (_, i) => currentYear - i);

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div>
            <span className="eyebrow">Alumni Management</span>
            <h1>Alumni Directory</h1>
            <p className="desc">প্রাক্তন শিক্ষার্থীদের পেশা, পাসের বছর এবং যোগাযোগের তথ্য পরিচালনা করুন।</p>
          </div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => { setEditingItem(null); setFormOpen(true); }}>
              <Icon name="plus" /> Add Alumni
            </button>
          </div>
        </div>
      }
    >
      <Head title="Alumni Directory" />

      <div className="card mm-card">
        <div className="mm-filters" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div className="search">
            <Icon name="search" />
            <input placeholder="Search name, phone or email..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
          </div>

          <select value={yearFilter} onChange={(e) => { setYearFilter(e.target.value); applyFilters(); }}>
            <option value="">All Passing Years</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          <button className="btn btn-outline" onClick={applyFilters}>Filter</button>
        </div>

        <div className="mm-table-wrap">
          <table className="mm-table">
            <thead>
              <tr>
                <th>Photo</th>
                <th>Name & Contact</th>
                <th>Passing Year</th>
                <th>Current Profession</th>
                <th className="mm-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {alumnis.data.length === 0 && (
                <tr><td colSpan={5} className="mm-empty">কোনো প্রাক্তন শিক্ষার্থীর তথ্য পাওয়া যায়নি।</td></tr>
              )}
              {alumnis.data.map((item) => (
                <tr key={item.id}>
                  <td>
                    {item.photo ? (
                      <img src={`/storage/${item.photo}`} alt={item.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                        <Icon name="user" />
                      </div>
                    )}
                  </td>
                  <td>
                    <strong style={{ color: '#0f172a' }}>{item.name}</strong>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{item.phone} {item.email && `| ${item.email}`}</div>
                  </td>
                  <td><span className="badge">{item.passing_year}</span></td>
                  <td>
                    <div style={{ fontWeight: '500' }}>{item.current_profession || '-'}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{item.organization}</div>
                  </td>
                  <td>
                    <div className="mm-row-actions">
                      <button className="icon-btn" title="View" onClick={() => setShowItem(item)}><Icon name="eye" /></button>
                      <button className="icon-btn" title="Edit" onClick={() => { setEditingItem(item); setFormOpen(true); }}><Icon name="edit" /></button>
                      <button className="icon-btn icon-btn-danger" title="Delete" onClick={() => setDeleteId(item.id)}><Icon name="trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination meta={alumnis} />
      </div>

      {formOpen && <FormModal item={editingItem} onClose={() => setFormOpen(false)} />}
      {showItem && <ShowModal item={showItem} onClose={() => setShowItem(null)} />}

      {deleteId && (
        <ConfirmDeleteModal
          show={Boolean(deleteId)}
          onClose={() => setDeleteId(null)}
          onCancel={() => setDeleteId(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Alumni Record"
          message="আপনি কি নিশ্চিত যে এই প্রাক্তন শিক্ষার্থীর তথ্য মুছে ফেলতে চান?"
        />
      )}

    </AuthenticatedLayout>
  );
}
