import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Activity, Users, DollarSign } from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

export default function AnalyticsIndex({ auth, stats, financialChart, genderDistribution }) {
    const financialData = {
        labels: financialChart.labels,
        datasets: [
            {
                label: 'Revenue',
                data: financialChart.revenue,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                tension: 0.3
            },
            {
                label: 'Expenses',
                data: financialChart.expenses,
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                tension: 0.3
            }
        ],
    };

    const genderData = {
        labels: genderDistribution.map(g => g.gender === 'male' ? 'Male' : (g.gender === 'female' ? 'Female' : 'Other')),
        datasets: [
            {
                data: genderDistribution.map(g => g.count),
                backgroundColor: [
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                ],
                borderWidth: 1,
            },
        ],
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Analytics Dashboard</h2>}>
            <Head title="Analytics" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-gray-500">Total Students</CardTitle>
                                <Users className="h-4 w-4 text-gray-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.total_students}</div>
                                <p className="text-xs text-gray-500">+ {stats.new_admissions} new this month</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-gray-500">Avg Monthly Revenue</CardTitle>
                                <DollarSign className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {(financialChart.revenue.reduce((a, b) => a + Number(b), 0) / (financialChart.revenue.length || 1)).toFixed(2)}
                                </div>
                                <p className="text-xs text-gray-500">Last 6 months average</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-gray-500">Avg Monthly Expenses</CardTitle>
                                <Activity className="h-4 w-4 text-red-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {(financialChart.expenses.reduce((a, b) => a + Number(b), 0) / (financialChart.expenses.length || 1)).toFixed(2)}
                                </div>
                                <p className="text-xs text-gray-500">Last 6 months average</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Financial Chart */}
                        <Card className="col-span-2">
                            <CardHeader>
                                <CardTitle>Financial Overview (6 Months)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <Line data={financialData} options={{ maintainAspectRatio: false }} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Gender Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Gender Distribution</CardTitle>
                            </CardHeader>
                            <CardContent className="flex justify-center items-center h-[300px]">
                                <div className="w-full h-full pb-4">
                                    <Doughnut data={genderData} options={{ maintainAspectRatio: false }} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}

