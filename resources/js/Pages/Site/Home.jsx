import { Head, Link } from '@inertiajs/react';
import { useEffect } from 'react';
import SiteLayout from '@/Layouts/SiteLayout';

export default function Home() {
    useEffect(() => {
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) {
                        e.target.classList.add('vd-visible');
                        io.unobserve(e.target);
                    }
                });
            },
            { threshold: 0.15 }
        );
        document.querySelectorAll('.vd-fade-up').forEach((el) => io.observe(el));
        return () => io.disconnect();
    }, []);

    return (
        <SiteLayout activePage="home">
            <Head title="Verdant International School & Colleges" />

            <section className="vd-hero-sec">
                <div className="vd-container vd-hero-grid">
                    <div>
                        <div className="vd-top-label">Admission — Session 2026–27 Open</div>
                        <h1>
                            Where every report card <em>tells a story</em> of growth.
                        </h1>
                        <p className="vd-hero-text">
                            Four campuses, one standard of care. Verdant blends a disciplined
                            academic tradition with modern classrooms — so every child's
                            progress is visible, measured, and celebrated.
                        </p>
                        <div className="vd-hero-buttons">
                            <Link className="vd-btn-main" href={route('site.admissions')}>
                                Apply for Admission
                            </Link>
                            <Link className="vd-btn-hollow" href={route('site.campuses')}>
                                Explore Campuses
                            </Link>
                        </div>
                    </div>

                    <div className="vd-stats-panel">
                        <div className="vd-stats-head">
                            <div>
                                <div className="vd-stat-key">Institution</div>
                                <div className="vd-stat-val">Verdant Int&apos;l School</div>
                            </div>
                            <div className="vd-stats-stamp">
                                EST.
                                <br />
                                2004
                            </div>
                        </div>
                        <div className="vd-grade-line">
                            <div className="vd-grade-title">Average Attendance</div>
                            <div className="vd-grade-value">
                                <span className="vd-grade-num">96%</span>
                                <span className="vd-grade-pill">A+</span>
                            </div>
                        </div>
                        <div className="vd-grade-line">
                            <div className="vd-grade-title">SSC / O-Level Pass Rate</div>
                            <div className="vd-grade-value">
                                <span className="vd-grade-num">99.2%</span>
                                <span className="vd-grade-pill">A+</span>
                            </div>
                        </div>
                        <div className="vd-grade-line">
                            <div className="vd-grade-title">Campuses Nationwide</div>
                            <div className="vd-grade-value">
                                <span className="vd-grade-num">4</span>
                                <span className="vd-grade-pill">GROWING</span>
                            </div>
                        </div>
                        <div className="vd-stats-quote">
                            &quot;Consistent, curious, and kind — Verdant students carry their
                            classroom habits into the world.&quot; — Head of Schools
                        </div>
                    </div>
                </div>
            </section>

            <section className="vd-bg-alt" id="campuses">
                <div className="vd-container">
                    <div className="vd-sec-header vd-fade-up">
                        <div className="vd-sec-label">Our Campuses</div>
                        <h2>One Verdant standard, four neighbourhoods.</h2>
                        <p>
                            Every campus follows the same curriculum, faculty training, and
                            safety protocol — parents can transfer a seat between campuses
                            without starting over.
                        </p>
                    </div>
                    <div className="vd-cards-grid">
                        {[
                            {
                                tag: 'Flagship',
                                name: 'Dhanmondi Campus',
                                desc: "Play-group through A-Level, with the school's oldest library and science wing.",
                                students: '1,240',
                                founded: '1998',
                            },
                            {
                                tag: 'STEM Focus',
                                name: 'Uttara Campus',
                                desc: 'Dedicated robotics and coding labs from Class 4, plus an indoor sports hall.',
                                students: '860',
                                founded: '2011',
                            },
                            {
                                tag: 'Boarding',
                                name: 'Chattogram Campus',
                                desc: 'Residential wing for students from outside the city, with weekend mentoring.',
                                students: '540',
                                founded: '2016',
                            },
                        ].map((c) => (
                            <div className="vd-info-card vd-fade-up" key={c.name}>
                                <span className="vd-card-badge">{c.tag}</span>
                                <h3>{c.name}</h3>
                                <p>{c.desc}</p>
                                <div className="vd-card-meta">
                                    <div>
                                        <b>{c.students}</b>Students
                                    </div>
                                    <div>
                                        <b>{c.founded}</b>Founded
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="results">
                <div className="vd-container">
                    <div className="vd-sec-header vd-fade-up">
                        <div className="vd-sec-label">Board Results</div>
                        <h2>Five years of results, in one glance.</h2>
                    </div>
                    <div className="vd-results-layout">
                        <div className="vd-fade-up">
                            {[
                                { year: 2026, pct: 99.2 },
                                { year: 2025, pct: 97.4 },
                                { year: 2024, pct: 95.8 },
                                { year: 2023, pct: 93.1 },
                                { year: 2022, pct: 90.5 },
                            ].map((r) => (
                                <div className="vd-bar-row" key={r.year}>
                                    <div className="vd-bar-year">{r.year}</div>
                                    <div className="vd-bar-track">
                                        <div
                                            className="vd-bar-fill"
                                            style={{ width: `${r.pct}%` }}
                                        />
                                    </div>
                                    <div className="vd-bar-pct">{r.pct}%</div>
                                </div>
                            ))}
                        </div>
                        <div className="vd-feature-card vd-fade-up">
                            <div className="vd-feature-big">27</div>
                            <div className="vd-feature-cap">
                                Students placed in Dhaka University &amp; BUET last academic
                                year alone.
                            </div>
                            <ul className="vd-feature-list">
                                <li>National Science Olympiad — Gold, 2026</li>
                                <li>Inter-school Debate Champions — 3 years running</li>
                                <li>100% attendance award given to 340+ students</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <section className="vd-bg-alt" id="admissions">
                <div className="vd-container">
                    <div className="vd-sec-header vd-fade-up">
                        <div className="vd-sec-label">Admissions</div>
                        <h2>Three steps from inquiry to enrollment.</h2>
                    </div>
                    <div className="vd-step-grid">
                        {[
                            { n: 1, t: 'Apply online', d: "Submit the form with your child's academic history — takes about 10 minutes, any campus." },
                            { n: 2, t: 'Assessment & interview', d: 'A short, age-appropriate assessment and a friendly conversation with the class teacher.' },
                            { n: 3, t: 'Confirm your seat', d: 'Receive your offer, complete enrollment online, and get instant portal access.' },
                        ].map((s) => (
                            <div className="vd-step-block vd-fade-up" key={s.n}>
                                <div className="vd-step-num">{s.n}</div>
                                <h3>{s.t}</h3>
                                <p>{s.d}</p>
                            </div>
                        ))}
                    </div>
                    <div className="vd-alert-badge">
                        Session 2026–27 admissions close August 30
                    </div>
                </div>
            </section>

            <section className="vd-bg-alt">
                <div className="vd-container">
                    <div className="vd-sec-header vd-fade-up">
                        <div className="vd-sec-label">Families &amp; Alumni</div>
                        <h2>Told in their own words.</h2>
                    </div>
                    <div className="vd-review-grid">
                        {[
                            { q: 'The portal alone changed how involved I am — I see my daughter\u2019s attendance and marks the same day.', name: 'Nasrin Akter', role: 'Parent, Uttara Campus' },
                            { q: 'Small class sizes and teachers who actually remember what you struggled with last term.', name: 'Rafiul Islam', role: 'Alumnus, Class of 2022' },
                            { q: 'Transferring between campuses when we relocated was seamless — same records, same standard.', name: 'Farhana Chowdhury', role: 'Parent, Dhanmondi Campus' },
                        ].map((t) => (
                            <div className="vd-review-card vd-fade-up" key={t.name}>
                                <p className="vd-review-quote">&quot;{t.q}&quot;</p>
                                <div className="vd-reviewer">
                                    <div className="vd-reviewer-img" />
                                    <div>
                                        <div className="vd-reviewer-name">{t.name}</div>
                                        <div className="vd-reviewer-role">{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="portal">
                <div className="vd-container">
                    <div className="vd-portal-box">
                        <div>
                            <h2>Already a Verdant family?</h2>
                            <p>
                                Check attendance, marks, fee status, and notices — one login
                                for students, parents, and staff.
                            </p>
                        </div>
                        <div className="vd-portal-actions">
                            <Link className="vd-btn-main" href={route('login')}>
                                Parent / Student Login
                            </Link>
                            <Link className="vd-btn-outline-gold" href={route('login')}>
                                Staff Login
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </SiteLayout>
    );
}
