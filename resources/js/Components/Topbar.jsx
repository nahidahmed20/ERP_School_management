import { useEffect, useMemo, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { Dialog, DialogPanel, DialogTitle, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import Icon from './Icons';
import CampusSwitcher from '@/Components/CampusSwitcher';

const EMPTY_NAVIGATION = [];
const SEARCH_MODULES = [
    { key: 'students', label: 'Students', route: 'admin.students.index', placeholder: 'Name, admission number, or guardian' },
    { key: 'staff', label: 'Staff', route: 'admin.staff.index', placeholder: 'Name, staff ID, or phone' },
    { key: 'invoices', label: 'Invoices', route: 'admin.fees.invoices', placeholder: 'Student name or admission number' },
];
const CREATE_ACTIONS = [
    { label: 'Add student', route: 'admin.students.create', icon: 'users' },
    { label: 'Add staff', route: 'admin.staff.create', icon: 'user' },
];
const menuItemClass = 'flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-slate-700 data-[focus]:bg-indigo-50 data-[focus]:text-indigo-700';

function permittedRoutes(auth, navigation) {
    if (auth?.topbar_permissions) return (name) => auth.topbar_permissions[name] === true;

    // The server has already filtered navigation by each menu's permission.
    const names = new Set(navigation.flatMap((group) => (group.items ?? []).flatMap(
        (item) => [item.route_name || item.route, ...(item.children ?? []).map((child) => child.route_name || child.route)],
    )));
    const isSuperAdmin = auth?.user?.roles?.some((role) => role.name === 'Super Admin');
    return (name) => Boolean(isSuperAdmin || names.has(name));
}

export default function Topbar({ onHamburgerClick, sidebarOpen = false }) {
    const { auth, all_campuses, navigation = EMPTY_NAVIGATION } = usePage().props;
    const user = auth?.user;
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchModule, setSearchModule] = useState('students');
    const [searchTerm, setSearchTerm] = useState('');
    const actions = useMemo(() => {
        const can = permittedRoutes(auth, navigation);
        const resolve = (item) => {
            if (!can(item.route)) return null;
            try { return { ...item, href: route(item.route) }; } catch { return null; }
        };
        return {
            search: SEARCH_MODULES.map(resolve).filter(Boolean),
            create: CREATE_ACTIONS.map(resolve).filter(Boolean),
            notifications: resolve({ route: 'admin.communication-notifications.index' }),
            settings: resolve({ route: 'admin.general.index' }),
        };
    }, [auth?.topbar_permissions, user?.roles, navigation]);
    const activeSearch = actions.search.find((item) => item.key === searchModule) || actions.search[0];
    const canCreateInCampus = Boolean(auth?.active_campus_id);

    useEffect(() => {
        if (!actions.search.length) return;
        const openSearch = (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k' && !event.altKey) {
                event.preventDefault();
                setSearchOpen(true);
            }
        };
        window.addEventListener('keydown', openSearch);
        return () => window.removeEventListener('keydown', openSearch);
    }, [actions.search]);

    const submitSearch = (event) => {
        event.preventDefault();
        if (!activeSearch || !searchTerm.trim()) return;
        setSearchOpen(false);
        router.get(activeSearch.href, { search: searchTerm.trim() }, { preserveState: false, preserveScroll: false });
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-2 border-b border-slate-200 bg-white/95 px-3 shadow-sm backdrop-blur-sm sm:px-6">
            <div className="flex min-w-0 items-center gap-1 sm:gap-4">
                <button
                    type="button"
                    aria-label={sidebarOpen ? 'Close navigation' : 'Open navigation'}
                    aria-expanded={sidebarOpen}
                    aria-controls="school-sidebar"
                    className="-ml-2 rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    onClick={onHamburgerClick}
                    title="Toggle menu"
                >
                    <Icon name="menu" className="h-5 w-5" />
                </button>
                {actions.search.length > 0 && (
                    <button type="button" onClick={() => setSearchOpen(true)} aria-label="Search records" aria-keyshortcuts="Control+k Meta+k"
                        className="flex items-center gap-2 rounded-lg p-2 text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 md:bg-slate-100/70 md:px-3">
                        <Icon name="search" className="h-4 w-4 shrink-0" />
                        <span className="hidden text-sm md:block">Search records…</span>
                        <kbd className="ml-5 hidden rounded border border-slate-200 bg-white px-1.5 text-[10px] text-slate-400 xl:block">Ctrl / ⌘ K</kbd>
                    </button>
                )}
            </div>

            <div className="flex min-w-0 items-center gap-1 sm:gap-3">
                {actions.create.length > 0 && (
                    <Menu as="div" className="relative shrink-0">
                        <MenuButton disabled={!canCreateInCampus} aria-label="Quick Add"
                            title={canCreateInCampus ? 'Add a record' : 'Select a working campus before adding records'}
                            className="flex items-center gap-1.5 rounded-lg border border-indigo-100 bg-indigo-50 p-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:cursor-not-allowed disabled:opacity-50 md:px-3 md:py-1.5">
                            <Icon name="plus" className="h-4 w-4" /><span className="hidden lg:inline">Quick Add</span>
                        </MenuButton>
                        <MenuItems className="absolute left-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-2 shadow-lg focus:outline-none sm:left-auto sm:right-0">
                            {actions.create.map((item) => (
                                <MenuItem key={item.route} as={Link} href={item.href} className={menuItemClass}>
                                    <Icon name={item.icon} className="h-4 w-4" />{item.label}
                                </MenuItem>
                            ))}
                        </MenuItems>
                    </Menu>
                )}
                {actions.notifications && (
                    <Link href={actions.notifications.href} aria-label="Notifications" title="Notifications"
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                        <Icon name="bell" className="h-5 w-5" />
                    </Link>
                )}

                <div className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" />
                <CampusSwitcher auth={auth} campuses={all_campuses} />

                <Menu as="div" className="relative shrink-0">
                    <MenuButton className="flex items-center gap-2 rounded-lg p-1 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" aria-label="Open user menu">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white shadow-sm sm:h-9 sm:w-9">
                            {user?.name?.charAt(0) || 'U'}
                        </span>
                        <span className="hidden max-w-[140px] text-left xl:block">
                            <span className="block truncate text-sm font-semibold leading-tight text-slate-700">{user?.name}</span>
                            <span className="block truncate text-[11px] font-medium text-slate-500">{user?.roles?.[0]?.name || 'Account'}</span>
                        </span>
                        <Icon name="chevron-down" className="hidden h-4 w-4 text-slate-400 sm:block" />
                    </MenuButton>
                    <MenuItems className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-2 shadow-lg focus:outline-none">
                        <div className="border-b border-slate-100 px-4 py-2">
                            <p className="truncate text-sm font-semibold text-slate-800">{user?.name}</p>
                            <p className="text-xs text-slate-500">{user?.roles?.[0]?.name || 'Account'}</p>
                        </div>
                        <MenuItem as={Link} href={route('profile.edit')} className={menuItemClass}>
                            <Icon name="user" className="h-4 w-4" />My Profile
                        </MenuItem>
                        {actions.settings && (
                            <MenuItem as={Link} href={actions.settings.href} className={menuItemClass}>
                                <Icon name="settings" className="h-4 w-4" />Settings
                            </MenuItem>
                        )}
                        {actions.settings && auth?.can_switch_campus && (
                            <MenuItem as={Link} href={`${actions.settings.href}#branding`} className={menuItemClass}>
                                <Icon name="building" className="h-4 w-4" />Website branding
                            </MenuItem>
                        )}
                        <div className="my-1 h-px bg-slate-100" />
                        <MenuItem>
                            <Link href={route('logout')} method="post" as="button"
                                className={`${menuItemClass} text-rose-600 data-[focus]:bg-rose-50 data-[focus]:text-rose-700`}>
                                <Icon name="logout" className="h-4 w-4" />Sign Out
                            </Link>
                        </MenuItem>
                    </MenuItems>
                </Menu>
            </div>

            <Dialog open={searchOpen && Boolean(activeSearch)} onClose={setSearchOpen} className="relative z-50">
                <div className="fixed inset-0 bg-slate-900/40" aria-hidden="true" />
                <div className="fixed inset-0 flex items-start justify-center overflow-y-auto p-4 pt-[15vh]">
                    <DialogPanel className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <DialogTitle className="text-lg font-semibold text-slate-800">Search records</DialogTitle>
                            <button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                                <Icon name="close" className="h-4 w-4" />
                            </button>
                        </div>
                        <form onSubmit={submitSearch} className="space-y-4">
                            <label className="block text-sm font-medium text-slate-700">
                                Search in
                                <select value={activeSearch?.key || ''} onChange={(event) => setSearchModule(event.target.value)} className="mt-1 block w-full rounded-lg border-slate-300 text-sm focus:border-indigo-500 focus:ring-indigo-500">
                                    {actions.search.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
                                </select>
                            </label>
                            <label className="block text-sm font-medium text-slate-700">
                                Search term
                                <input data-autofocus type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} required
                                    placeholder={activeSearch?.placeholder} className="mt-1 block w-full rounded-lg border-slate-300 text-sm focus:border-indigo-500 focus:ring-indigo-500" />
                            </label>
                            <p className="text-xs text-slate-500">Results use your current campus access.</p>
                            <button type="submit" disabled={!searchTerm.trim()} className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">Search</button>
                        </form>
                    </DialogPanel>
                </div>
            </Dialog>
        </header>
    );
}
