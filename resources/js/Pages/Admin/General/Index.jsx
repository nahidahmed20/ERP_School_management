import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import SettingFormModal from './Partials/SettingFormModal';
import ConfirmDeleteModal from './Partials/ConfirmDeleteModal';
import Pagination from '@/Components/Pagination';

export default function Index({ settings, groups, filters }) {
  const { flash } = usePage().props;

  const [search, setSearch] = useState(filters.search ?? '');
  const [group, setGroup] = useState(filters.group ?? '');
  const [status, setStatus] = useState(filters.status ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '10');

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  function applyFilters(overrides = {}) {
    router.get(route('admin.general'), {
      search, group, status, per_page: perPage, ...overrides,
    }, { preserveState: true, replace: true });
  }

  function openCreate() {
    setEditingItem(null);
    setFormOpen(true);
  }

  function openEdit(item) {
    setEditingItem(item);
    setFormOpen(true);
  }

  function confirmDelete() {
    router.delete(route('admin.general.destroy', deletingItem.id), {
      onSuccess: () => setDeletingItem(null),
    });
  }

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div>
            <span className="eyebrow">Settings &amp; Registry</span>
            <h1>General Settings</h1>
            <p className="desc">সিস্টেমের key-value ভিত্তিক configuration এখান থেকে নিয়ন্ত্রণ করুন।</p>
          </div>
          <div className="mm-head-actions">
            <button className="btn" onClick={openCreate}>
              <Icon name="plus" /> Add Setting
            </button>
          </div>
        </div>
      }
    >
      <Head title="General Settings" />

      {flash?.success && <div className="mm-toast">{flash.success}</div>}

      <div className="card mm-card">
        <div className="mm-filters">
          <div className="search">
            <Icon name="search" />
            <input
              placeholder="Search by label or key..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            />
          </div>

          <select value={group} onChange={(e) => { setGroup(e.target.value); applyFilters({ group: e.target.value }); }}>
            <option value="">All Groups</option>
            {groups.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>

          <select value={status} onChange={(e) => { setStatus(e.target.value); applyFilters({ status: e.target.value }); }}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select value={perPage} onChange={(e) => { setPerPage(e.target.value); applyFilters({ per_page: e.target.value }); }}>
            <option value="10">10 / page</option>
            <option value="20">20 / page</option>
            <option value="50">50 / page</option>
            <option value="all">Show All</option>
          </select>

          <button className="btn btn-outline" onClick={() => applyFilters()}>Filter</button>
        </div>

        <div className="mm-table-wrap">
          <table className="mm-table">
            <thead>
              <tr>
                <th>Label</th>
                <th>Group</th>
                <th>Key</th>
                <th>Type</th>
                <th>Value</th>
                <th>Status</th>
                <th className="mm-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {settings.data.length === 0 && (
                <tr><td colSpan={7} className="mm-empty">কোনো Setting পাওয়া যায়নি।</td></tr>
              )}
              {settings.data.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="mm-label-cell">
                      <Icon name="settings" className="mm-row-icon" />
                      <span>{item.label}</span>
                    </div>
                  </td>
                  <td>{item.group}</td>
                  <td><code>{item.key}</code></td>
                  <td>{item.type}</td>
                  <td>{item.value ?? '—'}</td>
                  <td>
                    <span className={`mm-status ${item.is_active ? 'is-active' : 'is-inactive'}`}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="mm-row-actions">
                      <button className="icon-btn" title="Edit" onClick={() => openEdit(item)}>
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

        <Pagination meta={settings} />
      </div>

      {formOpen && (
        <SettingFormModal item={editingItem} groups={groups} onClose={() => setFormOpen(false)} />
      )}

      {deletingItem && (
        <ConfirmDeleteModal
          item={deletingItem}
          onCancel={() => setDeletingItem(null)}
          onConfirm={confirmDelete}
        />
      )}
    </AuthenticatedLayout>
  );
}
