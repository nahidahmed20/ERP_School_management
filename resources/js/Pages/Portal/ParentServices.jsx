import { Head, Link, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';
import { useState } from 'react';

const Box = ({ title, children }) => <section className="rounded-2xl border bg-white p-5 shadow-sm"><h2 className="font-bold">{title}</h2><div className="mt-4 space-y-2">{children}</div></section>;
const C = 'rounded-xl border-slate-300 text-sm';
const vapidKey = import.meta.env.VITE_WEB_PUSH_PUBLIC_KEY;
const decodeKey = value => { const padded = `${value}${'='.repeat((4 - value.length % 4) % 4)}`.replace(/-/g, '+').replace(/_/g, '/'); return Uint8Array.from(atob(padded), c => c.charCodeAt(0)); };

export default function ParentServices({ children, consents, invoices, payments = [], publishedExams = [], clearances = [], timeline = [], guardian }) {
    const [pushStatus, setPushStatus] = useState('');
    const otp = useForm({ otp: '' });
    const msg = useForm({ student_id: children[0]?.id || '', subject: '', message: '' });
    const meet = useForm({ student_id: children[0]?.id || '', requested_at: '', mode: 'in_person', agenda: '' });
    const leave = useForm({ student_id: children[0]?.id || '', start_date: '', end_date: '', reason: '' });
    const pref = useForm({ sms: guardian?.notification_preferences?.sms ?? true, email: guardian?.notification_preferences?.email ?? true, push: guardian?.notification_preferences?.push ?? false, attendance: guardian?.notification_preferences?.attendance ?? true, results: guardian?.notification_preferences?.results ?? true, fees: guardian?.notification_preferences?.fees ?? true, emergency_contact_name: guardian?.emergency_contact_name || '', emergency_contact_phone: guardian?.emergency_contact_phone || '', emergency_priority: guardian?.emergency_priority || 1 });
    const student = form => <select className={C} value={form.data.student_id} onChange={e => form.setData('student_id', e.target.value)}>{children.map(child => <option key={child.id} value={child.id}>{child.first_name} {child.last_name}</option>)}</select>;
    const send = (form, type) => e => { e.preventDefault(); form.post(route('portal.parent.request', type)); };
    const enablePush = async () => {
        try {
            if (!('serviceWorker' in navigator) || !('PushManager' in window)) throw new Error('This browser does not support push notifications.');
            if (!vapidKey) throw new Error('VITE_WEB_PUSH_PUBLIC_KEY is not configured.');
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') throw new Error('Notification permission was not granted.');
            const registration = await navigator.serviceWorker.register('/guardian-push-sw.js');
            const subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: decodeKey(vapidKey) });
            const json = subscription.toJSON();
            await axios.post(route('portal.parent.push.subscribe'), { endpoint: json.endpoint, public_key: json.keys?.p256dh, auth_token: json.keys?.auth, device_name: navigator.userAgent.slice(0, 250) });
            pref.setData('push', true); setPushStatus('Push notifications enabled on this device.');
        } catch (error) { setPushStatus(error.message || 'Push subscription failed.'); }
    };

    return <AuthenticatedLayout><Head title="Parent Services"/><main className="mx-auto max-w-7xl space-y-6 p-6">
        <div><Link href={route('dashboard')} className="text-indigo-600">← Dashboard</Link><h1 className="text-3xl font-black">Parent Service Center</h1></div>
        <div className="grid gap-6 lg:grid-cols-3">
            <Box title="Message school"><form onSubmit={send(msg, 'message')} className="grid gap-2">{student(msg)}<input className={C} required placeholder="Subject" value={msg.data.subject} onChange={e => msg.setData('subject', e.target.value)}/><textarea className={C} required placeholder="Message" value={msg.data.message} onChange={e => msg.setData('message', e.target.value)}/><button className="rounded-xl bg-indigo-600 p-2 text-white">Send</button></form></Box>
            <Box title="Appointment booking"><form onSubmit={send(meet, 'meeting')} className="grid gap-2">{student(meet)}<input className={C} required type="datetime-local" value={meet.data.requested_at} onChange={e => meet.setData('requested_at', e.target.value)}/><select className={C} value={meet.data.mode} onChange={e => meet.setData('mode', e.target.value)}><option value="in_person">In person</option><option value="online">Online</option><option value="phone">Phone</option></select><textarea className={C} placeholder="Agenda" value={meet.data.agenda} onChange={e => meet.setData('agenda', e.target.value)}/><button className="rounded-xl bg-indigo-600 p-2 text-white">Book</button></form></Box>
            <Box title="Student leave"><form onSubmit={send(leave, 'leave')} className="grid gap-2">{student(leave)}<input className={C} required type="date" value={leave.data.start_date} onChange={e => leave.setData('start_date', e.target.value)}/><input className={C} required type="date" value={leave.data.end_date} onChange={e => leave.setData('end_date', e.target.value)}/><textarea className={C} required placeholder="Reason" value={leave.data.reason} onChange={e => leave.setData('reason', e.target.value)}/><button className="rounded-xl bg-indigo-600 p-2 text-white">Submit</button></form></Box>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
            <Box title="Fees, receipts & siblings"><a className="inline-block rounded-lg bg-slate-900 px-3 py-2 text-sm text-white" href={route('portal.parent.statement')}>Download consolidated statement</a>{invoices.map(invoice => <p key={invoice.id} className="flex justify-between border-b py-2 text-sm"><span>{invoice.invoice_no}</span><b>৳{Number(invoice.amount + invoice.fine - invoice.discount - invoice.paid_amount).toLocaleString()} due</b></p>)}{payments.map(payment => <p key={payment.id} className="flex justify-between text-sm"><span>Payment #{payment.id} · ৳{payment.amount_paid}</span><a className="text-indigo-600" href={route('portal.parent.receipt', payment.id)}>Receipt PDF</a></p>)}</Box>
            <Box title="Phone, emergency & notifications"><p>{guardian.phone_verified_at ? 'Verified phone ✓' : 'Phone not verified'}</p>{!guardian.phone_verified_at && <div className="flex gap-2"><button onClick={() => otp.post(route('portal.parent.otp.send'))} disabled={otp.processing} className="rounded bg-indigo-600 p-2 text-white">Send OTP</button><input className={`${C} w-28`} inputMode="numeric" maxLength={6} value={otp.data.otp} onChange={e => otp.setData('otp', e.target.value)}/><button onClick={() => otp.post(route('portal.parent.otp.verify'))} disabled={otp.processing} className="rounded bg-emerald-600 px-3 text-white">Verify</button></div>}<button type="button" onClick={enablePush} className="rounded bg-violet-600 px-3 py-2 text-sm text-white">Enable push on this device</button>{pushStatus && <p className="text-xs text-slate-600">{pushStatus}</p>}<form onSubmit={e => { e.preventDefault(); pref.patch(route('portal.parent.preferences')); }} className="grid grid-cols-3 gap-3 text-sm">{['sms', 'email', 'push', 'attendance', 'results', 'fees'].map(key => <label key={key}><input type="checkbox" checked={pref.data[key]} onChange={e => pref.setData(key, e.target.checked)}/> {key}</label>)}<input className={`${C} col-span-2`} placeholder="Emergency contact" value={pref.data.emergency_contact_name} onChange={e => pref.setData('emergency_contact_name', e.target.value)}/><input className={C} placeholder="Emergency phone" value={pref.data.emergency_contact_phone} onChange={e => pref.setData('emergency_contact_phone', e.target.value)}/><label className="col-span-2">Emergency priority (1 is highest)<input className={`${C} ml-2 w-20`} type="number" min="1" max="10" value={pref.data.emergency_priority} onChange={e => pref.setData('emergency_priority', e.target.value)}/></label><button className="rounded bg-slate-900 p-2 text-white">Save</button></form></Box>
            <Box title="Consent & permission forms">{consents.length === 0 && <p className="text-sm text-slate-500">No consent request.</p>}{consents.map(consent => <div key={consent.id} className="border-b py-2 text-sm"><b>{consent.title}</b><p>{consent.details}</p>{consent.responded_at ? <span className={consent.is_granted ? 'text-emerald-600' : 'text-rose-600'}>{consent.is_granted ? 'Granted' : 'Declined'}</span> : <><button className="mr-3 text-emerald-600" onClick={() => router.patch(route('portal.parent.consents.respond', consent.id), { is_granted: true, signature_name: guardian.father_name })}>Grant</button><button className="text-rose-600" onClick={() => router.patch(route('portal.parent.consents.respond', consent.id), { is_granted: false, signature_name: guardian.father_name })}>Decline</button></>}</div>)}</Box>
            <Box title="Report cards & transcript">{children.map(child => <div key={child.id} className="border-b py-2"><a className="font-bold text-violet-700" href={route('portal.parent.transcript', child.id)}>{child.first_name} — Full transcript PDF</a>{publishedExams.map(exam => <a key={exam.id} className="block pl-3 text-sm text-indigo-600" href={route('portal.parent.report-card', [child.id, exam.id])}>{exam.name} report card</a>)}</div>)}</Box>
            <Box title="Student clearance">{clearances.map(clearance => <p key={clearance.id} className="flex justify-between border-b py-2"><span>{clearance.department}</span><b>{clearance.status} {Number(clearance.amount_due) > 0 && `· ৳${clearance.amount_due}`}</b></p>)}</Box>
            <Box title="Communication timeline">{timeline.map(event => <div key={event.id} className="border-b py-2 text-sm"><b>{event.channel} · {event.status}</b><p>{event.content}</p><small>{event.created_at}</small></div>)}</Box>
        </div>
    </main></AuthenticatedLayout>;
}
