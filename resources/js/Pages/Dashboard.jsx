import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function Dashboard({ stats, recentAdmissions }) {

    // সেফলি রাউট জেনারেট করার জন্য হেল্পার ফাংশন
    const getRoute = (name) => {
        try {
            return route().has(name) ? route(name) : '#';
        } catch {
            return '#';
        }
    };

    const quickActions = [
        { name: 'Admission', icon: 'plus', routeName: 'admin.students.create', color: 'from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700' },
        { name: 'Teacher', icon: 'user', routeName: 'admin.staff.index', color: 'from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700' },
        { name: 'Student', icon: 'check-circle', routeName: 'admin.students.index', color: 'from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700' },
        { name: 'Fee', icon: 'dollar-sign', routeName: 'admin.studentfees.index', color: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700' },
        { name: 'Report', icon: 'file-text', routeName: 'admin.reports.saved', color: 'from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700' },
        { name: 'Library', icon: 'book', routeName: 'admin.study-materials.index', color: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700' },
        { name: 'Notice', icon: 'bell', routeName: 'admin.frontoffice.notices.index', color: 'from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700' },
        { name: 'Settings', icon: 'settings', routeName: 'admin.general.index', color: 'from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800' },
    ];

    const statCards = [
        { title: 'Unpaid Invoices', value: '2', color: 'from-rose-500 to-rose-600', routeName: 'admin.studentfees.index' },
        { title: 'Unpaid Amount', value: '৳ 4,544', color: 'from-amber-500 to-amber-600', routeName: 'admin.studentfees.index' },
        { title: 'Income Today', value: '৳ 0', color: 'from-blue-500 to-blue-600', routeName: 'admin.fees.ledger' },
        { title: 'Expense Today', value: '৳ 622', color: 'from-slate-600 to-slate-700', routeName: 'admin.fees.ledger' },
        { title: 'Profit Today', value: '৳ -622', color: 'from-cyan-500 to-cyan-600', routeName: 'admin.reports.saved' },
        { title: 'This Month Income', value: '৳ 4,994', color: 'from-emerald-600 to-emerald-700', routeName: 'admin.fees.ledger' },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Admin Dashboard" />

            <div className="w-full space-y-6 sm:px-6 lg:px-8 py-8">

                {/* Page Title */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">Overview</span>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Admin Dashboard</h1>
                        <p className="text-sm text-slate-500 mt-1">স্কুলের সার্বিক কার্যক্রমে আপনাকে স্বাগতম।</p>
                    </div>
                </div>

                {/* ১. রঙিন অ্যাকশন বার (Quick Actions) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                    {quickActions.map((act, i) => (
                        <Link
                            key={i}
                            href={getRoute(act.routeName)}
                            className={`bg-gradient-to-br ${act.color} text-white p-3.5 rounded-xl flex flex-col items-center justify-center text-xs font-bold shadow-sm hover:shadow-md transition-all active:scale-95 text-center gap-1.5`}
                        >
                            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                                <Icon name={act.icon} className="w-4 h-4 text-white" />
                            </div>
                            <span>{act.name}</span>
                        </Link>
                    ))}
                </div>

                {/* ২. মেইন স্ট্যাটাস গ্রিড (Stat Cards) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {statCards.map((s, i) => (
                        <Link
                            key={i}
                            href={getRoute(s.routeName)}
                            className={`bg-gradient-to-br ${s.color} text-white p-6 rounded-2xl shadow-md relative overflow-hidden block hover:shadow-lg transition-all group`}
                        >
                            <div className="relative z-10">
                                <h2 className="text-3xl font-black font-mono tracking-tight">{s.value}</h2>
                                <p className="text-xs font-bold uppercase tracking-wider opacity-90 mt-1">{s.title}</p>
                                <div className="mt-5 text-[11px] uppercase font-bold tracking-widest opacity-80 border-t border-white/20 pt-3 flex justify-between items-center group-hover:opacity-100 transition-opacity">
                                    <span>More info</span>
                                    <span className="transform group-hover:translate-x-1 transition-transform">➔</span>
                                </div>
                            </div>
                            {/* Background Watermark Icon Effect */}
                            <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform pointer-events-none"></div>
                        </Link>
                    ))}
                </div>

                {/* ৩. চার্ট ও টেবিল সেকশন */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Monthly Income & Expense Chart Container */}
                    <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                            <h3 className="font-bold text-slate-900 text-base">Monthly Income &amp; Expense</h3>
                        </div>
                        <div className="flex-1 min-h-[240px] flex items-center justify-center bg-slate-50 border-2 border-dashed border-slate-200 text-slate-400 text-sm font-semibold rounded-xl">
                            Chart Container
                        </div>
                    </div>

                    {/* Latest Admissions Table */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-bold text-slate-900 text-base">Latest Admissions</h3>
                            <Link href={getRoute('admin.students.index')} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                                View All ➔
                            </Link>
                        </div>
                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-left border-collapse text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        <th className="px-6 py-3.5">Student Name</th>
                                        <th className="px-6 py-3.5">Date</th>
                                        <th className="px-6 py-3.5 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {recentAdmissions?.map((s, i) => (
                                        <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="px-6 py-4 font-bold text-slate-900">{s.name}</td>
                                            <td className="px-6 py-4 text-slate-600 font-mono text-xs">{s.date}</td>
                                            <td className="px-6 py-4 text-right">
                                                <Link href={getRoute('admin.students.index')} className="inline-flex px-3 py-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-colors">
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!recentAdmissions || recentAdmissions.length === 0) && (
                                        <tr>
                                            <td colSpan="3" className="px-6 py-12 text-center text-slate-400 italic">
                                                No recent admissions found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>

            </div>
        </AuthenticatedLayout>
    );
}
