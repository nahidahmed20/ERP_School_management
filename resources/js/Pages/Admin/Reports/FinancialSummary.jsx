import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const money = value => new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT' }).format(Number(value || 0));

export default function FinancialSummary({ accounts, summary, filters }) {
    const apply = e => { e.preventDefault(); const data = new FormData(e.currentTarget); router.get(route('admin.reports.financial-summary'), Object.fromEntries(data)); };
    return <AuthenticatedLayout><Head title="Financial Reports"/><div className="p-4 sm:p-6 space-y-5">
        <div className="flex flex-wrap justify-between gap-3"><div><h1 className="text-2xl font-bold">Financial Reports</h1><p className="text-sm text-slate-500">Trial balance, income, expense এবং profit একই জায়গায়</p></div><button onClick={()=>window.print()} className="px-4 py-2 rounded-lg bg-indigo-600 text-white">Print</button></div>
        <form onSubmit={apply} className="bg-white border rounded-xl p-3 flex flex-wrap gap-3"><input type="date" name="start_date" defaultValue={filters.startDate} className="rounded-lg border-slate-300"/><input type="date" name="end_date" defaultValue={filters.endDate} className="rounded-lg border-slate-300"/><button className="px-4 py-2 rounded-lg bg-indigo-600 text-white">Apply</button></form>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">{[['Debit',summary.total_debit],['Credit',summary.total_credit],['Income',summary.income],['Expense',summary.expense],['Net Profit',summary.net_profit]].map(([l,v])=><div key={l} className="bg-white border rounded-xl p-4"><div className="text-xs text-slate-500">{l}</div><div className="text-lg font-bold mt-1">{money(v)}</div></div>)}</div>
        <div className="bg-white border rounded-xl overflow-x-auto"><table className="min-w-full text-sm"><thead className="bg-slate-50"><tr>{['Code','Account','Type','Debit','Credit','Balance'].map(h=><th key={h} className="p-3 text-left">{h}</th>)}</tr></thead><tbody>{accounts.map(a=><tr key={a.id} className="border-t"><td className="p-3">{a.code}</td><td className="p-3 font-semibold">{a.name}</td><td className="p-3">{a.type}</td><td className="p-3">{money(a.period_debit)}</td><td className="p-3">{money(a.period_credit)}</td><td className="p-3 font-bold">{money(a.balance)}</td></tr>)}</tbody><tfoot><tr className="border-t-2 font-bold"><td colSpan="3" className="p-3">Trial Balance</td><td className="p-3">{money(summary.total_debit)}</td><td className="p-3">{money(summary.total_credit)}</td><td className="p-3">{summary.is_balanced?'Balanced':'Mismatch'}</td></tr></tfoot></table></div>
    </div></AuthenticatedLayout>;
}
