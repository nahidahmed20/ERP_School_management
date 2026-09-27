import { Head, router, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

const C = "mt-1 w-full rounded-xl border-slate-300 text-sm",
    Box = ({ title, children }) => (
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-bold">{title}</h2>
            {children}
        </section>
    ),
    Btn = ({ children }) => (
        <button className="mt-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 transition-colors">
            {children}
        </button>
    );

export default function Index({
    wallets,
    users,
    outlets,
    foods,
    rawMaterials,
    orders,
    refunds,
    closings,
    consumption,
    summary,
}) {
    const today = new Date().toISOString().slice(0, 10);
    
    const w = useForm({ user_id: "", card_uid: "", daily_spending_limit: "" });
    const t = useForm({ cafeteria_wallet_id: "", amount: "", payment_method: "cash", reference_no: "" });
    const p = useForm({ identifier: "", cafeteria_outlet_id: "", payment_method: "wallet", items: [{ food_item_id: "", quantity: 1 }] });
    const cl = useForm({ cafeteria_outlet_id: "", business_date: today, opening_cash: 0, counted_cash: "", notes: "" });
    
    const st = useForm({ food_id: "", cafeteria_raw_material_id: "", stock_quantity: "", reorder_level: 5, stock_unit: "pcs" });

    const post = (f, n, par = {}) => (e) => {
        e.preventDefault();
        f.post(route(n, par), { preserveScroll: true, onSuccess: () => f.reset() });
    };

    const person = (u) => u.student ? `${u.student.first_name} ${u.student.last_name} (${u.student.admission_no})` : u.staff ? `${u.staff.first_name} ${u.staff.last_name} (${u.staff.staff_id_no})` : u.name;
    const addLine = () => p.setData("items", [...p.data.items, { food_item_id: "", quantity: 1 }]);
    const line = (i, k, v) => p.setData("items", p.data.items.map((x, n) => (n === i ? { ...x, [k]: v } : x)));

    return (
        <AuthenticatedLayout>
            <Head title="Cafeteria POS Dashboard" />
            <main className="mx-auto max-w-7xl space-y-6 p-6">
                
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Cafeteria & Wallet POS</h1>
                    <p className="text-sm text-slate-500">ID purchase, wallet control, kitchen tracking, stock, and daily closing.</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    {Object.entries(summary).map(([k, v]) => (
                        <div className="rounded-2xl bg-slate-900 p-4 text-white shadow-sm" key={k}>
                            <small className="capitalize text-slate-300 font-semibold">{k.replace(/([A-Z])/g, " $1")}</small>
                            <b className="block text-2xl font-mono mt-1">
                                {k.toLowerCase().includes("balance") || k === "sales" ? "৳ " : ""}{Number(v).toLocaleString()}
                            </b>
                        </div>
                    ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <Box title="Wallet / ID Card / Parent Limit">
                        <form onSubmit={post(w, "admin.cafeteria.wallets")}>
                            <select className={C} value={w.data.user_id} onChange={(e) => w.setData("user_id", e.target.value)} required>
                                <option value="">Select Student or Staff</option>
                                {users.map((u) => (<option key={u.id} value={u.id}>{person(u)}</option>))}
                            </select>
                            <input className={C} placeholder="Card UID / Barcode" value={w.data.card_uid} onChange={(e) => w.setData("card_uid", e.target.value)} />
                            <input className={C} type="number" placeholder="Daily Spending Limit (৳)" value={w.data.daily_spending_limit} onChange={(e) => w.setData("daily_spending_limit", e.target.value)} />
                            <Btn>Save Wallet Settings</Btn>
                        </form>
                    </Box>

                    <Box title="Wallet Top-up (Recharge)">
                        <form onSubmit={post(t, "admin.cafeteria.topups")}>
                            <select className={C} value={t.data.cafeteria_wallet_id} onChange={(e) => t.setData("cafeteria_wallet_id", e.target.value)} required>
                                <option value="">Select Wallet Account</option>
                                {wallets.map((x) => (<option key={x.id} value={x.id}>{x.user?.name} · (Bal: ৳{x.balance})</option>))}
                            </select>
                            <input className={C} type="number" placeholder="Recharge Amount" value={t.data.amount} onChange={(e) => t.setData("amount", e.target.value)} required />
                            <select className={C} value={t.data.payment_method} onChange={(e) => t.setData("payment_method", e.target.value)}>
                                <option value="cash">Cash</option>
                                <option value="bank">Bank/Card</option>
                                <option value="mobile_banking">Mobile Banking</option>
                                <option value="online">Online Payment</option>
                            </select>
                            <input className={C} placeholder="Txn Ref No. (Optional)" value={t.data.reference_no} onChange={(e) => t.setData("reference_no", e.target.value)} />
                            <Btn>Process Top-up</Btn>
                        </form>
                    </Box>

                    <Box title="Daily Cash Closing">
                        <form onSubmit={post(cl, "admin.cafeteria.cash-closing")}>
                            <select className={C} value={cl.data.cafeteria_outlet_id} onChange={(e) => cl.setData("cafeteria_outlet_id", e.target.value)} required>
                                <option value="">Select Outlet</option>
                                {outlets.map((x) => (<option key={x.id} value={x.id}>{x.name}</option>))}
                            </select>
                            <input className={C} type="date" value={cl.data.business_date} onChange={(e) => cl.setData("business_date", e.target.value)} required />
                            <input className={C} type="number" placeholder="Opening Cash Box (৳)" value={cl.data.opening_cash} onChange={(e) => cl.setData("opening_cash", e.target.value)} required />
                            <input className={C} type="number" placeholder="Counted Cash in Box (৳)" value={cl.data.counted_cash} onChange={(e) => cl.setData("counted_cash", e.target.value)} required />
                            <Btn>Close Register</Btn>
                        </form>
                    </Box>
                </div>

                <Box title="ID-card Purchase / Point of Sale">
                    <form onSubmit={post(p, "admin.cafeteria.purchase")}>
                        <div className="grid gap-3 md:grid-cols-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                            <input className={`${C} mt-0`} placeholder="Scan Card UID / Admission No." value={p.data.identifier} onChange={(e) => p.setData("identifier", e.target.value)} required autoFocus />
                            <select className={`${C} mt-0`} value={p.data.cafeteria_outlet_id} onChange={(e) => p.setData("cafeteria_outlet_id", e.target.value)} required>
                                <option value="">Select Outlet</option>
                                {outlets.map((x) => (<option key={x.id} value={x.id}>{x.name}</option>))}
                            </select>
                            <select className={`${C} mt-0`} value={p.data.payment_method} onChange={(e) => p.setData("payment_method", e.target.value)}>
                                <option value="wallet">Pay via Wallet</option>
                                <option value="cash">Pay with Cash</option>
                            </select>
                        </div>

                        <div className="mt-4 space-y-2">
                            {p.data.items.map((x, i) => (
                                <div className="flex items-center gap-2" key={i}>
                                    <select className={C} value={x.food_item_id} onChange={(e) => line(i, "food_item_id", e.target.value)} required>
                                        <option value="">Select Food Item</option>
                                        {foods.filter((f) => !p.data.cafeteria_outlet_id || String(f.cafeteria_outlet_id) === String(p.data.cafeteria_outlet_id)).map((f) => (
                                            <option value={f.id} key={f.id}>{f.name} · ৳{f.price} (Stock: {f.stock_quantity})</option>
                                        ))}
                                    </select>
                                    <input className={`${C} max-w-24 text-center`} type="number" min="1" value={x.quantity} onChange={(e) => line(i, "quantity", e.target.value)} required />
                                    {p.data.items.length > 1 && (
                                        <button type="button" onClick={() => p.setData("items", p.data.items.filter((_, n) => n !== i))} className="text-rose-500 hover:text-rose-700 bg-rose-50 p-2 rounded-xl mt-1">Remove</button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100">
                            <button type="button" onClick={addLine} className="text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100">+ Add another item</button>
                            <button type="submit" className="text-sm font-bold text-white bg-slate-900 px-6 py-2 rounded-xl shadow-md hover:bg-indigo-600 transition-colors">Charge & Send to Kitchen</button>
                        </div>
                    </form>
                </Box>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Box title="Live Kitchen Workflow">
                        <div className="space-y-3">
                            {orders.filter((o) => !["Served", "Voided", "Cancelled"].includes(o.status)).length === 0 ? <p className="text-center text-slate-400 py-4">No active orders in kitchen.</p> : null}
                            {orders.filter((o) => !["Served", "Voided", "Cancelled"].includes(o.status)).map((o) => (
                                <div key={o.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <span className="font-mono font-bold text-indigo-700">{o.order_number}</span>
                                            <span className="text-slate-600 text-sm ml-2 font-semibold">{o.customer?.name}</span>
                                        </div>
                                        <b className="text-slate-900 font-mono">৳{o.total_amount}</b>
                                    </div>
                                    <p className="text-sm text-slate-600 bg-white p-2 rounded border border-slate-100 mb-3">
                                        {o.items.map((i) => `${i.name} (x${i.quantity})`).join(", ")}
                                    </p>
                                    <div className="flex justify-between items-center">
                                        <div className="flex gap-2">
                                            {["Accepted", "Preparing", "Ready", "Served"].map((s) => (
                                                <button key={s} onClick={() => router.patch(route("admin.cafeteria.kitchen", o.id), { status: s }, { preserveScroll: true })} className={`rounded px-2.5 py-1 text-xs font-bold uppercase tracking-wider transition-colors ${o.status === s ? "bg-emerald-600 text-white shadow-sm" : "bg-slate-200 text-slate-500 hover:bg-slate-300"}`}>{s}</button>
                                            ))}
                                        </div>
                                        <button onClick={() => router.post(route("admin.cafeteria.refund.request", o.id), { type: "void", amount: o.total_amount, reason: "Counter void request" }, { preserveScroll: true })} className="text-xs font-bold text-rose-600 hover:text-rose-800">Void Order</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Box>

                    <Box title="Refund & Void Approvals">
                        <div className="space-y-3">
                            {refunds.filter((x) => x.status === "pending").length === 0 ? <p className="text-center text-slate-400 py-4">No pending refund requests.</p> : null}
                            {refunds.filter((x) => x.status === "pending").map((x) => (
                                <div key={x.id} className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 p-4">
                                    <div>
                                        <b className="uppercase text-amber-700 text-xs tracking-wider">{x.type} REQUEST</b>
                                        <span className="block font-mono text-slate-900 mt-1">Order: #{x.cafeteria_order_id}</span>
                                        <span className="block font-bold text-rose-600 font-mono">৳{x.amount}</span>
                                        <small className="block text-slate-600 mt-1">Reason: {x.reason}</small>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <button onClick={() => router.patch(route("admin.cafeteria.refund.decision", x.id), { status: "approved" })} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold">Approve</button>
                                        <button onClick={() => router.patch(route("admin.cafeteria.refund.decision", x.id), { status: "rejected" })} className="bg-rose-100 hover:bg-rose-200 text-rose-700 px-4 py-1.5 rounded-lg text-xs font-bold">Reject</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Box>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Box title="Food Stock & Kitchen Material Link">
                        <form onSubmit={(e) => {
                                e.preventDefault();
                                st.patch(route("admin.cafeteria.stock", st.data.food_id), { preserveScroll: true, onSuccess: () => st.reset() });
                            }}
                        >
                            <select className={C} value={st.data.food_id} onChange={(e) => {
                                    const f = foods.find((x) => String(x.id) === e.target.value);
                                    st.setData({
                                        ...st.data,
                                        food_id: e.target.value,
                                        cafeteria_raw_material_id: f?.cafeteria_raw_material_id || "",
                                        stock_quantity: f?.stock_quantity || 0,
                                        reorder_level: f?.reorder_level || 5,
                                        stock_unit: f?.stock_unit || "pcs",
                                    });
                                }} required
                            >
                                <option value="">Select Food item</option>
                                {foods.map((f) => (<option key={f.id} value={f.id}>{f.name} (Stock: {f.stock_quantity})</option>))}
                            </select>
                            
                            {/* 🟢 FIX: purchaseItems এর বদলে rawMaterials */}
                            <select className={C} value={st.data.cafeteria_raw_material_id} onChange={(e) => st.setData("cafeteria_raw_material_id", e.target.value)}>
                                <option value="">No linked kitchen material</option>
                                {rawMaterials?.map((x) => (<option key={x.id} value={x.id}>{x.name} (Stock: {x.stock_quantity})</option>))}
                            </select>
                            
                            <div className="grid grid-cols-3 gap-2">
                                <input className={C} type="number" placeholder="Stock Qty" value={st.data.stock_quantity} onChange={(e) => st.setData("stock_quantity", e.target.value)} required />
                                <input className={C} type="number" placeholder="Alert Level" value={st.data.reorder_level} onChange={(e) => st.setData("reorder_level", e.target.value)} required />
                                <input className={C} placeholder="Unit (pcs/kg)" value={st.data.stock_unit} onChange={(e) => st.setData("stock_unit", e.target.value)} required />
                            </div>
                            <Btn>Update Stock Levels</Btn>
                        </form>
                        
                        <div className="mt-4 space-y-2">
                            {foods.filter((f) => Number(f.stock_quantity) <= Number(f.reorder_level)).map((f) => (
                                <div key={f.id} className="rounded-lg bg-rose-50 border border-rose-100 p-3 text-sm flex justify-between items-center">
                                    <span className="font-bold text-slate-800">{f.name}</span>
                                    <span className="bg-rose-600 text-white px-2 py-0.5 rounded text-xs font-mono font-bold animate-pulse">Low Stock: {f.stock_quantity} {f.stock_unit}</span>
                                </div>
                            ))}
                        </div>
                    </Box>

                    <Box title="Today's Consumption Report">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-xs">
                                    <tr><th className="p-3">Item Name</th><th className="p-3 text-center">Qty Sold</th><th className="p-3 text-right">Revenue</th></tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {consumption.length === 0 ? <tr><td colSpan={3} className="p-4 text-center text-slate-400">No sales today.</td></tr> : consumption.map((x) => (
                                        <tr key={x.name} className="hover:bg-slate-50">
                                            <td className="p-3 font-semibold text-slate-800">{x.name}</td>
                                            <td className="p-3 text-center font-mono">{x.quantity}</td>
                                            <td className="p-3 text-right font-mono font-bold text-emerald-600">৳{Number(x.amount).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Box>
                </div>

                <Box title="Recent Cash Closings">
                    <div className="overflow-auto border rounded-xl">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 border-b text-slate-500 uppercase text-xs">
                                <tr><th className="p-3">Date</th><th className="p-3">Sales</th><th className="p-3">Expected</th><th className="p-3">Counted</th><th className="p-3">Variance</th></tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {closings.length === 0 ? <tr><td colSpan={5} className="p-4 text-center text-slate-400">No closings found.</td></tr> : closings.map((x) => (
                                    <tr key={x.id} className="hover:bg-slate-50">
                                        <td className="p-3 font-mono">{x.business_date}</td>
                                        <td className="p-3 font-mono">৳{x.cash_sales}</td>
                                        <td className="p-3 font-mono">৳{x.expected_cash}</td>
                                        <td className="p-3 font-mono font-bold">৳{x.counted_cash}</td>
                                        <td className={`p-3 font-mono font-bold ${Number(x.variance) !== 0 ? "text-rose-600 bg-rose-50" : "text-emerald-700 bg-emerald-50"}`}>
                                            ৳{x.variance}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Box>
            </main>
        </AuthenticatedLayout>
    );
}