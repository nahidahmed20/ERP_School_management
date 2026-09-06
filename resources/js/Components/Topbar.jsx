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
        <header className="h-16 sm:h-20 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 flex items-center justify-between px-3 sm:px-6 sticky top-0 z-30 shadow-[0_1px_12px_rgba(15,23,42,0.05)] transition-all">

            {/* Left: Hamburger & Search */}
            <div className="flex items-center gap-4">
                <button
                    className="ui-icon-button mobile-menu-trigger"
                    onClick={onHamburgerClick}
                    title="Toggle Menu"
                >
                    <Icon name="menu" className="w-5 h-5" />
                </button>

                <div className="relative w-64 sm:w-85 hidden sm:block">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Icon name="search" className="w-4 h-4" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search students, staff..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all shadow-inner"
                    />
                </div>
            </div>

            {/* Right: Language, Campus Switcher & User Profile */}
            <div className="flex items-center gap-1.5 sm:gap-3">

                {/* Language Selector */}
                <select aria-label="Language" className="hidden lg:block bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold pl-3.5 py-2 rounded-xl uppercase tracking-wider outline-none cursor-pointer transition-all shadow-sm">
                    <option value="en">English</option>
                </select>

                {/* Campus Switcher */}
                <select
                    value={auth?.active_campus_id || ''}
                    onChange={handleCampusChange}
                    className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold pl-3.5 py-2 rounded-xl uppercase tracking-wider outline-none cursor-pointer transition-all shadow-sm max-w-[118px] sm:max-w-[190px] truncate"
                >
                    <option value="">Select Campus</option>
                    {all_campuses?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>

                {/* User Profile Dropdown */}
                <Dropdown>
                    <Dropdown.Trigger>
                        <button type="button" className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-slate-200 cursor-pointer group rounded-r-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10" aria-label="Open user menu">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{user?.name}</p>
                                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{user?.roles?.[0]?.name || 'Admin'}</p>
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform shrink-0">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <Icon name="chevron-down" className="hidden sm:block w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                        </button>
                    </Dropdown.Trigger>

                    <Dropdown.Content contentClasses="py-2 bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-100" className="w-48 py-2 rounded-2xl shadow-xl border border-slate-100 mt-2">
                        <Dropdown.Link href={route('profile.edit')} className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                            <Icon name="user" className="w-3.5 h-3.5 text-slate-400" /> Profile
                        </Dropdown.Link>
                        <div className="h-px bg-slate-100 my-1"></div>
                        <Dropdown.Link href={route('logout')} method="post" as="button" className="px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 w-full text-left">
                            <Icon name="logout" className="w-3.5 h-3.5 text-rose-400" /> Log Out
                        </Dropdown.Link>
                    </Dropdown.Content>
                </Dropdown>

            </div>
        </header>
    );
}
