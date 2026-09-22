import Sidebar from '@/Components/Sidebar';
import Topbar from '@/Components/Topbar';
import PageSizeEnhancer from '@/Components/PageSizeEnhancer';
import GlobalEventBanner from '@/Components/GlobalEventBanner';
import { usePage } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const { auth, errors = {} } = usePage().props;
    const requiresCampusSelection = Boolean(auth?.requires_campus_selection);
    const campusError = errors.campus_id;
    const [mobileOpen, setMobileOpen] = useState(false);
    const [desktopCollapsed, setDesktopCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 900px)').matches);
    const closeMenu = useCallback(() => setMobileOpen(false), []);
    const toggleMenu = useCallback(() => {
        if (isMobile) setMobileOpen((value) => !value);
        else setDesktopCollapsed((value) => !value);
    }, [isMobile]);

    useEffect(() => {
        const media = window.matchMedia('(max-width: 900px)');
        const onResize = () => {
            setIsMobile(media.matches);
            if (!media.matches) closeMenu();
        };
        media.addEventListener('change', onResize);
        return () => media.removeEventListener('change', onResize);
    }, [closeMenu]);

    useEffect(() => {
        if (!mobileOpen) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKeyDown = (event) => { if (event.key === 'Escape') closeMenu(); };
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [mobileOpen, closeMenu]);

    return (
        <div className="shell">
            <PageSizeEnhancer />
            {mobileOpen && <button type="button" aria-label="Close navigation" className="mobile-nav-backdrop" onClick={closeMenu} />}
            <Sidebar mobileOpen={mobileOpen} desktopCollapsed={desktopCollapsed} onNavigate={closeMenu} />

            <div className="main">
                <Topbar onHamburgerClick={toggleMenu} sidebarOpen={isMobile ? mobileOpen : !desktopCollapsed} />
                <GlobalEventBanner />

                {(requiresCampusSelection || campusError) && (
                    <div
                        role={campusError ? 'alert' : 'status'}
                        className={`mx-4 mt-4 rounded-lg border px-4 py-3 text-sm sm:mx-6 ${campusError
                            ? 'border-rose-200 bg-rose-50 text-rose-800'
                            : 'border-amber-200 bg-amber-50 text-amber-900'}`}
                    >
                        {requiresCampusSelection && (
                            <p>
                                <span className="font-semibold">Select a working campus in the top bar.</span>{' '}
                                Combined campus lists are available to view. Choose a campus before adding or changing campus records.
                                Your account assignment stays unchanged.
                            </p>
                        )}
                        {campusError && <p className={requiresCampusSelection ? 'mt-2' : ''}>{campusError}</p>}
                    </div>
                )}

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
