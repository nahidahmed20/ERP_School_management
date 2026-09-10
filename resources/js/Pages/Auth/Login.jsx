import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/Components/InputError';
import Checkbox from '@/Components/Checkbox';

// Role accent colors stay inside the Unibox forest + gold family instead of
// jumping to generic SaaS blues/purples — each role is a tonal variation,
// not a different brand.
const ROLE_THEME = {
    admin:   { hex: '#1F5D42', label: 'Admin / Branch Admin', short: 'Admin Portal',   prefix: 'ADM' },
    student: { hex: '#3E7C59', label: 'Student Portal',       short: 'Student Portal', prefix: 'STU' },
    staff:   { hex: '#A9762F', label: 'Staff Portal',         short: 'Staff Portal',   prefix: 'STF' },
    parent:  { hex: '#0F6657', label: 'Parent Portal',        short: 'Parent Portal',  prefix: 'PAR' },
};

const BARCODE_WIDTHS = [2, 4, 1, 3, 2, 5, 1, 2, 4, 3, 1, 2, 5, 2, 3, 1, 4, 2, 1, 3, 2, 5, 1, 3, 2, 1, 4];

// Appends an alpha suffix to a 6-digit hex color, e.g. withAlpha('#1F5D42', '55')
function withAlpha(hex, alpha) {
    return `${hex}${alpha}`;
}

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

function EyeIcon({ open, className }) {
    return open ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" strokeLinejoin="round" strokeLinecap="round" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M3 3l18 18" strokeLinecap="round" />
            <path d="M10.6 5.6A10.6 10.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a15.5 15.5 0 0 1-3.4 4.2M6.6 6.9C4 8.6 2.5 12 2.5 12S6 18.5 12 18.5c1.2 0 2.3-.2 3.3-.6M9.9 9.9a3 3 0 0 0 4.2 4.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function SpinnerIcon({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={`${className} animate-spin motion-reduce:animate-none`} fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
            <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
    );
}

export default function Login({ status, canResetPassword, captchaQuestion }) {
    const [role, setRole] = useState('admin');
    const [showPassword, setShowPassword] = useState(false);
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
            className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#F7F5EF] overflow-hidden"
            style={{ '--accent': theme.hex }}
        >
            <Head title="Unibox — Sign in">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </Head>

            {/* Single, understated glow behind the ID card — not scattered decoration */}
            <div
                className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full blur-[140px] opacity-[0.15] transition-colors duration-700 pointer-events-none"
                style={{ backgroundColor: 'var(--accent)' }}
            ></div>

            {/* Main Container */}
            <div
                className="relative z-10 flex flex-col lg:flex-row w-full max-w-5xl bg-white/90 backdrop-blur-xl border border-black/5 rounded-3xl shadow-2xl shadow-black/10 overflow-hidden"
                style={{ fontFamily: "'Inter', sans-serif" }}
            >
                {/* Left Side: Brand + Digital ID preview */}
                <div className="lg:w-[42%] text-white p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #14301F 0%, #0A1F15 100%)' }}>
                    {/* Subtle campus-map dot texture, not a generic slate grid */}
                    <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(#C7A252_1px,transparent_1px)] [background-size:18px_18px] pointer-events-none"></div>

                    {/* Top Branding */}
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 3 3 8l9 5 9-5-9-5Z" strokeLinejoin="round" />
                                    <path d="M6 10.5V16c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5.5" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <span className="text-lg font-semibold tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>
                                Unibox
                            </span>
                        </div>
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/10 border border-white/10 text-white/80">
                            Secure sign-in
                        </span>
                    </div>

                    {/* Middle: Digital ID Card Preview */}
                    <div className="relative z-10 my-8 sm:my-12 flex justify-center">
                        <div
                            key={role}
                            className="w-full max-w-[280px] rounded-2xl p-5 text-white shadow-2xl border border-white/15 relative overflow-hidden animate-[card-in_0.4s_ease-out] motion-reduce:animate-none"
                            style={{ background: `linear-gradient(135deg, ${theme.hex}, #0A1F15)` }}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-[11px] text-white/70 font-medium">Digital ID</span>
                                <span className="text-[10px] font-mono text-white/70">2026–2027</span>
                            </div>

                            <div className="flex items-center gap-3.5 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0 border border-white/20">
                                    <RoleIcon role={role} className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-base leading-tight" style={{ fontFamily: "'Fraunces', serif" }}>
                                        {theme.label}
                                    </h3>
                                    <p className="text-xs text-white/70 font-mono mt-0.5">ID: {theme.prefix}-9842</p>
                                </div>
                            </div>

                            <div className="flex items-end gap-[2px] h-5 opacity-70">
                                {BARCODE_WIDTHS.map((w, i) => (
                                    <div key={i} className="bg-white" style={{ width: `${w * 1.5}px`, height: '100%' }} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Tagline */}
                    <div className="relative z-10">
                        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight mb-2" style={{ fontFamily: "'Fraunces', serif" }}>
                            Unified campus management
                        </h2>
                        <p className="text-[#B8CBBE] text-xs sm:text-sm leading-relaxed">
                            Access academic records, grades, schedules and administrative tools from one place.
                        </p>
                    </div>
                </div>

                {/* Right Side: Login Form */}
                <div className="w-full lg:w-[58%] p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-white">
                    <div className="max-w-md w-full mx-auto">
                        <div className="mb-6 sm:mb-8">
                            <h1 className="text-2xl sm:text-3xl font-semibold text-[#16241D] tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>
                                Welcome back
                            </h1>
                            <p className="text-[#6B7568] text-sm mt-1">Select your portal and enter your credentials.</p>
                        </div>

                        {status && (
                            <div role="status" aria-live="polite" className="mb-6 p-4 text-xs sm:text-sm font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl">
                                {status}
                            </div>
                        )}

                        {/* Role Selector */}
                        <div role="radiogroup" aria-label="Select portal" className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 bg-[#F1EEE5] rounded-2xl mb-6">
                            {Object.entries(ROLE_THEME).map(([r, t]) => {
                                const active = role === r;
                                return (
                                    <button
                                        key={r}
                                        type="button"
                                        role="radio"
                                        aria-checked={active}
                                        onClick={() => handleRoleChange(r)}
                                        className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-medium transition-colors duration-150 ${
                                            active
                                                ? 'bg-white text-[#16241D] shadow-sm font-semibold'
                                                : 'text-[#6B7568] hover:text-[#16241D] hover:bg-white/60'
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
                                <label htmlFor="login" className="block text-xs sm:text-sm font-medium text-[#3C443E] mb-1.5">
                                    {role === 'student' ? 'Student ID / Email' : role === 'staff' ? 'Staff ID / Email' : 'Email address'}
                                </label>
                                <input
                                    id="login"
                                    name="login"
                                    type="text"
                                    className="w-full px-4 py-3 bg-[#FAF9F5] border border-[#E4E0D4] rounded-xl text-[#16241D] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)] transition-all"
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
                                <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-[#3C443E] mb-1.5">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        className="w-full px-4 py-3 pr-11 bg-[#FAF9F5] border border-[#E4E0D4] rounded-xl text-[#16241D] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)] transition-all"
                                        placeholder="••••••••"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        autoComplete="current-password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        aria-pressed={showPassword}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A9186] hover:text-[#16241D] transition-colors"
                                    >
                                        <EyeIcon open={showPassword} className="w-4.5 h-4.5" />
                                    </button>
                                </div>
                                <InputError message={errors.password} className="mt-1.5 text-xs" />
                            </div>

                            {captchaQuestion && (
                                <div>
                                    <label htmlFor="captcha" className="block text-xs sm:text-sm font-medium text-[#3C443E] mb-1.5">
                                        Security check: {captchaQuestion}
                                    </label>
                                    <input
                                        id="captcha"
                                        name="captcha"
                                        type="number"
                                        inputMode="numeric"
                                        autoComplete="off"
                                        value={data.captcha}
                                        onChange={(e) => setData('captcha', e.target.value)}
                                        className="w-full px-4 py-3 bg-[#FAF9F5] border border-[#E4E0D4] rounded-xl text-[#16241D] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)] transition-all"
                                        required
                                    />
                                    <InputError message={errors.captcha} className="mt-1.5 text-xs" />
                                </div>
                            )}

                            {/* Options */}
                            <div className="flex items-center justify-between text-xs sm:text-sm">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <Checkbox
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                    />
                                    <span className="text-[#6B7568]">Remember me</span>
                                </label>

                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="font-medium hover:opacity-80 transition-opacity"
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
                                className="w-full py-3.5 px-4 rounded-xl text-white font-medium text-sm transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                style={{ backgroundColor: 'var(--accent)', boxShadow: `0 10px 25px -8px ${withAlpha(theme.hex, '80')}` }}
                            >
                                {processing && <SpinnerIcon className="w-4 h-4" />}
                                {processing ? 'Signing in…' : `Sign in to ${theme.short}`}
                            </button>
                        </form>

                        <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-[#6B7568]">
                            Need help signing in?{' '}
                            <a href="#" className="font-medium hover:underline" style={{ color: 'var(--accent)' }}>
                                Contact IT support
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes card-in {
                    from { opacity: 0; transform: translateY(6px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
}
