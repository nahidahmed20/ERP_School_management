import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const C = 'mt-1 w-full rounded-xl border-slate-300 text-sm focus:border-indigo-500 focus:ring-indigo-500';

const Box = ({ title, children }) => (
    <section className="rounded-2xl border bg-white p-4 sm:p-5 shadow-sm overflow-hidden">
        <h2 className="mb-4 font-bold text-base sm:text-lg text-slate-800">{title}</h2>
        {children}
    </section>
);

const Btn = ({ children }) => (
    <button className="mt-3 w-full sm:w-auto rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow hover:bg-indigo-700 transition">
        {children}
    </button>
);

export default function Index({ tenants, plans, usage, invoices, backups, report }) {
    const today = new Date().toISOString().slice(0, 10);

    const pv = useForm({
        company_name: '',
        domain: '',
        admin_email: '',
        admin_phone: '',
        saas_plan_id: '',
        valid_until: ''
    });

    const lim = useForm({
        plan_id: '',
        max_campuses: 1,
        max_students: 500,
        storage_limit_mb: 1024,
        features: {
            transport: true,
            hostel: true,
            library: true,
            cafeteria: true,
            medical: true,
            communication: true,
            reports: true
        }
    });

    const inv = useForm({
        tenant_id: '',
        period_start: today,
        period_end: '',
        due_date: '',
        amount: ''
    });

    const post = (f, n, p = {}) => e => {
        e.preventDefault();
        f.post(route(n, p), { preserveScroll: true, onSuccess: () => f.reset() });
    };

    return (
        <AuthenticatedLayout>
            <Head title="SaaS Control Center" />

            <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">

                {/* Header */}
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900">SaaS / Multi-campus Control</h1>
                    <p className="text-sm text-slate-500 mt-1">Provisioning, subscriptions, limits, metering, billing and tenant recovery.</p>
                </div>

                {/* Top Statistics Cards */}
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        ['Tenants', tenants.length],
                        ['Active', tenants.filter(x => x.status === 'Active').length],
                        ['Campuses', tenants.reduce((n, x) => n + (x.campuses?.length || 0), 0)],
                        ['Unpaid invoices', invoices.filter(x => x.status === 'unpaid').length]
                    ].map(x => (
                        <div key={x[0]} className="rounded-2xl bg-slate-900 p-4 text-white">
                            <small className="text-slate-400 text-xs font-medium">{x[0]}</small>
                            <b className="block text-2xl font-bold mt-1">{x[1]}</b>
                        </div>
                    ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">

                    {/* Tenant Provisioning */}
                    <Box title="Tenant Provisioning">
                        <form onSubmit={post(pv, 'admin.saas.provision')} className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {['company_name', 'domain', 'admin_email', 'admin_phone'].map(k => (
                                    <div key={k}>
                                        <label className="text-xs font-semibold text-slate-600 capitalize">
                                            {k.replaceAll('_', ' ')}
                                        </label>
                                        <input
                                            className={C}
                                            placeholder={`Enter ${k.replaceAll('_', ' ')}`}
                                            value={pv.data[k]}
                                            onChange={e => pv.setData(k, e.target.value)}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-slate-600">Subscription Plan</label>
                                    <select
                                        className={C}
                                        value={pv.data.saas_plan_id}
                                        onChange={e => pv.setData('saas_plan_id', e.target.value)}
                                    >
                                        <option value="">Select Plan</option>
                                        {plans.map(x => (
                                            <option key={x.id} value={x.id}>
                                                {x.name} · {x.currency} {x.price}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-600">Valid Until</label>
                                    <input
                                        className={C}
                                        type="date"
                                        value={pv.data.valid_until}
                                        onChange={e => pv.setData('valid_until', e.target.value)}
                                    />
                                </div>
                            </div>
                            <Btn>Provision tenant, campus & admin</Btn>
                        </form>
                    </Box>

                    {/* Plan-wise Features & Limits */}
                    <Box title="Plan-wise Features & Limits">
                        <form
                            onSubmit={e => {
                                e.preventDefault();
                                lim.patch(route('admin.saas.plan-limits', lim.data.plan_id), { preserveScroll: true });
                            }}
                            className="space-y-3"
                        >
                            <div>
                                <label className="text-xs font-semibold text-slate-600">Select Plan</label>
                                <select
                                    className={C}
                                    value={lim.data.plan_id}
                                    onChange={e => {
                                        const p = plans.find(x => String(x.id) === e.target.value);
                                        lim.setData({
                                            ...lim.data,
                                            plan_id: e.target.value,
                                            max_campuses: p?.max_campuses || 1,
                                            max_students: p?.max_students || 500,
                                            storage_limit_mb: p?.storage_limit_mb || 1024,
                                            features: p?.feature_limits || lim.data.features
                                        });
                                    }}
                                >
                                    <option value="">Select Plan</option>
                                    {plans.map(x => (
                                        <option key={x.id} value={x.id}>{x.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Responsive 1 col on mobile, 3 cols on tablet/desktop */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <div>
                                    <label className="text-xs text-slate-500">Max Campuses</label>
                                    <input
                                        className={C}
                                        type="number"
                                        value={lim.data.max_campuses}
                                        onChange={e => lim.setData('max_campuses', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500">Max Students</label>
                                    <input
                                        className={C}
                                        type="number"
                                        value={lim.data.max_students}
                                        onChange={e => lim.setData('max_students', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500">Storage Limit (MB)</label>
                                    <input
                                        className={C}
                                        type="number"
                                        value={lim.data.storage_limit_mb}
                                        onChange={e => lim.setData('storage_limit_mb', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-2">Enabled Features</label>
                                <div className="flex flex-wrap gap-2.5">
                                    {Object.keys(lim.data.features || {}).map(k => (
                                        <label key={k} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium cursor-pointer hover:bg-slate-50">
                                            <input
                                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                type="checkbox"
                                                checked={!!lim.data.features[k]}
                                                onChange={e => lim.setData('features', { ...lim.data.features, [k]: e.target.checked })}
                                            />
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
                <Box title="Tenant Subscription, Domain & Usage">
                    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                        {tenants.map(t => (
                            <div key={t.id} className="rounded-xl border p-4 bg-slate-50/50 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <b className="text-base text-slate-900 block truncate">{t.company_name}</b>
                                            <small className="block text-slate-500 truncate">{t.plan?.name || t.subscription_plan} · {t.domain}</small>
                                        </div>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap ${t.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                            {t.status}
                                        </span>
                                    </div>

                                    <p className="mt-2 text-xs text-slate-600">
                                        Campuses: <b>{t.campuses?.length || 0}</b> / {t.plan?.max_campuses || '—'} · Valid until: <b>{t.valid_until || 'Lifetime'}</b>
                                    </p>

                                    {!t.domain_verified_at && (
                                        <p className="mt-2.5 break-all rounded-lg bg-amber-50 border border-amber-200 p-2 text-xs text-amber-900">
                                            <b>DNS TXT Token:</b> <code className="select-all">{t.domain_verification_token}</code>
                                        </p>
                                    )}
                                </div>

                                <div className="mt-4 pt-3 border-t flex flex-wrap gap-2 text-xs font-bold">
                                    <button
                                        onClick={() => router.patch(route('admin.saas.status', t.id), { status: t.status === 'Active' ? 'Suspended' : 'Active', reason: 'Administrative action' })}
                                        className={`px-2 py-1 rounded transition ${t.status === 'Active' ? 'bg-rose-50 text-rose-700 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                                    >
                                        {t.status === 'Active' ? 'Suspend' : 'Reactivate'}
                                    </button>
                                    <button onClick={() => router.post(route('admin.saas.domain.verify', t.id))} className="px-2 py-1 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition">
                                        Verify domain
                                    </button>
                                    <button onClick={() => router.post(route('admin.saas.meter', t.id))} className="px-2 py-1 rounded bg-teal-50 text-teal-700 hover:bg-teal-100 transition">
                                        Meter usage
                                    </button>
                                    <button onClick={() => router.post(route('admin.saas.tenant-backup', t.id))} className="px-2 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 transition">
                                        Encrypted backup
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Box>

                <div className="grid gap-6 lg:grid-cols-2">

                    {/* Central Billing */}
                    <Box title="Central Billing">
                        <form onSubmit={post(inv, 'admin.saas.invoice', inv.data.tenant_id)} className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-slate-600">Select Tenant</label>
                                <select className={C} value={inv.data.tenant_id} onChange={e => inv.setData('tenant_id', e.target.value)}>
                                    <option value="">Select Tenant</option>
                                    {tenants.map(x => (
                                        <option key={x.id} value={x.id}>{x.company_name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Responsive Date Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <div>
                                    <label className="text-xs text-slate-500">Period Start</label>
                                    <input className={C} type="date" value={inv.data.period_start} onChange={e => inv.setData('period_start', e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500">Period End</label>
                                    <input className={C} type="date" value={inv.data.period_end} onChange={e => inv.setData('period_end', e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500">Due Date</label>
                                    <input className={C} type="date" value={inv.data.due_date} onChange={e => inv.setData('due_date', e.target.value)} />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-600">Invoice Amount (৳)</label>
                                <input className={C} type="number" placeholder="Enter invoice amount" value={inv.data.amount} onChange={e => inv.setData('amount', e.target.value)} />
                            </div>

                            <Btn>Create invoice</Btn>
                        </form>

                        <div className="mt-5 space-y-2">
                            {invoices.map(x => (
                                <div key={x.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center rounded-lg border p-3 text-sm gap-2">
                                    <div>
                                        <b>{x.invoice_no}</b> · ৳{Number(x.amount).toLocaleString()}
                                        <span className={`ml-2 text-xs font-bold px-2 py-0.5 rounded ${x.status === 'unpaid' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                            {x.status}
                                        </span>
                                    </div>
                                    {x.status === 'unpaid' && (
                                        <button
                                            onClick={() => {
                                                const ref = prompt('Enter payment reference / Transaction ID:');
                                                if (ref) router.patch(route('admin.saas.invoice.pay', x.id), { payment_reference: ref });
                                            }}
                                            className="w-full sm:w-auto text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition"
                                        >
                                            Mark paid
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Box>

                    {/* Tenant Backup / Restore */}
                    <Box title="Tenant Backup / Restore">
                        <div className="space-y-3">
                            {backups.map(x => (
                                <div key={x.id} className="rounded-xl border p-3 text-sm bg-slate-50/50">
                                    <div className="flex justify-between items-start">
                                        <b>Tenant #{x.saas_tenant_id}</b>
                                        <span className="text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">{x.status}</span>
                                    </div>
                                    <p className="text-xs text-slate-600 mt-1 truncate">{x.file_name}</p>
                                    <small className="block text-slate-500 mt-1">
                                        Size: {x.file_size} · Encrypted: <b>{x.encrypted ? 'Yes' : 'No'}</b>
                                    </small>
                                    <div className="mt-2.5">
                                        <a href={route('admin.security.operations')} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition">
                                            Verify / restore in Security Center →
                                        </a>
                                    </div>
                                </div>
                            ))}
                            {!backups.length && <p className="text-sm text-slate-400">No backup records found.</p>}
                        </div>
                    </Box>
                </div>

                {/* Consolidated Table */}
                <Box title="Cross-tenant / Cross-campus Consolidated Report">
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
                                            <td className="p-2.5 font-medium">৳{Number(x.collection).toLocaleString()}</td>
                                            <td className="p-2.5">
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${x.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                                                    {x.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Box>
            </main>
        </AuthenticatedLayout>
    );
}
