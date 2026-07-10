import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import Icon from './Icons';

/**
 * <Topbar onHamburgerClick={...} />
 * Search box + campus switch + notification bell + profile dropdown.
 * Profile/logout reuses Breeze's existing <Dropdown> component so
 * auth logic doesn't need to be duplicated.
 */
export default function Topbar({ onHamburgerClick }) {
  const { auth } = usePage().props;
  const user = auth?.user;
  const initials = user?.name
    ?.split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="topbar">
      <button className="hamburger" onClick={onHamburgerClick} aria-label="Toggle menu">
        <Icon name="grid" className="nav-ic" />
      </button>

      <div className="search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <input type="text" placeholder="Search students, staff, invoices…" />
      </div>

      <div className="topbar-spacer" />

      <div className="campus-switch">
        <span className="flag" /> Main Campus, Dhaka
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>

      <button className="icon-btn" aria-label="Notifications">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.7 21a2 2 0 01-3.4 0" />
        </svg>
        <span className="ping" />
      </button>

      <Dropdown>
        <Dropdown.Trigger>
          <button type="button" className="profile" style={{ border: 'none', background: 'none' }}>
            <div className="avatar">{initials || 'U'}</div>
            <div className="who">
              <div className="n">{user?.name}</div>
              <div className="r">{user?.role || 'Admin'}</div>
            </div>
          </button>
        </Dropdown.Trigger>
        <Dropdown.Content>
          <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
          <Dropdown.Link href={route('logout')} method="post" as="button">
            Log Out
          </Dropdown.Link>
        </Dropdown.Content>
      </Dropdown>
    </header>
  );
}
