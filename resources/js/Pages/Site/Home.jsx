import { Head, Link, usePage } from '@inertiajs/react';
import SiteLayout from '@/Layouts/SiteLayout';

const formatNumber = (number) => new Intl.NumberFormat('en', { notation: number > 999 ? 'compact' : 'standard' }).format(number || 0);
const Header = ({ eyebrow, title, text }) => <div className="sf-section-head"><span>{eyebrow}</span><h2>{title}</h2>{text && <p>{text}</p>}</div>;

export default function Home({ campuses = [], notices = [], teachers = [], articles = [], stats = {} }) {
    const { site_settings: settings = {} } = usePage().props;
    const schoolName = settings.school_short_name || settings.school_name;
    const benefits = [
        ['01', 'Whole-child learning', 'Strong academics alongside character, creativity and confidence.'],
        ['02', 'Connected guardians', 'Real-time attendance, results, fees and school communication.'],
        ['03', 'Smart campuses', 'Secure operations, modern classrooms and consistent standards.'],
        ['04', 'Visible progress', 'Teachers and families share a clear view of every learner journey.'],
    ];
    const steps = [
        ['Discover', 'Explore our learning approach, classes and active campuses.'],
        ['Connect', 'Speak with admissions and arrange a convenient campus visit.'],
        ['Apply', 'Submit an admission enquiry through the secure online form.'],
        ['Begin', 'Receive guidance and start the student onboarding journey.'],
    ];

    return <SiteLayout activePage="home">
        <Head title={settings.school_name} />
        <section className="sf-hero"><div className="sf-orb sf-orb-one" /><div className="sf-orb sf-orb-two" /><div className="sf-shell sf-hero-grid">
            <div className="sf-hero-copy"><div className="sf-eyebrow"><span />{settings.hero_eyebrow}</div><h1>{settings.hero_title}</h1><p>{settings.hero_description}</p><div className="sf-actions"><Link href={route('site.admissions')} className="sf-button sf-button-accent">Start an application</Link><Link href={route('site.campuses')} className="sf-button sf-button-ghost">Explore campuses</Link></div><div className="sf-trust"><span>Safe campuses</span><span>Connected parents</span><span>Future-ready learning</span></div></div>
            <div className="sf-hero-card"><div className="sf-card-top"><span>Live school community</span><b>{new Date().getFullYear()}</b></div><div className="sf-metric-grid">{[['Students', stats.students], ['Teachers', stats.teachers], ['Campuses', stats.campuses], ['Classes', stats.classes]].map(([label, number]) => <div key={label}><strong>{formatNumber(number)}+</strong><span>{label}</span></div>)}</div><blockquote>&ldquo;{settings.principal_message}&rdquo;<cite>&mdash; {settings.principal_name}</cite></blockquote></div>
        </div></section>

        <section className="sf-section sf-quick"><div className="sf-shell sf-quick-grid">{[['01', 'Apply online', 'A simple guided admission process.', route('site.admissions')], ['02', 'Visit a campus', 'Find the campus closest to your family.', route('site.campuses')], ['03', 'Access your portal', 'Attendance, results, fees and communication.', route('login')]].map((item) => <Link href={item[3]} key={item[0]}><i>{item[0]}</i><div><b>{item[1]}</b><p>{item[2]}</p></div><span>&nearr;</span></Link>)}</div></section>

        <section className="sf-section"><div className="sf-shell"><Header eyebrow="Why families choose us" title="One connected community. Every child known." text="Academic excellence works best when wellbeing, communication and technology work together." /><div className="sf-feature-grid">{benefits.map((item) => <article key={item[1]}><i>{item[0]}</i><h3>{item[1]}</h3><p>{item[2]}</p></article>)}</div></div></section>

        <section className="sf-section sf-journey-section"><div className="sf-shell sf-journey"><div><Header eyebrow="A simple beginning" title={`Your journey to ${schoolName} starts here.`} text="From the first enquiry to the first day of class, every step is clear and supported." /><Link className="sf-text-link" href={route('site.admissions')}>See admission details &rarr;</Link></div><div className="sf-step-list">{steps.map((step, index) => <article key={step[0]}><b>{String(index + 1).padStart(2, '0')}</b><div><h3>{step[0]}</h3><p>{step[1]}</p></div></article>)}</div></div></section>

        <section className="sf-section sf-soft"><div className="sf-shell"><Header eyebrow="Our campuses" title="A consistent standard, wherever you join us." text="Each active campus is managed through the same connected academic and operational platform." /><div className="sf-campus-grid">{campuses.slice(0, 4).map((campus, index) => <article key={campus.id}><div className="sf-campus-art"><span>{String(index + 1).padStart(2, '0')}</span>{campus.is_main && <b>Main campus</b>}</div><div><h3>{campus.name}</h3><p>{campus.address || 'Campus information is available from the admissions team.'}</p><footer>{campus.established_year && <span>Since {campus.established_year}</span>}{campus.phone && <a href={`tel:${campus.phone}`}>{campus.phone}</a>}</footer></div></article>)}</div><Link className="sf-text-link" href={route('site.campuses')}>View all campuses &rarr;</Link></div></section>

        {teachers.length > 0 && <section className="sf-section"><div className="sf-shell"><Header eyebrow="Our educators" title="Meet the people behind every learner." text="Experienced teachers, caring mentors and academic leaders working together for student success." /><div className="sf-home-teachers">{teachers.map((teacher) => <article key={teacher.id}><div>{teacher.photo ? <img src={teacher.photo.startsWith('/') ? teacher.photo : `/storage/${teacher.photo}`} alt="" /> : <span>{teacher.first_name?.[0]}{teacher.last_name?.[0]}</span>}</div><small>{teacher.designation?.name}</small><h3>{teacher.first_name} {teacher.last_name}</h3><p>{teacher.department?.name} · {teacher.campus?.name}</p></article>)}</div><Link className="sf-text-link" href={route('site.teachers')}>Meet all teachers &rarr;</Link></div></section>}

        {notices.length > 0 && <section className="sf-section sf-soft"><div className="sf-shell"><Header eyebrow="Notice board" title="What is happening now." /><div className="sf-notices">{notices.map((notice) => <article key={notice.id}><time>{new Date(notice.start_datetime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</time><span>{notice.type}</span><h3>{notice.title}</h3><p>{notice.description}</p></article>)}</div></div></section>}

        {articles.length > 0 && <section className="sf-section"><div className="sf-shell"><Header eyebrow="Stories and updates" title="From across our community." /><div className="sf-home-articles">{articles.map((article) => <Link href={route('site.blog.show', article.slug)} key={article.id}><small>{article.content_type} · {article.campus?.name || 'All campuses'}</small><h3>{article.title}</h3><p>{article.content_body?.replace(/<[^>]*>/g, '').slice(0, 125)}</p><b>Read story &rarr;</b></Link>)}</div><Link className="sf-text-link" href={route('site.blogs')}>View all news and stories &rarr;</Link></div></section>}

        <section className="sf-section sf-family-section"><div className="sf-shell sf-family-panel"><div className="sf-family-mark">&ldquo;</div><blockquote>{settings.principal_message}<cite>{settings.principal_name}<small>School leadership</small></cite></blockquote><div className="sf-family-points"><span>Transparent progress</span><span>Timely communication</span><span>Safe learning environment</span></div></div></section>

        <section className="sf-section"><div className="sf-shell sf-cta"><div><span>Your next chapter starts here</span><h2>Come and experience {schoolName}.</h2><p>Talk to our admissions team, arrange a campus visit, or begin your application online.</p></div><div><Link href={route('site.admissions')} className="sf-button sf-button-accent">Apply for admission</Link><Link href={route('site.contact')} className="sf-button sf-button-ghost">Contact us</Link></div></div></section>
    </SiteLayout>;
}
