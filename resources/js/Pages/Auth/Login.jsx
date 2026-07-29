import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/Components/InputError';
import Checkbox from '@/Components/Checkbox';

const ROLE_THEME = {
    student: { hex: '#3B5BA5', label: 'Student Access', prefix: 'STU' },
    staff:   { hex: '#9C7A1D', label: 'Staff Access',   prefix: 'STF' },
    parent:  { hex: '#3F7D68', label: 'Parent Access',  prefix: 'PAR' },
};

const BARCODE_WIDTHS = [2, 4, 1, 3, 2, 5, 1, 2, 4, 3, 1, 2, 5, 2, 3, 1, 4, 2, 1, 3, 2, 5, 1, 3, 2, 1, 4];

function RoleIcon({ role, className }) {
    const paths = {
        student: <path d="M3 9.5 12 5l9 4.5-9 4.5-9-4.5Z M7 11.5V16c0 1.4 2.4 3 5 3s5-1.6 5-3v-4.5" strokeLinejoin="round" strokeLinecap="round" />,
        staff:   <path d="M4 8.5h16a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5a1 1 0 0 1 1-1Z M9 8.5V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2.5" strokeLinejoin="round" strokeLinecap="round" />,
        parent:  <path d="M9 8.2a2.6 2.6 0 1 1-5.2 0 2.6 2.6 0 0 1 5.2 0Z M20.2 8.2a2.6 2.6 0 1 1-5.2 0 2.6 2.6 0 0 1 5.2 0Z M2.5 19c0-2.9 2.5-5 3.9-5s3.9 2.1 3.9 5 M13.7 19c0-2.9 2.5-5 3.9-5s3.9 2.1 3.9 5" strokeLinejoin="round" strokeLinecap="round" />,
    };
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6">
            {paths[role]}
        </svg>
    );
}

export default function Login({ status, canResetPassword }) {
    const [role, setRole] = useState('student');
    const theme = ROLE_THEME[role];

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
        role: 'student',
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
            className="relative min-h-screen flex items-center justify-center p-3 sm:p-4 md:p-8 overflow-hidden bg-[#F1F0EC]"
            style={{ '--accent': theme.hex }}
        >
            <Head title="EduERP Login">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=IBM+Plex+Mono:wght@500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap"
                    rel="stylesheet"
                />
            </Head>

            {/* Ambient accent glow — breathes with the selected role */}
            <div
                className="pointer-events-none absolute -top-28 -left-28 w-[440px] h-[440px] rounded-full blur-[110px] opacity-[0.16] transition-colors duration-700"
                style={{ backgroundColor: 'var(--accent)' }}
            ></div>
            <div
                className="pointer-events-none absolute -bottom-32 -right-20 w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.14] transition-colors duration-700"
                style={{ backgroundColor: 'var(--accent)' }}
            ></div>

            {/* Ruled paper lines */}
            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    backgroundImage:
                        'repeating-linear-gradient(rgba(22,35,61,0.035) 0, rgba(22,35,61,0.035) 1px, transparent 1px, transparent 27px)',
                }}
            ></div>

            {/* Ledger margin rule */}
            <div
                className="pointer-events-none absolute top-0 bottom-0 left-[10%] w-px transition-colors duration-700 hidden md:block"
                style={{ backgroundColor: 'var(--accent)', opacity: 0.16 }}
            ></div>

            {/* Vignette to focus the card */}
            <div
                className="pointer-events-none absolute inset-0"
                style={{ background: 'radial-gradient(ellipse at center, transparent 45%, rgba(22,35,61,0.08) 100%)' }}
            ></div>

            <style>{`
                @keyframes lanyardSway { 0%, 100% { transform: rotate(-1.1deg); } 50% { transform: rotate(1.1deg); } }
                @keyframes scanSweep {
                    0%   { transform: translateY(-130%); opacity: 0; }
                    10%  { opacity: .9; }
                    88%  { opacity: .9; }
                    100% { transform: translateY(230%); opacity: 0; }
                }
                .lanyard-sway { animation: lanyardSway 6.5s ease-in-out infinite; transform-origin: top center; }
                .scan-line { animation: scanSweep 1.2s ease-out; }
                @media (prefers-reduced-motion: reduce) {
                    .lanyard-sway { animation: none; }
                    .scan-line { animation: none; opacity: 0; }
                }
            `}</style>

            <div
                className="relative z-10 flex w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden"
                style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
            >
                {/* Left Side - Access Card panel (hidden on mobile) */}
                <div className="hidden lg:flex lg:w-[44%] bg-gradient-to-br from-[#16233D] to-[#0E1728] p-10 flex-col justify-between relative overflow-hidden">
                    {/* blueprint grid texture */}
                    <div
                        className="absolute inset-0 opacity-[0.05]"
                        style={{
                            backgroundImage:
                                'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
                            backgroundSize: '26px 26px',
                        }}
                    ></div>
                    <div className="absolute top-[-15%] left-[-15%] w-72 h-72 bg-white/[0.04] rounded-full blur-3xl"></div>
                    <div className="absolute bottom-[-15%] right-[-10%] w-80 h-80 bg-[var(--accent)]/10 rounded-full blur-3xl transition-colors duration-500"></div>

                    {/* Brand */}
                    <div className="relative z-10 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="1.6">
                                <path d="M12 3 3 8l9 5 9-5-9-5Z" strokeLinejoin="round" />
                                <path d="M6 10.5V16c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5.5" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span className="text-white text-xl tracking-wide" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>
                            EduERP
                        </span>
                    </div>

                    {/* Headline */}
                    <div className="relative z-10 mt-8">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-white/40 mb-3">Unified Campus Access</p>
                        <h1 className="text-white text-[28px] leading-[1.25] mb-3" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>
                            One login. Three roles.<br />Every record in view.
                        </h1>
                        <p className="text-slate-300/70 text-[13.5px] max-w-xs leading-relaxed">
                            Students, teaching staff, and parents each carry an access
                            card sized to what they need to do today.
                        </p>
                    </div>

                    {/* Signature: Lanyard Access Card */}
                    <div className="relative z-10 flex-1 flex items-center justify-center py-10">
                        <div className="lanyard-sway relative w-full max-w-[320px]">

                            {/* Lanyard strap + clip */}
                            <div className="absolute -top-11 left-1/2 -translate-x-1/2 flex flex-col items-center">
                                <div
                                    className="w-3 h-9 rounded-full"
                                    style={{ background: `repeating-linear-gradient(45deg, ${theme.hex} 0 6px, rgba(255,255,255,0.3) 6px 12px)` }}
                                ></div>
                                <div className="w-4 h-4 rounded-full border-2 border-white/60 -mt-1 bg-[#0E1728]"></div>
                            </div>

                            {/* Card outer (holds hole + seal, not clipped) */}
                            <div
                                className="relative rounded-2xl transition-transform duration-500 [transform:perspective(1000px)_rotateX(7deg)_rotateY(-8deg)] hover:[transform:perspective(1000px)_rotateX(1deg)_rotateY(-1deg)]"
                                style={{ boxShadow: `0 24px 44px -14px ${theme.hex}77` }}
                            >
                                {/* punch hole */}
                                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#0E1728] border border-white/40 z-20"></div>

                                {/* Clipped surface */}
                                <div
                                    className="relative rounded-2xl overflow-hidden p-6"
                                    style={{ background: `linear-gradient(135deg, ${theme.hex}, ${theme.hex}CC)` }}
                                >
                                    <div key={role} className="scan-line absolute inset-x-0 h-2/5 bg-gradient-to-b from-transparent via-white/35 to-transparent pointer-events-none"></div>

                                    <div className="flex items-center justify-between mb-6">
                                        <span className="text-white/70 text-[10px] uppercase tracking-[0.18em]">Access Card</span>
                                        <span className="text-white/70 text-[10px] uppercase tracking-[0.18em]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                                            2026–27
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-14 h-14 rounded-full bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
                                            <RoleIcon role={role} className="w-7 h-7 text-white/85" />
                                        </div>
                                        <div>
                                            <p className="text-white text-lg leading-tight" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>
                                                {theme.label}
                                            </p>
                                            <p className="text-white/60 text-[12px] tracking-wide mt-0.5" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                                                NO. {theme.prefix}-00147
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-end gap-[3px] h-6 opacity-80">
                                        {BARCODE_WIDTHS.map((w, i) => (
                                            <div key={i} className="bg-white/85" style={{ width: `${w * 2}px`, height: '100%' }} />
                                        ))}
                                    </div>
                                </div>

                                {/* Seal stamp — curved text */}
                                <div className="absolute -bottom-6 -right-6 w-20 h-20 rotate-[-10deg] z-20">
                                    <svg viewBox="0 0 100 100" className="w-full h-full">
                                        <defs>
                                            <path id="sealCircle" d="M 50,50 m -34,0 a 34,34 0 1,1 68,0 a 34,34 0 1,1 -68,0" />
                                        </defs>
                                        <circle cx="50" cy="50" r="34" fill="rgba(14,23,40,0.55)" stroke="rgba(255,255,255,0.45)" strokeWidth="1" strokeDasharray="2 3" />
                                        <text fill="rgba(255,255,255,0.8)" fontSize="6.2" letterSpacing="1.5" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                                            <textPath href="#sealCircle" startOffset="2%">
                                                VERIFIED ACCESS • VERIFIED ACCESS •
                                            </textPath>
                                        </text>
                                        <path d="M40 51 L47 58 L61 42" fill="none" stroke="white" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quote */}
                    <div className="relative z-10">
                        <div className="bg-white/[0.06] backdrop-blur-lg border border-white/10 p-5 rounded-xl">
                            <p className="text-white/85 text-sm italic leading-relaxed">
                                "Education is the passport to the future, for tomorrow belongs to those who prepare for it today."
                            </p>
                            <div className="mt-3 flex items-center gap-3">
                                <div className="w-8 h-8 bg-[var(--accent)] rounded-full transition-colors duration-500"></div>
                                <div>
                                    <h4 className="text-white text-[13px] font-medium">Principal's Desk</h4>
                                    <p className="text-slate-400 text-[11px]">Message from Authority</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="w-full lg:w-[56%] p-6 sm:p-10 lg:p-14 flex flex-col justify-center">
                    <div className="max-w-md w-full mx-auto">

                        {/* Mobile brand header */}
                        <div className="flex lg:hidden items-center gap-2.5 mb-6 sm:mb-8">
                            <div className="w-8 h-8 rounded-lg bg-[#16233D] flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="1.8">
                                    <path d="M12 3 3 8l9 5 9-5-9-5Z" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <span className="text-[#16233D] text-lg" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>EduERP</span>
                        </div>

                        <div className="text-left mb-5 sm:mb-7">
                            <h2 className="text-[22px] sm:text-[26px] text-[#16233D]" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>
                                Welcome back
                            </h2>
                            <p className="text-gray-500 mt-1.5 text-[13.5px] sm:text-[14px]">Sign in with the access card that fits your role.</p>
                        </div>

                        {status && (
                            <div className="mb-5 p-3.5 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg">
                                {status}
                            </div>
                        )}

                        {/* Role Selector — registry tabs (equal-width so 3 tabs always fit, never clip) */}
                        <div className="flex gap-1 border-b border-gray-200 mb-5 sm:mb-7">
                            {Object.entries(ROLE_THEME).map(([r, t]) => {
                                const active = role === r;
                                return (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => handleRoleChange(r)}
                                        className={`relative flex flex-1 min-w-0 items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-4 pt-2.5 pb-2.5 text-[12.5px] sm:text-sm font-medium rounded-t-lg border transition-colors ${
                                            active
                                                ? 'bg-white border-gray-200 border-b-white -mb-px text-[#16233D]'
                                                : 'bg-transparent border-transparent text-gray-400 hover:text-gray-600'
                                        }`}
                                    >
                                        <RoleIcon role={r} className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                                        <span className="capitalize truncate" style={{ color: active ? t.hex : undefined }}>{r}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <form onSubmit={submit} className="space-y-4 sm:space-y-5">
                            {/* Identifier Input */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                                    {role === 'student' ? 'Student ID / Email' : 'Email Address'}
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                        </svg>
                                    </div>
                                    <input
                                        id="email"
                                        type="text"
                                        className="block w-full pl-10 pr-3 py-2.5 sm:py-3 border border-gray-300 rounded-xl text-gray-900 outline-none focus:ring-2 focus:ring-[var(--accent)]/40 focus:border-[var(--accent)] transition-colors sm:text-sm"
                                        placeholder={role === 'student' ? 'e.g. STU-2023-001' : 'admin@school.com'}
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        autoComplete="username"
                                    />
                                </div>
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            {/* Password Input */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <input
                                        id="password"
                                        type="password"
                                        className="block w-full pl-10 pr-3 py-2.5 sm:py-3 border border-gray-300 rounded-xl text-gray-900 outline-none focus:ring-2 focus:ring-[var(--accent)]/40 focus:border-[var(--accent)] transition-colors sm:text-sm"
                                        placeholder="••••••••"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        autoComplete="current-password"
                                    />
                                </div>
                                <InputError message={errors.password} className="mt-2" />
                            </div>

                            {/* Options */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center">
                                    <Checkbox
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                    />
                                    <span className="ml-2 text-sm text-gray-600">Remember me</span>
                                </label>

                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="text-sm font-medium hover:opacity-80 transition-opacity"
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
                                className="w-full flex justify-center py-3 sm:py-3.5 px-4 rounded-xl text-sm font-medium text-white transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                                style={{ backgroundColor: 'var(--accent)' }}
                            >
                                {processing ? 'Signing in…' : 'Sign in to Dashboard'}
                            </button>
                        </form>

                        <p className="mt-6 sm:mt-8 text-center text-sm text-gray-500">
                            Having trouble logging in? <br className="sm:hidden" />
                            <a href="#" className="font-medium hover:opacity-80" style={{ color: 'var(--accent)' }}>Contact IT Support</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}