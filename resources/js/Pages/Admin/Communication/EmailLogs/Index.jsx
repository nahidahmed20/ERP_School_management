import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import TemplateFormModal from './Partials/TemplateFormModal';
import Swal from 'sweetalert2';

export default function Index({ logs, templates, activeTab: initialTab, filters }) {
  const { flash } = usePage().props;
  const [activeTab, setActiveTab] = useState(initialTab);
  const [search, setSearch] = useState(filters.search ?? '');
  
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingLog, setDeletingLog] = useState(null);
  const [deletingTemplate, setDeletingTemplate] = useState(null);

  useEffect(() => {
    if (flash?.success) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000 });
  }, [flash]);

  // Update URL silently when tab changes
  useEffect(() => {
    router.get(route('admin.email-logs.index'), { tab: activeTab, search }, { preserveState: true, replace: true, preserveScroll: true });
  }, [activeTab]);

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div><span className="eyebrow">Communication</span><h1>Email Logs & Templates</h1></div>
          <div className="mm-head-actions">
            {activeTab === 'templates' && (
              <button className="btn" onClick={() => { setEditingTemplate(null); setIsFormOpen(true); }}>
                <Icon name="plus" /> Add Template
              </button>
            )}
          </div>
        </div>
      }
    >
      <Head title="Email Management" />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <button 
          onClick={() => setActiveTab('logs')}
          style={{ padding: '10px 15px', fontWeight: 'bold', borderBottom: activeTab === 'logs' ? '2px solid #4f46e5' : '2px solid transparent', color: activeTab === 'logs' ? '#4f46e5' : '#64748b', transition: 'all 0.2s' }}
        >
          <Icon name="mail" style={{ width: '16px', display: 'inline-block', marginRight: '5px' }} /> Sent Emails (Logs)
        </button>
        <button 
          onClick={() => setActiveTab('templates')}
          style={{ padding: '10px 15px', fontWeight: 'bold', borderBottom: activeTab === 'templates' ? '2px solid #4f46e5' : '2px solid transparent', color: activeTab === 'templates' ? '#4f46e5' : '#64748b', transition: 'all 0.2s' }}
        >
          <Icon name="layout" style={{ width: '16px', display: 'inline-block', marginRight: '5px' }} /> Email Templates
        </button>
      </div>

      <div className="card mm-card">
        
        {/* --- LOGS TAB CONTENT --- */}
        {activeTab === 'logs' && (
          <div>
            <div className="mm-table-wrap">
              <table className="mm-table">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Recipient Email</th>
                    <th>Subject</th>
                    <th>Status</th>
                    <th className="mm-actions-col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.data.length === 0 && <tr><td colSpan={5} className="mm-empty">No email logs found.</td></tr>}
                  {logs.data.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong style={{ color: '#334155' }}>{new Date(item.created_at).toLocaleDateString()}</strong>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{new Date(item.created_at).toLocaleTimeString()}</div>
                      </td>
                      <td><strong style={{ color: '#0f172a' }}>{item.recipient_email}</strong></td>
                      <td>{item.subject}</td>
                      <td>
                        <span className={`badge-outline ${item.status === 'Sent' ? 'border-green-600 text-green-700' : 'border-red-600 text-red-700'}`}>
                          {item.status}
                        </span>
                        {item.status === 'Failed' && <div style={{ fontSize: '10px', color: '#dc2626', marginTop: '3px' }}>{item.error_message}</div>}
                      </td>
                      <td>
                        <button className="icon-btn icon-btn-danger" onClick={() => setDeletingLog(item)}><Icon name="trash" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination meta={logs} />
          </div>
        )}

        {/* --- TEMPLATES TAB CONTENT --- */}
        {activeTab === 'templates' && (
          <div className="mm-table-wrap">
            <table className="mm-table">
              <thead>
                <tr>
                  <th>Template Name</th>
                  <th>Subject Line</th>
                  <th>Variables Used</th>
                  <th>Status</th>
                  <th className="mm-actions-col">Action</th>
                </tr>
              </thead>
              <tbody>
                {templates.length === 0 && <tr><td colSpan={5} className="mm-empty">No templates created yet.</td></tr>}
                {templates.map((item) => (
                  <tr key={item.id}>
                    <td><strong style={{ color: '#0f172a' }}>{item.name}</strong></td>
                    <td>{item.subject}</td>
                    <td>
                      <code style={{ fontSize: '12px', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: '#475569' }}>
                        {item.variables || 'None'}
                      </code>
                    </td>
                    <td>
                      <span className={`badge-outline ${item.is_active ? 'border-green-600 text-green-600' : 'border-gray-500 text-gray-500'}`}>
                        {item.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td>
                      <div className="mm-row-actions">
                        <button className="icon-btn" onClick={() => { setEditingTemplate(item); setIsFormOpen(true); }}><Icon name="edit" /></button>
                        <button className="icon-btn icon-btn-danger" onClick={() => setDeletingTemplate(item)}><Icon name="trash" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {isFormOpen && <TemplateFormModal item={editingTemplate} onClose={() => setIsFormOpen(false)} />}
      
      {deletingLog && (
        <ConfirmDeleteModal item={{ name: 'this email log' }} message="Delete this log record?" onCancel={() => setDeletingLog(null)} onConfirm={() => { router.delete(route('admin.email-logs.destroy', deletingLog.id), { onSuccess: () => setDeletingLog(null) }); }} />
      )}

      {deletingTemplate && (
        <ConfirmDeleteModal item={{ name: deletingTemplate.name }} message="Are you sure you want to delete this template?" onCancel={() => setDeletingTemplate(null)} onConfirm={() => { router.delete(route('admin.email-templates.destroy', deletingTemplate.id), { onSuccess: () => setDeletingTemplate(null) }); }} />
      )}
    </AuthenticatedLayout>
  );
}