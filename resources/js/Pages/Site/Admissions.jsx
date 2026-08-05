import { Head } from '@inertiajs/react';
import { useState } from 'react';
import SiteLayout from '@/Layouts/SiteLayout';

const steps = [
    { n: 1, t: 'Apply online', d: "Fill in the form below with your child's academic history — takes about 10 minutes, for any campus." },
    { n: 2, t: 'Assessment & interview', d: 'Within 5 working days, we schedule a short, age-appropriate assessment and a conversation with the class teacher.' },
    { n: 3, t: 'Confirm your seat', d: 'Receive your offer letter, complete enrollment and payment online, and get instant portal access.' },
];

const faqs = [
    { q: 'Can I apply to more than one campus?', a: "Yes — list your preferred campus on the form, and our admissions team will let you know if a seat opens at another campus if your first choice is full." },
    { q: 'Is there an admission test for Play-group or KG?', a: "No formal test — just a short, informal interaction to understand the child's comfort with routine and language, alongside a conversation with parents." },
    { q: "What if we're transferring from another school mid-session?", a: 'Mid-session transfers are assessed on a case-by-case basis depending on seat availability; bring the transfer certificate and latest report card to the interview.' },
    { q: 'When will I get portal access?', a: "As soon as enrollment and the first payment are confirmed, you'll receive parent portal login details by email, usually within 24 hours." },
];

export default function Admissions() {
    const [form, setForm] = useState({
        childName: '',
        dob: '',
        campus: 'Dhanmondi',
        grade: 'Play-group',
        guardianName: '',
        phone: '',
        email: '',
    });

    const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    const submit = (e) => {
        e.preventDefault();
        // TODO: post to route('site.admissions.store') once the controller exists
        console.log('Admission application (not yet wired to backend):', form);
    };

    return (
        <SiteLayout activePage="admissions">
            <Head title="Admissions — Verdant International School" />

            <div className="vd-page-hero">
                <div className="vd-container">
                    <div className="vd-top-label">Admissions</div>
                    <h1>Three steps from inquiry to enrollment.</h1>
                    <p>
                        Applications are open for Session 2026–27 across all four
                        campuses, from Play-group through Class 11.
                    </p>
                    <div className="vd-alert-badge">Admissions close August 30, 2026</div>
                </div>
            </div>

            <section>
                <div className="vd-container">
                    <div className="vd-sec-header">
                        <div className="vd-sec-label">The Process</div>
                        <h2>What happens after you apply.</h2>
                    </div>
                    <div className="vd-step-grid">
                        {steps.map((s) => (
                            <div className="vd-step-block" key={s.n}>
                                <div className="vd-step-num">{s.n}</div>
                                <h3>{s.t}</h3>
                                <p>{s.d}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="vd-bg-alt">
                <div className="vd-container">
                    <div className="vd-form-wrap">
                        <div className="vd-req-card">
                            <h3>What you&apos;ll need on hand</h3>
                            <ul>
                                <li>Child&apos;s birth certificate or NID</li>
                                <li>Previous school&apos;s transfer certificate (if applicable)</li>
                                <li>Last two years&apos; report cards</li>
                                <li>One passport-size photograph</li>
                                <li>Parent/guardian contact details</li>
                            </ul>
                        </div>

                        <div className="vd-app-card">
                            <div className="vd-app-head">
                                <div className="vd-app-key">Application For</div>
                                <div className="vd-app-val">Session 2026–27</div>
                            </div>
                            <form onSubmit={submit}>
                                <div className="vd-form-row">
                                    <div className="vd-field">
                                        <label htmlFor="cname">Child&apos;s full name</label>
                                        <input id="cname" type="text" placeholder="e.g. Ayesha Rahman" value={form.childName} onChange={update('childName')} />
                                    </div>
                                    <div className="vd-field">
                                        <label htmlFor="cdob">Date of birth</label>
                                        <input id="cdob" type="date" value={form.dob} onChange={update('dob')} />
                                    </div>
                                </div>
                                <div className="vd-form-row">
                                    <div className="vd-field">
                                        <label htmlFor="campus">Preferred campus</label>
                                        <select id="campus" value={form.campus} onChange={update('campus')}>
                                            <option>Dhanmondi</option>
                                            <option>Uttara</option>
                                            <option>Chattogram</option>
                                            <option>Sylhet</option>
                                        </select>
                                    </div>
                                    <div className="vd-field">
                                        <label htmlFor="grade">Applying for class</label>
                                        <select id="grade" value={form.grade} onChange={update('grade')}>
                                            <option>Play-group</option>
                                            <option>KG</option>
                                            <option>Class 1</option>
                                            <option>Class 6</option>
                                            <option>Class 9</option>
                                            <option>Class 11</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="vd-form-row">
                                    <div className="vd-field">
                                        <label htmlFor="gname">Parent / guardian name</label>
                                        <input id="gname" type="text" placeholder="e.g. Nasrin Akter" value={form.guardianName} onChange={update('guardianName')} />
                                    </div>
                                    <div className="vd-field">
                                        <label htmlFor="gphone">Phone number</label>
                                        <input id="gphone" type="tel" placeholder="01XXX-XXXXXX" value={form.phone} onChange={update('phone')} />
                                    </div>
                                </div>
                                <div className="vd-form-row">
                                    <div className="vd-field vd-full">
                                        <label htmlFor="gemail">Email address</label>
                                        <input id="gemail" type="email" placeholder="you@example.com" value={form.email} onChange={update('email')} />
                                    </div>
                                </div>
                                <button className="vd-submit-btn" type="submit">Submit Application</button>
                                <p className="vd-form-note">You&apos;ll receive a confirmation email and an application ID within a few minutes.</p>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <div className="vd-container" style={{ maxWidth: 820 }}>
                    <div className="vd-sec-header">
                        <div className="vd-sec-label">Frequently Asked</div>
                        <h2>Before you apply.</h2>
                    </div>
                    {faqs.map((f, i) => (
                        <details className="vd-faq-item" key={f.q} open={i === 0}>
                            <summary>{f.q}</summary>
                            <p>{f.a}</p>
                        </details>
                    ))}
                </div>
            </section>
        </SiteLayout>
    );
}
