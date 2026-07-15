import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ClassFormModal from './Partials/ClassFormModal';
import AssignSectionModal from './Partials/AssignSectionModal';
import AssignSubjectModal from './Partials/AssignSubjectModal';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Swal from 'sweetalert2';

export default function Index({ classes, campuses, allSections, allSubjects, filters }) {
  const { flash, auth } = usePage().props;

  const [search, setSearch] = useState(filters.search ?? '');
  const [status, setStatus] = useState(filters.status ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '10');

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  
  const [assigningSectionClass, setAssigningSectionClass] = useState(null);
  const [assigningSubjectClass, setAssigningSubjectClass] = useState(null);

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000, timerProgressBar: true });
    }
    if (flash?.error) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: flash.error, showConfirmButton: false, timer: 4000, timerProgressBar: true });
    }
  }, [flash]);

  function applyFilters(overrides = {}) {
    router.get(route('admin.classes.index'), {
      search, status, per_page: perPage, ...overrides,
    }, { preserveState: true, replace: true });
  }

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div>
            <span className="eyebrow">Academics</span>
            <h1>Classes</h1>
            <p className="desc">স্কুল বা কলেজের সব ক্লাস এবং তাদের সেকশন/সাবজেক্ট এখান থেকে পরিচালনা করুন।</p>
          </div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => { setEditingItem(null); setFormOpen(true); }}>
              <Icon name="plus" /> Add Class
            </button>
          </div>
        </div>
      }
    >
      <Head title="Classes" />

      <div className="card mm-card">
        <div className="mm-filters" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div className="search">
            <Icon name="search" />
            <input
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            />
          </div>

          <select value={status} onChange={(e) => { setStatus(e.target.value); applyFilters({ status: e.target.value }); }}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select value={perPage} onChange={(e) => { setPerPage(e.target.value); applyFilters({ per_page: e.target.value }); }}>
            <option value="10">10 / page</option>
            <option value="50">50 / page</option>
            <option value="100">100 / page</option>
            <option value="500">500 / page</option>
            <option value="1000">1000 / page</option>
            <option value="all">Show All</option>
          </select>

          <button className="btn btn-outline" onClick={() => applyFilters()}>Filter</button>
        </div>

        <div className="mm-table-wrap">
          <table className="mm-table">
            <thead>
              <tr>
                <th>Class Name</th>
                <th>Numeric Name</th>
                <th style={{ width: '200px' }}>Sections</th>
                <th style={{ width: '250px' }}>Subjects</th>
                <th>Status</th>
                <th className="mm-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {classes.data.length === 0 && (
                <tr><td colSpan={6} className="mm-empty">কোনো ক্লাস পাওয়া যায়নি।</td></tr>
              )}
              {classes.data.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="mm-label-cell">
                      <Icon name="folder" className="mm-row-icon" />
                      <span style={{ fontWeight: 500 }}>{item.name}</span>
                    </div>
                  </td>
                  <td>{item.numeric_name ?? '—'}</td>
                  
                  {/* Assigned Sections Column */}
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {item.sections?.map(sec => (
                        <span key={sec.id} className="badge" style={{ background: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: '4px', fontSize: '11px' }}>{sec.name}</span>
                      ))}
                      {(!item.sections || item.sections.length === 0) && <span style={{ color: '#999', fontSize: '12px' }}>—</span>}
                    </div>
                  </td>
                  
                  {/* Assigned Subjects Column */}
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {item.subjects?.slice(0, 3).map(sub => (
                        <span key={sub.id} className="badge" style={{ background: '#e0e7ff', color: '#3730a3', padding: '2px 6px', borderRadius: '4px', fontSize: '11px' }}>{sub.name}</span>
                      ))}
                      {item.subjects?.length > 3 && <span style={{ fontSize: '11px', color: '#666', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>+{item.subjects.length - 3} more</span>}
                      {(!item.subjects || item.subjects.length === 0) && <span style={{ color: '#999', fontSize: '12px' }}>—</span>}
                    </div>
                  </td>
                  
                  <td>
                    <span className={`mm-status ${item.is_active ? 'is-active' : 'is-inactive'}`}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="mm-row-actions">
                      <button className="icon-btn" title="Assign Sections" onClick={() => setAssigningSectionClass(item)} style={{ color: '#059669' }}>
                        <Icon name="users" />
                      </button>
                      <button className="icon-btn" title="Assign Subjects" onClick={() => setAssigningSubjectClass(item)} style={{ color: '#4f46e5' }}>
                        <Icon name="book" />
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

        <Pagination meta={classes} />
      </div>

      {formOpen && <ClassFormModal item={editingItem} campuses={campuses} activeCampusId={auth?.active_campus_id} onClose={() => setFormOpen(false)} />}
      
      {assigningSectionClass && <AssignSectionModal schoolClass={assigningSectionClass} allSections={allSections} onClose={() => setAssigningSectionClass(null)} />}
      
      {assigningSubjectClass && <AssignSubjectModal schoolClass={assigningSubjectClass} allSubjects={allSubjects} onClose={() => setAssigningSubjectClass(null)} />}
      
      {deletingItem && (
        <ConfirmDeleteModal item={deletingItem} onCancel={() => setDeletingItem(null)} onConfirm={() => {
          router.delete(route('admin.classes.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) });
        }} />
      )}
    </AuthenticatedLayout>
  );
}