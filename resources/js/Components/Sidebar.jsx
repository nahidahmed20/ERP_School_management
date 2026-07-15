import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import Icon from './Icons';

export default function Sidebar({ mobileOpen = false }) {
  const { url, props } = usePage();
  const navigation = props.navigation ?? [];

  function isActive(routeName) {
    if (!routeName) return false;
    try {
      return route().current(routeName);
    } catch {
      return url.startsWith('/' + routeName.replaceAll('.', '/'));
    }
  }

  const [openKeys, setOpenKeys] = useState(() => {
    const initialKeys = new Set();
    navigation.forEach(group => {
      group.items.forEach(item => {
        if (item.children?.some(child => isActive(child.route))) {
          initialKeys.add(item.key);
        }
      });
    });
    return initialKeys;
  });

  useEffect(() => {
    setOpenKeys(prev => {
      const next = new Set(prev);
      let hasChanges = false;
      
      navigation.forEach(group => {
        group.items.forEach(item => {
          if (item.children?.some(child => isActive(child.route))) {
            if (!next.has(item.key)) {
              next.add(item.key);
              hasChanges = true;
            }
          }
        });
      });
      return hasChanges ? next : prev; 
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, navigation]);

  function toggle(key) {
    setOpenKeys(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  function hrefFor(routeName) {
    try {
      return route(routeName);
    } catch {
      return '/' + routeName.replaceAll('.', '/');
    }
  }

  if (!navigation.length) {
    return (
      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="brand">
          <div className="seal"><span>V</span></div>
          <div className="brand-text">
            <div className="name">Verdant</div>
            <div className="sub">School ERP</div>
          </div>
        </div>
        <div className="nav-loading">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="nav-skel" />)}
        </div>
      </aside>
    );
  }

  return (
    <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="brand">
        <div className="seal"><span>V</span></div>
        <div className="brand-text">
          <div className="name">Verdant</div>
          <div className="sub">School ERP</div>
        </div>
      </div>

      <nav className="nav">
        {navigation.map(group => (
          <div className="nav-group" key={group.label}>
            <div className="nav-label">{group.label}</div>
            {group.items.map(item =>
              item.children?.length ? (
                <div className="nav-parent" key={item.key}>
                  <button
                    type="button"
                    className={`nav-item nav-toggle ${openKeys.has(item.key) ? 'open' : ''}`}
                    onClick={() => toggle(item.key)}
                    aria-expanded={openKeys.has(item.key)}
                  >
                    <Icon name={item.icon} />
                    <span>{item.label}</span>
                    {item.count ? <span className="nav-count">{item.count}</span> : null}
                    <Icon name="chevron" className="nav-chevron" />
                  </button>

                  <div
                    className="nav-submenu"
                    style={{ maxHeight: openKeys.has(item.key) ? '480px' : '0px' }}
                  >
                    {item.children.map(child => (
                      <Link
                        key={child.key}
                        href={hrefFor(child.route)}
                        className={`nav-subitem ${isActive(child.route) ? 'active' : ''}`}
                      >
                        <span className="dot" />
                        <span>{child.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={item.key}
                  href={hrefFor(item.route)}
                  className={`nav-item ${isActive(item.route) ? 'active' : ''}`}
                >
                  <Icon name={item.icon} />
                  <span>{item.label}</span>
                  {item.count ? <span className="nav-count">{item.count}</span> : null}
                </Link>
              )
            )}
          </div>
        ))}
      </nav>

      <div className="sidebar-foot">
        <span><span className="dot-online" /> All systems normal</span>
      </div>
    </aside>
  );
}