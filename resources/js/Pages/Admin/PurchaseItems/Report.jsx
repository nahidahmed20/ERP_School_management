import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Pagination';
import Icon from '@/Components/Icons';

const money = value => new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT' }).format(Number(value || 0));

export default function Report({ items, summary, recentMovements, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const filter = (values) => router.get(route('admin.purchase.items.report'), { ...filters, ...values }, { preserveState: true, replace: true });

    const cards = [
        { label: 'Products', value: summary.products, color: 'text-slate-900', mark: 'bg-slate-100' },
        { label: 'Units in stock', value: summary.units, color: 'text-sky-800', mark: 'bg-sky-100' },
        { label: 'Stock value', value: money(summary.stock_value), color: 'text-emerald-800', mark: 'bg-emerald-100' },
        { label: 'Low stock', value: summary.low_stock, color: 'text-amber-800', mark: 'bg-amber-100' },
        { label: 'Out of stock', value: summary.out_of_stock, color: 'text-rose-800', mark: 'bg-rose-100' },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Stock & Movement Report" />
            <div className="w-full space-y-5 px-3 py-4 sm:space-y-6 sm:px-5 sm:py-6 lg:px-8">
                <header className="no-print flex flex-col gap-4 rounded-3xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-slate-50 px-5 py-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-7">
                    <div>
                        <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-800">Inventory · Reports</span>
                        <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Stock &amp; Movement Report</h1>
                        <p className="mt-1 text-sm text-slate-600">Live stock, valuation, reorder warnings and movement history.</p>
                    </div>
                    <button onClick={() => window.print()} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-900 sm:w-auto">
                        <Icon name="printer" className="h-4 w-4" /> Print report
                    </button>
                </header>

                <section aria-label="Stock summary" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    {cards.map(card => (
                        <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{card.label}</span>
                                <span className={`h-2.5 w-2.5 rounded-full ${card.mark}`} />
                            </div>
                            <div className={`mt-3 text-xl font-black tracking-tight sm:text-2xl ${card.color}`}>{card.value}</div>
                        </div>
                    ))}
                </section>

                <section className="no-print overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
                        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-emerald-700">Inventory filters</p>
                        <h2 className="mt-1 text-lg font-bold text-slate-900">Find stock items</h2>
                    </div>
                    <form onSubmit={e => { e.preventDefault(); filter({ search }); }} className="grid grid-cols-1 items-end gap-3 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3">
                        <label className="text-xs font-bold uppercase tracking-wide text-slate-500 sm:col-span-2 lg:col-span-1">
                            Search products
                            <span className="relative mt-1.5 block">
                                <Icon name="search" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-700" />
                                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search product or item code..." className="block min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm font-normal normal-case tracking-normal text-slate-700 outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/20" />
                            </span>
                        </label>
                        <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                            Stock status
                            <select value={filters.status || ''} onChange={e => filter({ status: e.target.value })} className="mt-1.5 block min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium normal-case tracking-normal text-slate-700 outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/20">
                                <option value="">All stock</option>
                                <option value="low">Low stock</option>
                                <option value="out">Out of stock</option>
                            </select>
                        </label>
                        <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-900">
                            <Icon name="filter" className="h-4 w-4" /> Apply filters
                        </button>
                    </form>
                </section>

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-1 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <div><h2 className="text-sm font-bold text-slate-900">Stock by product</h2><p className="mt-0.5 text-xs text-slate-500">Available quantities, reorder levels and valuation</p></div>
                        <span className="self-start rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 sm:self-auto">{items.total ?? items.data.length} products</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[850px] text-left text-sm">
                            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                <tr>{['Code', 'Product', 'Category', 'Available', 'Reorder level', 'Stock value', 'Movements'].map(h => <th key={h} className="px-5 py-4">{h}</th>)}</tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {items.data.map(item => {
                                    const low = Number(item.quantity) <= Number(item.reorder_level);
                                    return <tr key={item.id} className={`transition-colors hover:bg-slate-50/70 ${low ? 'bg-amber-50/50' : ''}`}>
                                        <td className="whitespace-nowrap px-5 py-4 font-mono text-xs font-semibold text-slate-500">{item.item_code}</td>
                                        <td className="px-5 py-4 font-semibold text-slate-900">{item.name}</td>
                                        <td className="px-5 py-4 text-slate-600">{item.category}</td>
                                        <td className="px-5 py-4"><span className={`font-bold ${low ? 'text-amber-800' : 'text-slate-800'}`}>{item.quantity} {item.unit}</span>{low && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-800">Reorder</span>}</td>
                                        <td className="px-5 py-4 text-slate-600">{item.reorder_level} {item.unit}</td>
                                        <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-700">{money(Number(item.quantity) * Number(item.purchase_price))}</td>
                                        <td className="px-5 py-4"><span className="inline-flex min-w-8 justify-center rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">{item.movements_count}</span></td>
                                    </tr>;
                                })}
                                {!items.data.length && <tr><td colSpan="7" className="px-5 py-12 text-center text-sm text-slate-500">No stock items match these filters.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                    <div className="border-t border-slate-100 p-4 sm:px-6"><Pagination meta={items} /></div>
                </section>

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
                        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-sky-700">Audit trail</p>
                        <h2 className="mt-1 text-lg font-bold text-slate-900">Recent Stock Movements</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[650px] text-left text-sm">
                            <thead className="bg-white text-xs uppercase tracking-wide text-slate-500"><tr>{['Date', 'Product', 'Movement type', 'Change', 'Quantity after'].map(h => <th key={h} className="px-5 py-4">{h}</th>)}</tr></thead>
                            <tbody className="divide-y divide-slate-100">
                                {recentMovements.map(m => <tr key={m.id} className="transition-colors hover:bg-slate-50/70">
                                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">{m.created_at?.slice(0, 10)}</td>
                                    <td className="px-5 py-4 font-semibold text-slate-800">{m.item?.name}</td>
                                    <td className="px-5 py-4"><span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-700">{m.movement_type}</span></td>
                                    <td className={`px-5 py-4 font-bold ${m.quantity_change > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{m.quantity_change > 0 ? '+' : ''}{m.quantity_change}</td>
                                    <td className="px-5 py-4 font-medium text-slate-700">{m.quantity_before} <span className="px-1 text-slate-400">→</span> {m.quantity_after}</td>
                                </tr>)}
                                {!recentMovements.length && <tr><td colSpan="5" className="px-5 py-10 text-center text-sm text-slate-500">No stock movements found.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
