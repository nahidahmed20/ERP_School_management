import { memo, useCallback, useEffect, useId, useMemo, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import Icon from './Icons';
import { activeSidebarKey, buildSidebarNavigation, toggleSidebarKey } from '@/Utils/sidebarNavigation';

const EMPTY_NAVIGATION = [];
const resolveRoute = (...args) => route(...args);

const SubmenuLinks = memo(function SubmenuLinks({ children, onNavigate }) {
  return children.map((child) => (
    <Link key={child.menuKey} href={child.href}
      className={'nav-subitem' + (child.active ? ' active' : '')}
      aria-current={child.active ? 'page' : undefined} onClick={onNavigate}>
      <span className="dot" />
      <span>{child.label}</span>
    </Link>
  ));
});

const MenuEntry = memo(function MenuEntry({ item, isOpen, onToggle, onNavigate }) {
  const submenuId = useId();

  if (!item.children.length) {
    return <Link href={item.href} className={'nav-item' + (item.active ? ' active' : '')}
      aria-current={item.active ? 'page' : undefined} onClick={onNavigate}>
      <Icon name={item.icon} />
      <span>{item.label}</span>
      {item.count ? <span className="nav-count">{item.count}</span> : null}
    </Link>;
  }

  return <div className="nav-parent">
    <button type="button"
      className={'nav-item nav-toggle' + (isOpen ? ' open' : '') + (item.active ? ' active' : '')}
      onClick={() => onToggle(item.menuKey)} aria-expanded={isOpen} aria-controls={submenuId}>
      <Icon name={item.icon} />
      <span>{item.label}</span>
      {item.count ? <span className="nav-count">{item.count}</span> : null}
      <Icon name="chevron" className="nav-chevron" />
    </button>
    {/* Keep links mounted, but remove closed menus from layout and keyboard focus.
        No fixed-height animation or route work runs when toggling. */}
    <div id={submenuId} className="nav-submenu" hidden={!isOpen}>
      <SubmenuLinks children={item.children} onNavigate={onNavigate} />
    </div>
  </div>;
});

export default memo(function Sidebar({ mobileOpen = false, desktopCollapsed = false, onNavigate }) {
  const { url, props } = usePage();
  const navigation = props.navigation ?? EMPTY_NAVIGATION;
  const site = props.site_settings ?? {};
  const shortName = site.school_short_name || site.school_name || 'School';
  const groups = useMemo(() => buildSidebarNavigation(navigation, url, resolveRoute), [navigation, url]);
  const activeKey = useMemo(() => activeSidebarKey(groups), [groups]);
  const [openKey, setOpenKey] = useState(activeKey);

  useEffect(() => {
    // One update per navigation, not one update per matching parent menu.
    setOpenKey((previous) => activeKey ?? (groups.some((group) => group.items.some(
      (item) => item.menuKey === previous && item.children.length,
    )) ? previous : null));
  }, [url, groups, activeKey]);

  const toggle = useCallback((key) => setOpenKey((previous) => toggleSidebarKey(previous, key)), []);

  return <aside id="school-sidebar" className={'sidebar' + (mobileOpen ? ' mobile-open' : '') + (desktopCollapsed ? ' desktop-collapsed' : '')} aria-label="School navigation">
    <div className="brand">
      <div className="seal">{site.logo
        ? <img src={site.logo} alt={shortName + ' logo'} className="h-full w-full rounded-xl object-contain" />
        : <span>{shortName.trim().charAt(0).toUpperCase()}</span>}</div>
      <div className="brand-text">
        <div className="name">{shortName}</div>
        <div className="sub">{site.school_tagline || 'School ERP'}</div>
      </div>
    </div>

    {groups.length ? <nav className="nav" aria-label="Main menu">
      {groups.map((group) => <div className="nav-group" key={group.menuKey}>
        <div className="nav-label">{group.label}</div>
        {group.items.map((item) => <MenuEntry key={item.menuKey} item={item}
          isOpen={openKey === item.menuKey} onToggle={toggle} onNavigate={onNavigate} />)}
      </div>)}
    </nav> : <p className="nav-empty">No menus are available for this account.</p>}

    <div className="sidebar-foot"><span><span className="dot-online" /> School ERP</span></div>
  </aside>;
});
