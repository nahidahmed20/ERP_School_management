import { Head, Link, usePage } from '@inertiajs/react';
import '../../css/site.css';

export default function SiteLayout({ children, activePage = '' }) {
    const { site_settings: site = {} } = usePage().props;
    const initial = (site.school_short_name || site.school_name || 'S').trim().charAt(0).toUpperCase();
    const brandImage = source => source ? <img className="vd-brand-logo" src={source} alt={site.school_name || 'School'} /> : <div className="vd-brand-seal">{initial}</div>;
    const navItem = (href, label, key) => <Link href={href} className={`vd-nav-link ${activePage === key ? 'active' : ''}`}>{label}</Link>;

    return <>
        <Head>{site.favicon && <link rel="icon" href={site.favicon} />}</Head>
        <div className="verdant-front-site">
            <div className="vd-header"><div className="vd-container vd-header-inner">
                <Link className="vd-brand-link" href={route('home')}>{brandImage(site.logo)}<div className="vd-brand-title">{site.school_short_name || site.school_name}<span>{site.school_tagline}</span></div></Link>
                <nav className="vd-hide-mobile">
                    {navItem(route('site.campuses'), 'Campuses', 'campuses')}{navItem(route('site.academics'), 'Academics', 'academics')}{navItem(route('home') + '#results', 'Results', 'results')}{navItem(route('site.admissions'), 'Admissions', 'admissions')}{navItem(route('site.contact'), 'Contact', 'contact')}
                    {site.admission_session && <div className="vd-campus-badge">Admissions: {site.admission_session}</div>}<Link className="vd-btn-portal" href={route('login')}>Portal Login</Link>
                </nav>
            </div></div>
            <main>{children}</main>
            <footer><div className="vd-container">
                <div className="vd-footer-grid">
                    <div><div className="vd-brand-link" style={{ marginBottom: 14 }}>{brandImage(site.footer_logo || site.logo)}<div className="vd-brand-title">{site.school_short_name || site.school_name}<span>{site.school_tagline}</span></div></div><p style={{ fontSize: 13, lineHeight: 1.7, maxWidth: 300 }}>{site.footer_description}</p></div>
                    <div><h4>Campuses</h4><ul><li><Link href={route('site.campuses')}>All Campuses</Link></li><li><Link href={route('site.academics')}>Academics</Link></li></ul></div>
                    <div><h4>Quick Links</h4><ul><li><Link href={route('site.admissions')}>Admissions</Link></li><li><Link href={route('home') + '#results'}>Results</Link></li><li><Link href={route('site.contact')}>Contact</Link></li></ul></div>
                    <div><h4>Contact</h4><ul>{site.primary_phone && <li><a href={`tel:${site.primary_phone.replace(/\s/g, '')}`}>{site.primary_phone}</a></li>}{site.secondary_phone && <li><a href={`tel:${site.secondary_phone.replace(/\s/g, '')}`}>{site.secondary_phone}</a></li>}{site.email && <li><a href={`mailto:${site.email}`}>{site.email}</a></li>}{site.address && <li><span>{site.address}</span></li>}</ul></div>
                </div>
                {(site.facebook_url || site.youtube_url || site.linkedin_url) && <div className="vd-social-links">{site.facebook_url && <a href={site.facebook_url} target="_blank" rel="noreferrer">Facebook</a>}{site.youtube_url && <a href={site.youtube_url} target="_blank" rel="noreferrer">YouTube</a>}{site.linkedin_url && <a href={site.linkedin_url} target="_blank" rel="noreferrer">LinkedIn</a>}</div>}
                <div className="vd-footer-bottom"><span>© {new Date().getFullYear()} {site.school_name}. {site.copyright_text}</span>{site.powered_by_text && <span>{site.powered_by_text}</span>}</div>
            </div></footer>
        </div>
    </>;
}
