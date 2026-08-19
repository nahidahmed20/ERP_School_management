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
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-40">
            <div className="flex items-center gap-4">
                <button className="md:hidden p-2 text-gray-600" onClick={onHamburgerClick}><Icon name="menu" /></button>
                <div className="relative w-64">
                    <input type="text" placeholder="Search students, staff..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition-all" />
                    <Icon name="search" className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <select className="bg-red-500 text-white text-[10px] font-bold px-3 py-1.5 rounded uppercase border-none hover:bg-red-600 transition-all cursor-pointer">
                    <option value="en">English</option>
                </select>

                {/* ফিক্সড: option এ selected না দিয়ে select এর ভেতরে value দেওয়া হয়েছে */}
                <select
                    value={auth?.active_campus_id || ''}
                    onChange={handleCampusChange}
                    className="bg-indigo-900 text-white text-[10px] font-bold px-3 py-1.5 rounded uppercase border-none hover:bg-indigo-950 transition-all cursor-pointer"
                >
                    <option value="">Select Campus</option>
                    {all_campuses?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>

                <Dropdown>
                    <Dropdown.Trigger>
                        <div className="flex items-center gap-3 pl-4 border-l cursor-pointer">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-bold text-gray-800">{user?.name}</p>
                                <p className="text-[10px] text-gray-500 uppercase">{user?.roles?.[0]?.name || 'Admin'}</p>
                            </div>
                            <div className="w-9 h-9 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                        </div>
                    </Dropdown.Trigger>
                    <Dropdown.Content>
                        <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                        <Dropdown.Link href={route('logout')} method="post" as="button">Log Out</Dropdown.Link>
                    </Dropdown.Content>
                </Dropdown>
            </div>
        </header>
    );
}
