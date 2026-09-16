import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const inputClasses = 'mt-1 w-full rounded-xl border-slate-300 text-sm';

const Box = ({ title, children }) => (
    <section className="rounded-2xl border bg-white p-4 sm:p-5 shadow-sm overflow-hidden">
        <h2 className="mb-4 font-bold text-lg">{title}</h2>
        {children}
    </section>
);

export default function Index({ users, sessions, backups, failedJobs, queueCount, errors, health, retention, drTests }) {
    const b = useForm({ type: 'Full Backup' });
    const r = useForm({ scope: 'failed_logins', retention_days: 180, confirm: false });

    return (
        <AuthenticatedLayout>
            <Head title="Security & Operations" />
            <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">

                {/* Header Section */}
                <div>
                    <h1 className="text-xl sm:text-2xl font-black">Security & Operations</h1>
                    <p className="text-sm text-slate-500">Identity protection, recoverability, queues, health and privacy.</p>
                </div>

                {/* Top Metrics Cards - Fixed for Mobile (1 col -> 2 col -> 4 col) */}
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        ['Active sessions', sessions.length],
                        ['Queued jobs', queueCount],
                        ['Failed jobs', failedJobs.length],
                        ['Recent errors', errors.length]
                    ].map(x => (
                        <div className="rounded-2xl bg-slate-900 p-4 text-white" key={x[0]}>
                            <small className="text-slate-300">{x[0]}</small>
                            <b className="block text-2xl">{x[1]}</b>
                        </div>
                    ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">

                    {/* Backup Section */}
                    <Box title="Encrypted Backup & Disaster Recovery">
                        <form onSubmit={e => { e.preventDefault(); b.post(route('admin.security.backups.create')) }} className="flex flex-col sm:flex-row gap-2">
                            <select className={inputClasses} value={b.data.type} onChange={e => b.setData('type', e.target.value)}>
                                <option>Database</option>
                                <option>Files</option>
                                <option>Full Backup</option>
                            </select>
                            <button className="mt-1 w-full sm:w-auto whitespace-nowrap rounded-xl bg-indigo-600 px-4 py-2 text-white">Create</button>
                        </form>

                        <div className="mt-4 space-y-2">
                            {backups.map(x => (
                                <div className="rounded-xl border p-3 text-sm flex flex-col gap-2" key={x.id}>
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                        <span className="break-all">
                                            <b>{x.file_name}</b>
                                            <small className="block text-slate-500">{x.type} · {x.status} · {x.file_size}</small>
                                        </span>
                                        <button onClick={() => router.post(route('admin.security.backups.verify', x.id))} className="font-bold text-emerald-700 whitespace-nowrap">Verify</button>
                                    </div>

                                    {x.status === 'Completed' && (
                                        <form className="mt-2 flex flex-col sm:flex-row gap-2" onSubmit={e => {
                                            e.preventDefault();
                                            const password = e.currentTarget.password.value;
                                            if (confirm('This will overwrite matching database records. Continue?')) {
                                                router.post(route('admin.security.backups.restore', x.id), { confirmation: 'RESTORE', password })
                                            }
                                        }}>
                                            <input name="password" type="password" required className="w-full rounded-lg border-slate-300 text-xs" placeholder="Current password" />
                                            <button className="w-full sm:w-auto text-xs font-bold text-rose-700 bg-rose-50 px-3 py-2 rounded-lg whitespace-nowrap">RESTORE</button>
                                        </form>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Box>

                    {/* System Health Section */}
                    <Box title="System Health & Queue">
                        <button onClick={() => router.post(route('admin.security.health'))} className="w-full sm:w-auto rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white">Run health check</button>
                        <div className="mt-4 space-y-2">
                            {health.slice(0, 10).map(x => (
                                <div key={x.id} className="flex justify-between items-center rounded-lg bg-slate-50 p-2 text-sm">
                                    <span className="truncate pr-2">{x.component}</span>
                                    <b className={x.status === 'healthy' ? 'text-emerald-700' : 'text-rose-700'}>{x.status}</b>
                                </div>
                            ))}
                            {failedJobs.map(x => (
                                <div key={x.id} className="rounded-lg border p-2 text-xs">
                                    <div className="flex justify-between mb-1">
                                        <b>Failed job #{x.id}</b>
                                        <button onClick={() => router.post(route('admin.security.jobs.retry', x.uuid))} className="text-indigo-700 font-bold">Retry</button>
                                    </div>
                                    <p className="truncate text-slate-500">{x.exception}</p>
                                </div>
                            ))}
                        </div>
                    </Box>
                </div>

                {/* Users Table */}
                <Box title="User 2FA, Lockout & Password Expiry">
                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                        <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="p-2 whitespace-nowrap">User</th>
                                        <th className="p-2 whitespace-nowrap">2FA</th>
                                        <th className="p-2 whitespace-nowrap">Password expiry</th>
                                        <th className="p-2 whitespace-nowrap">Locked</th>
                                        <th className="p-2 whitespace-nowrap">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr className="border-b" key={u.id}>
                                            <td className="p-2">
                                                <b>{u.name}</b>
                                                <small className="block text-slate-500">{u.email}</small>
                                            </td>
                                            <td className="p-2">{u.two_factor_enabled ? 'Enabled' : 'Off'}</td>
                                            <td className="p-2">{u.password_expires_days || 'Default'} days</td>
                                            <td className="p-2">{u.locked_until || 'No'}</td>
                                            <td className="p-2">
                                                <button onClick={() => router.patch(route('admin.security.users.policy', u.id), { two_factor_enabled: !u.two_factor_enabled, password_expires_days: u.password_expires_days || 90, unlock: true })} className="font-bold text-indigo-700 whitespace-nowrap">Toggle 2FA / Unlock</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Box>

                <div className="grid gap-6 lg:grid-cols-2">

                    {/* Active Sessions */}
                    <Box title="Active Session Management">
                        <div className="space-y-2">
                            {sessions.map(x => (
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 rounded-xl border p-3 text-sm" key={x.id}>
                                    <div className="min-w-0 flex-1">
                                        <b>{x.name || 'Guest'}</b> <span className="text-slate-500">· {x.ip_address}</span>
                                        <small className="block truncate text-slate-500" title={x.user_agent}>{x.user_agent}</small>
                                    </div>
                                    <button onClick={() => router.delete(route('admin.security.sessions.revoke', x.id))} className="font-bold text-rose-700 sm:ml-4 whitespace-nowrap">Revoke</button>
                                </div>
                            ))}
                        </div>
                    </Box>

                    {/* Data Retention */}
                    <Box title="Data Retention / Privacy">
                        <form onSubmit={e => { e.preventDefault(); r.post(route('admin.security.retention')) }} className="flex flex-col gap-2">
                            <select className={inputClasses} value={r.data.scope} onChange={e => r.setData('scope', e.target.value)}>
                                <option>failed_logins</option>
                                <option>login_history</option>
                                <option>audit_logs</option>
                                <option>error_events</option>
                            </select>
                            <input className={inputClasses} type="number" min="30" value={r.data.retention_days} onChange={e => r.setData('retention_days', e.target.value)} />
                            <label className="mt-2 flex items-center gap-2 text-sm cursor-pointer">
                                <input type="checkbox" className="rounded" checked={r.data.confirm} onChange={e => r.setData('confirm', e.target.checked)} />
                                {r.data.confirm ? <span className="text-rose-600 font-bold">Delete matching records</span> : 'Preview only'}
                            </label>
                            <button className="mt-2 w-full sm:w-auto rounded-xl bg-slate-900 px-4 py-2 text-white">Run retention</button>
                        </form>
                        <div className="mt-4 text-xs text-slate-500 space-y-1">
                            {retention.map(x => <p key={x.id}>{x.scope}: {x.details}</p>)}
                        </div>
                    </Box>
                </div>

                <Box title="Disaster Recovery Verification History">
                    <div className="space-y-2">
                        {drTests.map(x => (
                            <p key={x.id} className="rounded bg-slate-50 p-3 text-sm flex flex-col sm:flex-row sm:items-center sm:gap-2">
                                <span className="text-slate-500">Backup #{x.saas_backup_id}</span>
                                <b className="text-slate-800">{x.status}</b>
                                <span className="truncate">{x.details}</span>
                            </p>
                        ))}
                    </div>
                </Box>
            </main>
        </AuthenticatedLayout>
    );
}
