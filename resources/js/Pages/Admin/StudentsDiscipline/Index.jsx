import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import FormModal from './Partials/FormModal';
import ShowModal from './Partials/ShowModal';
import Swal from 'sweetalert2';

export default function Index({ records, students, filters }) {
  const { flash } = usePage().props;

  const [search, setSearch] = useState(filters.search ?? '');
  const [typeFilter, setTypeFilter] = useState(filters.type ?? '');

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showItem, setShowItem] = useState(null);

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000 });
      setFormOpen(false);
    }
  }, [flash]);

  const applyFilters = () => {
    router.get(route('admin.students.discipline'), { search, type: typeFilter }, { preserveState: true });
  };

  const handleDelete = (id) => {
    if (confirm('আপনি কি নিশ্চিত যে এই রেকর্ডটি মুছে ফেলতে চান?')) {
      router.delete(route('admin.students.discipline.destroy', id));
    }
  };

  const getTypeStyle = (type) => {
    switch (type) {
      case 'Reward': return { bg: '#dcfce7', text: '#15803d' };
      case 'Warning': return { bg: '#fef3c7', text: '#d97706' };
      case 'Suspension': return { bg: '#fee2e2', text: '#b91c1c' };
      default: return { bg: '#f1f5f9', text: '#475569' };
    }
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div>
            <span className="eyebrow">Students</span>
            <h1>Disciplinary Records</h1>
            <p className="desc">শিক্ষার্থীদের শৃঙ্খলা, অভিযোগ এবং পুরস্কারের রেকর্ড পরিচালনা করুন।</p>
          </div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => { setEditingItem(null); setFormOpen(true); }}>
              <Icon name="plus" /> Add Record
            </button>
          </div>
        </div>
      }
    >
      <Head title="Discipline Records" />

      <div className="card mm-card">
        <div className="mm-filters" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div className="search">
            <Icon name="search" />
            <input placeholder="Search student or title..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
          </div>

          <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); applyFilters(); }}>
            <option value="">All Types</option>
            <option value="Reward">Reward (পুরস্কার)</option>
            <option value="Complaint">Complaint (অভিযোগ)</option>
            <option value="Warning">Warning (সতর্কতা)</option>
            <option value="Suspension">Suspension (বহিষ্কার)</option>
            <option value="Other">Other</option>
          </select>
          <button className="btn btn-outline" onClick={applyFilters}>Filter</button>
        </div>

        <div className="mm-table-wrap">
          <table className="mm-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Incident & Date</th>
                <th>Type</th>
                <th>Reported By</th>
                <th className="mm-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.data.length === 0 && (
                <tr><td colSpan={5} className="mm-empty">কোনো রেকর্ড পাওয়া যায়নি।</td></tr>
              )}
              {records.data.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong style={{ color: '#0f172a' }}>{item.student?.first_name} {item.student?.last_name || ''}</strong>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Adm: {item.student?.admission_no}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{item.title}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Date: {item.incident_date}</div>
                  </td>
                  <td>
                    <span style={{ backgroundColor: getTypeStyle(item.type).bg, color: getTypeStyle(item.type).text, padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                      {item.type}
                    </span>
                  </td>
                  <td>{item.reported_by || '-'}</td>
                  <td>
                    <div className="mm-row-actions">
                      <button className="icon-btn" title="View" onClick={() => setShowItem(item)}><Icon name="eye" /></button>
                      <button className="icon-btn" title="Edit" onClick={() => { setEditingItem(item); setFormOpen(true); }}><Icon name="edit" /></button>
                      <button className="icon-btn icon-btn-danger" title="Delete" onClick={() => handleDelete(item.id)}><Icon name="trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination meta={records} />
      </div>

      {/* Form Modal (Create / Edit) */}
      {formOpen && <FormModal item={editingItem} students={students} onClose={() => setFormOpen(false)} />}
      
      {/* Show Modal (Details View) */}
      {showItem && <ShowModal item={showItem} onClose={() => setShowItem(null)} />}

    </AuthenticatedLayout>
  );
}