import { Head, Link } from '@inertiajs/react';
import SiteLayout from '@/Layouts/SiteLayout';

const campuses = [
    {
        founded: 'Founded 1998',
        tag: 'Flagship Campus',
        name: 'Dhanmondi',
        desc: "The founding campus, home to Verdant's oldest library and the school's central science and arts wings. Play-group through A-Level under one roof.",
        stats: [
            { num: '1,240', cap: 'Students' },
            { num: '86', cap: 'Faculty' },
            { num: '1:14', cap: 'Teacher ratio' },
        ],
        facilities: ['Central Library', 'Science Labs ×3', 'Auditorium', 'Indoor Sports Hall'],
        quote: 'We built Verdant on one rule: know every child by name before you know their grades.',
        who: 'Principal, Dhanmondi Campus',
        reverse: false,
    },
    {
        founded: 'Founded 2011',
        tag: 'STEM Focus',
        name: 'Uttara',
        desc: 'Our newest purpose-built campus, designed around a dedicated robotics and coding lab from Class 4 onward, alongside a full-size indoor sports hall.',
        stats: [
            { num: '860', cap: 'Students' },
            { num: '58', cap: 'Faculty' },
            { num: '1:13', cap: 'Teacher ratio' },
        ],
        facilities: ['Robotics Lab', 'Coding Studio', 'Sports Hall', 'Music Room'],
        quote: 'Uttara students build their first working robot before they finish primary school.',
        who: 'Principal, Uttara Campus',
        reverse: true,
    },
    {
        founded: 'Founded 2016',
        tag: 'Residential',
        name: 'Chattogram',
        desc: 'A residential wing supports students joining from outside the city, with structured weekend mentoring and a house-based pastoral care system.',
        stats: [
            { num: '540', cap: 'Students' },
            { num: '140', cap: 'Boarders' },
            { num: '1:12', cap: 'Teacher ratio' },
        ],
        facilities: ['Boarding House', 'Dining Hall', 'Infirmary', 'Evening Study Hall'],
        quote: 'For boarders, our house parents become the second set of eyes every parent wants.',
        who: 'Principal, Chattogram Campus',
        reverse: false,
    },
];

const compareRows = [
    { name: 'Dhanmondi', grades: 'Play-group – A-Level', students: '1,240', boarding: 'No', program: 'Arts & Sciences' },
    { name: 'Uttara', grades: 'Class 1 – Class 12', students: '860', boarding: 'No', program: 'Robotics & Coding' },
    { name: 'Chattogram', grades: 'Class 1 – Class 10', students: '540', boarding: 'Yes', program: 'Residential Mentoring' },
    { name: 'Sylhet', grades: 'Play-group – Class 8', students: '310', boarding: 'No', program: 'Language Immersion' },
];

export default function Campuses() {
    return (
        <SiteLayout activePage="campuses">
            <Head title="Campuses — Verdant International School" />

            <div className="vd-page-hero">
                <div className="vd-container">
                    <div className="vd-top-label">Our Campuses</div>
                    <h1>Four campuses. One shared standard.</h1>
                    <p>
                        Every Verdant campus runs the same curriculum, faculty training, and
                        safety protocol — so a family can move between cities without their
                        child losing a beat.
                    </p>
                </div>
            </div>

            <section>
                <div className="vd-container">
                    {campuses.map((c) => (
                        <div className={`vd-campus-profile ${c.reverse ? 'vd-reverse' : ''}`} key={c.name}>
                            <div className="vd-profile-visual">
                                <span className="vd-founded-tag">{c.founded}</span>
                            </div>
                            <div>
                                <span className="vd-tag">{c.tag}</span>
                                <h2>{c.name}</h2>
                                <p className="vd-desc">{c.desc}</p>
                                <div className="vd-stat-row">
                                    {c.stats.map((s) => (
                                        <div className="vd-stat-box" key={s.cap}>
                                            <div className="vd-num">{s.num}</div>
                                            <div className="vd-cap">{s.cap}</div>
                                        </div>
                                    ))}
                                </div>
                                <ul className="vd-facility-list">
                                    {c.facilities.map((f) => (
                                        <li key={f}>{f}</li>
                                    ))}
                                </ul>
                                <div className="vd-principal-note">
                                    <div className="vd-avatar" />
                                    <div>
                                        <p>&quot;{c.quote}&quot;</p>
                                        <span>— {c.who}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="vd-compare-strip">
                <div className="vd-container">
                    <div className="vd-compare-head">
                        <div className="vd-sec-label">At a Glance</div>
                        <h2>Compare campuses before you apply.</h2>
                    </div>
                    <table className="vd-compare-table">
                        <thead>
                            <tr>
                                <th>Campus</th>
                                <th>Grades offered</th>
                                <th>Students</th>
                                <th>Boarding</th>
                                <th>Signature program</th>
                            </tr>
                        </thead>
                        <tbody>
                            {compareRows.map((r) => (
                                <tr key={r.name}>
                                    <td className="vd-campus-name">{r.name}</td>
                                    <td>{r.grades}</td>
                                    <td>{r.students}</td>
                                    <td>{r.boarding}</td>
                                    <td>{r.program}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div style={{ marginTop: 32 }}>
                        <Link className="vd-btn-outline" href={route('site.admissions')}>
                            Start an application →
                        </Link>
                    </div>
                </div>
            </section>
        </SiteLayout>
    );
}
