import { usePage } from '@inertiajs/react';

/** Campus assignment follows the working campus, never an independently edited form choice. */
export default function WorkingCampusField({ value, campuses = [], className = '', id }) {
    const { auth = {} } = usePage().props;
    const campusId = value || auth.active_campus_id || '';
    const campus = campuses.find((entry) => String(entry.id) === String(campusId))
        ?? (String(auth.active_campus?.id) === String(campusId) ? auth.active_campus : null);
    const mismatch = campusId && auth.active_campus_id
        && String(campusId) !== String(auth.active_campus_id);

    return (
        <div>
            <select id={id} aria-label="Working campus" value={campusId} disabled className={className}>
                <option value={campusId}>
                    {campus?.name ?? (campusId ? `Campus #${campusId}` : 'Select a campus from the top bar')}
                </option>
            </select>
            <p className={`mt-1 text-xs ${mismatch || !campusId ? 'text-amber-700' : 'text-slate-500'}`}>
                {mismatch
                    ? 'This record belongs to a different campus. Switch campus and reopen the form.'
                    : auth.can_switch_campus
                        ? 'Uses the campus selected in the top bar. Switch there before opening a new form.'
                        : 'This record is assigned to your campus.'}
            </p>
        </div>
    );
}
