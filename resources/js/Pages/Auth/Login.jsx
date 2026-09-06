import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/Components/InputError';
import Checkbox from '@/Components/Checkbox';

const ROLE_THEME = {
    admin:   { hex: '#2563EB', label: 'Admin / Branch Admin', prefix: 'ADM', bg: 'from-blue-600 to-indigo-700' },
    student: { hex: '#4F46E5', label: 'Student Portal', prefix: 'STU', bg: 'from-indigo-600 to-violet-700' },
    staff:   { hex: '#D97706', label: 'Staff Portal', prefix: 'STF', bg: 'from-amber-600 to-orange-700' },
    parent:  { hex: '#0D9488', label: 'Parent Portal', prefix: 'PAR', bg: 'from-teal-600 to-emerald-700' },
};

const BARCODE_WIDTHS = [2, 4, 1, 3, 2, 5, 1, 2, 4, 3, 1, 2, 5, 2, 3, 1, 4, 2, 1, 3, 2, 5, 1, 3, 2, 1, 4];

function RoleIcon({ role, className }) {
    const paths = {
        student: <path d="M3 9.5 12 5l9 4.5-9 4.5-9-4.5Z M7 11.5V16c0 1.4 2.4 3 5 3s5-1.6 5-3v-4.5" strokeLinejoin="round" strokeLinecap="round" />,
        staff:   <path d="M4 8.5h16a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5a1 1 0 0 1 1-1Z M9 8.5V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2.5" strokeLinejoin="round" strokeLinecap="round" />,
        parent:  <path d="M9 8.2a2.6 2.6 0 1 1-5.2 0 2.6 2.6 0 0 1 5.2 0Z M20.2 8.2a2.6 2.6 0 1 1-5.2 0 2.6 2.6 0 0 1 5.2 0Z M2.5 19c0-2.9 2.5-5 3.9-5s3.9 2.1 3.9 5 M13.7 19c0-2.9 2.5-5 3.9-5s3.9 2.1 3.9 5" strokeLinejoin="round" strokeLinecap="round" />,
        admin:   <path d="M12 3 4.5 6v5.5c0 4.4 3.2 7.8 7.5 9.5 4.3-1.7 7.5-5.1 7.5-9.5V6L12 3Z M9 12l2 2 4-4" strokeLinejoin="round" strokeLinecap="round" />,
    };
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7">
            {paths[role]}
        </svg>
    );
}

export default function Login({ status, canResetPassword, captchaQuestion }) {
    const [role, setRole] = useState('admin');
    const theme = ROLE_THEME[role];

    const { data, setData, post, processing, errors, reset } = useForm({
        login: '',
        password: '',
        remember: false,
        role: 'admin',
        captcha: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    const handleRoleChange = (selectedRole) => {
        setRole(selectedRole);
        setData('role', selectedRole);
    };

    return (
        <div
            className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50 overflow-hidden"
            style={{ '--accent': theme.hex }}
        >
            <Head title="EduERP Login">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@500;600;700&display=swap"
                    rel="stylesheet"
                />
            </Head>

            {/* Dynamic Background Glow */}
            <div
                className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[120px] opacity-20 transition-all duration-700 pointer-events-none"
                style={{ backgroundColor: 'var(--accent)' }}
            ></div>
            <div
                className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-[120px] opacity-20 transition-all duration-700 pointer-events-none"
                style={{ backgroundColor: 'var(--accent)' }}
            ></div>

            {/* Main Container */}
            <div
                className="relative z-10 flex flex-col lg:flex-row w-full max-w-5xl bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl overflow-hidden transition-all duration-500"
                style={{ fontFamily: "'Inter', sans-serif" }}
            >
                {/* Left Side: Interactive Digital ID Card Panel */}
                <div className="lg:w-[42%] bg-slate-900 text-white p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 opacity-90"></div>
                    
                    {/* Background pattern */}
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

                    {/* Top Branding */}
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 3 3 8l9 5 9-5-9-5Z" strokeLinejoin="round" />
                                    <path d="M6 10.5V16c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5.5" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <span className="text-lg font-bold tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                EduERP
                            </span>
                        </div>
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/10 backdrop-blur border border-white/10">
                            Secure Portal
                        </span>
                    </div>

                    {/* Middle: Floating ID Card Preview */}
                    <div className="relative z-10 my-8 sm:my-12 flex justify-center">
                        <div 
                            className="w-full max-w-[280px] rounded-2xl p-5 text-white shadow-2xl transition-all duration-500 transform hover:scale-[1.02] border border-white/20 relative overflow-hidden"
                            style={{ background: `linear-gradient(135deg, ${theme.hex}, #0f172a)` }}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-[10px] uppercase tracking-widest opacity-80 font-semibold">Digital ID</span>
                                <span className="text-[10px] font-mono opacity-80">2026-2027</span>
                            </div>

                            <div className="flex items-center gap-3.5 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
                                    <RoleIcon role={role} className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                        {theme.label}
                                    </h3>
                                    <p className="text-xs opacity-80 font-mono mt-0.5">ID: {theme.prefix}-9842</p>
                                </div>
                            </div>

                            <div className="flex items-end gap-[2px] h-5 opacity-75">
                                {BARCODE_WIDTHS.map((w, i) => (
                                    <div key={i} className="bg-white" style={{ width: `${w * 1.5}px`, height: '100%' }} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Tagline */}
                    <div className="relative z-10">
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Unified Campus Management
                        </h2>
                        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                            Seamlessly access your academic resources, grades, schedules, and administrative tools in one unified space.
                        </p>
                    </div>
                </div>

                {/* Right Side: Modern Login Form */}
                <div className="w-full lg:w-[58%] p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-white">
                    <div className="max-w-md w-full mx-auto">
                        <div className="mb-6 sm:mb-8">
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                Welcome back
                            </h1>
                            <p className="text-slate-500 text-sm mt-1">Please select your role and enter your credentials.</p>
                        </div>

                        {status && (
                            <div className="mb-6 p-4 text-xs sm:text-sm font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl">
                                {status}
                            </div>
                        )}

                        {/* Responsive Role Selector Buttons */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 bg-slate-100 rounded-2xl mb-6">
                            {Object.entries(ROLE_THEME).map(([r, t]) => {
                                const active = role === r;
                                return (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => handleRoleChange(r)}
                                        className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                                            active
                                                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                                                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
                                        }`}
                                    >
                                        <RoleIcon role={r} className="w-4 h-4" />
                                        <span className="capitalize">{r}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <form onSubmit={submit} className="space-y-4 sm:space-y-5">
                            {/* Identifier Input */}
                            <div>
                                <label htmlFor="login" className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                                    {role === 'student' ? 'Student ID / Email' : role === 'staff' ? 'Staff ID / Email' : 'Email Address'}
                                </label>
                                <input
                                    id="login"
                                    name="login"
                                    type="text"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)] transition-all"
                                    placeholder={role === 'student' ? 'e.g. STU-2023-001' : role === 'staff' ? 'e.g. STF-001' : 'name@school.com'}
                                    value={data.login}
                                    onChange={(e) => setData('login', e.target.value)}
                                    autoComplete="username"
                                    autoFocus
                                    required
                                />
                                <InputError message={errors.login} className="mt-1.5 text-xs" />
                            </div>

                            {/* Password Input */}
                            <div>
                                <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)] transition-all"
                                    placeholder="••••••••"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    autoComplete="current-password"
                                    required
                                />
                                <InputError message={errors.password} className="mt-1.5 text-xs" />
                            </div>

                            {captchaQuestion && <div><label className="block text-sm font-medium text-slate-700">Security check: {captchaQuestion}</label><input type="number" value={data.captcha} onChange={e=>setData('captcha',e.target.value)} className="mt-1 w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3" required/><InputError message={errors.captcha} className="mt-1.5 text-xs"/></div>}

                            {/* Options */}
                            <div className="flex items-center justify-between text-xs sm:text-sm">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <Checkbox
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                    />
                                    <span className="text-slate-600">Remember me</span>
                                </label>

                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="font-medium text-slate-600 hover:text-slate-900 transition-colors"
                                        style={{ color: 'var(--accent)' }}
                                    >
                                        Forgot password?
                                    </Link>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-3.5 px-4 rounded-xl text-white font-medium text-sm shadow-lg shadow-indigo-500/20 hover:opacity-95 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                                style={{ backgroundColor: 'var(--accent)' }}
                            >
                                {processing ? 'Signing in...' : 'Sign in to Portal'}
                            </button>
                        </form>

                        <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-slate-500">
                            Need help signing in?{' '}
                            <a href="#" className="font-medium hover:underline" style={{ color: 'var(--accent)' }}>
                                Contact IT Support
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
