import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import Icon from './Icons';

export default function Sidebar({ mobileOpen = false, onNavigate }) {
  const { url, props } = usePage();
  const navigation = props.navigation ?? [];
  const site = props.site_settings ?? {};
  const shortName = site.school_short_name || site.school_name || 'School';
  const brandMark = site.logo ? <img src={site.logo} alt={`${shortName} logo`} className="h-full w-full rounded-xl object-contain" /> : <span>{shortName.trim().charAt(0).toUpperCase()}</span>;

  // Helper to safely get route name
  const getRoute = (item) => item?.route_name || item?.route || null;

  // ১. নির্দিষ্ট Child Menu Active করার জন্য (Exact Match)
  function isChildActive(routeName) {
    if (!routeName) return false;
    try {
      // এক্সাক্ট রাউট ম্যাচ
      if (route().current(routeName)) return true;

      // যদি এডিট বা শো পেজ হয় (admin.students.edit), তবে শুধু 'Student List' (admin.students.index) সিলেক্ট হবে
      if (
        (route().current('admin.students.edit') || route().current('admin.students.show')) &&
        routeName === 'admin.students.index'
      ) {
        return true;
      }

      return false;
    } catch {
      return url === '/' + routeName.replaceAll('.', '/');
    }
  }

  // ২. Parent Menu ওপেন বা হাইলাইট করার জন্য
  function isParentActive(item) {
    if (!item.children || item.children.length === 0) {
      return isChildActive(getRoute(item));
    }
    
    // যদি চাইল্ডের কোনো একটা অ্যাক্টিভ থাকে অথবা বর্তমান রাউটের গ্রুপ ম্যাচ করে
    return item.children.some(child => {
      const childRoute = getRoute(child);
      return isChildActive(childRoute) || (childRoute && route().current(childRoute.split('.').slice(0, 2).join('.') + '.*'));
    });
  }

  const [openKeys, setOpenKeys] = useState(() => {
    const initialKeys = new Set();
    navigation.forEach(group => {
      group.items?.forEach(item => {
        if (isParentActive(item)) {
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
        if (isParentActive(item)) {
          setOpenKeys(prev => new Set(prev).add(item.key));
        }
      });
    });
  }, [url, navigation]);

  function toggle(key) {
    setOpenKeys(prev => {
      const next = new Set();
      if (!prev.has(key)) {
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
          <div className="seal">{brandMark}</div>
          <div className="brand-text">
            <div className="name">{shortName}</div>
            <div className="sub">{site.school_tagline || 'School ERP'}</div>
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
        <div className="seal">{brandMark}</div>
        <div className="brand-text">
          <div className="name">{shortName}</div>
          <div className="sub">{site.school_tagline || 'School ERP'}</div>
        </div>
      </div>

      <nav className="nav">
        {navigation.map(group => (
          <div className="nav-group" key={group.label}>
            <div className="nav-label">{group.label}</div>
            {group.items?.map(item => {
              const hasActiveChildren = isParentActive(item);
              const isOpen = openKeys.has(item.key);

              return item.children?.length ? (
                <div className="nav-parent" key={item.key}>
                  <button
                    type="button"
                    className={`nav-item nav-toggle ${isOpen ? 'open' : ''} ${hasActiveChildren ? 'active' : ''}`}
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
                      const active = isChildActive(childRoute);

                      return (
                        <Link
                          key={child.key || childRoute}
                          href={hrefFor(child)}
                          className={`nav-subitem ${active ? 'active' : ''}`}
                          onClick={onNavigate}
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
                  className={`nav-item ${isChildActive(getRoute(item)) ? 'active' : ''}`}
                  onClick={onNavigate}
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
