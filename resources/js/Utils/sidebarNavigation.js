const routeNameFor = (item) => item?.route_name || item?.route || null;

/** Resolve routes once per page/navigation change, never for an accordion click. */
export function buildSidebarNavigation(navigation, url, resolveRoute) {
    let currentRoute;
    try {
        currentRoute = resolveRoute().current();
    } catch {
        // The URL fallback also supports pages rendered without Ziggy.
    }

    const names = new Set(navigation.flatMap((group) => (group.items ?? []).flatMap(
        (item) => [routeNameFor(item), ...(item.children ?? []).map(routeNameFor)],
    )));
    const hasExactMenu = Boolean(currentRoute && names.has(currentRoute));
    const pathname = url.split(/[?#]/)[0];
    const hrefs = new Map();

    function hrefFor(name) {
        if (!name) return '#';
        if (!hrefs.has(name)) {
            try {
                hrefs.set(name, String(resolveRoute(name)));
            } catch {
                hrefs.set(name, '/' + name.replaceAll('.', '/'));
            }
        }
        return hrefs.get(name);
    }

    function isActive(name) {
        if (!name) return false;
        if (currentRoute) {
            if (currentRoute === name) return true;
            // Detail/edit pages use their module's list unless they have their own menu.
            return !hasExactMenu && name.endsWith('.index')
                && currentRoute.startsWith(name.slice(0, -'index'.length));
        }
        try {
            return new URL(hrefFor(name), 'https://sidebar.invalid').pathname === pathname;
        } catch {
            return false;
        }
    }

    return navigation.map((group, groupIndex) => {
        const groupKey = String(group.id ?? group.key ?? group.label ?? groupIndex);
        return {
            ...group,
            menuKey: groupKey,
            items: (group.items ?? []).map((item, itemIndex) => {
                const name = routeNameFor(item);
                const menuKey = `${groupKey}:${item.key ?? name ?? itemIndex}`;
                const children = (item.children ?? []).map((child, childIndex) => {
                    const childName = routeNameFor(child);
                    return { ...child, menuKey: `${menuKey}:${child.key ?? childName ?? childIndex}`,
                        href: hrefFor(childName), active: isActive(childName) };
                });
                return { ...item, menuKey, children, href: hrefFor(name),
                    active: isActive(name) || children.some((child) => child.active) };
            }),
        };
    });
}

export function activeSidebarKey(groups) {
    for (const group of groups) {
        const active = group.items.find((item) => item.children.length && item.active);
        if (active) return active.menuKey;
    }
    return null;
}

export function toggleSidebarKey(current, key) {
    return current === key ? null : key;
}
