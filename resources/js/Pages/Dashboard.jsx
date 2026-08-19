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
        { name: 'Admission', icon: 'plus', routeName: 'admin.students.create', bg: 'bg-emerald-500' },
        { name: 'Teacher', icon: 'user', routeName: 'admin.staff.index', bg: 'bg-red-500' },
        { name: 'Student', icon: 'check-circle', routeName: 'admin.students.index', bg: 'bg-emerald-600' },
        { name: 'Fee', icon: 'dollar-sign', routeName: 'admin.studentfees.index', bg: 'bg-blue-500' },
        { name: 'Report', icon: 'file-text', routeName: 'admin.reports.saved', bg: 'bg-amber-500' },
        { name: 'Library', icon: 'book', routeName: 'admin.study-materials.index', bg: 'bg-orange-500' },
        { name: 'Notice', icon: 'bell', routeName: 'admin.frontoffice.notices.index', bg: 'bg-indigo-500' },
        { name: 'Settings', icon: 'settings', routeName: 'admin.general.index', bg: 'bg-gray-500' },
    ];

    const statCards = [
        { title: 'Unpaid Invoices', value: '2', bg: 'bg-red-500', routeName: 'admin.studentfees.index' },
        { title: 'Unpaid Amount', value: '4544', bg: 'bg-amber-500', routeName: 'admin.studentfees.index' },
        { title: 'Income Today', value: '0', bg: 'bg-blue-500', routeName: 'admin.fees.ledger' },
        { title: 'Expense Today', value: '622', bg: 'bg-gray-500', routeName: 'admin.fees.ledger' },
        { title: 'Profit Today', value: '-622', bg: 'bg-cyan-500', routeName: 'admin.reports.saved' },
        { title: 'This Month Income', value: '4994', bg: 'bg-emerald-600', routeName: 'admin.fees.ledger' },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Admin Dashboard" />

            {/* ১. রঙিন অ্যাকশন বার */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mb-6 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                {quickActions.map((act, i) => (
                    <Link
                        key={i}
                        href={getRoute(act.routeName)}
                        className={`${act.bg} text-white p-3 rounded-lg flex flex-col items-center justify-center text-[11px] font-bold hover:opacity-90 transition-opacity`}
                    >
                        <Icon name={act.icon} className="w-4 h-4 mb-1" /> {act.name}
                    </Link>
                ))}
            </div>

            {/* ২. মেইন স্ট্যাটাস গ্রিড */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {statCards.map((s, i) => (
                    <Link
                        key={i}
                        href={getRoute(s.routeName)}
                        className={`${s.bg} text-white p-5 rounded-xl shadow-sm relative overflow-hidden block hover:opacity-95 transition-opacity`}
                    >
                        <h2 className="text-3xl font-black">{s.value}</h2>
                        <p className="text-xs font-semibold opacity-90 mt-1">{s.title}</p>
                        <div className="mt-4 text-[10px] uppercase font-bold opacity-75 border-t border-white/20 pt-2 flex justify-between">
                            <span>More info</span> <span>➔</span>
                        </div>
                    </Link>
                ))}
            </div>

            {/* ৩. চার্ট ও টেবিল সেকশন */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Monthly Income & Expense</h3>
                    <div className="h-48 flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-200 text-gray-400 text-sm rounded-xl">
                        Chart Container
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h3 className="font-bold text-gray-800">Latest Admissions</h3>
                        <Link href={getRoute('admin.students.index')} className="text-xs text-indigo-600 font-bold hover:underline">View All</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-600">
                                <tr><th className="p-3">Student Name</th><th className="p-3">Date</th><th className="p-3">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {recentAdmissions?.map((s, i) => (
                                    <tr key={i} className="hover:bg-gray-50">
                                        <td className="p-3 font-semibold text-gray-800">{s.name}</td>
                                        <td className="p-3 text-gray-500">{s.date}</td>
                                        <td className="p-3"><Link href={getRoute('admin.students.index')} className="text-indigo-600 font-bold hover:underline">View</Link></td>
                                    </tr>
                                ))}
                                {(!recentAdmissions || recentAdmissions.length === 0) && (
                                    <tr><td colSpan="3" className="p-6 text-center text-gray-400">No recent admissions found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
