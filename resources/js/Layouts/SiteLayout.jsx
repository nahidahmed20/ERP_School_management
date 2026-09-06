import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import '../../css/site.css';
import '../../css/site-pages.css';

export default function SiteLayout({ children, activePage = '' }) {
    const { site_settings: settings = {}, flash = {} } = usePage().props;
    const [open, setOpen] = useState(false);
    const initial = (settings.school_short_name || settings.school_name || 'S')[0];
    const nav = [
        ['home', 'Home', route('home')], ['campuses', 'Campuses', route('site.campuses')],
        ['academics', 'Academics', route('site.academics')], ['teachers', 'Teachers', route('site.teachers')],
        ['blog', 'News & Blog', route('site.blogs')], ['admissions', 'Admissions', route('site.admissions')],
        ['contact', 'Contact', route('site.contact')],
    ];
    const Brand = ({ light = false }) => <Link href={route('home')} className={`sf-brand ${light ? 'sf-brand-light' : ''}`}>
        {settings.logo ? <img src={settings.logo} alt={settings.school_name || 'School logo'} /> : <i>{initial}</i>}
        <span><b>{settings.school_short_name || settings.school_name}</b><small>{settings.school_tagline}</small></span>
    </Link>;

    return <><Head>{settings.favicon && <link rel="icon" href={settings.favicon} />}</Head>
        <div className="sf-site" style={{ '--sf-primary': settings.primary_color || '#12372A', '--sf-accent': settings.accent_color || '#E9B949' }}>
            <div className="sf-announcement"><span>Admissions {settings.admission_session || 'Open'}</span>{settings.admission_deadline && <b>Application deadline: {settings.admission_deadline}</b>}<Link href={route('site.admissions')}>Apply now &rarr;</Link></div>
            <header className="sf-header"><div className="sf-shell sf-nav"><Brand /><nav className={open ? 'is-open' : ''}>{nav.map(([key, label, url]) => <Link key={key} href={url} className={activePage === key ? 'active' : ''} onClick={() => setOpen(false)}>{label}</Link>)}<Link href={route('login')} className="sf-login">Portal login</Link></nav><button type="button" className="sf-menu" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Toggle navigation">{open ? 'Close' : 'Menu'}</button></div></header>
            {(flash.success || flash.error) && <div className={`sf-flash ${flash.error ? 'is-error' : ''}`}>{flash.success || flash.error}</div>}
            <main>{children}</main>
            <footer className="sf-footer"><div className="sf-shell sf-footer-grid"><div><Brand light /><p>{settings.footer_description || settings.hero_description}</p></div><div><h4>Explore</h4>{nav.slice(1).map((item) => <Link key={item[0]} href={item[2]}>{item[1]}</Link>)}</div><div><h4>Portals</h4><Link href={route('login')}>Student portal</Link><Link href={route('login')}>Guardian portal</Link><Link href={route('login')}>Staff portal</Link></div><div><h4>Contact</h4>{settings.primary_phone && <a href={`tel:${settings.primary_phone}`}>{settings.primary_phone}</a>}{settings.email && <a href={`mailto:${settings.email}`}>{settings.email}</a>}<span>{settings.address}</span></div></div><div className="sf-shell sf-copyright">&copy; {new Date().getFullYear()} {settings.school_name}. {settings.copyright_text}<span>{settings.powered_by_text}</span></div></footer>
        </div></>;
}
