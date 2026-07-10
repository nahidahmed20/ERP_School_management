import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <AuthenticatedLayout
            header={
                <div className="page-head">
                    <div>
                        <span className="eyebrow">Main Campus · Today</span>
                        <h1>Dashboard</h1>
                        <p className="desc">
                            A single ledger view of enrollment, attendance and
                            collections across all branches.
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="card">
                <p style={{ color: 'var(--muted)' }}>You're logged in!</p>
            </div>
        </AuthenticatedLayout>
    );
}
