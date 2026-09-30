import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';

export default function SubscriptionIndex({ tenant, plan, valid_until, is_expired, invoices }) {
    const renew = () => {
        router.post(route('subscription.renew'), {}, {
            preserveScroll: true,
            onSuccess: () => alert('Subscription Renewed (Mocked Payment)'),
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">My Subscription</h2>}
        >
            <Head title="Subscription Portal" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="bg-white p-6 shadow sm:rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900">Current Plan Overview</h3>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="border rounded-lg p-4 bg-slate-50">
                                <p className="text-sm text-slate-500">Plan</p>
                                <p className="text-xl font-bold text-slate-800">{plan || 'Free Trial'}</p>
                            </div>
                            <div className="border rounded-lg p-4 bg-slate-50">
                                <p className="text-sm text-slate-500">Valid Until</p>
                                <p className={`text-xl font-bold ${is_expired ? 'text-rose-600' : 'text-emerald-600'}`}>
                                    {valid_until}
                                </p>
                            </div>
                            <div className="border rounded-lg p-4 bg-slate-50">
                                <p className="text-sm text-slate-500">Status</p>
                                <p className={`text-xl font-bold ${is_expired ? 'text-rose-600' : 'text-emerald-600'}`}>
                                    {is_expired ? 'Expired' : 'Active'}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center gap-4">
                            <button
                                onClick={renew}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-700 transition"
                            >
                                Renew Subscription (Mock)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
