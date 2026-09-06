import { Head } from '@inertiajs/react';
import SiteLayout from '@/Layouts/SiteLayout';

const photoUrl = (path) => path ? (path.startsWith('http') || path.startsWith('/') ? path : `/storage/${path}`) : null;

export default function Teachers({ teachers = [] }) {
    return <SiteLayout activePage="teachers"><Head title="Our Teachers" />
        <section className="sf-page-hero"><div className="sf-shell"><span>Meet our educators</span><h1>Expert guidance. Human connection.</h1><p>Meet the teachers and academic leaders who help every student learn with confidence and purpose.</p></div></section>
        <section className="sf-section"><div className="sf-shell">
            {teachers.length ? <div className="sf-teacher-grid">{teachers.map((teacher) => <article key={teacher.id}><div className="sf-teacher-photo">{photoUrl(teacher.photo) ? <img src={photoUrl(teacher.photo)} alt={`${teacher.first_name} ${teacher.last_name || ''}`} /> : <span>{teacher.first_name?.[0]}{teacher.last_name?.[0]}</span>}</div><div><small>{teacher.designation?.name || 'Teacher'}</small><h2>{teacher.first_name} {teacher.last_name}</h2><p>{teacher.department?.name}{teacher.qualification ? ` · ${teacher.qualification}` : ''}</p>{teacher.experience && <b>{teacher.experience} experience</b>}<footer>{teacher.campus?.name}</footer></div></article>)}</div> : <div className="sf-empty"><h2>Teacher profiles are being prepared.</h2><p>Assign a Teacher or Principal designation to active staff members to publish them here.</p></div>}
        </div></section>
    </SiteLayout>;
}
