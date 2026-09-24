import { Head, router, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useEffect } from 'react';
import Swal from 'sweetalert2';
import Icon from '@/Components/Icons';

const InputClass = 'mt-1 w-full rounded-xl border-slate-300 text-sm focus:ring-indigo-500 focus:border-indigo-500 shadow-sm';

const Box = ({ title, children, icon }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <h2 className="mb-5 font-bold text-slate-800 flex items-center gap-2">
      {icon && <Icon name={icon} className="w-5 h-5 text-indigo-500" />} {title}
    </h2>
    {children}
  </section>
);

export default function Index({ vehicles, routes, stops, personnel, allocations, fuelLogs, maintenance, documents, boarding, fees, expenses, summary }) {
  const { flash } = usePage().props;

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000 });
    }
  }, [flash]);

  // Forms
  const p = useForm({ type: 'driver', name: '', phone: '', license_no: '', license_expires_at: '', national_id: '' });
  const s = useForm({ transport_route_id: '', name: '', sequence: 1, pickup_time: '', drop_time: '', latitude: '', longitude: '', geofence_radius_m: 200, monthly_fare: 0 });
  const f = useForm({ vehicle_id: '', date: new Date().toISOString().slice(0, 10), litres: '', unit_price: '', odometer: '', vendor: '', receipt_no: '' });
  const m = useForm({ vehicle_id: '', type: '', service_date: '', next_due_date: '', next_due_odometer: '', cost: 0, vendor: '', status: 'scheduled', notes: '' });
  const b = useForm({ transport_allocation_id: '', trip_date: new Date().toISOString().slice(0, 10), trip_type: 'pickup', event: 'boarded' });
  const e = useForm({ vehicle_id: '', date: new Date().toISOString().slice(0, 10), category: '', amount: '', reference: '', notes: '' });
  const mth = useForm({ month: new Date().toISOString().slice(0, 7) });

  const submit = (formInstance, url) => (event) => {
    event.preventDefault();
    formInstance.post(route(url), {
      preserveScroll: true,
      onSuccess: () => formInstance.reset()
    });
  };

  const VehicleSelect = ({ formInstance }) => (
    <select className={InputClass} value={formInstance.data.vehicle_id} onChange={e => formInstance.setData('vehicle_id', e.target.value)} required>
      <option value="" disabled>Select Vehicle</option>
      {vehicles.map(v => <option key={v.id} value={v.id}>{v.vehicle_number}</option>)}
    </select>
  );

  return (
    <AuthenticatedLayout>
      <Head title="Transport Operations" />
      <main className="mx-auto max-w-7xl space-y-8 p-6">
        
        {/* Header */}
        <div>
          <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">Fleet Management</span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Transport Operations</h1>
          <p className="text-sm text-slate-500 mt-1">Manage vehicles, drivers, routes, fuel logs, and student boarding.</p>
        </div>

        {/* Summary Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-indigo-600 p-6 text-white shadow-md relative overflow-hidden">
            <Icon name="droplet" className="absolute -right-4 -bottom-4 w-24 h-24 text-white opacity-20" />
            <small className="font-semibold uppercase tracking-wider text-indigo-100">Total Fuel Cost</small>
            <b className="block text-3xl mt-1">৳{Number(summary.fuel || 0).toLocaleString()}</b>
          </div>
          <div className="rounded-2xl bg-rose-600 p-6 text-white shadow-md relative overflow-hidden">
            <Icon name="tool" className="absolute -right-4 -bottom-4 w-24 h-24 text-white opacity-20" />
            <small className="font-semibold uppercase tracking-wider text-rose-100">Maintenance Cost</small>
            <b className="block text-3xl mt-1">৳{Number(summary.maintenance || 0).toLocaleString()}</b>
          </div>
          <div className="rounded-2xl bg-slate-800 p-6 text-white shadow-md relative overflow-hidden">
            <Icon name="dollar-sign" className="absolute -right-4 -bottom-4 w-24 h-24 text-white opacity-20" />
            <small className="font-semibold uppercase tracking-wider text-slate-300">Other Expenses</small>
            <b className="block text-3xl mt-1">৳{Number(summary.other || 0).toLocaleString()}</b>
          </div>
        </div>

        {/* First Row */}
        <div className="grid gap-6 xl:grid-cols-3">
          
          <Box title="Add Driver / Helper" icon="user">
            <form onSubmit={submit(p, 'admin.transport.personnel')} className="space-y-3">
              <select className={InputClass} value={p.data.type} onChange={x => p.setData('type', x.target.value)}>
                <option value="driver">Driver</option>
                <option value="helper">Helper</option>
              </select>
              <input className={InputClass} placeholder="Full Name" value={p.data.name} onChange={x => p.setData('name', x.target.value)} required />
              <input className={InputClass} placeholder="Phone Number" value={p.data.phone} onChange={x => p.setData('phone', x.target.value)} required />
              <input className={InputClass} placeholder="License Number" value={p.data.license_no} onChange={x => p.setData('license_no', x.target.value)} />
              <input className={InputClass} placeholder="NID Number" value={p.data.national_id} onChange={x => p.setData('national_id', x.target.value)} />
              <div>
                <label className="text-xs text-slate-500 font-bold ml-1">License Expiry Date</label>
                <input className={InputClass} type="date" value={p.data.license_expires_at} onChange={x => p.setData('license_expires_at', x.target.value)} />
              </div>
              <button disabled={p.processing} className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 p-2.5 font-bold text-white transition-colors">Save Personnel</button>
            </form>
          </Box>

          <Box title="Route Stops & Schedule" icon="map-pin">
            <form onSubmit={submit(s, 'admin.transport.stops')} className="space-y-3">
              <select className={InputClass} value={s.data.transport_route_id} onChange={x => s.setData('transport_route_id', x.target.value)} required>
                <option value="" disabled>Select Route</option>
                {routes.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
              </select>
              <input className={InputClass} placeholder="Stop Name (e.g. Mirpur 10)" value={s.data.name} onChange={x => s.setData('name', x.target.value)} required />
              
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-slate-500 font-bold ml-1">Pickup Time</label><input className={InputClass} type="time" value={s.data.pickup_time} onChange={x => s.setData('pickup_time', x.target.value)} /></div>
                <div><label className="text-xs text-slate-500 font-bold ml-1">Drop Time</label><input className={InputClass} type="time" value={s.data.drop_time} onChange={x => s.setData('drop_time', x.target.value)} /></div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <input className={InputClass} placeholder="Latitude" value={s.data.latitude} onChange={x => s.setData('latitude', x.target.value)} />
                <input className={InputClass} placeholder="Longitude" value={s.data.longitude} onChange={x => s.setData('longitude', x.target.value)} />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <input className={InputClass} placeholder="Radius (m)" type="number" value={s.data.geofence_radius_m} onChange={x => s.setData('geofence_radius_m', x.target.value)} />
                <input className={InputClass} placeholder="Monthly Fare" type="number" value={s.data.monthly_fare} onChange={x => s.setData('monthly_fare', x.target.value)} />
              </div>
              
              <button disabled={s.processing} className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 p-2.5 font-bold text-white transition-colors">Add Stop</button>
            </form>
          </Box>

          <Box title="Live Vehicle GPS Tracker" icon="navigation">
            <div className="space-y-3">
              {vehicles.map(v => (
                <div key={v.id} className="border border-slate-100 bg-slate-50 p-3 rounded-xl text-sm shadow-sm">
                  <b className="text-indigo-900 text-base">{v.vehicle_number}</b>
                  <p className="text-xs text-slate-500 mt-1 mb-2 font-mono">
                    {/* 🟢 Fix: Safe null access for latest_location */}
                    {v.latest_location?.latitude ? `${v.latest_location.latitude}, ${v.latest_location.longitude} · ${v.latest_location.recorded_at}` : 'No recent location data available'}
                  </p>
                  <button onClick={() => router.post(route('admin.transport.token', v.id))} className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded text-xs font-bold transition-colors">
                    Generate GPS Token
                  </button>
                </div>
              ))}
            </div>
          </Box>

        </div>

        {/* Expenses Row */}
        <div className="grid gap-6 xl:grid-cols-3">
          
          <Box title="Fuel Log Entry" icon="droplet">
            <form onSubmit={submit(f, 'admin.transport.fuel')} className="space-y-3">
              <VehicleSelect formInstance={f} />
              <input className={InputClass} type="date" value={f.data.date} onChange={x => f.setData('date', x.target.value)} required />
              <div className="grid grid-cols-2 gap-3">
                <input className={InputClass} type="number" step="0.01" placeholder="Litres" value={f.data.litres} onChange={x => f.setData('litres', x.target.value)} required />
                <input className={InputClass} type="number" step="0.01" placeholder="Price per Ltr" value={f.data.unit_price} onChange={x => f.setData('unit_price', x.target.value)} required />
              </div>
              <input className={InputClass} type="number" placeholder="Odometer Reading" value={f.data.odometer} onChange={x => f.setData('odometer', x.target.value)} />
              <input className={InputClass} placeholder="Vendor/Pump Name" value={f.data.vendor} onChange={x => f.setData('vendor', x.target.value)} />
              <button disabled={f.processing} className="w-full rounded-xl bg-amber-500 hover:bg-amber-600 p-2.5 font-bold text-white transition-colors">Save Fuel Record</button>
            </form>
          </Box>

          <Box title="Maintenance & Reminders" icon="tool">
            <form onSubmit={submit(m, 'admin.transport.maintenance')} className="space-y-3">
              <VehicleSelect formInstance={m} />
              <input className={InputClass} placeholder="Maintenance Type (e.g. Oil Change)" value={m.data.type} onChange={x => m.setData('type', x.target.value)} required />
              
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-slate-500 font-bold ml-1">Service Date</label><input className={InputClass} type="date" value={m.data.service_date} onChange={x => m.setData('service_date', x.target.value)} /></div>
                <div><label className="text-xs text-slate-500 font-bold ml-1">Next Due Date</label><input className={InputClass} type="date" value={m.data.next_due_date} onChange={x => m.setData('next_due_date', x.target.value)} /></div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <input className={InputClass} type="number" placeholder="Cost (৳)" value={m.data.cost} onChange={x => m.setData('cost', x.target.value)} />
                <input className={InputClass} placeholder="Vendor / Garage" value={m.data.vendor} onChange={x => m.setData('vendor', x.target.value)} />
              </div>
              <button disabled={m.processing} className="w-full rounded-xl bg-rose-600 hover:bg-rose-700 p-2.5 font-bold text-white transition-colors">Save Maintenance</button>
            </form>
          </Box>

          <Box title="Other Vehicle Expenses" icon="dollar-sign">
            <form onSubmit={submit(e, 'admin.transport.expenses')} className="space-y-3">
              <VehicleSelect formInstance={e} />
              <input className={InputClass} type="date" value={e.data.date} onChange={x => e.setData('date', x.target.value)} required />
              <input className={InputClass} placeholder="Category (e.g. Toll, Wash)" value={e.data.category} onChange={x => e.setData('category', x.target.value)} required />
              <input className={InputClass} type="number" placeholder="Amount (৳)" value={e.data.amount} onChange={x => e.setData('amount', x.target.value)} required />
              <input className={InputClass} placeholder="Reference No" value={e.data.reference} onChange={x => e.setData('reference', x.target.value)} />
              <textarea rows="2" className={`${InputClass} resize-none`} placeholder="Notes..." value={e.data.notes} onChange={x => e.setData('notes', x.target.value)} />
              <button disabled={e.processing} className="w-full rounded-xl bg-slate-800 hover:bg-slate-900 p-2.5 font-bold text-white transition-colors">Save Expense</button>
            </form>
          </Box>

        </div>

        {/* Boarding & Fees Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          
          <Box title="Manual Boarding Attendance" icon="check-square">
            <form onSubmit={submit(b, 'admin.transport.boarding')} className="space-y-4">
              <select className={InputClass} value={b.data.transport_allocation_id} onChange={x => b.setData('transport_allocation_id', x.target.value)} required>
                <option value="" disabled>Select Student Allocation</option>
                {/* 🟢 Fix: Safe user name access */}
                {allocations.map(a => <option key={a.id} value={a.id}>{a.user?.name || 'Unknown Student'} · {a.pickup_point}</option>)}
              </select>
              
              <div className="grid grid-cols-3 gap-3">
                <input className={InputClass} type="date" value={b.data.trip_date} onChange={x => b.setData('trip_date', x.target.value)} required />
                <select className={InputClass} value={b.data.trip_type} onChange={x => b.setData('trip_type', x.target.value)}>
                  <option value="pickup">Pickup (Going out)</option>
                  <option value="drop">Drop (Coming back)</option>
                </select>
                <select className={InputClass} value={b.data.event} onChange={x => b.setData('event', x.target.value)}>
                  <option value="boarded">Boarded (উঠেছে)</option>
                  <option value="dropped">Dropped (নেমেছে)</option>
                  <option value="absent">Absent (অনুপস্থিত)</option>
                </select>
              </div>
              <button disabled={b.processing} className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 p-2.5 font-bold text-white transition-colors">Record & Notify Guardian (SMS)</button>
            </form>
          </Box>

          <Box title="Route-wise Monthly Fees Generate" icon="credit-card">
            <p className="text-sm text-slate-500 mb-4">Generate fee invoices for all active transport students for a specific month.</p>
            <form onSubmit={submit(mth, 'admin.transport.fees.generate')} className="flex gap-3">
              <input className={`${InputClass} !mt-0`} type="month" value={mth.data.month} onChange={x => mth.setData('month', x.target.value)} required />
              <button disabled={mth.processing} className="shrink-0 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-6 py-2.5 font-bold text-white transition-colors">Generate Fees</button>
            </form>
            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700 text-sm font-semibold flex items-center gap-2">
              <Icon name="check-circle" className="w-4 h-4" /> System has generated {fees.length} fee records recently.
            </div>
          </Box>

        </div>

      </main>
    </AuthenticatedLayout>
  );
}