import Icon from '@/Components/Icons';
import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function GlobalEventBanner() {
    const alerts = usePage().props.dashboard_alerts ?? [];
    const [dismissed, setDismissed] = useState([]);

    useEffect(() => {
        try { setDismissed(JSON.parse(sessionStorage.getItem('dismissed-dashboard-alerts') || '[]')); } catch { setDismissed([]); }
    }, []);

    const visible = alerts.filter((alert) => !dismissed.includes(alert.id));
    if (!visible.length) return null;

    const dismiss = (id) => {
        const next = [...dismissed, id];
        setDismissed(next);
        sessionStorage.setItem('dismissed-dashboard-alerts', JSON.stringify(next));
    };

    return (
        <div className="mx-3 mt-3 space-y-2 sm:mx-6">
            {visible.map((alert) => (
                <div key={alert.id} className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-sm ${alert.type === 'Holiday' ? 'border-amber-200 bg-amber-50' : 'border-emerald-200 bg-emerald-50'}`}>
                    <Icon name={alert.type === 'Holiday' ? 'calendar' : 'bell'} className={`mt-0.5 h-5 w-5 shrink-0 ${alert.type === 'Holiday' ? 'text-amber-700' : 'text-emerald-800'}`} />
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-900">{alert.is_today ? 'আজ: ' : ''}{alert.title}</p>
                        <p className="mt-0.5 text-xs text-slate-600">{alert.starts_at}{alert.description ? ` · ${alert.description}` : ''}</p>
                    </div>
                    <button type="button" onClick={() => dismiss(alert.id)} className="rounded-lg p-1 text-slate-400 hover:bg-white hover:text-slate-700" aria-label="Dismiss announcement"><Icon name="close" className="h-4 w-4" /></button>
                </div>
            ))}
        </div>
    );
}
