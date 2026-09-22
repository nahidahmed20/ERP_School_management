import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Swal from 'sweetalert2';

export default function SecurityOperationsIndex({
  users, sessions, backups, failedJobs, queueCount, systemErrors, health, retention, drTests
}) {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Tabs Definition
  const tabs = [
    { id: 'dashboard', name: 'System Health', icon: 'activity' },
    { id: 'sessions', name: 'Active Sessions', icon: 'monitor' },
    { id: 'users', name: 'User Policies', icon: 'shield' },
    { id: 'backups', name: 'Backups & DR', icon: 'database' },
    { id: 'logs', name: 'Logs & Retention', icon: 'archive' },
  ];

  // ===================== ACTIONS ===================== //

  const runHealthCheck = () => {
    router.post(route('admin.security-operations.health'), {}, {
      onSuccess: () => Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Health checks completed', showConfirmButton: false, timer: 3000 })
    });
  };

  const revokeSession = (id) => {
    Swal.fire({
      title: 'Revoke Session?',
      text: "This user will be logged out immediately.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      confirmButtonText: 'Yes, Revoke'
    }).then((result) => {
      if (result.isConfirmed) {
        router.delete(route('admin.security-operations.sessions.revoke', id), {
          onSuccess: () => Swal.fire('Revoked!', 'Session has been terminated.', 'success')
        });
      }
    });
  };

  const retryJob = (id) => {
    router.post(route('admin.security-operations.jobs.retry', id), {}, {
      onSuccess: () => Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Job queued for retry', showConfirmButton: false, timer: 3000 })
    });
  };

  // ===================== RENDER COMPONENTS ===================== //

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500">Pending Queue Jobs</p>
            <h3 className="text-3xl font-black text-slate-800">{queueCount}</h3>
          </div>
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center"><Icon name="cpu" /></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500">Failed Jobs</p>
            <h3 className="text-3xl font-black text-rose-600">{failedJobs?.length || 0}</h3>
          </div>
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center"><Icon name="alert-triangle" /></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500">System Errors</p>
        
            <h3 className="text-3xl font-black text-amber-600">{systemErrors?.length || 0}</h3>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center"><Icon name="x-octagon" /></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
          <h3 className="font-bold text-slate-800">Recent Health Checks</h3>
          <button onClick={runHealthCheck} className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 shadow-sm flex items-center gap-2 transition-colors">
            <Icon name="refresh-cw" className="w-3 h-3" /> Run Health Check
          </button>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-3 font-semibold">Component</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold">Response Time</th>
                <th className="px-6 py-3 font-semibold">Message</th>
                <th className="px-6 py-3 font-semibold">Checked At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {health?.slice(0, 10).map((h, i) => (
                <tr key={i} className="hover:bg-slate-50/50">
                  <td className="px-6 py-3 font-medium text-slate-800 uppercase">{h.component}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 text-[10px] font-bold rounded-md uppercase ${h.status === 'healthy' ? 'bg-emerald-100 text-emerald-700' : h.status === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                      {h.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 font-mono text-slate-600">{h.response_ms} ms</td>
                  <td className="px-6 py-3 text-slate-500">{h.message || '-'}</td>
                  <td className="px-6 py-3 text-slate-500 text-xs">{new Date(h.checked_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSessions = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
        <h3 className="font-bold text-slate-800">Active User Sessions ({sessions?.length})</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-6 py-3 font-semibold">User</th>
              <th className="px-6 py-3 font-semibold">IP Address</th>
              <th className="px-6 py-3 font-semibold">Device / Browser</th>
              <th className="px-6 py-3 font-semibold">Last Activity</th>
              <th className="px-6 py-3 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sessions?.map((session) => (
              <tr key={session.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-3 font-bold text-slate-800">{session.name || 'Guest'}</td>
                <td className="px-6 py-3 font-mono text-slate-600">{session.ip_address}</td>
                <td className="px-6 py-3 text-slate-500 text-xs max-w-xs truncate" title={session.user_agent}>{session.user_agent}</td>
                <td className="px-6 py-3 text-slate-500 text-xs">{new Date(session.last_activity * 1000).toLocaleString()}</td>
                <td className="px-6 py-3 text-right">
                  <button onClick={() => revokeSession(session.id)} className="px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-md transition-colors">Revoke</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderBackups = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-bold text-slate-800 mb-4">Create Manual Backup</h3>
        <BackupForm />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
          <h3 className="font-bold text-slate-800">Backup Archives</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-3 font-semibold">File Name</th>
                <th className="px-6 py-3 font-semibold">Type</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold">Date</th>
                <th className="px-6 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {backups?.map((backup) => (
                    <tr key={backup.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-3 font-mono text-xs text-slate-700">{backup.file_name}</td>
                    <td className="px-6 py-3 font-semibold text-slate-700">{backup.type}</td>
                    <td className="px-6 py-3">
                        <span className={`px-2 py-1 text-[10px] font-bold rounded-md uppercase ${backup.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : backup.status === 'Failed' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                        {backup.status}
                        </span>
                        {backup.status === 'Failed' && backup.error_message && (
                        <div className="text-[10px] text-rose-500 mt-1 max-w-[200px] truncate" title={backup.error_message}>
                            {backup.error_message}
                        </div>
                        )}
                    </td>
                    <td className="px-6 py-3 text-slate-500 text-xs">{new Date(backup.created_at).toLocaleString()}</td>
                    <td className="px-6 py-3 text-right space-x-2 flex justify-end items-center">
                  
                        <a 
                            href={route('admin.security-operations.backup.download', backup.id)} 
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${backup.status === 'Completed' ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' : 'text-slate-400 bg-slate-50 pointer-events-none'}`}
                            download
                        >
                            Download
                        </a>
                        
                        <VerifyButton backup={backup} />
                        <RestoreButton backup={backup} />
                        </td>
                    </tr>
                ))}
                </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <AuthenticatedLayout>
      <Head title="Security Operations" />

      <div className="w-full space-y-6 sm:px-6 lg:px-8 py-8">
        <div>
          <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">System Administration</span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Security Operations Center</h1>
        </div>

        {/* Custom Tabs */}
        <div className="flex overflow-x-auto space-x-2 border-b border-slate-200 pb-1 mb-6 custom-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Icon name={tab.icon} className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
        </div>

        {/* Tab Content Rendering */}
        <div className="animate-in fade-in duration-300">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'sessions' && renderSessions()}
          {activeTab === 'backups' && renderBackups()}
          {activeTab === 'users' && <UserPoliciesTable users={users} />}
          {activeTab === 'logs' && <LogsAndRetention systemErrors={systemErrors} failedJobs={failedJobs} retryJob={retryJob} />}
        </div>

      </div>
    </AuthenticatedLayout>
  );
}


// ==================== SUB COMPONENTS ==================== //

// 1. User Policy Form
const UserPoliciesTable = ({ users }) => {
  const [editingUser, setEditingUser] = useState(null);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
        <h3 className="font-bold text-slate-800">User Security Policies</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-6 py-3 font-semibold">User</th>
              <th className="px-6 py-3 font-semibold">Roles</th>
              <th className="px-6 py-3 font-semibold">2FA Enabled</th>
              <th className="px-6 py-3 font-semibold">Status (Lock)</th>
              <th className="px-6 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users?.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-3">
                  <div className="font-bold text-slate-800">{user.name}</div>
                  <div className="text-xs text-slate-500">{user.email}</div>
                </td>
                <td className="px-6 py-3 text-xs">{user.roles?.map(r => r.name).join(', ') || '-'}</td>
                <td className="px-6 py-3 text-xs">
                  {user.two_factor_enabled ? <span className="text-emerald-600 font-bold">Enabled</span> : <span className="text-slate-400">Disabled</span>}
                </td>
                <td className="px-6 py-3 text-xs">
                  {user.locked_until && new Date(user.locked_until) > new Date()
                    ? <span className="text-rose-600 font-bold bg-rose-50 px-2 py-1 rounded">Locked</span>
                    : <span className="text-emerald-600">Active</span>}
                </td>
                <td className="px-6 py-3 text-right">
                  <button onClick={() => setEditingUser(user)} className="px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors">Edit Policy</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingUser && <EditUserPolicyModal user={editingUser} onClose={() => setEditingUser(null)} />}
    </div>
  );
};

const EditUserPolicyModal = ({ user, onClose }) => {
  const { data, setData, put, processing } = useForm({
    two_factor_enabled: user.two_factor_enabled === 1 || user.two_factor_enabled === true,
    password_expires_days: user.password_expires_days || '',
    unlock: false,
  });

  const submit = (e) => {
    e.preventDefault();
    put(route('admin.security-operations.users.policy', user.id), {
      onSuccess: () => {
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Policy updated', showConfirmButton: false, timer: 3000 });
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-900">Edit Policy: {user.name}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors"><Icon name="close" className="w-5 h-5" /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={data.two_factor_enabled} onChange={e => setData('two_factor_enabled', e.target.checked)} className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" />
            <span className="text-sm font-semibold text-slate-700">Enforce Two-Factor Authentication</span>
          </label>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Password Expires In (Days)</label>
            <input type="number" value={data.password_expires_days} onChange={e => setData('password_expires_days', e.target.value)} placeholder="e.g. 90" className="w-full px-4 py-2 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg outline-none transition-all" />
          </div>
          {user.locked_until && new Date(user.locked_until) > new Date() && (
            <label className="flex items-center gap-3 p-3 bg-rose-50 border border-rose-100 rounded-lg cursor-pointer mt-4">
              <input type="checkbox" checked={data.unlock} onChange={e => setData('unlock', e.target.checked)} className="w-5 h-5 rounded border-rose-300 text-rose-600 focus:ring-rose-600" />
              <span className="text-sm font-bold text-rose-700">Unlock User Account Now</span>
            </label>
          )}
          <button type="submit" disabled={processing} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl mt-4 transition-all active:scale-95 disabled:opacity-70">Save Changes</button>
        </form>
      </div>
    </div>
  );
};

// 2. Backup Action Form
const BackupForm = () => {
  const [type, setType] = useState('Database');
  const [processing, setProcessing] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    setProcessing(true);
    router.post(route('admin.security-operations.backup'), { type: type }, {
      onSuccess: () => Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Backup Triggered', showConfirmButton: false, timer: 3000 }),
      onFinish: () => setProcessing(false)
    });
  };

  return (
    <form onSubmit={submit} className="flex flex-col sm:flex-row items-center gap-4">
      <select value={type} onChange={e => setType(e.target.value)} className="w-full sm:w-64 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
        <option value="Database">Database Backup</option>
        <option value="Files">Files & Storage Backup</option>
        <option value="Full Backup">Full System Backup</option>
      </select>
      <button type="submit" disabled={processing} className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-70">
        {processing ? 'Processing...' : 'Run Backup Now'}
      </button>
    </form>
  );
};

// Verify Button Component
const VerifyButton = ({ backup }) => {
  const handleVerify = () => {
    Swal.fire({
      title: 'Verifying...',
      html: 'Checking archive integrity and checksum',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });

    router.post(route('admin.security-operations.backup.verify', backup.id), {}, {
      onSuccess: (page) => {
        if (page.props.flash?.error) {
          Swal.fire('Failed!', page.props.flash.error, 'error');
        } else {
          Swal.fire('Verified!', page.props.flash?.success || 'Backup verification passed.', 'success');
        }
      },
      onError: () => Swal.fire('Error', 'Verification request failed.', 'error')
    });
  };

  return (
    <button onClick={handleVerify} className="px-3 py-1.5 text-xs font-bold text-sky-600 bg-sky-50 hover:bg-sky-100 rounded-md transition-colors">
      Verify
    </button>
  );
};

// 3. Restore Button with Confirmation
const RestoreButton = ({ backup }) => {
  const handleRestore = () => {
    Swal.fire({
      title: 'DANGER: Database Restore',
      html: `
        <p class="text-sm text-rose-600 mb-4 font-semibold">You are about to overwrite live database records.</p>
        <p class="text-xs text-slate-500 mb-1 text-left">1. Enter your account login password:</p>
        <input type="password" id="swal-password" class="swal2-input !mt-0 !mb-4 text-sm" placeholder="Your Login Password">
        <p class="text-xs text-slate-500 mb-1 text-left">2. Type RESTORE to confirm:</p>
        <input type="text" id="swal-confirm" class="swal2-input !mt-0 text-sm font-mono uppercase" placeholder="RESTORE">
      `,
      icon: 'error',
      showCancelButton: true,
      confirmButtonText: 'Execute Restore',
      confirmButtonColor: '#e11d48',
      preConfirm: () => {
        const password = Swal.getPopup().querySelector('#swal-password').value;
        const confirm = Swal.getPopup().querySelector('#swal-confirm').value;
        if (!password || confirm !== 'RESTORE') {
          Swal.showValidationMessage(`Confirmation word must be 'RESTORE' and password is required`);
        }
        return { password, confirmation: confirm };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({ title: 'Restoring...', html: 'Please wait while backup is applied', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); }});
        
        router.post(route('admin.security-operations.backup.restore', backup.id), {
          password: result.value.password,
          confirmation: result.value.confirmation
        }, {
          onSuccess: (page) => {
            // ব্যাকএন্ড থেকে আসা error বা success মেসেজ ধরা হচ্ছে
            if (page.props.flash?.error) {
              Swal.fire('Failed!', page.props.flash.error, 'error');
            } else {
              Swal.fire('Restored!', page.props.flash?.success || 'The backup has been restored successfully.', 'success');
            }
          },
          onError: (errors) => {
            // ভ্যালিডেশন এরর (যেমন: পাসওয়ার্ড ভুল হলে)
            Swal.fire('Validation Error', errors.password || errors.confirmation || 'Restore failed.', 'error');
          }
        });
      }
    });
  };

  return (
    <button onClick={handleRestore} disabled={backup.status !== 'Completed'} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${backup.status === 'Completed' ? 'text-rose-600 bg-rose-50 hover:bg-rose-100' : 'text-slate-400 bg-slate-50 cursor-not-allowed'}`}>
      Restore
    </button>
  );
};

// 4. Logs and Data Retention
const LogsAndRetention = ({ systemErrors, failedJobs, retryJob }) => {
  const { data, setData, post, processing } = useForm({ scope: 'login_history', retention_days: 90, confirm: false });

  const runRetention = (e) => {
    e.preventDefault();
    post(route('admin.security-operations.retention'), {
      onSuccess: () => Swal.fire('Success', 'Data retention policy executed.', 'success')
    });
  };

  return (
    <div className="space-y-6">
      {/* Retention Form */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-slate-800 mb-4">Execute Data Retention Policy</h3>
        <form onSubmit={runRetention} className="flex flex-col sm:flex-row items-center gap-4">
          <select value={data.scope} onChange={e => setData('scope', e.target.value)} className="w-full sm:w-auto px-4 py-2 border border-slate-200 rounded-xl bg-slate-50 text-sm outline-none focus:border-indigo-500">
            <option value="login_history">Login History</option>
            <option value="failed_logins">Failed Logins</option>
            <option value="audit_logs">Audit Logs</option>
            <option value="error_events">System Errors</option>
          </select>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-sm font-semibold text-slate-600">Delete records older than</span>
            <input type="number" value={data.retention_days} onChange={e => setData('retention_days', e.target.value)} className="w-20 px-3 py-2 border border-slate-200 outline-none focus:border-indigo-500 rounded-xl text-center text-sm" />
            <span className="text-sm font-semibold text-slate-600">days</span>
          </div>
          <label className="flex items-center gap-2 ml-auto cursor-pointer">
            <input type="checkbox" checked={data.confirm} onChange={e => setData('confirm', e.target.checked)} className="rounded border-slate-300 text-rose-600 focus:ring-rose-600" />
            <span className="text-sm font-bold text-rose-600">Confirm Deletion</span>
          </label>
          <button type="submit" disabled={processing} className="w-full sm:w-auto px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-sm transition-all active:scale-95 disabled:opacity-70">Execute</button>
        </form>
      </div>

      {/* Failed Jobs */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
          <h3 className="font-bold text-slate-800">Failed Queue Jobs</h3>
        </div>
        <div className="overflow-x-auto max-h-64 custom-scrollbar">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 sticky top-0 shadow-sm z-10">
              <tr>
                <th className="px-6 py-3 font-semibold">Queue</th>
                <th className="px-6 py-3 font-semibold">Payload (Class)</th>
                <th className="px-6 py-3 font-semibold">Failed At</th>
                <th className="px-6 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {failedJobs?.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-3 font-medium text-slate-800">{job.queue}</td>
                  <td className="px-6 py-3 text-xs font-mono text-slate-500 max-w-xs truncate" title={job.payload}>{JSON.parse(job.payload)?.displayName || 'Unknown Class'}</td>
                  <td className="px-6 py-3 text-xs text-slate-500">{new Date(job.failed_at).toLocaleString()}</td>
                  <td className="px-6 py-3 text-right">
                    <button onClick={() => retryJob(job.uuid || job.id)} className="text-xs font-bold text-indigo-600 px-3 py-1 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors">Retry</button>
                  </td>
                </tr>
              ))}
              {!failedJobs?.length && <tr><td colSpan="4" className="text-center py-8 text-slate-500 font-medium">No failed jobs found. All systems operational.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
