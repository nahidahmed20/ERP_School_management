import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Pagination';

const money = value => new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT' }).format(Number(value || 0));

export default function Report({ items, summary, recentMovements, filters }) {
    const filter = (values) => router.get(route('admin.purchase.items.report'), { ...filters, ...values }, { preserveState: true, replace: true });
    return <AuthenticatedLayout>
        <Head title="Stock & Movement Report" />
        <div className="p-4 sm:p-6 space-y-5">
            <div className="flex flex-wrap justify-between gap-3"><div><h1 className="text-2xl font-bold text-slate-900">Stock & Movement Report</h1><p className="text-sm text-slate-500">Live stock, valuation, reorder warning এবং audit movement</p></div><button onClick={() => window.print()} className="px-4 py-2 rounded-lg bg-indigo-600 text-white">Print Report</button></div>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">{[['Products',summary.products],['Units',summary.units],['Stock Value',money(summary.stock_value)],['Low Stock',summary.low_stock],['Out of Stock',summary.out_of_stock]].map(([label,value]) => <div key={label} className="bg-white border rounded-xl p-4"><div className="text-xs text-slate-500">{label}</div><div className="text-xl font-bold mt-1">{value}</div></div>)}</div>
            <div className="bg-white border rounded-xl p-3 flex flex-wrap gap-3"><input defaultValue={filters.search || ''} onKeyDown={e => e.key === 'Enter' && filter({search:e.currentTarget.value})} placeholder="Product/code search" className="rounded-lg border-slate-300"/><select value={filters.status || ''} onChange={e => filter({status:e.target.value})} className="rounded-lg border-slate-300"><option value="">All stock</option><option value="low">Low stock</option><option value="out">Out of stock</option></select></div>
            <div className="bg-white border rounded-xl overflow-x-auto"><table className="min-w-full text-sm"><thead className="bg-slate-50"><tr>{['Code','Product','Category','Available','Reorder','Stock Value','Movements'].map(h=><th key={h} className="p-3 text-left">{h}</th>)}</tr></thead><tbody>{items.data.map(item=><tr key={item.id} className={Number(item.quantity)<=Number(item.reorder_level)?'bg-amber-50 border-t':'border-t'}><td className="p-3">{item.item_code}</td><td className="p-3 font-semibold">{item.name}</td><td className="p-3">{item.category}</td><td className="p-3">{item.quantity} {item.unit}</td><td className="p-3">{item.reorder_level}</td><td className="p-3">{money(Number(item.quantity)*Number(item.purchase_price))}</td><td className="p-3">{item.movements_count}</td></tr>)}</tbody></table><div className="p-3 border-t"><Pagination meta={items}/></div></div>
            <div className="bg-white border rounded-xl overflow-x-auto"><h2 className="font-bold p-4">Recent Stock Movements</h2><table className="min-w-full text-sm"><tbody>{recentMovements.map(m=><tr key={m.id} className="border-t"><td className="p-3">{m.created_at?.slice(0,10)}</td><td className="p-3">{m.item?.name}</td><td className="p-3">{m.movement_type}</td><td className={`p-3 font-bold ${m.quantity_change>0?'text-emerald-600':'text-rose-600'}`}>{m.quantity_change>0?'+':''}{m.quantity_change}</td><td className="p-3">{m.quantity_before} → {m.quantity_after}</td></tr>)}</tbody></table></div>
        </div>
    </AuthenticatedLayout>;
}
