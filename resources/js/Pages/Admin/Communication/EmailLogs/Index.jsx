import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import TemplateFormModal from './Partials/TemplateFormModal';
import Swal from 'sweetalert2';

export default function Index({ logs, templates, campuses, activeCampusId, activeTab: initialTab, filters }) {
  const { flash } = usePage().props;
  const [activeTab, setActiveTab] = useState(initialTab || 'logs');
  const [search, setSearch] = useState(filters.search ?? '');
  
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingLog, setDeletingLog] = useState(null);
  const [deletingTemplate, setDeletingTemplate] = useState(null);

  useEffect(() => {
    if (flash?.success) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000 });
  }, [flash]);

  // Handle Tab Switch smoothly
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    router.get(route('admin.email-logs.index'), { tab, search }, { preserveState: true, replace: true, preserveScroll: true });
  };

  // Search Logic
  const handleSearch = () => {
    router.get(route('admin.email-logs.index'), { tab: activeTab, search }, { preserveState: true, replace: true });
  };

  return (
    <AuthenticatedLayout>
      <Head title="Email Management" />

      <div className="w-full space-y-6 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">Communication</span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Email Logs &amp; Templates</h1>
            <p className="text-sm text-slate-500 mt-1">সেন্ট ইমেইল লগ এবং নোটিফিকেশন ইমেইল টেমপ্লেট পরিচালনা করুন।</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {activeTab === 'templates' && (
              <button
                onClick={() => { setEditingTemplate(null); setIsFormOpen(true); }}
                className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-500/20 active:scale-95"
              >
                <Icon name="plus" className="w-4 h-4" /> Add Template
              </button>
            )}
            {activeTab === 'logs' && (
              <div className="relative flex-1 sm:w-72">
                <Icon name="search" className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search email or subject..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                />
              </div>
            )}
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200">
          <button 
            onClick={() => handleTabSwitch('logs')}
            className={`flex items-center gap-2 px-6 py-3.5 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'logs' ? 'border-indigo-600 text-indigo-600 bg-white shadow-[0_-4px_6px_-2px_rgba(0,0,0,0.05)] rounded-t-xl' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
            }`}
          >
            <Icon name="mail" className="w-4 h-4" /> Sent Emails (Logs)
          </button>
          <button 
            onClick={() => handleTabSwitch('templates')}
            className={`flex items-center gap-2 px-6 py-3.5 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'templates' ? 'border-indigo-600 text-indigo-600 bg-white shadow-[0_-4px_6px_-2px_rgba(0,0,0,0.05)] rounded-t-xl' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
            }`}
          >
            <Icon name="layout" className="w-4 h-4" /> Email Templates
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5 overflow-hidden">
          
          {/* --- LOGS TAB CONTENT --- */}
          {activeTab === 'logs' && (
            <div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50">
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-40">Date &amp; Time</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Recipient Email</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Subject</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Status</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right w-24">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {logs.data.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3 border border-slate-100">
                            <Icon name="mail" className="w-8 h-8 text-slate-300" />
                          </div>
                          <p className="text-sm font-semibold text-slate-600">No email logs found.</p>
                          <p className="text-xs text-slate-400 mt-1">Sent emails will appear here</p>
                        </td>
                      </tr>
                    ) : (
                      logs.data.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-6 py-4 font-mono text-xs">
                            <strong className="text-slate-900 block font-bold">{new Date(item.created_at).toLocaleDateString('en-GB')}</strong>
                            <span className="text-slate-500 block mt-0.5">{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </td>
                          <td className="px-6 py-4">
                            <strong className="text-sm font-bold text-slate-900">{item.recipient_email}</strong>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-slate-700">
                            {item.subject}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase border ${
                              item.status === 'Sent' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}>
                              {item.status}
                            </span>
                            {item.status === 'Failed' && <div className="text-[10px] text-rose-500 mt-1 font-medium line-clamp-1" title={item.error_message}>{item.error_message}</div>}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => setDeletingLog(item)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete Log">
                              <Icon name="trash" className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-slate-100 bg-white px-6 py-4">
                <Pagination meta={logs} />
              </div>
            </div>
          )}

          {/* --- TEMPLATES TAB CONTENT --- */}
          {activeTab === 'templates' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[25%]">Template Name</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[35%]">Subject Line</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Variables Used</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right w-28">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {templates.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                        <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3 border border-slate-100">
                          <Icon name="layout" className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-sm font-semibold text-slate-600">No templates created yet.</p>
                        <p className="text-xs text-slate-400 mt-1">Create your first email template</p>
                      </td>
                    </tr>
                  ) : (
                    templates.map((item) => (
                      <tr key={item.id} className={`hover:bg-slate-50/60 transition-colors ${!item.is_active ? 'opacity-60' : ''}`}>
                        <td className="px-6 py-4">
                          <strong className="text-sm font-bold text-slate-900 block">{item.name}</strong>
                          {!item.campus_id && <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-bold uppercase mt-1 inline-block">Global</span>}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                          {item.subject}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {item.variables ? item.variables.split(',').map(v => (
                              <code key={v} className="text-[10px] font-bold font-mono bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-100">
                                {v.trim()}
                              </code>
                            )) : <span className="text-xs text-slate-400 italic">None</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase border ${
                            item.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}>
                            {item.is_active ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button onClick={() => { setEditingTemplate(item); setIsFormOpen(true); }} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Edit Template">
                              <Icon name="edit" className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeletingTemplate(item)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete Template">
                              <Icon name="trash" className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>

      {isFormOpen && <TemplateFormModal item={editingTemplate} campuses={campuses} activeCampusId={activeCampusId} onClose={() => setIsFormOpen(false)} />}
      
      {deletingLog && (
        <ConfirmDeleteModal 
          item={{ name: 'this email log' }} 
          message="Delete this log record?" 
          onCancel={() => setDeletingLog(null)} 
          onConfirm={() => { router.delete(route('admin.email-logs.destroy', deletingLog.id), { onSuccess: () => setDeletingLog(null) }); }} 
        />
      )}

      {deletingTemplate && (
        <ConfirmDeleteModal 
          item={{ name: deletingTemplate.name }} 
          message="Are you sure you want to delete this template?" 
          onCancel={() => setDeletingTemplate(null)} 
          onConfirm={() => { router.delete(route('admin.email-templates.destroy', deletingTemplate.id), { onSuccess: () => setDeletingTemplate(null) }); }} 
        />
      )}
    </AuthenticatedLayout>
  );
}