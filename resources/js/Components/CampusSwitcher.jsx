import { useId, useState } from 'react';
import { router } from '@inertiajs/react';

export default function CampusSwitcher({ auth, campuses = [] }) {
    const id = useId();
    const [pending, setPending] = useState(false);
    const [error, setError] = useState('');
    const canSwitch = Boolean(auth?.can_switch_campus);
    const selectedId = auth?.active_campus_id == null ? '' : String(auth.active_campus_id);
    const options = campuses.filter((campus) => campus.id && String(campus.id) !== 'all');

    const changeCampus = (event) => {
        const campusId = event.target.value;
        if (!canSwitch || pending || !campusId || campusId === selectedId
            || !options.some((campus) => String(campus.id) === campusId)) return;

        let outcome = 'pending';
        setError('');
        router.post(route('admin.campus.switch'), { campus_id: campusId }, {
            // A successful switch must discard forms belonging to the previous campus.
            preserveState: 'errors',
            preserveScroll: false,
            onStart: () => setPending(true),
            onSuccess: () => { outcome = 'success'; },
            onError: (errors) => {
                outcome = 'error';
                setError(errors.campus_id || 'Unable to switch campus. Please try again.');
            },
            onCancel: () => {
                outcome = 'cancelled';
                setError('Campus switch cancelled. Please try again.');
            },
            onFinish: () => {
                setPending(false);
                if (outcome === 'pending') setError('Unable to switch campus. Please try again.');
            },
        });
    };

    if (!canSwitch) {
        return (
            <div className="min-w-0 max-w-[144px] sm:max-w-[180px]">
                <p className="text-[10px] leading-3 text-slate-500">Assigned campus</p>
                <p className="truncate text-xs font-semibold text-slate-700" title={auth?.active_campus?.name}>
                    {auth?.active_campus?.name || 'No assigned campus'}
                </p>
            </div>
        );
    }

    return (
        <div className="relative min-w-0 max-w-[144px] sm:max-w-[180px]">
            <label htmlFor={id} className="block text-[10px] leading-3 text-slate-500">Working campus</label>
            <select
                id={id}
                value={selectedId}
                onChange={changeCampus}
                disabled={pending || options.length === 0}
                aria-busy={pending}
                aria-invalid={Boolean(error)}
                aria-describedby={`${id}-hint${error ? ` ${id}-error` : ''}`}
                className="w-full bg-transparent hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold pl-2 pr-7 py-1 rounded-lg outline-none cursor-pointer transition-all truncate focus:ring-2 focus:ring-indigo-500/30 disabled:cursor-wait disabled:opacity-60"
            >
                <option value="" disabled>{options.length ? 'Select working campus' : 'No active campuses'}</option>
                {options.map((campus) => <option key={campus.id} value={campus.id}>{campus.name}</option>)}
            </select>
            <p id={`${id}-hint`} aria-live="polite" className="mt-0.5 text-[9px] leading-3 text-slate-500">
                {pending ? 'Switching campus…' : 'Account assignment stays unchanged.'}
            </p>
            {error && (
                <p id={`${id}-error`} role="alert" className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-rose-200 bg-white p-3 text-xs text-rose-700 shadow-lg">
                    {error}
                </p>
            )}
        </div>
    );
}
