import React from 'react';
import Dropdown from '@/Components/Dropdown';
import { Link, usePage, router } from '@inertiajs/react'; 
import Icon from './Icons'; 

export default function Topbar({ onHamburgerClick }) {
  const { auth, all_campuses } = usePage().props;
  const user = auth?.user;

  const initials = user?.name
    ?.split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleCampusChange = (e) => {
    router.post(route('admin.campus.switch'), { campus_id: e.target.value }, {
      preserveScroll: true,
      onSuccess: () => {
        console.log('Campus switched successfully!');
      }
    });
  };

  return (
    <header className="topbar">
      {/* Hamburger Menu */}
      <button className="hamburger" onClick={onHamburgerClick} aria-label="Toggle menu">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      {/* Search Box */}
      <div className="search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <input type="text" placeholder="Search students, staff, invoices…" />
      </div>

      <div className="topbar-spacer" />

      {/* --- Campus Switcher Section --- */}
      {all_campuses && all_campuses.length > 0 ? (
        <div className="campus-switch" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <span className="flag" /> 
          <select
            value={auth?.active_campus_id ? String(auth.active_campus_id) : ''}
            onChange={handleCampusChange}
            style={{ 
              appearance: 'none', 
              background: 'transparent', 
              border: 'none', 
              outline: 'none', 
              cursor: 'pointer',
              paddingRight: '20px', 
              fontFamily: 'inherit',
              fontSize: 'inherit',
              color: 'inherit',
              fontWeight: 'inherit'
            }}
          >
            <option value="">-- All Campuses --</option>
            {all_campuses.map((campus) => (
              <option key={campus.id} value={campus.id} style={{ color: '#333' }}>
                {campus.name}
              </option>
            ))}
          </select>
          {/* Custom Arrow Icon */}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', right: '0', width: '16px', pointerEvents: 'none' }}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      ) : (
        <div className="campus-switch">
          <span className="flag" /> {user?.campus?.name || 'My Campus'}
        </div>
      )}
      {/* ------------------------------- */}

      {/* Notification Bell */}
      <button className="icon-btn" aria-label="Notifications">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.7 21a2 2 0 01-3.4 0" />
        </svg>
        <span className="ping" />
      </button>

      {/* Profile Dropdown */}
      <Dropdown>
        <Dropdown.Trigger>
          <button type="button" className="profile" style={{ border: 'none', background: 'none' }}>
            <div className="avatar">{initials || 'U'}</div>
            <div className="who">
              <div className="n">{user?.name}</div>
              <div className="r">{user?.roles?.[0]?.name || 'User'}</div>
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