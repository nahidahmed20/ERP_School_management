import Sidebar from '@/Components/Sidebar';
import Topbar from '@/Components/Topbar';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="shell">
            <Sidebar mobileOpen={mobileOpen} />

            <div className="main">
                <Topbar onHamburgerClick={() => setMobileOpen((v) => !v)} />

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
