import { Head } from '@inertiajs/react';
import { useState } from 'react';
import SiteLayout from '@/Layouts/SiteLayout';

const desks = [
    { name: 'Dhanmondi', addr: 'House 12, Road 5, Dhanmondi, Dhaka', phone: '+880 1711-000001' },
    { name: 'Uttara', addr: 'Sector 7, Uttara, Dhaka', phone: '+880 1711-000002' },
    { name: 'Chattogram', addr: 'GEC Circle, Chattogram', phone: '+880 1711-000003' },
    { name: 'Sylhet', addr: 'Zindabazar, Sylhet', phone: '+880 1711-000004' },
];

export default function Contact() {
    const [form, setForm] = useState({ name: '', phone: '', email: '', campus: 'General / Not sure', message: '' });
    const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    const submit = (e) => {
        e.preventDefault();
        // TODO: post to route('site.contact.store') once the controller exists
        console.log('Contact inquiry (not yet wired to backend):', form);
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
                            <div className="vd-form-row">
                                <div className="vd-field">
                                    <label htmlFor="name">Your name</label>
                                    <input id="name" type="text" placeholder="Full name" value={form.name} onChange={update('name')} />
                                </div>
                                <div className="vd-field">
                                    <label htmlFor="phone">Phone number</label>
                                    <input id="phone" type="tel" placeholder="01XXX-XXXXXX" value={form.phone} onChange={update('phone')} />
                                </div>
                            </div>
                            <div className="vd-form-row">
                                <div className="vd-field vd-full">
                                    <label htmlFor="email">Email address</label>
                                    <input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={update('email')} />
                                </div>
                            </div>
                            <div className="vd-form-row">
                                <div className="vd-field vd-full">
                                    <label htmlFor="campus">Which campus is this about?</label>
                                    <select id="campus" value={form.campus} onChange={update('campus')}>
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
                                    <textarea id="msg" rows="4" placeholder="How can we help?" value={form.message} onChange={update('message')} />
                                </div>
                            </div>
                            <button className="vd-submit-btn" type="submit">Send Message</button>
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
