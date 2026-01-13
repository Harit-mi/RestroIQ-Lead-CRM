import React, { useEffect, useState } from 'react';
import { getDashboardStats } from '../lib/db';
import { Users, Phone, Flame, CheckCircle } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="card">
        <div className="flex items-center justify-between">
            <div>
                <div className="label" style={{ color: 'var(--color-text-muted)' }}>{title}</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-text-main)' }}>{value}</div>
            </div>
            <div style={{ padding: '12px', borderRadius: '50%', backgroundColor: color + '20', color: color }}>
                <Icon size={24} />
            </div>
        </div>
    </div>
);

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalLeads: 0,
        callsDueToday: 0,
        cold: 0,
        warm: 0,
        hot: 0,
        converted: 0
    });

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        const data = await getDashboardStats();
        setStats(data);
    };

    return (
        <div className="container">
            <h1>Dashboard</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
                <StatCard title="Calls Due Today" value={stats.callsDueToday} icon={Phone} color="#ef4444" />
                <StatCard title="Total Leads" value={stats.totalLeads} icon={Users} color="#3b82f6" />
                <StatCard title="Converted" value={stats.converted} icon={CheckCircle} color="#10b981" />
            </div>

            <h2>Pipeline Status</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-6)' }}>
                <StatCard title="Cold Leads" value={stats.cold} icon={Flame} color="#94a3b8" />
                <StatCard title="Warm Leads" value={stats.warm} icon={Flame} color="#f59e0b" />
                <StatCard title="Hot Leads" value={stats.hot} icon={Flame} color="#b91c1c" />
            </div>
        </div>
    );
}
