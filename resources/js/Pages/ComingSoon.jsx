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
            <p className="desc">এই মডিউলটি এখনও তৈরি করা হচ্ছে। শীঘ্রই এখানে পূর্ণাঙ্গ ফিচার যোগ করা হবে।</p>
          </div>
        </div>
      }
    >
      <Head title={title} />

      <div className="card cs-card">
        <div className="cs-icon"><Icon name="settings" /></div>
        <h2>{title} শীঘ্রই আসছে</h2>
        <p>এই মডিউলের কাজ চলছে। প্রয়োজনীয় ফিচার প্রস্তুত হলে এখান থেকেই ব্যবহার করতে পারবে।</p>
        <Link href={route('dashboard')} className="btn">
          <Icon name="grid" /> Dashboard এ ফিরে যাও
        </Link>
      </div>
    </AuthenticatedLayout>
  );
}
