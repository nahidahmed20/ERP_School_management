import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status, account = {}, activeSessions = [], sessionsAvailable = false }) {
    const { auth } = usePage().props;
    const sessionForm = useForm({ password: '' });
    const endOtherSessions = (event) => {
        event.preventDefault();
        sessionForm.delete(route('profile.sessions.destroy'), {
            preserveScroll: true,
            onSuccess: () => sessionForm.reset(),
        });
    };
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Profile
                </h2>
            }
        >
            <Head title="Profile" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow sm:p-8">
                        <h2 className="text-lg font-semibold text-slate-900">Account & campus</h2>
                        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                            <div><dt className="text-slate-500">Role</dt><dd className="mt-1 font-medium text-slate-800">{account.roles?.join(', ') || 'No assigned role'}</dd></div>
                            <div><dt className="text-slate-500">Account campus</dt><dd className="mt-1 font-medium text-slate-800">{account.assigned_campus?.name || (auth?.can_switch_campus ? 'All campuses — Super Admin' : 'Not assigned')}</dd></div>
                            <div><dt className="text-slate-500">Working campus</dt><dd className="mt-1 font-medium text-slate-800">{auth?.active_campus?.name || 'Choose in the top bar'}</dd></div>
                            <div><dt className="text-slate-500">Two-step verification</dt><dd className="mt-1 font-medium text-slate-800">{account.two_factor_enabled ? 'Enabled' : 'Not enabled'}</dd></div>
                        </dl>
                        <p className="mt-4 text-xs text-slate-500">Roles and campus assignment are managed by your administrator; changing profile information does not change access.</p>
                    </section>
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </div>

                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow sm:p-8">
                        <h2 className="text-lg font-semibold text-slate-900">Signed-in devices</h2>
                        {!sessionsAvailable ? <p className="mt-2 text-sm text-slate-500">Device management is available when database sessions are enabled.</p> : <>
                            <ul className="mt-4 divide-y divide-slate-100">
                                {activeSessions.map((session, index) => <li key={index} className="py-3 text-sm text-slate-700">
                                    <span className="font-semibold">{session.current ? 'This device' : 'Other device'}</span> · {session.ip_address || 'IP unavailable'}
                                    <p className="mt-1 break-words text-xs text-slate-500">{session.user_agent || 'Unknown browser'}</p>
                                    <p className="mt-1 text-xs text-slate-500">Last active: {new Date(session.last_active_at).toLocaleString()}</p>
                                </li>)}
                            </ul>
                            <form onSubmit={endOtherSessions} className="mt-5 max-w-xl space-y-3">
                                <label className="block text-sm font-medium text-slate-700">Current password
                                    <input type="password" autoComplete="current-password" required value={sessionForm.data.password} onChange={event => sessionForm.setData('password', event.target.value)} className="mt-2 block w-full rounded-lg border-slate-300" />
                                </label>
                                {sessionForm.errors.password && <p role="alert" className="text-sm text-rose-600">{sessionForm.errors.password}</p>}
                                <button disabled={sessionForm.processing} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Sign out other devices</button>
                                {status === 'other-sessions-logged-out' && <p role="status" className="text-sm text-emerald-700">Other devices have been signed out. This session is still active.</p>}
                            </form>
                        </>}
                    </section>

                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
