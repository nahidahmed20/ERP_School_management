import { Head } from '@inertiajs/react';
import SiteLayout from '@/Layouts/SiteLayout';

const stages = [
    {
        badge: ['Play-', 'group'],
        title: 'Early Years (Play-group – KG)',
        desc: 'Play-based literacy and numeracy, motor skills, and first social routines, with a 1:10 teacher ratio.',
        tags: ['Phonics', 'Motor Skills', 'Story Circle'],
    },
    {
        badge: ['Class', '1–5'],
        title: 'Primary (Class 1 – 5)',
        desc: 'Core literacy, numeracy, and science foundations, alongside Bangla, English, and introductory computing.',
        tags: ['Bangla & English', 'Mathematics', 'Computing Basics'],
    },
    {
        badge: ['Class', '6–10'],
        title: 'Secondary (Class 6 – 10, SSC / O-Level)',
        desc: 'Subject specialization begins, with science/commerce/arts streaming from Class 9 and structured board-exam preparation.',
        tags: ['Science Stream', 'Commerce Stream', 'Arts Stream'],
    },
    {
        badge: ['Class', '11–12'],
        title: 'Higher Secondary (Class 11 – 12, HSC / A-Level)',
        desc: 'University-entrance focused, with dedicated admission-test coaching and a personal mentor per student.',
        tags: ['University Prep', 'Mentorship', 'Mock Admission Tests'],
    },
];

const pillars = [
    { mark: '✎', title: 'Weekly written feedback', desc: 'Every student gets a short written remark from their class teacher each week, visible to parents on the portal the same day.' },
    { mark: '⚙', title: 'Hands-on lab time', desc: 'Science and computing classes are lab-based from Class 4, not just lecture-and-textbook.' },
    { mark: '♟', title: 'A co-curricular each term', desc: 'Debate, robotics, art, or sport — every student picks one co-curricular activity per term, tracked in their record.' },
    { mark: '◈', title: 'A named mentor from Class 9', desc: 'From Class 9 onward, each student is paired with a faculty mentor who tracks their academic and university planning.' },
];

const terms = [
    { label: 'Term 1', range: 'January – April', items: [['Classes begin', 'Jan 5'], ['Mid-term assessment', 'Feb 22'], ['Term 1 exams', 'Apr 10–18']] },
    { label: 'Term 2', range: 'May – August', items: [['Classes resume', 'May 3'], ['Sports week', 'Jun 14–18'], ['Term 2 exams', 'Aug 9–17']] },
    { label: 'Term 3', range: 'September – December', items: [['Classes resume', 'Sep 6'], ['Annual day', 'Nov 20'], ['Final exams', 'Dec 1–12']] },
];

export default function Academics() {
    return (
        <SiteLayout activePage="academics">
            <Head title="Academics — Verdant International School" />

            <div className="vd-page-hero">
                <div className="vd-container">
                    <div className="vd-top-label">Academics</div>
                    <h1>A curriculum that grows with the child.</h1>
                    <p>
                        From first letters in Play-group to university placement in Class
                        12 — one continuous academic ladder, taught the same way across
                        every campus.
                    </p>
                </div>
            </div>

            <section>
                <div className="vd-container">
                    <div className="vd-sec-header">
                        <div className="vd-sec-label">The Academic Ladder</div>
                        <h2>Four stages, one continuous record.</h2>
                        <p>
                            Because every stage shares the same enrollment record, a child&apos;s
                            history — attendance, marks, remarks — carries forward without
                            re-entry, even across a campus transfer.
                        </p>
                    </div>

                    <div className="vd-ladder">
                        {stages.map((s) => (
                            <div className="vd-stage" key={s.title}>
                                <div className="vd-stage-dot">
                                    {s.badge[0]}
                                    <br />
                                    {s.badge[1]}
                                </div>
                                <div className="vd-stage-body">
                                    <h3>{s.title}</h3>
                                    <p>{s.desc}</p>
                                    <div className="vd-stage-tags">
                                        {s.tags.map((t) => (
                                            <span key={t}>{t}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="vd-bg-alt">
                <div className="vd-container">
                    <div className="vd-sec-header">
                        <div className="vd-sec-label">Beyond the Textbook</div>
                        <h2>Four things every Verdant student does.</h2>
                    </div>
                    <div className="vd-pillar-grid">
                        {pillars.map((p) => (
                            <div className="vd-pillar-card" key={p.title}>
                                <div className="vd-pillar-mark">{p.mark}</div>
                                <h3>{p.title}</h3>
                                <p>{p.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section>
                <div className="vd-container">
                    <div className="vd-sec-header">
                        <div className="vd-sec-label">Academic Calendar</div>
                        <h2>Session 2026–27, at a glance.</h2>
                    </div>
                    <div className="vd-calendar-wrap">
                        {terms.map((t) => (
                            <div className="vd-term-card" key={t.label}>
                                <div className="vd-term-eyebrow">{t.label}</div>
                                <h3>{t.range}</h3>
                                <ul>
                                    {t.items.map(([label, date]) => (
                                        <li key={label}>
                                            {label}
                                            <b>{date}</b>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </SiteLayout>
    );
}
