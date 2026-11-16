import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import LocaleSwitcher from '@/Components/LocaleSwitcher';

export default function GuestLayout({ children }) {
    return (
        <div className="guest-shell flex min-h-screen flex-col items-center pt-6 sm:justify-center sm:pt-0">
            <div className="fixed right-4 top-4 z-50"><LocaleSwitcher /></div>
            <div>
                <Link href="/">
                    <ApplicationLogo className="h-20 w-20 fill-current text-gray-500" />
                </Link>
            </div>

            <div className="guest-card mt-6 w-full overflow-hidden bg-white px-6 py-4 sm:max-w-md">
                {children}
            </div>
        </div>
    );
}
