import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function SavedReports({ reportGroups }) {
  return (
    <AuthenticatedLayout>
      <Head title="Report Center" />

      <main className="w-full space-y-5 px-3 py-4 sm:space-y-6 sm:px-5 sm:py-6 lg:px-8">
        <header className="rounded-3xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-slate-50 px-5 py-6 shadow-sm sm:px-7">
          <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-800">Reports &amp; Insights</span>
          <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">Report Center</h1>
          <p className="mt-1 text-sm text-slate-600">Standard, contextual and custom reports from one place.</p>
        </header>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {reportGroups.map((group) => (
            <section key={group.name} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">
              <div className="mb-4 flex items-center gap-3 border-b border-slate-100 pb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-lg font-black text-emerald-800">{group.name.charAt(0)}</span>
                <h2 className="text-lg font-black text-slate-900">{group.name}</h2>
              </div>
              <div className="grid gap-2">
                {group.items.map(([name, url]) => (
                  <Link key={name} href={url} className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3.5 text-sm font-bold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50/70 hover:text-emerald-900">
                    <span>{name}</span>
                    <span className="text-emerald-700 transition-transform group-hover:translate-x-0.5" aria-hidden="true">→</span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

        <aside className="overflow-hidden rounded-2xl border border-emerald-900 bg-gradient-to-r from-emerald-950 to-slate-900 p-5 text-white shadow-sm sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-lg font-black text-emerald-200">i</span>
            <div>
              <b className="text-base font-extrabold">Person-specific reports</b>
              <p className="mt-1 text-sm leading-6 text-slate-300">Student List এবং Staff List-এর প্রতিটি record-এর action menu থেকে attendance, result, fees, payroll, leave, HR report এবং ID card খোলা যাবে।</p>
            </div>
          </div>
        </aside>
      </main>
    </AuthenticatedLayout>
  );
}
