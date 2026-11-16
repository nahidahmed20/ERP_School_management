import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import React, { useState } from 'react';

// Change this to your real root domain
const ROOT_DOMAIN = 'yourdomain.com';

const ICONS = {
    school: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    mail: 'M3 8l7.9 5.3a2 2 0 002.2 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    lock: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
    globe: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9',
    check: 'M5 13l4 4L19 7',
};

const Icon = ({ name, className = 'h-5 w-5', stroke = 1.8 }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={stroke} d={ICONS[name]} />
    </svg>
);

const EyeIcon = ({ off }) => (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        {off ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 5.1A9.8 9.8 0 0112 5c5 0 8.5 4 9.5 7a11.6 11.6 0 01-2.6 4M6.2 6.3C4.3 7.7 2.9 9.8 2.5 12c1 3 4.5 7 9.5 7 1.5 0 2.9-.3 4.1-.9" />
        ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.5 12C3.5 9 7 5 12 5s8.5 4 9.5 7c-1 3-4.5 7-9.5 7s-8.5-4-9.5-7zM12 15a3 3 0 100-6 3 3 0 000 6z" />
        )}
    </svg>
);

// Input styles: dark text, clear border, readable placeholder
const inputCls =
    'block w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-3.5 text-[15px] font-medium text-slate-900 placeholder:font-normal placeholder:text-slate-500 shadow-none transition focus:border-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-700/15';
const labelCls = 'text-sm font-semibold text-slate-900';

// Wraps an input with a left icon
const Field = ({ icon, children }) => (
    <div className="relative mt-2">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
            <Icon name={icon} />
        </span>
        {children}
    </div>
);

const SectionTitle = ({ icon, title, hint }) => (
    <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-emerald-100 text-emerald-900">
            <Icon name={icon} className="h-5 w-5" />
        </span>
        <div>
            <h3 className="text-base font-bold leading-tight text-slate-900">{title}</h3>
            <p className="mt-0.5 text-sm text-slate-600">{hint}</p>
        </div>
    </div>
);

export default function Register({ dynamicText }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        school_name: '',
        domain: '',
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    // Only lowercase letters, numbers and hyphens are allowed in a subdomain
    const handleDomain = (value) => {
        const clean = value
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, '')
            .replace(/^-+/, '');
        setData('domain', clean);
    };

    const previewName = data.domain || 'your-school';
    const headingFont = { fontFamily: "'Bricolage Grotesque', sans-serif" };

    const features = [
        dynamicText?.feature_1 || 'Instant Setup',
        dynamicText?.feature_2 || 'Multi-Campus Ready',
        dynamicText?.feature_3 || '1 month free, no card needed',
    ];

    return (
        <>
            <Head title="Register your School">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Figtree:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <div
                className="min-h-screen bg-[#EEF3F0] lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]"
                style={{ fontFamily: "'Figtree', ui-sans-serif, system-ui, sans-serif" }}
            >
                {/* ───────── Left: brand + live subdomain preview ───────── */}
                <aside
                    className="relative overflow-hidden px-6 py-10 text-white sm:px-10 lg:flex lg:min-h-screen lg:flex-col lg:justify-between lg:px-14 lg:py-14"
                    style={{ background: 'linear-gradient(160deg, #0A2A22 0%, #0F3D32 55%, #145244 100%)' }}
                >
                    {/* dot grid */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 opacity-[0.12]"
                        style={{
                            backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
                            backgroundSize: '24px 24px',
                        }}
                    />
                    {/* warm glow */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full opacity-30 blur-3xl"
                        style={{ background: '#FCD34D' }}
                    />
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full opacity-30 blur-3xl"
                        style={{ background: '#10B981' }}
                    />

                    {/* Logo */}
                    <div className="relative flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-300 text-[#0A2A22] shadow-lg shadow-black/20">
                            <Icon name="school" className="h-6 w-6" stroke={2} />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white" style={headingFont}>
                            School ERP
                        </span>
                    </div>

                    {/* Headline + preview */}
                    <div className="relative mt-12 lg:mt-0">
                        <h1
                            className="max-w-md text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl"
                            style={headingFont}
                            dangerouslySetInnerHTML={{ __html: dynamicText?.title || 'Modernize Your School ERP' }}
                        />
                        <p className="mt-5 max-w-md text-base leading-relaxed text-white/90 sm:text-lg">
                            {dynamicText?.subtitle ||
                                'Join hundreds of institutes upgrading their management systems. Sign up today and get 1 month free.'}
                        </p>

                        {/* Browser mock: updates as the user types */}
                        <div className="mt-10 max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl shadow-black/30">
                            <div className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-100 px-4 py-2.5">
                                <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                            </div>
                            <div className="px-5 py-5">
                                <p className="text-sm font-semibold text-slate-700">Your school's login page</p>
                                <div className="mt-2.5 flex items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3">
                                    <Icon name="lock" className="h-4 w-4 flex-none text-emerald-700" stroke={2} />
                                    <span className="truncate text-[15px] font-medium text-slate-600" aria-live="polite">
                                        https://
                                        <span className={data.domain ? 'font-bold text-emerald-800' : 'font-bold text-slate-400'}>
                                            {previewName}
                                        </span>
                                        .{ROOT_DOMAIN}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Features */}
                    <ul className="relative mt-10 space-y-3.5 lg:mt-0">
                        {features.map((f) => (
                            <li key={f} className="flex items-center gap-3 text-base font-medium text-white">
                                <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-amber-300 text-[#0A2A22]">
                                    <Icon name="check" className="h-3.5 w-3.5" stroke={3} />
                                </span>
                                {f}
                            </li>
                        ))}
                    </ul>
                </aside>

                {/* ───────── Right: form card ───────── */}
                <main className="flex items-center justify-center px-4 py-10 sm:px-8 lg:px-12">
                    <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-emerald-950/5 sm:p-10">
                        <div className="mb-8">
                            <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
                                1 month free trial
                            </span>
                            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900" style={headingFont}>
                                Create your school account
                            </h2>
                            <p className="mt-2 text-[15px] text-slate-600">Takes about two minutes. You can change everything later.</p>
                        </div>

                        <form onSubmit={submit} className="space-y-9">
                            {/* School */}
                            <section className="space-y-5">
                                <SectionTitle icon="school" title="School details" hint="Tell us about your institute." />

                                <div>
                                    <InputLabel htmlFor="school_name" value="School / Institute name" className={labelCls} />
                                    <Field icon="school">
                                        <TextInput
                                            id="school_name"
                                            name="school_name"
                                            value={data.school_name}
                                            className={inputCls}
                                            placeholder="e.g. Dhaka Public School"
                                            isFocused={true}
                                            onChange={(e) => setData('school_name', e.target.value)}
                                            required
                                        />
                                    </Field>
                                    <InputError message={errors.school_name} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="domain" value="Subdomain" className={labelCls} />
                                    <div className="relative mt-2 flex overflow-hidden rounded-xl border border-slate-300 bg-white transition focus-within:border-emerald-700 focus-within:ring-4 focus-within:ring-emerald-700/15">
                                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                                            <Icon name="globe" />
                                        </span>
                                        <TextInput
                                            id="domain"
                                            name="domain"
                                            value={data.domain}
                                            className="block w-full min-w-0 flex-1 rounded-none border-0 bg-transparent py-3 pl-11 pr-2 text-[15px] font-medium text-slate-900 placeholder:font-normal placeholder:text-slate-500 shadow-none focus:outline-none focus:ring-0"
                                            placeholder="e.g. dps"
                                            autoComplete="off"
                                            onChange={(e) => handleDomain(e.target.value)}
                                            required
                                        />
                                        <span className="inline-flex items-center border-l border-slate-200 bg-slate-100 px-4 text-sm font-semibold text-slate-700">
                                            .{ROOT_DOMAIN}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm text-slate-600">Use lowercase letters, numbers and hyphens only.</p>
                                    <InputError message={errors.domain} className="mt-2" />
                                </div>
                            </section>

                            {/* Admin */}
                            <section className="space-y-5 border-t border-slate-200 pt-9">
                                <SectionTitle icon="user" title="Admin account" hint="You'll use this to sign in and manage the school." />

                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                    <div>
                                        <InputLabel htmlFor="name" value="Full name" className={labelCls} />
                                        <Field icon="user">
                                            <TextInput
                                                id="name"
                                                name="name"
                                                value={data.name}
                                                className={inputCls}
                                                placeholder="Your full name"
                                                autoComplete="name"
                                                onChange={(e) => setData('name', e.target.value)}
                                                required
                                            />
                                        </Field>
                                        <InputError message={errors.name} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="email" value="Email address" className={labelCls} />
                                        <Field icon="mail">
                                            <TextInput
                                                id="email"
                                                type="email"
                                                name="email"
                                                value={data.email}
                                                className={inputCls}
                                                placeholder="admin@school.edu"
                                                autoComplete="username"
                                                onChange={(e) => setData('email', e.target.value)}
                                                required
                                            />
                                        </Field>
                                        <InputError message={errors.email} className="mt-2" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                    <div>
                                        <InputLabel htmlFor="password" value="Password" className={labelCls} />
                                        <Field icon="lock">
                                            <TextInput
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                value={data.password}
                                                className={`${inputCls} !pr-11`}
                                                placeholder="At least 8 characters"
                                                autoComplete="new-password"
                                                onChange={(e) => setData('password', e.target.value)}
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword((v) => !v)}
                                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                                className="absolute inset-y-0 right-0 flex items-center rounded-r-xl px-3 text-slate-500 transition hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700/40"
                                            >
                                                <EyeIcon off={showPassword} />
                                            </button>
                                        </Field>
                                        <InputError message={errors.password} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="password_confirmation" value="Confirm password" className={labelCls} />
                                        <Field icon="lock">
                                            <TextInput
                                                id="password_confirmation"
                                                type={showPassword ? 'text' : 'password'}
                                                name="password_confirmation"
                                                value={data.password_confirmation}
                                                className={inputCls}
                                                placeholder="Type it again"
                                                autoComplete="new-password"
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                                required
                                            />
                                        </Field>
                                        <InputError message={errors.password_confirmation} className="mt-2" />
                                    </div>
                                </div>
                            </section>

                            <div>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-emerald-800 px-4 py-3.5 text-base font-bold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-700/30 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {processing && (
                                        <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                                            <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                        </svg>
                                    )}
                                    {processing ? 'Creating account...' : 'Create account and start free trial'}
                                </button>

                                <p className="mt-6 text-center text-[15px] text-slate-700">
                                    Already have an account?{' '}
                                    <Link
                                        href={route('login')}
                                        className="font-bold text-emerald-800 underline underline-offset-4 transition hover:text-emerald-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700/40"
                                    >
                                        Sign in
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
        </>
    );
}