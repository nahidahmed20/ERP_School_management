import { Head, useForm, usePage } from '@inertiajs/react';
import SiteLayout from '@/Layouts/SiteLayout';
import { Hero } from './Campuses';
import { Field } from './Admissions';

export default function JobDetails({ job }) {
    const { site_settings: s = {} } = usePage().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        phone: '',
        email: '',
        cover_letter: '',
        resume: null
    });

    const submit = e => {
        e.preventDefault();
        post(route('site.careers.apply', job.id), {
            onSuccess: () => reset()
        });
    };

    return (
        <SiteLayout activePage="careers">
            <Head title={`${job.title} — Careers`} />
            
            <Hero 
                tag={job.department} 
                title={job.title} 
                text={`${job.employment_type} position • ${job.vacancies} vacancy(s) • Apply by ${new Date(job.deadline).toLocaleDateString()}`}
            />

            <section className="sf-section">
                <div className="sf-shell sf-form-layout">
                    <aside>
                        <span>Job Description</span>
                        <h2 style={{ marginBottom: '1.5rem', fontWeight: 'bold' }}>Requirements & Details</h2>
                        <div 
                            style={{ lineHeight: '1.8', color: '#4a5568', whiteSpace: 'pre-wrap', marginBottom: '2rem' }}
                            dangerouslySetInnerHTML={{ __html: job.description }}
                        />
                    </aside>

                    <form className="sf-public-form" onSubmit={submit}>
                        <h2>Apply for this position</h2>
                        <div className="sf-fields">
                            <Field label="Full name *" error={errors.name}>
                                <input value={data.name} onChange={e => setData('name', e.target.value)} required />
                            </Field>
                            
                            <Field label="Phone *" error={errors.phone}>
                                <input value={data.phone} onChange={e => setData('phone', e.target.value)} required />
                            </Field>
                            
                            <Field label="Email address *" error={errors.email}>
                                <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} required />
                            </Field>
                            
                            <Field wide label="Cover Letter / Message" error={errors.cover_letter}>
                                <textarea rows="6" value={data.cover_letter} onChange={e => setData('cover_letter', e.target.value)} placeholder="Tell us why you're a good fit..." />
                            </Field>

                            <Field wide label="Resume / CV (PDF or DOC) *" error={errors.resume}>
                                <input 
                                    type="file" 
                                    accept=".pdf,.doc,.docx"
                                    onChange={e => setData('resume', e.target.files[0])} 
                                    required 
                                    style={{ padding: '0.5rem', border: '1px solid #cbd5e0', borderRadius: '0.5rem', width: '100%' }}
                                />
                            </Field>
                        </div>
                        <button disabled={processing} className="sf-submit">
                            {processing ? 'Submitting Application...' : 'Submit Application →'}
                        </button>
                    </form>
                </div>
            </section>
        </SiteLayout>
    );
}

