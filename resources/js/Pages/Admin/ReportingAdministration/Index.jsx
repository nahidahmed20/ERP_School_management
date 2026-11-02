import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';

const C = 'mt-1.5 w-full rounded-xl border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 shadow-sm focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/15';

const Box = ({ title, icon = 'file-text', children }) => (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-emerald-50/80 via-white to-white px-4 py-4 sm:px-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800"><Icon name={icon} className="h-5 w-5" /></span>
            <h2 className="font-extrabold text-base text-slate-900 sm:text-lg">{title}</h2>
        </div>
        <div className="p-4 sm:p-5">
        {children}
        </div>
    </section>
);

const Btn = ({ children }) => (
    <button className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-700/30 sm:w-auto">
        {children}
    </button>
);

export default function Index({ sources, reports, schedules, exports, imports, approvals, notifications, kpis, activities, campusComparison }) {
    const sourceNames = Object.keys(sources);

    const rp = useForm({ name: '', data_source: 'students', columns: ['id', 'admission_no', 'first_name', 'last_name'], filter_column: '', filter_operator: '=', filter_value: '' });
    const sc = useForm({ custom_report_id: '', frequency: 'monthly', recipients: '', format: 'csv', next_run_at: new Date().toISOString().slice(0, 16) });
    const im = useForm({ entity_type: 'expenses', file: null });
    const kp = useForm({ name: '', metric: 'student_count', target_value: '', period: 'monthly', starts_at: new Date().toISOString().slice(0, 10), ends_at: '', owner_id: '' });

    const post = (f, n, opt = {}) => e => {
        e.preventDefault();
        f.post(route(n), { preserveScroll: true, ...opt, onSuccess: () => f.reset() });
    };

    const toggle = x => rp.setData('columns', rp.data.columns.includes(x) ? rp.data.columns.filter(y => y !== x) : [...rp.data.columns, x]);

    return (
        <AuthenticatedLayout>
            <Head title="Reporting & Administration" />

            <main className="w-full max-w-none space-y-6 px-3 py-4 sm:px-5 sm:py-6 lg:px-8">

                {/* Header Section */}
                <div className="rounded-3xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-slate-50 px-5 py-6 shadow-sm sm:px-7">
                    <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-800">Insights / Administration</p>
                    <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Reporting & Administration</h1>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Build and schedule reports, manage imports and approvals, compare campuses, and track performance.</p>
                </div>

                {/* Top Metrics / Statistics - Responsive Grid */}
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-5">
                    {[
                        ['Reports', reports.length, 'file-text'],
                        ['Scheduled', schedules.length, 'calendar'],
                        ['Exports', exports.length, 'download'],
                        ['Pending approvals', approvals.length, 'check-circle'],
                        ['Notifications', notifications.length, 'bell']
                    ].map(x => (
                        <div key={x[0]} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                            <div><small className="text-xs font-bold text-slate-500">{x[0]}</small><b className="mt-1 block text-2xl font-black text-slate-900">{x[1]}</b></div>
                            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800"><Icon name={x[2]} className="h-5 w-5" /></span>
                        </div>
                    ))}
                </div>

                <div className="grid items-start gap-5 xl:grid-cols-2">
                    {/* Custom Report Builder */}
                    <Box title="Custom Report Builder" icon="settings">
                        <form onSubmit={post(rp, 'admin.reporting-administration.reports')}>
                            <input className={C} placeholder="Report name" value={rp.data.name} onChange={e => rp.setData('name', e.target.value)} />
                            <select className={C} value={rp.data.data_source} onChange={e => rp.setData({ ...rp.data, data_source: e.target.value, columns: [] })}>
                                {sourceNames.map(x => <option key={x}>{x}</option>)}
                            </select>

                            <div className="my-3 flex flex-wrap gap-3">
                                {sources[rp.data.data_source].columns.map(x => (
                                    <label key={x} className="text-xs flex items-center cursor-pointer">
                                        <input type="checkbox" checked={rp.data.columns.includes(x)} onChange={() => toggle(x)} className="mr-1 rounded border-slate-300" />
                                        {x}
                                    </label>
                                ))}
                            </div>

                            {/* Responsive Filters */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <select className={C} value={rp.data.filter_column} onChange={e => rp.setData('filter_column', e.target.value)}>
                                    <option value="">No filter</option>
                                    {sources[rp.data.data_source].columns.map(x => <option key={x}>{x}</option>)}
                                </select>
                                <select className={C} value={rp.data.filter_operator} onChange={e => rp.setData('filter_operator', e.target.value)}>
                                    {['=', '!=', '>', '>=', '<', '<=', 'like'].map(x => <option key={x}>{x}</option>)}
                                </select>
                                <input className={C} placeholder="Value" value={rp.data.filter_value} onChange={e => rp.setData('filter_value', e.target.value)} />
                            </div>
                            <Btn>Save report</Btn>
                        </form>

                        <div className="mt-4 space-y-2">
                            {reports.map(x => (
                                <div key={x.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center rounded-lg bg-slate-50 p-3 text-sm gap-2">
                                    <b className="truncate max-w-full">{x.name}</b>
                                    <span className="flex gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                                        <button onClick={() => window.open(route('admin.reporting-administration.preview', x.id))} className="text-indigo-700 font-semibold hover:underline">Preview</button>
                                        <a href={route('admin.reporting-administration.export', x.id)} className="text-emerald-700 font-semibold hover:underline">Export CSV</a>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Box>

                    {/* Scheduled Report Delivery */}
                    <Box title="Scheduled Report Delivery" icon="calendar">
                        <form onSubmit={post(sc, 'admin.reporting-administration.schedules')}>
                            <select className={C} value={sc.data.custom_report_id} onChange={e => sc.setData('custom_report_id', e.target.value)}>
                                <option value="">Select a Report</option>
                                {reports.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
                            </select>
                            <select className={C} value={sc.data.frequency} onChange={e => sc.setData('frequency', e.target.value)}>
                                <option>daily</option>
                                <option>weekly</option>
                                <option>monthly</option>
                            </select>
                            <input className={C} placeholder="Email recipients, comma separated" value={sc.data.recipients} onChange={e => sc.setData('recipients', e.target.value)} />
                            <input className={C} type="datetime-local" value={sc.data.next_run_at} onChange={e => sc.setData('next_run_at', e.target.value)} />
                            <Btn>Schedule delivery</Btn>
                        </form>
                        <p className="mt-4 text-xs text-slate-500 bg-slate-50 p-2 rounded">Scheduler checks due reports every 15 minutes and records each export.</p>
                    </Box>
                </div>

                <div className="grid items-start gap-5 xl:grid-cols-2">
                    {/* Campus Comparison Report */}
                    <Box title="Campus Comparison Report" icon="chart">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm whitespace-nowrap">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="p-2">Campus</th>
                                        <th className="p-2">Students</th>
                                        <th className="p-2">Staff</th>
                                        <th className="p-2">Collection</th>
                                        <th className="p-2">Outstanding</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {campusComparison.map(x => (
                                        <tr key={x.id} className="border-b hover:bg-slate-50">
                                            <td className="p-2 font-bold">{x.name}</td>
                                            <td className="p-2">{x.students}</td>
                                            <td className="p-2">{x.staff}</td>
                                            <td className="p-2">৳{Number(x.collections).toLocaleString()}</td>
                                            <td className="p-2 text-rose-600">৳{Number(x.outstanding).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Box>

                    {/* Bulk Import Center */}
                    <Box title="Bulk Import Center" icon="upload">
                        <form onSubmit={post(im, 'admin.reporting-administration.imports', { forceFormData: true })}>
                            <select className={C} value={im.data.entity_type} onChange={e => im.setData('entity_type', e.target.value)}>
                                <option>expenses</option>
                            </select>
                            <input type="file" accept=".csv" className={`${C} bg-white p-1`} onChange={e => im.setData('file', e.target.files[0])} />
                            <p className="mt-2 text-xs text-slate-500">CSV columns: <code className="bg-slate-100 px-1 rounded">expense_head, amount, expense_date, description(optional)</code>. Invalid files import nothing.</p>
                            <Btn>Validate & import</Btn>
                        </form>
                        <div className="mt-4 space-y-2">
                            {imports.map(x => (
                                <div key={x.id} className="flex flex-col sm:flex-row justify-between rounded-lg border p-3 text-xs gap-2">
                                    <span className="flex-1">
                                        <b>{x.file_name}</b> <br/>
                                        <span className="text-slate-500">{x.status} · Valid: {x.valid_rows}, Invalid: {x.invalid_rows}</span>
                                    </span>
                                    {x.status === 'completed' && (
                                        <button onClick={() => router.post(route('admin.reporting-administration.imports.rollback', x.id))} className="font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded w-full sm:w-auto">
                                            Rollback
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Box>
                </div>

                <div className="grid items-start gap-5 xl:grid-cols-2 2xl:grid-cols-3">
                    {/* Approval Dashboard */}
                    <Box title="Approval Dashboard" icon="check-circle">
                        <div className="space-y-2">
                            {approvals.map(x => (
                                <a href={route('admin.workflow-approvals.index')} key={x.id} className="block rounded-xl border border-slate-200 p-3 text-sm hover:bg-slate-50 transition">
                                    <b>{x.title}</b>
                                    <small className="block text-slate-500">{x.type} · {x.requester_name}</small>
                                </a>
                            ))}
                            {!approvals.length && <p className="text-sm text-slate-400 p-4 text-center border border-dashed rounded-xl">No pending approval.</p>}
                        </div>
                    </Box>

                    {/* Notification Center */}
                    <Box title="Notification Center" icon="bell">
                        <div className="space-y-2">
                            {notifications.slice(0, 10).map(x => (
                                <a href={route('admin.communication-notifications.index')} key={x.id} className="block rounded-xl border border-slate-200 p-3 text-sm hover:bg-slate-50 transition">
                                    <b>{x.title}</b>
                                    <small className="block text-slate-500">{x.target_audience} · {x.status}</small>
                                </a>
                            ))}
                        </div>
                    </Box>

                    {/* KPI Target */}
                    <Box title="KPI Target" icon="chart">
                        <form onSubmit={post(kp, 'admin.reporting-administration.kpis')} className="space-y-3">

                            <input className={C} placeholder="KPI name" value={kp.data.name} onChange={e => kp.setData('name', e.target.value)} />

                            <select className={C} value={kp.data.metric} onChange={e => kp.setData('metric', e.target.value)}>
                                <option>student_count</option>
                                <option>fee_collection</option>
                                <option>attendance_rate</option>
                                <option>expense_total</option>
                            </select>

                            <input className={C} type="number" placeholder="Target" value={kp.data.target_value} onChange={e => kp.setData('target_value', e.target.value)} />

                            <select className={C} value={kp.data.period} onChange={e => kp.setData('period', e.target.value)}>
                                <option>monthly</option>
                                <option>quarterly</option>
                                <option>annual</option>
                            </select>

                            {/* Date Inputs - Fixed for Responsive Design */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 ml-1">Start Date</label>
                                    <input className={C.replace('mt-1', 'mt-0')} type="date" value={kp.data.starts_at} onChange={e => kp.setData('starts_at', e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 ml-1">End Date</label>
                                    <input className={C.replace('mt-1', 'mt-0')} type="date" value={kp.data.ends_at} onChange={e => kp.setData('ends_at', e.target.value)} />
                                </div>
                            </div>

                            <Btn>Save KPI</Btn>
                        </form>
                    </Box>
                </div>

                <div className="grid items-start gap-5 xl:grid-cols-2">
                    {/* Export History */}
                    <Box title="Export History" icon="download">
                        <div className="space-y-2">
                            {exports.map(x => (
                                <a key={x.id} href={route('admin.reporting-administration.exports.download', x.id)} className="flex flex-col sm:flex-row justify-between items-start sm:items-center rounded-lg bg-slate-50 border border-slate-100 p-3 text-sm hover:bg-slate-100 transition">
                                    <span>
                                        <b className="text-indigo-700">Report #{x.custom_report_id}</b>
                                        <span className="text-slate-500 text-xs block sm:inline sm:ml-2">· {x.exported_at}</span>
                                    </span>
                                    <b className="mt-1 sm:mt-0 text-emerald-700 flex items-center gap-1">
                                        {x.row_count} rows
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                    </b>
                                </a>
                            ))}
                        </div>
                    </Box>

                    {/* Activity Timeline */}
                    <Box title="Activity Timeline" icon="activity">
                        <div className="space-y-4">
                            {activities.map(x => (
                                <div key={x.id} className="border-l-4 border-indigo-300 pl-4 text-sm relative">
                                    <div className="absolute w-2 h-2 bg-indigo-500 rounded-full -left-[5px] top-1.5"></div>
                                    <b className="text-slate-800">{x.description}</b>
                                    <small className="block text-slate-500 mt-0.5">{x.user_name || 'System'} · {x.occurred_at}</small>
                                </div>
                            ))}
                        </div>
                    </Box>
                </div>
            </main>
        </AuthenticatedLayout>
    );
}
