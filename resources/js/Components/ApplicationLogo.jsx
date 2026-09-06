import { usePage } from '@inertiajs/react';

export default function ApplicationLogo(props) {
    const site = usePage().props.site_settings ?? {};
    const name = site.school_short_name || site.school_name || 'School';
    if (site.logo) return <img {...props} src={site.logo} alt={`${name} logo`} className={`${props.className || ''} object-contain`} />;
    return <div {...props} className={`${props.className || ''} flex items-center justify-center rounded-full bg-emerald-800 text-2xl font-bold text-white`}>{name.charAt(0).toUpperCase()}</div>;
}
