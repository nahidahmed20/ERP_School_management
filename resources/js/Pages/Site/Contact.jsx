import { Head, useForm, usePage } from '@inertiajs/react';
import SiteLayout from '@/Layouts/SiteLayout';

const desks = [
    { name: 'Dhanmondi', addr: 'House 12, Road 5, Dhanmondi, Dhaka', phone: '+880 1711-000001' },
    { name: 'Uttara', addr: 'Sector 7, Uttara, Dhaka', phone: '+880 1711-000002' },
    { name: 'Chattogram', addr: 'GEC Circle, Chattogram', phone: '+880 1711-000003' },
    { name: 'Sylhet', addr: 'Zindabazar, Sylhet', phone: '+880 1711-000004' },
];

export default function Contact() {
    const { flash } = usePage().props;
    const { data, setData, post, processing, errors, reset } = useForm({ name: '', phone: '', email: '', campus: 'General / Not sure', message: '' });
    const update = (field) => (e) => setData(field, e.target.value);

    const submit = (e) => {
        e.preventDefault();
        post(route('site.contact.store'), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <SiteLayout activePage="contact">
            <Head title="Contact — Verdant International School" />

            <div className="vd-page-hero">
                <div className="vd-container">
                    <div className="vd-top-label">Contact</div>
                    <h1>Talk to a campus, not a call centre.</h1>
                    <p>
                        Reach the admissions desk at your nearest campus directly, or send
                        a general inquiry below.
                    </p>
                </div>
            </div>

            <section>
                <div className="vd-container vd-contact-wrap">
                    <div>
                        <h3 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 18px' }}>
                            Campus admissions desks
                        </h3>
                        <div className="vd-campus-contact">
                            {desks.map((d) => (
                                <div className="vd-cc-card" key={d.name}>
                                    <div>
                                        <h4>{d.name}</h4>
                                        <p>{d.addr}</p>
                                    </div>
                                    <a className="vd-call-link" href={`tel:${d.phone.replace(/\s/g, '')}`}>{d.phone}</a>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="vd-contact-card">
                        <h3 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 20px' }}>
                            Send a general inquiry
                        </h3>
                        <form onSubmit={submit}>
                            {flash?.success && <p className="vd-form-note" role="status">{flash.success}</p>}
                            <div className="vd-form-row">
                                <div className="vd-field">
                                    <label htmlFor="name">Your name</label>
                                    <input id="name" type="text" required placeholder="Full name" value={data.name} onChange={update('name')} />
                                    {errors.name && <p className="vd-form-note">{errors.name}</p>}
                                </div>
                                <div className="vd-field">
                                    <label htmlFor="phone">Phone number</label>
                                    <input id="phone" type="tel" required placeholder="01XXX-XXXXXX" value={data.phone} onChange={update('phone')} />
                                    {errors.phone && <p className="vd-form-note">{errors.phone}</p>}
                                </div>
                            </div>
                            <div className="vd-form-row">
                                <div className="vd-field vd-full">
                                    <label htmlFor="email">Email address</label>
                                    <input id="email" type="email" placeholder="you@example.com" value={data.email} onChange={update('email')} />
                                    {errors.email && <p className="vd-form-note">{errors.email}</p>}
                                </div>
                            </div>
                            <div className="vd-form-row">
                                <div className="vd-field vd-full">
                                    <label htmlFor="campus">Which campus is this about?</label>
                                    <select id="campus" value={data.campus} onChange={update('campus')}>
                                        <option>General / Not sure</option>
                                        <option>Dhanmondi</option>
                                        <option>Uttara</option>
                                        <option>Chattogram</option>
                                        <option>Sylhet</option>
                                    </select>
                                </div>
                            </div>
                            <div className="vd-form-row">
                                <div className="vd-field vd-full">
                                    <label htmlFor="msg">Message</label>
                                    <textarea id="msg" rows="4" required placeholder="How can we help?" value={data.message} onChange={update('message')} />
                                    {errors.message && <p className="vd-form-note">{errors.message}</p>}
                                </div>
                            </div>
                            <button className="vd-submit-btn" type="submit" disabled={processing}>{processing ? 'Sending…' : 'Send Message'}</button>
                        </form>
                    </div>
                </div>
            </section>

            <section className="vd-map-strip">
                <div className="vd-container">
                    <div className="vd-map-placeholder">Campus Map — embed goes here</div>
                </div>
            </section>
        </SiteLayout>
    );
}
