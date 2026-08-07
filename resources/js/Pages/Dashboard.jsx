import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import Icon from '@/Components/Icons'; // Assuming you have an Icon component

export default function Dashboard({ stats, recentAdmissions, pendingLeaves, absentStaff, notices }) {
    
    const TakaSymbol = () => (
        <span style={{ fontFamily: 'Arial, sans-serif', fontStyle: 'normal' }}>৳</span>
    );

    // List of Quick Shortcuts for the Admin
    const quickActions = [
        { name: 'New Admission', icon: 'user-plus', routeName: 'admin.students.create', color: 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100' },
        { name: 'Collect Fee', icon: 'dollar-sign', routeName: 'admin.studentfees.index', color: 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100' },
        { name: 'Student Attend.', icon: 'calendar-check', routeName: 'admin.student-attendance.index', color: 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100' },
        { name: 'Staff Attend.', icon: 'users', routeName: 'admin.staff-attendance.index', color: 'bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100' },
        { name: 'Add Expense', icon: 'trending-down', routeName: 'admin.fees.ledger', color: 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100' },
        { name: 'Marks Entry', icon: 'edit-3', routeName: 'admin.exams-marks.index', color: 'bg-orange-50 text-orange-700 border-orange-100 hover:bg-orange-100' },
        { name: 'Send SMS', icon: 'message-square', routeName: 'admin.sms-logs.index', color: 'bg-teal-50 text-teal-700 border-teal-100 hover:bg-teal-100' },
        { name: 'Add Notice', icon: 'bell', routeName: 'admin.frontoffice.notices.index', color: 'bg-yellow-50 text-yellow-700 border-yellow-100 hover:bg-yellow-100' },
        { name: 'Study Materials', icon: 'book', routeName: 'admin.study-materials.index', color: 'bg-cyan-50 text-cyan-700 border-cyan-100 hover:bg-cyan-100' },
        { name: 'Visitor Book', icon: 'book-open', routeName: 'admin.frontoffice.visitors.index', color: 'bg-pink-50 text-pink-700 border-pink-100 hover:bg-pink-100' },
        { name: 'Payroll', icon: 'credit-card', routeName: 'admin.staff-payrolls.index', color: 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100' },
        { name: 'All Reports', icon: 'pie-chart', routeName: 'admin.reports.saved', color: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100' },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">Main Campus · Today</span>
                        <h1 className="text-2xl font-bold text-gray-900 mt-1">Admin Dashboard</h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Comprehensive overview of school activities, finance, and administration.
                        </p>
                    </div>

                    <div className="mt-4 md:mt-0 flex gap-3">
                        <Link href={route('admin.reports.saved')} className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm inline-block">
                            Generate Reports
                        </Link>
                        <Link href={route('admin.students.create')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm inline-block flex items-center gap-2">
                            <Icon name="plus" className="w-4 h-4" /> New Admission
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Admin Dashboard" />

            <div className="py-6 space-y-6">

                {/* 1. Key Metrics / Stat Cards (5 Cards) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                            <span className="text-gray-500 text-sm font-medium">{stat.title}</span>
                            <div className="mt-3 flex items-end justify-between">
                                <span className="text-2xl font-bold text-gray-900">
                                    {stat.isCurrency && <TakaSymbol />} {stat.value}
                                </span>
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${stat.trend.startsWith('+') ? 'bg-green-100 text-green-700' : stat.trend.startsWith('-') ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                                    {stat.trend}
                                </span>
                            </div>
                            <div className={`h-1 w-full mt-4 rounded-full ${stat.bgColor} opacity-60`}></div>
                        </div>
                    ))}
                </div>

                {/* 2. Middle Section: Quick Actions & Pending Approvals */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Quick Actions / Shortcuts (Expanded to 12 Buttons) */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Icon name="zap" className="w-5 h-5 text-yellow-500" /> Command Center
                        </h3>
                        {/* 3x4 Grid for Shortcuts */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {quickActions.map((action, idx) => (
                                <Link 
                                    key={idx} 
                                    href={route(action.routeName)} 
                                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 text-center transition-all duration-200 hover:-translate-y-1 ${action.color}`}
                                >
                                    <Icon name={action.icon} className="w-5 h-5" />
                                    <span className="text-xs font-semibold leading-tight">{action.name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Pending Leave Requests */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Leave Requests</h3>
                            <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">{pendingLeaves.length} Pending</span>
                        </div>
                        <div className="space-y-3">
                            {pendingLeaves.length === 0 ? (
                                <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <p className="text-sm text-gray-500">All caught up! No pending requests.</p>
                                </div>
                            ) : (
                                pendingLeaves.map((leave, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-800">{leave.name}</h4>
                                            <p className="text-xs text-gray-500">{leave.role} · {leave.dates}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700">Approve</button>
                                            <button className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200">Deny</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Absent Staff Today */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Absent Staff Today</h3>
                        <div className="space-y-3">
                            {absentStaff.map((staff, idx) => (
                                <div key={idx} className="flex items-center gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                                    <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold">
                                        {staff.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-800">{staff.name}</h4>
                                        <p className="text-xs text-gray-500">{staff.role}</p>
                                    </div>
                                    <button className="ml-auto p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100" title="Contact Staff">
                                        <Icon name="phone" className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {absentStaff.length === 0 && (
                                <div className="text-center py-8 bg-green-50 rounded-xl border border-dashed border-green-200">
                                    <p className="text-sm text-green-600 font-medium">Excellent! Everyone is present today.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. Bottom Section: Tables & Notices */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Recent Admissions (Spans 2 cols) */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">Recent Admissions</h3>
                            <Link href={route('admin.students.index')} className="text-sm text-indigo-600 font-medium hover:underline">View All Students</Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                                        <th className="px-6 py-3 font-medium">Student ID</th>
                                        <th className="px-6 py-3 font-medium">Name</th>
                                        <th className="px-6 py-3 font-medium">Class</th>
                                        <th className="px-6 py-3 font-medium">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-gray-50">
                                    {recentAdmissions.length === 0 ? (
                                        <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">No recent admissions found.</td></tr>
                                    ) : (
                                        recentAdmissions.map((student, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-indigo-600">{student.id}</td>
                                                <td className="px-6 py-4 text-gray-900 font-medium">{student.name}</td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs">
                                                        {student.class}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500">{student.date}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Notice Board */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Notice Board</h3>
                            <Link href={route('admin.frontoffice.notices.index')} className="text-sm text-indigo-600 font-medium hover:underline">View All</Link>
                        </div>
                        <div className="space-y-4">
                            {notices.length === 0 ? (
                                <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <p className="text-sm text-gray-500">No active notices.</p>
                                </div>
                            ) : (
                                notices.map((notice, idx) => (
                                    <div key={idx} className="flex gap-4 items-start pb-4 border-b border-gray-50 last:border-0 last:pb-0 hover:bg-gray-50 p-2 rounded-lg transition-colors">
                                        <div className="w-10 h-10 rounded-lg bg-white flex-shrink-0 flex items-center justify-center text-xl border border-gray-200 shadow-sm">
                                            {notice.type === 'Holiday' ? '🏖️' : notice.type === 'Event' ? '🎉' : '📢'}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-800">{notice.title}</h4>
                                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                <Icon name="clock" className="w-3 h-3" /> {notice.date}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>

            </div>
        </AuthenticatedLayout>
    );
}