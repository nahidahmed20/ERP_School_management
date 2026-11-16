/** Normalize public-disk paths without duplicating /storage or corrupting existing URLs. */
export function publicMediaUrl(value, fallback = null) {
    if (typeof value !== 'string' || !value.trim()) return fallback;
    const path = value.trim().replaceAll('\\', '/');
    if (/^(?:https?:\/\/|blob:|data:image\/)/i.test(path)) return path;
    if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(path)) return fallback;
    const relative = path.replace(/^\/+/, '').replace(/^(?:public\/)?storage\//, '').replace(/^public\//, '');
    if (!relative || relative.split('/').some((part) => part === '..')) return fallback;
    return `/storage/${relative}`;
}
