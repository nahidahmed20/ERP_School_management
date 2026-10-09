import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Fingerprint, MonitorSmartphone, Wifi, WifiOff, Users } from 'lucide-react';

export default function DeviceHealthIndex({ auth, stats, recentSyncs, recentTrustedDevices }) {
    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Device & Biometric Health Dashboard</h2>}>
            <Head title="Device Health" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* Stats Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-gray-500">Total Biometric Devices</CardTitle>
                                <Fingerprint className="h-4 w-4 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.total_biometric_devices}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-gray-500">Online Devices</CardTitle>
                                <Wifi className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">{stats.online_devices}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-gray-500">Offline Devices</CardTitle>
                                <WifiOff className="h-4 w-4 text-red-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">{stats.offline_devices}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-gray-500">Enrolled Users</CardTitle>
                                <Users className="h-4 w-4 text-purple-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.total_enrolled_users}</div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Recent Biometric Syncs */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Biometric Punches (Last 24h)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {recentSyncs.length > 0 ? (
                                    <div className="space-y-4">
                                        {recentSyncs.map((sync) => (
                                            <div key={sync.id} className="flex items-center justify-between border-b pb-2">
                                                <div>
                                                    <p className="text-sm font-medium">{sync.enrolled_user?.user_name || 'Unknown User'}</p>
                                                    <p className="text-xs text-gray-500">{sync.device?.name} - {sync.punch_state}</p>
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    {new Date(sync.punch_time).toLocaleString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">No recent punches found.</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Trusted Devices */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Recent Trusted Logins</CardTitle>
                                <MonitorSmartphone className="h-5 w-5 text-gray-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="mb-4">
                                    <span className="text-sm text-gray-500">Total Trusted Devices: </span>
                                    <span className="font-bold">{stats.total_trusted_devices}</span>
                                </div>
                                {recentTrustedDevices.length > 0 ? (
                                    <div className="space-y-4">
                                        {recentTrustedDevices.map((device) => (
                                            <div key={device.id} className="flex items-center justify-between border-b pb-2">
                                                <div>
                                                    <p className="text-sm font-medium">{device.device_name}</p>
                                                    <p className="text-xs text-gray-500">{device.user?.name || 'Unknown'} - {device.last_ip_address}</p>
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    {new Date(device.last_used_at).toLocaleString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">No trusted devices found.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}

