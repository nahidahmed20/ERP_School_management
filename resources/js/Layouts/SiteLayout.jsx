import { Link } from '@inertiajs/react';
import '../../css/site.css'; 

export default function SiteLayout({ children, activePage = '' }) {
    const navItem = (href, label, key) => (
        <Link
            href={href}
            className={`vd-nav-link ${activePage === key ? 'active' : ''}`}
        >
            {label}
        </Link>
    );

    return (
        <>
            <div className="vd-header">
                <div className="vd-container vd-header-inner">
                    <Link className="vd-brand-link" href={route('home')}>
                        <div className="vd-brand-seal">V</div>
                        <div className="vd-brand-title">
                            Verdant
                            <span>INTERNATIONAL SCHOOL &amp; COLLEGES</span>
                        </div>
                    </Link>
                    <nav className="vd-hide-mobile">
                        {navItem(route('site.campuses'), 'Campuses', 'campuses')}
                        {navItem(route('site.academics'), 'Academics', 'academics')}
                        {navItem(route('home') + '#results', 'Results', 'results')}
                        {navItem(route('site.admissions'), 'Admissions', 'admissions')}
                        {navItem(route('site.contact'), 'Contact', 'contact')}
                        <div className="vd-campus-badge">📍 Dhanmondi Campus</div>
                        <Link className="vd-btn-portal" href={route('login')}>
                            Portal Login
                        </Link>
                    </nav>
                </div>
            </div>

            <main>{children}</main>

            <footer>
                <div className="vd-container">
                    <div className="vd-footer-grid">
                        <div>
                            <div className="vd-brand-link" style={{ marginBottom: 14 }}>
                                <div className="vd-brand-seal" style={{ animation: 'none' }}>V</div>
                                <div className="vd-brand-title">
                                    Verdant<span>INTERNATIONAL SCHOOL</span>
                                </div>
                            </div>
                            <p style={{ fontSize: 13, lineHeight: 1.7, maxWidth: 260 }}>
                                Four campuses across Bangladesh, one shared standard of care
                                since 2004.
                            </p>
                        </div>
                        <div>
                            <h4>Campuses</h4>
                            <ul>
                                <li><Link href={route('site.campuses')}>Dhanmondi</Link></li>
                                <li><Link href={route('site.campuses')}>Uttara</Link></li>
                                <li><Link href={route('site.campuses')}>Chattogram</Link></li>
                                <li><Link href={route('site.campuses')}>Sylhet</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4>Quick Links</h4>
                            <ul>
                                <li><Link href={route('site.admissions')}>Admissions</Link></li>
                                <li><Link href={route('home') + '#results'}>Results</Link></li>
                                <li><Link href={route('site.academics')}>Academic Calendar</Link></li>
                                <li><Link href={route('site.contact')}>Careers</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4>Contact</h4>
                            <ul>
                                <li><a href="#">+880 1XXX-XXXXXX</a></li>
                                <li><a href="#">admissions@verdant.edu.bd</a></li>
                                <li><a href="#">House 12, Road 5, Dhanmondi</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="vd-footer-bottom">
                        <span>© {new Date().getFullYear()} Verdant International School &amp; Colleges.</span>
                        <span>Powered by Verdant ERP</span>
                    </div>
                </div>
            </footer>
        </>
    );
}
