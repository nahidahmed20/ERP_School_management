import { memo, useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
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
  const sidebarRef = useRef(null);
  const scrollTopBeforeMenuChange = useRef(null);

  useLayoutEffect(() => {
    const storageKey = 'school-sidebar-scroll-top';
    let savedScrollTop = 0;
    try {
      const storedValue = Number(window.sessionStorage.getItem(storageKey));
      if (Number.isFinite(storedValue) && storedValue >= 0) savedScrollTop = storedValue;
    } catch {
      // Keep sidebar navigation usable if browser storage is unavailable.
    }

    const saveScrollTop = () => {
      if (!sidebarRef.current) return;
      try {
        window.sessionStorage.setItem(storageKey, String(sidebarRef.current.scrollTop));
      } catch {
        // Scroll preservation is optional when browser storage is unavailable.
      }
    };

    const sidebar = sidebarRef.current;
    if (sidebar) sidebar.scrollTop = savedScrollTop;
    sidebar?.addEventListener('scroll', saveScrollTop, { passive: true });
    return () => {
      sidebar?.removeEventListener('scroll', saveScrollTop);
    };
  }, []);

  useLayoutEffect(() => {
    // One update per navigation, not one update per matching parent menu.
    if (sidebarRef.current) scrollTopBeforeMenuChange.current = sidebarRef.current.scrollTop;
    setOpenKey((previous) => activeKey ?? (groups.some((group) => group.items.some(
      (item) => item.menuKey === previous && item.children.length,
    )) ? previous : null));
  }, [url, groups, activeKey]);

  useLayoutEffect(() => {
    if (scrollTopBeforeMenuChange.current === null || !sidebarRef.current) return;
    sidebarRef.current.scrollTop = scrollTopBeforeMenuChange.current;
    scrollTopBeforeMenuChange.current = null;
  }, [openKey]);

  const toggle = useCallback((key) => {
    if (sidebarRef.current) scrollTopBeforeMenuChange.current = sidebarRef.current.scrollTop;
    setOpenKey((previous) => toggleSidebarKey(previous, key));
  }, []);

  const handleNavigate = useCallback((event) => {
    if (sidebarRef.current) scrollTopBeforeMenuChange.current = sidebarRef.current.scrollTop;
    // A focused link can make the browser scroll its overflow container after navigation.
    event?.currentTarget?.blur();
    onNavigate?.();
  }, [onNavigate]);

  return <aside ref={sidebarRef} id="school-sidebar" className={'sidebar' + (mobileOpen ? ' mobile-open' : '') + (desktopCollapsed ? ' desktop-collapsed' : '')} aria-label="School navigation">
    <div className="brand">
      {site.admin_logo ? (
          <div className="brand-logo" style={{ maxWidth: '100%', height: '42px', flexShrink: 0 }}>
              <img src={site.admin_logo} alt={shortName + ' logo'} style={{ width: 'auto', height: '100%', objectFit: 'contain' }} />
          </div>
      ) : (
          <>
            <div className="seal">
              <span>{shortName.trim().charAt(0).toUpperCase()}</span>
            </div>
            <div className="brand-text">
              <div className="name">{shortName}</div>
              <div className="sub">{site.school_tagline || 'School ERP'}</div>
            </div>
          </>
      )}
    </div>

    {groups.length ? <nav className="nav" aria-label="Main menu">
      {groups.map((group) => <div className="nav-group" key={group.menuKey}>
        <div className="nav-label">{group.label}</div>
        {group.items.map((item) => <MenuEntry key={item.menuKey} item={item}
          isOpen={openKey === item.menuKey} onToggle={toggle} onNavigate={handleNavigate} />)}
      </div>)}
    </nav> : <p className="nav-empty">No menus are available for this account.</p>}

    <div className="sidebar-foot"><span><span className="dot-online" /> School ERP</span></div>
  </aside>;
});
