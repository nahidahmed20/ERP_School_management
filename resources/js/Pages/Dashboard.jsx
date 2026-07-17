import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard() {
    const stats = [
        { title: 'Total Students', value: '2,845', trend: '+4.5%', bgColor: 'bg-blue-500' },
        { title: 'Total Staff & Teachers', value: '142', trend: '0%', bgColor: 'bg-purple-500' },
        { title: 'Today\'s Attendance', value: '92%', trend: '-1.2%', bgColor: 'bg-green-500' },
        { title: 'Today\'s Collection', value: '45,500', isCurrency: true, trend: '+15%', bgColor: 'bg-indigo-500' },
        { title: 'Pending Dues', value: '1,20,000', isCurrency: true, trend: '-5%', bgColor: 'bg-red-500' },
    ];

    const recentAdmissions = [
        { id: 'STU-001', name: 'Rahim Uddin', class: 'Class 8', date: 'Today, 10:30 AM' },
        { id: 'STU-002', name: 'Sadia Islam', class: 'Class 5', date: 'Today, 09:15 AM' },
        { id: 'STU-003', name: 'Arafat Hossain', class: 'Class 9', date: 'Yesterday' },
    ];

    const pendingLeaves = [
        { name: 'Mr. Anisur Rahman', role: 'Math Teacher', dates: '12-14 Jul', reason: 'Sick Leave' },
        { name: 'Ms. Fahmida', role: 'Librarian', dates: '15 Jul', reason: 'Casual' },
    ];

    const absentStaff = [
        { name: 'Mr. Shafiqul', role: 'Physics Teacher', phone: '01711XXXXXX' },
        { name: 'Abdul Karim', role: 'Security Guard', phone: '01922XXXXXX' },
    ];

    const notices = [
        { title: 'First Term Exam Routine', date: '15 Feb, 2024', type: 'Exam' },
        { title: 'Parents-Teacher Meeting', date: '10 Feb, 2024', type: 'Event' },
    ];

    const TakaSymbol = () => (
        <span style={{ fontFamily: 'Arial, sans-serif', fontStyle: 'normal' }}>৳</span>
    );

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
                        <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
                            Generate Reports
                        </button>
                        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
                            + New Admission
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Admin Dashboard" />

            <div className="py-6 space-y-6">

                {/* 1. Key Metrics / Stat Cards (5 Cards) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
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

                    {/* Quick Actions */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button className="p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-sm font-medium transition-colors text-center border border-blue-100">
                                Collect Fee
                            </button>
                            <button className="p-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-sm font-medium transition-colors text-center border border-red-100">
                                Add Expense
                            </button>
                            <button className="p-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl text-sm font-medium transition-colors text-center border border-green-100">
                                Send SMS
                            </button>
                            <button className="p-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-sm font-medium transition-colors text-center border border-purple-100">
                                Staff Attendance
                            </button>
                        </div>
                    </div>

                    {/* Pending Leave Requests */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Leave Requests</h3>
                            <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">{pendingLeaves.length} Pending</span>
                        </div>
                        <div className="space-y-3">
                            {pendingLeaves.map((leave, idx) => (
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
                            ))}
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
                                    <button className="ml-auto text-xs text-indigo-600 hover:underline">Call</button>
                                </div>
                            ))}
                            {absentStaff.length === 0 && <p className="text-sm text-gray-500 text-center py-4">Everyone is present today!</p>}
                        </div>
                    </div>
                </div>

                {/* 3. Bottom Section: Tables & Notices */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Recent Admissions (Spans 2 cols) */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">Recent Admissions</h3>
                            <Link href="#" className="text-sm text-indigo-600 font-medium hover:underline">View All</Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                                        <th className="px-6 py-3 font-medium">Student ID</th>
                                        <th className="px-6 py-3 font-medium">Name</th>
                                        <th className="px-6 py-3 font-medium">Class</th>
                                        <th className="px-6 py-3 font-medium">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-gray-50">
                                    {recentAdmissions.map((student, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-indigo-600">{student.id}</td>
                                            <td className="px-6 py-4 text-gray-900">{student.name}</td>
                                            <td className="px-6 py-4 text-gray-600">{student.class}</td>
                                            <td className="px-6 py-4 text-gray-500">{student.date}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Notice Board */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Notice Board</h3>
                            <Link href="#" className="text-sm text-indigo-600 font-medium hover:underline">Add</Link>
                        </div>
                        <div className="space-y-4">
                            {notices.map((notice, idx) => (
                                <div key={idx} className="flex gap-4 items-start pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                                    <div className="w-10 h-10 rounded-lg bg-gray-50 flex-shrink-0 flex items-center justify-center text-xl border border-gray-100">
                                        {notice.type === 'Holiday' ? '🏖️' : notice.type === 'Exam' ? '📝' : '📢'}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-800">{notice.title}</h4>
                                        <p className="text-xs text-gray-500 mt-1">{notice.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

            </div>
        </AuthenticatedLayout>
    );
}
