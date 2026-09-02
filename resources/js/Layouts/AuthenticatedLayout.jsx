import Sidebar from '@/Components/Sidebar';
import Topbar from '@/Components/Topbar';
import PageSizeEnhancer from '@/Components/PageSizeEnhancer';
import GlobalEventBanner from '@/Components/GlobalEventBanner';
import { useEffect, useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    return (
        <div className="shell">
            <PageSizeEnhancer />
            {mobileOpen && <button type="button" aria-label="Close navigation" className="mobile-nav-backdrop" onClick={() => setMobileOpen(false)} />}
            <Sidebar mobileOpen={mobileOpen} onNavigate={() => setMobileOpen(false)} />

            <div className="main">
                <Topbar onHamburgerClick={() => setMobileOpen((v) => !v)} />
                <GlobalEventBanner />

                {header && (
                    <div className="content" style={{ paddingBottom: 0 }}>
                        {header}
                    </div>
                )}

                <main className="content">{children}</main>
            </div>
        </div>
    );
}
