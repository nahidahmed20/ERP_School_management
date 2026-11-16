import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';

export default function ComingSoon({ title, group }) {
  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div>
            {group && <span className="eyebrow">{group}</span>}
            <h1>{title}</h1>
            <p className="desc">This module is under development. More features will be available here soon.</p>
          </div>
        </div>
      }
    >
      <Head title={title} />

      <div className="card cs-card">
        <div className="cs-icon"><Icon name="settings" /></div>
        <h2>{title} is coming soon</h2>
        <p>This module is being built. You will be able to use it here when it is ready.</p>
        <Link href={route('dashboard')} className="btn">
          <Icon name="grid" /> Return to Dashboard
        </Link>
      </div>
    </AuthenticatedLayout>
  );
}
