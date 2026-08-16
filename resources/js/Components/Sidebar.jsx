import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import Icon from './Icons';

export default function Sidebar({ mobileOpen = false }) {
  const { url, props } = usePage();
  const navigation = props.navigation ?? [];

  // Helper to safely get the route name whether it comes as 'route' or 'route_name'
  const getRoute = (item) => item?.route_name || item?.route || null;

  function isActive(routeName) {
    if (!routeName) return false;
    try {
      return route().current(routeName) || route().current(routeName + '.*');
    } catch {
      return url.startsWith('/' + routeName.replaceAll('.', '/'));
    }
  }

  const [openKeys, setOpenKeys] = useState(() => {
    const initialKeys = new Set();
    navigation.forEach(group => {
      group.items?.forEach(item => {
        if (item.children?.some(child => isActive(getRoute(child)))) {
          initialKeys.add(item.key);
        }
      });
    });
    return initialKeys;
  });

  // Automatically expand active parent when navigation or url changes
  useEffect(() => {
    navigation.forEach(group => {
      group.items?.forEach(item => {
        if (item.children?.some(child => isActive(getRoute(child)))) {
          setOpenKeys(prev => new Set(prev).add(item.key));
        }
      });
    });
  }, [url, navigation]);

  function toggle(key) {
    setOpenKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  function hrefFor(item) {
    const routeName = getRoute(item);
    if (!routeName) return '#';
    try {
      return route(routeName);
    } catch {
      return '/' + routeName.replaceAll('.', '/');
    }
  }

  if (!navigation || navigation.length === 0) {
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
            {group.items?.map(item => {
              const isParentActive = item.children?.some(child => isActive(getRoute(child)));
              const isOpen = openKeys.has(item.key);

              return item.children?.length ? (
                <div className="nav-parent" key={item.key}>
                  <button
                    type="button"
                    className={`nav-item nav-toggle ${isOpen ? 'open' : ''} ${isParentActive ? 'active' : ''}`}
                    onClick={() => toggle(item.key)}
                    aria-expanded={isOpen}
                  >
                    <Icon name={item.icon} />
                    <span>{item.label}</span>
                    {item.count ? <span className="nav-count">{item.count}</span> : null}
                    <Icon name="chevron" className="nav-chevron" />
                  </button>

                  <div
                    className="nav-submenu"
                    style={{
                      maxHeight: isOpen ? '600px' : '0px',
                      overflow: 'hidden',
                      transition: 'max-height 0.3s ease'
                    }}
                  >
                    {item.children.map(child => {
                      const childRoute = getRoute(child);
                      return (
                        <Link
                          key={child.key || childRoute}
                          href={hrefFor(child)}
                          className={`nav-subitem ${isActive(childRoute) ? 'active' : ''}`}
                        >
                          <span className="dot" />
                          <span>{child.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <Link
                  key={item.key || getRoute(item)}
                  href={hrefFor(item)}
                  className={`nav-item ${isActive(getRoute(item)) ? 'active' : ''}`}
                >
                  <Icon name={item.icon} />
                  <span>{item.label}</span>
                  {item.count ? <span className="nav-count">{item.count}</span> : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-foot">
        <span><span className="dot-online" /> All systems normal</span>
      </div>
    </aside>
  );
}
