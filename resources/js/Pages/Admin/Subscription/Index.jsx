import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';
import Swal from 'sweetalert2';

export default function SubscriptionIndex({ tenant, domain, plan, usage, valid_until, is_expired, invoices }) {
    const { flash } = usePage().props;

    React.useEffect(() => {
        if (flash?.success) {
            Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000 });
        }
        if (flash?.error) {
            Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: flash.error, showConfirmButton: false, timer: 4000 });
        }
    }, [flash]);

    const renew = () => {
        Swal.fire({
            title: 'Renew Subscription',
            text: `This is a mock payment. You will be billed ${plan?.price || 0} ${plan?.currency || 'BDT'} to extend for 1 month.`,
            icon: 'info',
            showCancelButton: true,
            confirmButtonColor: '#4f46e5',
            confirmButtonText: 'Proceed to Payment (Mock)'
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('subscription.renew'), {}, {
                    preserveScroll: true,
                });
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="My Subscription" />

            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                            <Icon name="briefcase" className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">{tenant}</h2>
                            <p className="text-sm text-slate-500 font-mono mt-0.5">{domain}</p>
                        </div>
                    </div>
                    <div className="mt-4 md:mt-0 text-left md:text-right">
                        <p className="text-sm font-semibold text-slate-500">Subscription Status</p>
                        {is_expired ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-rose-50 text-rose-700 mt-1">
                                <span className="w-2 h-2 rounded-full bg-rose-500"></span> Expired
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-emerald-50 text-emerald-700 mt-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active
                            </span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Current Plan Overview */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-lg font-bold text-slate-800">Current Plan Overview</h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-100">
                                    <p className="text-sm font-semibold text-indigo-600">Active Plan</p>
                                    <p className="text-3xl font-black text-indigo-900 mt-2">{plan?.name || 'Free Trial'}</p>
                                    <p className="text-sm text-indigo-700 mt-1">
                                        {plan?.price || 0} {plan?.currency || 'BDT'} / {plan?.billing_cycle || 'month'}
                                    </p>
                                </div>
                                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-center">
                                    <p className="text-sm font-semibold text-slate-500">Valid Until</p>
                                    <p className={`text-2xl font-bold mt-2 ${is_expired ? 'text-rose-600' : 'text-slate-800'}`}>
                                        {valid_until || 'No Expiry'}
                                    </p>
                                    <p className="text-sm text-slate-500 mt-1">
                                        {is_expired ? 'Your subscription has expired.' : 'Your subscription is up to date.'}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8 border-t border-slate-100 pt-6">
                                <h4 className="font-semibold text-slate-800 mb-4">Plan Features & Limits</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2">
                                        <Icon name="check-circle" className="w-5 h-5 text-emerald-500" />
                                        <span className="text-sm text-slate-600">Max Campuses: <strong className="text-slate-900">{plan?.max_campuses || 'Unlimited'}</strong></span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Icon name="check-circle" className="w-5 h-5 text-emerald-500" />
                                        <span className="text-sm text-slate-600">Max Students: <strong className="text-slate-900">{plan?.max_students || 'Unlimited'}</strong></span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Icon name="check-circle" className="w-5 h-5 text-emerald-500" />
                                        <span className="text-sm text-slate-600">Storage: <strong className="text-slate-900">{plan?.storage_limit_mb ? `${plan.storage_limit_mb} MB` : 'Unlimited'}</strong></span>
                                    </div>
                                    {plan?.features?.map((feature, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <Icon name="check-circle" className="w-5 h-5 text-emerald-500" />
                                            <span className="text-sm text-slate-600 capitalize">{feature.replace('_', ' ')}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                            <p className="text-sm text-slate-600">Need more features? Contact sales to upgrade your plan.</p>
                            <button
                                onClick={renew}
                                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition-all active:scale-95"
                            >
                                Renew Now
                            </button>
                        </div>
                    </div>

                    {/* Usage Stats */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-lg font-bold text-slate-800">Current Usage</h3>
                        </div>
                        <div className="p-6 flex-1">
                            {usage ? (
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="font-medium text-slate-600">Storage Used</span>
                                            <span className="font-bold text-slate-900">{usage.storage_used_mb} MB</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2">
                                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: plan?.storage_limit_mb ? `${(usage.storage_used_mb / plan.storage_limit_mb) * 100}%` : '5%' }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="font-medium text-slate-600">Campuses Active</span>
                                            <span className="font-bold text-slate-900">{usage.campuses_count}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="font-medium text-slate-600">Students Enrolled</span>
                                            <span className="font-bold text-slate-900">{usage.students_count}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                    <Icon name="bar-chart" className="w-12 h-12 mb-3 opacity-20" />
                                    <p className="text-sm">Usage metrics will appear here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Billing History */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="text-lg font-bold text-slate-800">Billing History</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Invoice No</th>
                                    <th className="px-6 py-4 font-semibold">Period</th>
                                    <th className="px-6 py-4 font-semibold">Amount</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold">Paid On</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {invoices?.length > 0 ? (
                                    invoices.map((inv) => (
                                        <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-mono font-medium text-slate-700">{inv.invoice_no}</td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {new Date(inv.period_start).toLocaleDateString()} - {new Date(inv.period_end).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-900">{inv.amount} {inv.currency}</td>
                                            <td className="px-6 py-4">
                                                {inv.status === 'paid' ? (
                                                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">Paid</span>
                                                ) : (
                                                    <span className="px-2.5 py-1 bg-rose-50 text-rose-700 text-xs font-bold rounded-full border border-rose-200">Unpaid</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">
                                                {inv.paid_at ? new Date(inv.paid_at).toLocaleDateString() : '-'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-slate-500 font-medium">
                                            No billing history found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
