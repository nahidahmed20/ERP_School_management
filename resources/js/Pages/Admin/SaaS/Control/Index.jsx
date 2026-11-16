import React, { useState, useEffect } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Swal from 'sweetalert2';

const C = 'mt-1.5 w-full rounded-xl border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 shadow-sm focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/15';

const Box = ({ title, icon = 'building', children }) => (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-emerald-50/80 via-white to-white px-4 py-4 sm:px-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800"><Icon name={icon} className="h-5 w-5" /></span>
            <h2 className="font-extrabold text-base text-slate-900 sm:text-lg">{title}</h2>
        </div>
        <div className="p-4 sm:p-5">{children}</div>
    </section>
);

const Btn = ({ children }) => (
    <button className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-700/30 sm:w-auto">
        {children}
    </button>
);

export default function Index({ tenants, plans, usage, invoices, backups, report }) {
    const { flash } = usePage().props;
    const [tenantToDelete, setTenantToDelete] = useState(null);

    useEffect(() => {
        if (flash?.success) {
            Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 4000 });
        }
        if (flash?.error) {
            Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: flash.error, showConfirmButton: false, timer: 5000 });
        }
        if (flash?.warning) {
            Swal.fire({ toast: true, position: 'top-end', icon: 'warning', title: flash.warning, showConfirmButton: false, timer: 5000 });
        }
    }, [flash]);

    const today = new Date().toISOString().slice(0, 10);

    const pv = useForm({
        company_name: '', domain: '', admin_email: '', admin_phone: '', password: '', saas_plan_id: '', valid_until: ''
    });

    const lim = useForm({
        plan_id: '', max_campuses: 1, max_students: 500, storage_limit_mb: 1024,
        features: { transport: true, hostel: true, library: true, cafeteria: true, medical: true, communication: true, reports: true }
    });

    const inv = useForm({
        tenant_id: '', period_start: today, period_end: '', due_date: '', amount: ''
    });

    const post = (f, n, p = {}) => e => {
        e.preventDefault();
        f.post(route(n, p), { preserveScroll: true, onSuccess: () => f.reset() });
    };

    return (
        <AuthenticatedLayout>
            <Head title="SaaS Control Center" />

            <main className="w-full max-w-none space-y-6 px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
                
                {/* Header */}
                <div className="rounded-3xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-slate-50 px-5 py-6 shadow-sm sm:px-7">
                    <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-800">Platform administration</p>
                    <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">SaaS / Multi-campus Control</h1>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Manage tenants, subscriptions, campus limits, billing and backups from one workspace.</p>
                </div>

                {/* Top Statistics Cards */}
                <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                    {[
                        ['Tenants', tenants.length, 'building', 'emerald'],
                        ['Active', tenants.filter(x => x.status === 'Active').length, 'check-circle', 'blue'],
                        ['Campuses', tenants.reduce((n, x) => n + (x.campuses?.length || 0), 0), 'home', 'violet'],
                        ['Unpaid invoices', invoices.filter(x => x.status === 'unpaid').length, 'card', 'amber']
                    ].map(x => (
                        <div key={x[0]} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                            <div><small className="text-xs font-bold text-slate-500">{x[0]}</small><b className="mt-1 block text-2xl font-black text-slate-900">{x[1]}</b></div>
                            <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${x[3] === 'emerald' ? 'bg-emerald-50 text-emerald-800' : x[3] === 'blue' ? 'bg-blue-50 text-blue-800' : x[3] === 'violet' ? 'bg-violet-50 text-violet-800' : 'bg-amber-50 text-amber-800'}`}><Icon name={x[2]} className="h-5 w-5" /></span>
                        </div>
                    ))}
                </div>

                <div className="grid items-start gap-5 xl:grid-cols-2 2xl:grid-cols-3">
                    {/* Tenant Provisioning */}
                    <Box title="Tenant Provisioning" icon="plus">
                        <form onSubmit={post(pv, 'admin.saas.provision')} className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {['company_name', 'domain', 'admin_email', 'admin_phone', 'password'].map(k => (
                                    <div key={k}>
                                        <label className="text-xs font-semibold text-slate-600 capitalize">
                                            {k.replaceAll('_', ' ')}
                                        </label>
                                        <input
                                            className={`${C} ${pv.errors[k] ? 'border-rose-500' : ''}`}
                                            placeholder={`Enter ${k.replaceAll('_', ' ')}`}
                                            value={pv.data[k]}
                                            onChange={e => pv.setData(k, e.target.value)}
                                        />
                                        {pv.errors[k] && <p className="text-[10px] text-rose-600 mt-1 font-semibold">{pv.errors[k]}</p>}
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-slate-600">Subscription Plan</label>
                                    <select className={`${C} ${pv.errors.saas_plan_id ? 'border-rose-500' : ''}`} value={pv.data.saas_plan_id} onChange={e => pv.setData('saas_plan_id', e.target.value)}>
                                        <option value="">Select Plan</option>
                                        {plans.map(x => (
                                            <option key={x.id} value={x.id}>{x.name} Â· {x.currency} {x.price}</option>
                                        ))}
                                    </select>
                                    {pv.errors.saas_plan_id && <p className="text-[10px] text-rose-600 mt-1 font-semibold">{pv.errors.saas_plan_id}</p>}
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-600">Valid Until</label>
                                    <input className={C} type="date" value={pv.data.valid_until} onChange={e => pv.setData('valid_until', e.target.value)} />
                                </div>
                            </div>
                            <Btn>Provision tenant, campus & admin</Btn>
                        </form>
                    </Box>

                    {/* Plan-wise Features & Limits */}
                    <Box title="Plan-wise Features & Limits" icon="settings">
                        <form onSubmit={e => { e.preventDefault(); lim.patch(route('admin.saas.plan-limits', lim.data.plan_id), { preserveScroll: true }); }} className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-slate-600">Select Plan</label>
                                <select className={C} value={lim.data.plan_id} onChange={e => {
                                    const p = plans.find(x => String(x.id) === e.target.value);
                                    lim.setData({
                                        ...lim.data, plan_id: e.target.value,
                                        max_campuses: p?.max_campuses || 1, max_students: p?.max_students || 500, storage_limit_mb: p?.storage_limit_mb || 1024,
                                        features: p?.feature_limits || lim.data.features
                                    });
                                }}>
                                    <option value="">Select Plan</option>
                                    {plans.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <div>
                                    <label className="text-xs text-slate-500">Max Campuses</label>
                                    <input className={C} type="number" value={lim.data.max_campuses} onChange={e => lim.setData('max_campuses', e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500">Max Students</label>
                                    <input className={C} type="number" value={lim.data.max_students} onChange={e => lim.setData('max_students', e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500">Storage Limit (MB)</label>
                                    <input className={C} type="number" value={lim.data.storage_limit_mb} onChange={e => lim.setData('storage_limit_mb', e.target.value)} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-2">Enabled Features</label>
                                <div className="flex flex-wrap gap-2.5">
                                    {Object.keys(lim.data.features || {}).map(k => (
                                        <label key={k} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium cursor-pointer hover:bg-slate-50">
                                            <input className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" type="checkbox" checked={!!lim.data.features[k]} onChange={e => lim.setData('features', { ...lim.data.features, [k]: e.target.checked })} />
                                            <span className="capitalize">{k}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <Btn>Update enforcement limits</Btn>
                        </form>
                    </Box>
                </div>

                {/* Tenant Subscription, Domain & Usage */}
                <Box title="Tenant Subscription, Domain & Usage" icon="chart">
                    <div className="grid gap-4 grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3">
                        {tenants.map(t => (
                            <div key={t.id} className="rounded-xl border p-4 bg-slate-50/50 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <b className="text-base text-slate-900 block truncate">{t.company_name}</b>
                                            <small className="block text-slate-500 truncate">{t.plan?.name || t.subscription_plan} Â· {t.domain}</small>
                                        </div>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap ${t.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                            {t.status}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-xs text-slate-600">
                                        Campuses: <b>{t.campuses?.length || 0}</b> / {t.plan?.max_campuses || 'â€”'} Â· Valid until: <b>{t.valid_until || 'Lifetime'}</b>
                                    </p>
                                    {!t.domain_verified_at && (
                                        <div className="mt-2.5 space-y-1">
                                            <p className="break-all rounded-lg bg-amber-50 border border-amber-200 p-2 text-xs text-amber-900">
                                                <b>DNS TXT Token:</b> <code className="select-all">{t.domain_verification_token}</code>
                                            </p>
                                            <p className="text-[10px] text-slate-500 px-1">* DNS propagation may take up to 24 hours.</p>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4 pt-3 border-t flex flex-wrap gap-2 text-xs font-bold">
                                    <button onClick={() => router.patch(route('admin.saas.status', t.id), { status: t.status === 'Active' ? 'Suspended' : 'Active', reason: 'Administrative action' })} className={`px-2 py-1 rounded transition ${t.status === 'Active' ? 'bg-rose-50 text-rose-700 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}>
                                        {t.status === 'Active' ? 'Suspend' : 'Reactivate'}
                                    </button>
                                    <button onClick={() => router.post(route('admin.saas.domain.verify', t.id))} className="px-2 py-1 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition">Verify domain</button>
                                    <button onClick={() => router.post(route('admin.saas.meter', t.id))} className="px-2 py-1 rounded bg-teal-50 text-teal-700 hover:bg-teal-100 transition">Meter usage</button>
                                    <button onClick={() => router.post(route('admin.saas.tenant-backup', t.id))} className="px-2 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 transition">Encrypted backup</button>
                                    <button 
                                        onClick={() => setTenantToDelete({ id: t.id, name: t.company_name })} 
                                        className="px-2 py-1 rounded bg-rose-600 text-white hover:bg-rose-700 transition ml-auto"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Box>

                <div className="grid items-start gap-5 xl:grid-cols-2 2xl:grid-cols-3">
                    {/* Central Billing */}
                    <Box title="Central Billing" icon="card">
                        <form onSubmit={post(inv, 'admin.saas.invoice', inv.data.tenant_id)} className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-slate-600">Select Tenant</label>
                                <select className={C} value={inv.data.tenant_id} onChange={e => inv.setData('tenant_id', e.target.value)}>
                                    <option value="">Select Tenant</option>
                                    {tenants.map(x => <option key={x.id} value={x.id}>{x.company_name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <div><label className="text-xs text-slate-500">Period Start</label><input className={C} type="date" value={inv.data.period_start} onChange={e => inv.setData('period_start', e.target.value)} /></div>
                                <div><label className="text-xs text-slate-500">Period End</label><input className={C} type="date" value={inv.data.period_end} onChange={e => inv.setData('period_end', e.target.value)} /></div>
                                <div><label className="text-xs text-slate-500">Due Date</label><input className={C} type="date" value={inv.data.due_date} onChange={e => inv.setData('due_date', e.target.value)} /></div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-600">Invoice Amount (à§³)</label>
                                <input className={C} type="number" placeholder="Enter invoice amount" value={inv.data.amount} onChange={e => inv.setData('amount', e.target.value)} />
                            </div>
                            <Btn>Create invoice</Btn>
                        </form>
                        <div className="mt-5 space-y-2">
                            {invoices.map(x => (
                                <div key={x.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center rounded-lg border p-3 text-sm gap-2">
                                    <div>
                                        <b>{x.invoice_no}</b> Â· à§³{Number(x.amount).toLocaleString()}
                                        <span className={`ml-2 text-xs font-bold px-2 py-0.5 rounded ${x.status === 'unpaid' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>{x.status}</span>
                                    </div>
                                    {x.status === 'unpaid' && (
                                        <button onClick={() => { const ref = prompt('Enter payment reference / Transaction ID:'); if (ref) router.patch(route('admin.saas.invoice.pay', x.id), { payment_reference: ref }); }} className="w-full sm:w-auto text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition">Mark paid</button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Box>

                    {/* Tenant Backup / Restore */}
                    <Box title="Tenant Backup / Restore" icon="database">
                        <div className="space-y-3">
                            {backups.map(x => (
                                <div key={x.id} className="rounded-xl border p-3 text-sm bg-slate-50/50">
                                    <div className="flex justify-between items-start">
                                        <b>Tenant #{x.saas_tenant_id}</b>
                                        <span className="text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">{x.status}</span>
                                    </div>
                                    <p className="text-xs text-slate-600 mt-1 truncate">{x.file_name}</p>
                                    <small className="block text-slate-500 mt-1">Size: {x.file_size} Â· Encrypted: <b>{x.encrypted ? 'Yes' : 'No'}</b></small>
                                    <div className="mt-2.5">
                                        <a href={route('admin.security-operations.index')} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition">Verify / restore in Security Center â†’</a>
                                    </div>
                                </div>
                            ))}
                            {!backups.length && <p className="text-sm text-slate-400">No backup records found.</p>}
                        </div>
                    </Box>
                </div>

                {/* Consolidated Table */}
                <Box title="Cross-tenant / Cross-campus Consolidated Report" icon="file-text">
                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                        <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                            <table className="min-w-full text-sm whitespace-nowrap">
                                <thead>
                                    <tr className="border-b text-left text-slate-600">
                                        <th className="p-2.5">Tenant</th>
                                        <th className="p-2.5">Plan</th>
                                        <th className="p-2.5">Campuses</th>
                                        <th className="p-2.5">Students</th>
                                        <th className="p-2.5">Staff</th>
                                        <th className="p-2.5">Collection</th>
                                        <th className="p-2.5">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.map(x => (
                                        <tr key={x.id} className="border-b hover:bg-slate-50 transition">
                                            <td className="p-2.5 font-bold text-slate-900">{x.tenant}</td>
                                            <td className="p-2.5">{x.plan}</td>
                                            <td className="p-2.5">{x.campuses}</td>
                                            <td className="p-2.5">{x.students}</td>
                                            <td className="p-2.5">{x.staff}</td>
                                            <td className="p-2.5 font-medium">à§³{Number(x.collection).toLocaleString()}</td>
                                            <td className="p-2.5">
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${x.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>{x.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Box>
                {tenantToDelete && (
                    <ConfirmDeleteModal
                        item={tenantToDelete}
                        onCancel={() => setTenantToDelete(null)}
                        onConfirm={() => {
                            router.delete(route('admin.saas.destroy', tenantToDelete.id), {
                                preserveScroll: true,
                                onSuccess: () => setTenantToDelete(null)
                            });
                        }}
                    />
                )}
            </main>
        </AuthenticatedLayout>
    );
}
