import { Head, Link, usePage } from '@inertiajs/react';
import SiteLayout from '@/Layouts/SiteLayout';

export default function Campuses({ campusRecords = [] }) {
    const { site_settings: settings = {} } = usePage().props;
    return <SiteLayout activePage="campuses"><Head title={`Campuses — ${settings.school_name}`} /><Hero tag="Our network" title="Find a campus that feels like home." text="Discover each location, its facilities and the connected learning experience available to your family." /><section className="sf-section"><div className="sf-shell sf-location-list">{campusRecords.map((campus, index) => <article key={campus.id}><div className="sf-location-mark">{String(index + 1).padStart(2, '0')}{campus.is_main && <b>Main</b>}</div><div><span>{campus.code}</span><h2>{campus.name}</h2><p>{campus.public_description || campus.address || 'Contact our admissions team for campus details.'}</p>{campus.facilities?.length > 0 && <div className="sf-facilities">{campus.facilities.map((facility) => <b key={facility}>{facility}</b>)}</div>}<div className="sf-contact-row">{campus.phone && <a href={`tel:${campus.phone}`}>{campus.phone}</a>}{campus.email && <a href={`mailto:${campus.email}`}>{campus.email}</a>}{campus.established_year && <span>Established {campus.established_year}</span>}{campus.map_url && <a href={campus.map_url} target="_blank" rel="noreferrer">Open map &nearr;</a>}</div></div></article>)}</div></section><CTA /></SiteLayout>;
}

export function Hero({ tag, title, text }) { return <section className="sf-page-hero"><div className="sf-shell"><span>{tag}</span><h1>{title}</h1><p>{text}</p></div></section>; }
function CTA() { return <section className="sf-section"><div className="sf-shell sf-mini-cta"><div><h2>Ready to visit?</h2><p>Meet our admissions team and explore the learning environment.</p></div><Link href={route('site.contact')} className="sf-button sf-button-accent">Book a conversation</Link></div></section>; }
