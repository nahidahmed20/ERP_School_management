import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/Components/InputError';
import Checkbox from '@/Components/Checkbox';

export default function Login({ status, canResetPassword }) {
    // Role selection state (Admin/Teacher, Student, Parent)
    const [role, setRole] = useState('student');

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
        role: 'student', // sending role to backend if needed
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 sm:p-8 font-sans">
            <Head title="ERP Login" />

            <div className="flex w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden">

                {/* Left Side - Brand & Graphics (Hidden on Mobile) */}
                <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-blue-700 to-indigo-900 p-12 flex-col justify-between relative overflow-hidden">
                    {/* Decorative Background Circles */}
                    <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-blue-400/20 rounded-full blur-3xl"></div>

                    <div className="relative z-10">
                        {/* Brand Logo & Name */}
                            <div className="flex items-center gap-3 mb-10">
                                {/* Custom SVG School ERP Logo */}
                                <div className="w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center p-1.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-full h-full">
                                        {/* Background Circle */}
                                        <circle cx="50" cy="50" r="45" fill="#4F46E5" />

                                        {/* Open Book */}
                                        <path d="M25 65 L50 75 L75 65 L75 40 L50 50 L25 40 Z" fill="#E0E7FF" />
                                        <path d="M50 75 L50 50" stroke="#4F46E5" strokeWidth="2" />

                                        {/* Graduation Cap */}
                                        <path d="M20 35 L50 18 L80 35 L50 52 Z" fill="#ffffff" />
                                        <path d="M80 35 L80 50" stroke="#ffffff" strokeWidth="2" />
                                        <circle cx="80" cy="53" r="3" fill="#ffffff" />
                                    </svg>
                                </div>
                                <span className="text-white text-3xl font-extrabold tracking-wider">EduERP</span>
                            </div>
                        <h1 className="text-4xl text-white font-extrabold leading-tight mb-6">
                            Smart School <br /> Management System
                        </h1>
                        <p className="text-blue-100 text-lg max-w-md">
                            Empowering students, teachers, and parents with seamless access to education and administration.
                        </p>
                    </div>

                    <div className="relative z-10">
                        <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl">
                            <p className="text-white italic">
                                "Education is the passport to the future, for tomorrow belongs to those who prepare for it today."
                            </p>
                            <div className="mt-4 flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-300 rounded-full border-2 border-white"></div>
                                <div>
                                    <h4 className="text-white font-semibold text-sm">Principal's Desk</h4>
                                    <p className="text-blue-200 text-xs">Message from Authority</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="w-full lg:w-1/2 p-8 sm:p-16 flex flex-col justify-center">

                    <div className="max-w-md w-full mx-auto">
                        <div className="text-center lg:text-left mb-8">
                            <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
                            <p className="text-gray-500 mt-2">Please enter your details to sign in.</p>
                        </div>

                        {status && (
                            <div className="mb-4 p-4 text-sm text-green-700 bg-green-100 rounded-lg">
                                {status}
                            </div>
                        )}

                        {/* Role Selector */}
                        <div className="flex bg-gray-100 p-1 rounded-xl mb-8">
                            {['student', 'staff', 'parent'].map((r) => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => handleRoleChange(r)}
                                    className={`flex-1 capitalize py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                                        role === r
                                            ? 'bg-white text-indigo-600 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>

                        <form onSubmit={submit} className="space-y-6">
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
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-colors sm:text-sm"
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
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-colors sm:text-sm"
                                        placeholder="••••••••"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        autoComplete="current-password"
                                    />
                                </div>
                                <InputError message={errors.password} className="mt-2" />
                            </div>

                            {/* Options: Remember Me & Forgot Password */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center">
                                    <Checkbox
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="text-indigo-600 focus:ring-indigo-500 rounded"
                                    />
                                    <span className="ml-2 text-sm text-gray-600">Remember me</span>
                                </label>

                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                                    >
                                        Forgot password?
                                    </Link>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {processing ? 'Signing in...' : 'Sign in to Dashboard'}
                            </button>
                        </form>

                        {/* Help Text */}
                        <p className="mt-8 text-center text-sm text-gray-500">
                            Having trouble logging in? <br className="sm:hidden" />
                            <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">Contact IT Support</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
