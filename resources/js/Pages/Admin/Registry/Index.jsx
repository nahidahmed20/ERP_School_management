import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Pagination from '@/Components/Pagination';
import Swal from 'sweetalert2'; 

const DIAG_LABELS = {
  php_version: 'PHP Version',
  laravel_version: 'Laravel Version',
  db_connection: 'DB Connection',
  db_status: 'Database Status',
  cache_driver: 'Cache Driver',
  queue_driver: 'Queue Driver',
  storage_writable: 'Storage Writable',
  debug_mode: 'Debug Mode',
  environment: 'Environment',
  server_time: 'Server Time',
};

export default function Index({ logs, filters, diagnostics }) {
  const { flash } = usePage().props;

  const [search, setSearch] = useState(filters.search ?? '');
  const [level, setLevel] = useState(filters.level ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '10');

  const [deletingItem, setDeletingItem] = useState(null);

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({
        toast: true, position: 'top-end', icon: 'success', title: flash.success,
        showConfirmButton: false, timer: 3000, timerProgressBar: true,
      });
    }
    if (flash?.error) {
      Swal.fire({
        toast: true, position: 'top-end', icon: 'error', title: flash.error,
        showConfirmButton: false, timer: 4000, timerProgressBar: true,
      });
    }
  }, [flash]);

  function applyFilters(overrides = {}) {
    router.get(route('admin.registry'), {
      search, level, per_page: perPage, ...overrides,
    }, { preserveState: true, replace: true });
  }

  function confirmDelete() {
    router.delete(route('admin.registry.destroy', deletingItem.id), {
      onSuccess: () => setDeletingItem(null),
    });
  }

  function clearAll() {
    Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: "সব Log চিরতরে মুছে ফেলা হবে!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'হ্যাঁ, সব মুছুন!',
      cancelButtonText: 'বাতিল'
    }).then((result) => {
      if (result.isConfirmed) {
        router.post(route('admin.registry.clear'));
      }
    });
  }

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div>
            <span className="eyebrow">Settings &amp; Registry</span>
            <h1>System Registry &amp; Diagnostics</h1>
            <p className="desc">সিস্টেমের স্বাস্থ্য পরীক্ষা করুন এবং কার্যকলাপের log দেখুন।</p>
          </div>
          <div className="mm-head-actions">
            <button className="btn btn-ghost" onClick={clearAll}>
              <Icon name="trash" /> Clear All Logs
            </button>
          </div>
        </div>
      }
    >
      <Head title="System Registry & Diagnostics" />

      <div className="mm-diag-grid">
        {Object.entries(diagnostics).map(([key, value]) => (
          <div className="mm-diag-card" key={key}>
            <span className="mm-diag-label">{DIAG_LABELS[key] ?? key}</span>
            <span className={`mm-diag-value ${value === 'fail' ? 'is-inactive' : ''}`}>{String(value)}</span>
          </div>
        ))}
      </div>

      <div className="card mm-card">
        <div className="mm-filters">
          <select value={perPage} onChange={(e) => { setPerPage(e.target.value); applyFilters({ per_page: e.target.value }); }}>
            <option value="10">10 / page</option>
            <option value="20">20 / page</option>
            <option value="50">50 / page</option>
            <option value="all">Show All</option>
          </select>
          <div className="search">
            <Icon name="search" />
            <input
              placeholder="Search by action or message..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            />
          </div>

          <select value={level} onChange={(e) => { setLevel(e.target.value); applyFilters({ level: e.target.value }); }}>
            <option value="">All Levels</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="critical">Critical</option>
          </select>

          <button className="btn btn-outline" onClick={() => applyFilters()}>Filter</button>
        </div>

        <div className="mm-table-wrap">
          <table className="mm-table">
            <thead>
              <tr>
                <th>Level</th>
                <th>Action</th>
                <th>Message</th>
                <th>User</th>
                <th>IP</th>
                <th>Time</th>
                <th className="mm-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {logs.data.length === 0 && (
                <tr><td colSpan={7} className="mm-empty">কোনো Log পাওয়া যায়নি।</td></tr>
              )}
              {logs.data.map((item) => (
                <tr key={item.id}>
                  <td>
                    <span className={`mm-tag mm-tag-level-${item.level}`}>{item.level}</span>
                  </td>
                  <td><code>{item.action}</code></td>
                  <td>{item.message}</td>
                  <td>{item.user?.name ?? 'System'}</td>
                  <td>{item.ip_address ?? '—'}</td>
                  <td>{item.created_at}</td>
                  <td>
                    <div className="mm-row-actions">
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

        <Pagination meta={logs} />
      </div>

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