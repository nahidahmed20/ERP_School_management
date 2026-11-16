import { Head, Link, usePage } from '@inertiajs/react';
import SiteLayout from '@/Layouts/SiteLayout';
import { Hero } from './Campuses';

export default function Careers({ jobs = [] }) {
    const { site_settings: s = {} } = usePage().props;

    return (
        <SiteLayout activePage="careers">
            <Head title={`Careers — ${s.school_name || 'Our School'}`} />
            
            <Hero 
                tag="Join our team" 
                title="Build your career with us." 
                text="We are always looking for passionate educators and professionals."
            />

            <section className="sf-section">
                <div className="sf-shell">
                    <h2 style={{ fontSize: '2rem', marginBottom: '2rem', fontWeight: 'bold' }}>Open Positions</h2>
                    
                    {jobs.length === 0 ? (
                        <p style={{ color: '#666', fontSize: '1.1rem' }}>There are currently no open positions. Please check back later.</p>
                    ) : (
                        <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                            {jobs.map(job => (
                                <Link 
                                    href={route('site.careers.show', job.id)} 
                                    key={job.id}
                                    style={{
                                        display: 'block',
                                        padding: '1.5rem',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '0.75rem',
                                        textDecoration: 'none',
                                        color: 'inherit',
                                        transition: 'all 0.2s',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}
                                >
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1a202c' }}>
                                        {job.title}
                                    </h3>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem', color: '#4a5568' }}>
                                        <span style={{ background: '#edf2f7', padding: '0.25rem 0.75rem', borderRadius: '9999px' }}>{job.department}</span>
                                        <span style={{ background: '#edf2f7', padding: '0.25rem 0.75rem', borderRadius: '9999px' }}>{job.employment_type}</span>
                                    </div>
                                    <p style={{ color: '#718096', fontSize: '0.875rem' }}>
                                        Deadline: {new Date(job.deadline).toLocaleDateString()}
                                    </p>
                                    <p style={{ color: '#4c51bf', fontWeight: 'bold', marginTop: '1rem', display: 'flex', alignItems: 'center' }}>
                                        View Details & Apply →
                                    </p>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </SiteLayout>
    );
}

