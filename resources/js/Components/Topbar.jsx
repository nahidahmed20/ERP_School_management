import { Link, usePage, router } from '@inertiajs/react';
import Icon from './Icons';
import Dropdown from '@/Components/Dropdown';

export default function Topbar({ onHamburgerClick }) {
    const { auth, all_campuses } = usePage().props;
    const user = auth?.user;

    const handleCampusChange = (e) => {
        if (!e.target.value) return;
        router.post(route('admin.campus.switch'), { campus_id: e.target.value }, {
            preserveScroll: true,
        });
    };

    return (
        <header className="h-16 bg-white/95 backdrop-blur-sm border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 shadow-sm transition-all">

            {/* Left: Hamburger & Search */}
            <div className="flex items-center gap-3 sm:gap-6">
                <button
                    className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    onClick={onHamburgerClick}
                    title="Toggle Menu"
                >
                    <Icon name="menu" className="w-5 h-5" />
                </button>

                {/* Enhanced Search Bar */}
                <div className="relative w-full max-w-md hidden md:block">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon name="search" className="w-4 h-4 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search students, staff, or invoices..."
                        className="w-72 lg:w-96 pl-10 pr-12 py-2 bg-slate-100/70 border-transparent rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                    />
                    <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                        <span className="hidden lg:flex items-center justify-center px-1.5 py-0.5 rounded border border-slate-200 text-[10px] font-medium text-slate-400 bg-white">
                            ⌘K
                        </span>
                    </div>
                </div>
            </div>

            {/* Right: Actions, Switchers & Profile */}
            <div className="flex items-center gap-2 sm:gap-4">

                {/* Quick Add Button (New Feature) */}
                <button className="hidden lg:flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors border border-indigo-100">
                    <Icon name="plus" className="w-4 h-4" />
                    <span>Quick Add</span>
                </button>

                {/* Notification Bell (New Feature) */}
                <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                    <Icon name="bell" className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                </button>

                <div className="hidden sm:block h-6 w-px bg-slate-200 mx-1"></div>

                {/* Campus Switcher */}
                <select
                    value={auth?.active_campus_id || ''}
                    onChange={handleCampusChange}
                    className="bg-transparent hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold pl-3 pr-8 py-1.5 rounded-lg outline-none cursor-pointer transition-all max-w-[120px] sm:max-w-[160px] truncate focus:ring-2 focus:ring-indigo-500/30"
                >
                    <option value="" disabled>Select Campus</option>
                    {all_campuses?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>

                {/* User Profile Dropdown */}
                <Dropdown>
                    <Dropdown.Trigger>
                        <button type="button" className="flex items-center gap-2.5 p-1 pr-2 rounded-lg hover:bg-slate-50 transition-colors focus:outline-none" aria-label="Open user menu">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-indigo-600 text-white rounded-full flex items-center justify-center font-semibold text-sm shadow-sm shrink-0">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="text-left hidden sm:block">
                                <p className="text-sm font-semibold text-slate-700 leading-tight">{user?.name}</p>
                                <p className="text-[11px] font-medium text-slate-500">{user?.roles?.[0]?.name || 'Administrator'}</p>
                            </div>
                            <Icon name="chevron-down" className="hidden sm:block w-4 h-4 text-slate-400" />
                        </button>
                    </Dropdown.Trigger>

                    <Dropdown.Content contentClasses="py-2 bg-white rounded-xl border border-slate-200 shadow-lg" className="w-56 mt-2">
                        <div className="px-4 py-2 border-b border-slate-100 sm:hidden">
                            <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
                            <p className="text-xs text-slate-500">{user?.roles?.[0]?.name || 'Admin'}</p>
                        </div>

                        <Dropdown.Link href={route('profile.edit')} className="px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2.5 transition-colors">
                            <Icon name="user" className="w-4 h-4 text-slate-400" /> My Profile
                        </Dropdown.Link>

                        <Dropdown.Link href="#" className="px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2.5 transition-colors">
                            <Icon name="settings" className="w-4 h-4 text-slate-400" /> Settings
                        </Dropdown.Link>

                        <div className="h-px bg-slate-100 my-1"></div>

                        <Dropdown.Link href={route('logout')} method="post" as="button" className="px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 w-full text-left transition-colors">
                            <Icon name="logout" className="w-4 h-4 text-rose-400" /> Sign Out
                        </Dropdown.Link>
                    </Dropdown.Content>
                </Dropdown>

            </div>
        </header>
    );
}
