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
            <Head title="ভারড্যান্ট ইন্টারন্যাশনাল স্কুল অ্যান্ড কলেজ" />

            {/* হিরো সেকশন */}
            <section className="vd-hero-sec">
                <div className="vd-container vd-hero-grid">
                    <div>
                        <div className="vd-top-label">ভর্তি চলছে — শিক্ষাবর্ষ ২০২৬-২৭</div>
                        <h1>
                            যেখানে প্রতিটি শিশুর মেধা <em>ডানা মেলে</em> নতুন আকাশে।
                        </h1>
                        <p className="vd-hero-text">
                            চারটি ক্যাম্পাস, কিন্তু শিক্ষার মান একটাই। ভারড্যান্ট দিচ্ছে সুশৃঙ্খল একাডেমিক পরিবেশ এবং আধুনিক ক্লাসরুমের নিশ্চয়তা—যাতে আপনার সন্তানের অগ্রগতি হয় দৃশ্যমান।
                        </p>
                        <div className="vd-hero-buttons">
                            <Link className="vd-btn-main" href={route('site.admissions')}>
                                ভর্তির আবেদন করুন
                            </Link>
                            <Link className="vd-btn-hollow" href={route('site.campuses')}>
                                ক্যাম্পাসসমূহ দেখুন
                            </Link>
                        </div>
                    </div>

                    <div className="vd-stats-panel vd-fade-up">
                        <div className="vd-stats-head">
                            <div>
                                <div className="vd-stat-key">প্রতিষ্ঠানের নাম</div>
                                <div className="vd-stat-val">ভারড্যান্ট ইন্টারন্যাশনাল স্কুল</div>
                            </div>
                            <div className="vd-stats-stamp">স্থাপিত<br />২০০৪</div>
                        </div>
                        <div className="vd-grade-line">
                            <div className="vd-grade-title">শিক্ষার্থীদের গড় উপস্থিতি</div>
                            <div className="vd-grade-value">
                                <span className="vd-grade-num">৯৬%</span>
                                <span className="vd-grade-pill">চমৎকার</span>
                            </div>
                        </div>
                        <div className="vd-grade-line">
                            <div className="vd-grade-title">এসএসসি / ও-লেভেল পাসের হার</div>
                            <div className="vd-grade-value">
                                <span className="vd-grade-num">৯৯.২%</span>
                                <span className="vd-grade-pill">এ+</span>
                            </div>
                        </div>
                        <div className="vd-grade-line">
                            <div className="vd-grade-title">দেশজুড়ে মোট ক্যাম্পাস</div>
                            <div className="vd-grade-value">
                                <span className="vd-grade-num">৪</span>
                                <span className="vd-grade-pill">বর্ধনশীল</span>
                            </div>
                        </div>
                        <div className="vd-stats-quote">
                            "নিয়মানুবর্তিতা, কৌতূহল এবং মানবিকতা—ভারড্যান্টের শিক্ষার্থীরা ক্লাসরুমের এই অভ্যাসগুলো জীবনেও ধারণ করে।" — হেড অব স্কুলস
                        </div>
                    </div>
                </div>
            </section>

            {/* নতুন: নোটিশ বোর্ড */}
            <section className="vd-bg-alt" id="notices">
                <div className="vd-container">
                    <div className="vd-sec-header vd-fade-up">
                        <div className="vd-sec-label">জরুরি আপডেট</div>
                        <h2>নোটিশ বোর্ড</h2>
                    </div>
                    <div className="vd-notice-layout vd-fade-up">
                        {[
                            { date: '১৯ আগস্ট', title: 'ষষ্ঠ শ্রেণীর ভর্তি পরীক্ষার চূড়ান্ত ফলাফল প্রকাশিত হয়েছে', tag: 'ভর্তি' },
                            { date: '১৫ আগস্ট', title: 'জাতীয় শোক দিবস উপলক্ষে রচনা প্রতিযোগিতা ও আলোচনা সভা', tag: 'অনুষ্ঠান' },
                            { date: '১২ আগস্ট', title: 'এসএসসি ২০২৬ পরীক্ষার্থীদের প্রাক-নির্বাচনী পরীক্ষার রুটিন', tag: 'একাডেমিক' },
                            { date: '০৫ আগস্ট', title: 'গ্রীষ্মকালীন ছুটি উপলক্ষে প্রতিষ্ঠান বন্ধ থাকার নোটিশ', tag: 'ছুটি' },
                        ].map((notice, i) => (
                            <div className="vd-notice-row" key={i}>
                                <div className="vd-notice-date">{notice.date}</div>
                                <div className="vd-notice-title">
                                    <span className="vd-card-badge">{notice.tag}</span>
                                    {notice.title}
                                </div>
                                <div className="vd-notice-link">বিস্তারিত →</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* নতুন: অধ্যক্ষের বাণী */}
            <section id="principal">
                <div className="vd-container vd-results-layout">
                    <div className="vd-feature-card vd-fade-up" style={{ padding: '0', background: 'transparent' }}>
                        {/* ছবির জন্য প্লেসহোল্ডার */}
                        <div style={{ background: 'var(--forest-soft)', borderRadius: '16px', aspectRatio: '4/5', display: 'flex', alignItems: 'flex-end', padding: '20px' }}>
                            <div style={{ background: 'var(--parchment)', padding: '16px', borderRadius: '10px', width: '100%' }}>
                                <h3 style={{ margin: '0 0 5px', color: 'var(--forest-deep)', fontSize: '18px' }}>ড. মো. শফিকুল ইসলাম</h3>
                                <p style={{ margin: '0', fontSize: '13px', color: 'var(--ink-soft)' }}>অধ্যক্ষ, ভারড্যান্ট ইন্টারন্যাশনাল স্কুল</p>
                            </div>
                        </div>
                    </div>
                    <div className="vd-fade-up">
                        <div className="vd-sec-label">অধ্যক্ষের বাণী</div>
                        <h2 style={{ fontSize: '32px', color: 'var(--forest-deep)', marginBottom: '20px' }}>আগামীর বিশ্ব নাগরিকদের গড়ে তোলার প্রত্যয়।</h2>
                        <p style={{ fontSize: '16px', color: 'var(--ink-soft)', lineHeight: '1.8', marginBottom: '15px' }}>
                            ভারড্যান্ট ইন্টারন্যাশনালে আপনাকে স্বাগতম। গত দুই দশক ধরে আমরা এমন একটি শিক্ষাব্যবস্থা প্রদান করতে প্রতিশ্রুতিবদ্ধ, যা আমাদের সমৃদ্ধ দেশীয় ঐতিহ্যকে সম্মান করার পাশাপাশি আধুনিক বৈশ্বিক মান বজায় রাখে।
                        </p>
                        <p style={{ fontSize: '16px', color: 'var(--ink-soft)', lineHeight: '1.8' }}>
                            আমরা বিশ্বাস করি, শিক্ষা হলো শিক্ষার্থী, শিক্ষক এবং অভিভাবকদের একটি সম্মিলিত যাত্রা। আমাদের লক্ষ্য শুধু ভালো ফলাফল নয়, বরং শিক্ষার্থীদের নীতিবান, কৌতূহলী ও আত্মবিশ্বাসী মানুষ হিসেবে গড়ে তোলা।
                        </p>
                    </div>
                </div>
            </section>

            {/* নতুন: আমাদের সুবিধাসমূহ */}
            <section className="vd-bg-alt" id="facilities">
                <div className="vd-container">
                    <div className="vd-sec-header vd-fade-up">
                        <div className="vd-sec-label">কেন ভারড্যান্ট বেছে নেবেন?</div>
                        <h2>আমাদের আধুনিক সুবিধাসমূহ</h2>
                    </div>
                    <div className="vd-cards-grid">
                        {[
                            { icon: '🔬', title: 'আধুনিক সায়েন্স ল্যাব', desc: 'পদার্থ, রসায়ন এবং জীববিজ্ঞানের জন্য সম্পূর্ণ সজ্জিত আধুনিক ল্যাবরেটরি।' },
                            { icon: '📚', title: 'সমৃদ্ধ গ্রন্থাগার', desc: 'দেশি-বিদেশি হাজারো বই, জার্নাল এবং ডিজিটাল ই-বুক সমৃদ্ধ লাইব্রেরি।' },
                            { icon: '🚌', title: 'নিরাপদ পরিবহন', desc: 'শহরের বিভিন্ন রুটে শিক্ষার্থীদের যাতায়াতের জন্য নিজস্ব নিরাপদ স্কুল বাস।' },
                            { icon: '💻', title: 'রোবোটিক্স ও আইসিটি', desc: 'শিক্ষার্থীদের প্রযুক্তিগত দক্ষতা বাড়াতে আধুনিক কম্পিউটার ও রোবোটিক্স ল্যাব।' },
                            { icon: '⚽', title: 'খেলাধুলা ও সংস্কৃতি', desc: 'ডিবেট ক্লাব, ইনডোর স্পোর্টস এবং নিয়মিত সাংস্কৃতিক চর্চার সুযোগ।' },
                            { icon: '🛡️', title: 'সিসিটিভি নিরাপত্তা', desc: 'পুরো ক্যাম্পাস সিসিটিভি নিয়ন্ত্রিত এবং সার্বক্ষণিক নিরাপত্তা কর্মীদের নজরদারি।' },
                        ].map((f) => (
                            <div className="vd-info-card vd-fade-up" key={f.title}>
                                <div style={{ fontSize: '30px', marginBottom: '15px' }}>{f.icon}</div>
                                <h3>{f.title}</h3>
                                <p>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ক্যাম্পাসসমূহ */}
            <section id="campuses">
                <div className="vd-container">
                    <div className="vd-sec-header vd-fade-up">
                        <div className="vd-sec-label">আমাদের ক্যাম্পাসসমূহ</div>
                        <h2>একই মান, চারটি ভিন্ন লোকেশন।</h2>
                        <p>
                            প্রতিটি ক্যাম্পাসে একই কারিকুলাম, প্রশিক্ষিত শিক্ষক এবং নিরাপত্তা ব্যবস্থা রয়েছে—অভিভাবকরা চাইলে এক ক্যাম্পাস থেকে অন্য ক্যাম্পাসে সহজেই ট্রান্সফার নিতে পারেন।
                        </p>
                    </div>
                    <div className="vd-cards-grid">
                        {[
                            { tag: 'প্রধান শাখা', name: 'ধানমন্ডি ক্যাম্পাস', desc: "প্লে-গ্রুপ থেকে এ-লেভেল পর্যন্ত। এখানে রয়েছে সুবিশাল লাইব্রেরি ও বিজ্ঞানাগার।", students: '১,২৪০', founded: '১৯৯৮' },
                            { tag: 'বিজ্ঞান ও প্রযুক্তি', name: 'উত্তরা ক্যাম্পাস', desc: '৪র্থ শ্রেণী থেকে রোবোটিক্স এবং কোডিং ল্যাবের সুবিধা ও ইনডোর স্পোর্টস জোন।', students: '৮৬০', founded: '২০১১' },
                            { tag: 'আবাসিক সুবিধা', name: 'চট্টগ্রাম ক্যাম্পাস', desc: 'শহরের বাইরের শিক্ষার্থীদের জন্য উন্নতমানের হোস্টেল ও উইকেন্ড মেন্টরিং সুবিধা।', students: '৫৪০', founded: '২০১৬' },
                        ].map((c) => (
                            <div className="vd-info-card vd-fade-up" key={c.name}>
                                <span className="vd-card-badge">{c.tag}</span>
                                <h3>{c.name}</h3>
                                <p>{c.desc}</p>
                                <div className="vd-card-meta">
                                    <div><b>{c.students}</b>শিক্ষার্থী</div>
                                    <div><b>{c.founded}</b>স্থাপিত</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* বোর্ড রেজাল্ট */}
            <section className="vd-bg-alt" id="results">
                <div className="vd-container">
                    <div className="vd-sec-header vd-fade-up">
                        <div className="vd-sec-label">বোর্ড রেজাল্ট</div>
                        <h2>এক নজরে বিগত ৫ বছরের সাফল্য।</h2>
                    </div>
                    <div className="vd-results-layout">
                        <div className="vd-fade-up">
                            {[
                                { year: '২০২৬', pct: 99.2 },
                                { year: '২০২৫', pct: 97.4 },
                                { year: '২০২৪', pct: 95.8 },
                                { year: '২০২৩', pct: 93.1 },
                                { year: '২০২২', pct: 90.5 },
                            ].map((r) => (
                                <div className="vd-bar-row" key={r.year}>
                                    <div className="vd-bar-year">{r.year}</div>
                                    <div className="vd-bar-track">
                                        <div className="vd-bar-fill" style={{ width: `${r.pct}%` }} />
                                    </div>
                                    <div className="vd-bar-pct">{r.pct}%</div>
                                </div>
                            ))}
                        </div>
                        <div className="vd-feature-card vd-fade-up">
                            <div className="vd-feature-big">২৭ জন</div>
                            <div className="vd-feature-cap">
                                শুধুমাত্র গত শিক্ষাবর্ষে ঢাকা বিশ্ববিদ্যালয় এবং বুয়েটে সুযোগ পাওয়া শিক্ষার্থীর সংখ্যা।
                            </div>
                            <ul className="vd-feature-list">
                                <li>জাতীয় বিজ্ঞান অলিম্পিয়াড — স্বর্ণপদক, ২০২৬</li>
                                <li>আন্তঃস্কুল বিতর্ক চ্যাম্পিয়ন — টানা ৩ বছর</li>
                                <li>৩৪০+ শিক্ষার্থীকে ১০০% উপস্থিতির অ্যাওয়ার্ড প্রদান</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* ভর্তি প্রক্রিয়া */}
            <section id="admissions">
                <div className="vd-container">
                    <div className="vd-sec-header vd-fade-up">
                        <div className="vd-sec-label">ভর্তি প্রক্রিয়া</div>
                        <h2>আবেদন থেকে ভর্তি — মাত্র ৩টি ধাপ।</h2>
                    </div>
                    <div className="vd-step-grid">
                        {[
                            { n: '১', t: 'অনলাইনে আবেদন', d: "শিক্ষার্থীর পূর্ববর্তী একাডেমিক তথ্য দিয়ে ফর্মটি পূরণ করুন—যেকোনো ক্যাম্পাসের জন্য সময় লাগবে মাত্র ১০ মিনিট।" },
                            { n: '২', t: 'মূল্যায়ন ও সাক্ষাৎকার', d: 'বয়স অনুযায়ী একটি সংক্ষিপ্ত মূল্যায়ন পরীক্ষা এবং ক্লাস টিচারের সাথে বন্ধুত্বপূর্ণ আলোচনা।' },
                            { n: '৩', t: 'আসন নিশ্চিতকরণ', d: 'অফার লেটার গ্রহণ করুন, অনলাইনে ভর্তির কাজ সম্পন্ন করুন এবং তাৎক্ষণিক পোর্টাল অ্যাক্সেস পান।' },
                        ].map((s) => (
                            <div className="vd-step-block vd-fade-up" key={s.n}>
                                <div className="vd-step-num">{s.n}</div>
                                <h3>{s.t}</h3>
                                <p>{s.d}</p>
                            </div>
                        ))}
                    </div>
                    <div className="vd-alert-badge vd-fade-up">
                        শিক্ষাবর্ষ ২০২৬-২৭ এর ভর্তি কার্যক্রম ৩০শে আগস্ট শেষ হবে
                    </div>
                </div>
            </section>

            {/* মতামত */}
            <section className="vd-bg-alt">
                <div className="vd-container">
                    <div className="vd-sec-header vd-fade-up">
                        <div className="vd-sec-label">পরিবার ও প্রাক্তন শিক্ষার্থী</div>
                        <h2>তাঁদের নিজেদের কথায়।</h2>
                    </div>
                    <div className="vd-review-grid">
                        {[
                            { q: 'স্টুডেন্ট পোর্টালটি দারুণ! আমি ঘরে বসেই মেয়ের প্রতিদিনের উপস্থিতি এবং পরীক্ষার রেজাল্ট দেখতে পারি।', name: 'নাসরিন আক্তার', role: 'অভিভাবক, উত্তরা ক্যাম্পাস' },
                            { q: 'শিক্ষকদের আন্তরিকতা এবং ছোট আকারের ক্লাসরুম আমাকে পড়াশোনায় অনেক বেশি মনোযোগী হতে সাহায্য করেছে।', name: 'রাফিউল ইসলাম', role: 'প্রাক্তন শিক্ষার্থী, ব্যাচ ২০২২' },
                            { q: 'বদলি জনিত কারণে ক্যাম্পাস পরিবর্তন করতে হয়েছিল, কিন্তু তাদের সিস্টেম এতোই চমৎকার যে নতুন করে কোনো ঝামেলাই পোহাতে হয়নি।', name: 'ফারহানা চৌধুরী', role: 'অভিভাবক, ধানমন্ডি ক্যাম্পাস' },
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

            {/* পোর্টাল CTA */}
            <section id="portal">
                <div className="vd-container">
                    <div className="vd-portal-box vd-fade-up">
                        <div>
                            <h2>আপনি কি ভারড্যান্ট পরিবারের সদস্য?</h2>
                            <p>
                                শিক্ষার্থীদের উপস্থিতি, পরীক্ষার ফলাফল, বেতনের আপডেট এবং নোটিশ দেখতে স্টুডেন্ট পোর্টালে লগইন করুন।
                            </p>
                        </div>
                        <div className="vd-portal-actions">
                            <Link className="vd-btn-main" href={route('login')}>
                                অভিভাবক / শিক্ষার্থী লগইন
                            </Link>
                            <Link className="vd-btn-outline-gold" href={route('login')}>
                                শিক্ষক ও স্টাফ লগইন
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </SiteLayout>
    );
}
