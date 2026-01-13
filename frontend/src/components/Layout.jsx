import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, Phone, PlusCircle } from 'lucide-react';

const Sidebar = () => {
    return (
        <div className="sidebar">
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-primary)' }}>RestroIQ</h2>
            </div>
            <nav style={{ padding: '1rem 0' }}>
                <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </NavLink>
                <NavLink to="/today" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <Phone size={20} />
                    <span>Today's Calls</span>
                </NavLink>
                <NavLink to="/leads" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <Users size={20} />
                    <span>Leads</span>
                </NavLink>
                <div style={{ margin: '1rem', borderTop: '1px solid var(--color-border)' }}></div>
                <NavLink to="/leads/new" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <PlusCircle size={20} />
                    <span>Add Lead</span>
                </NavLink>
            </nav>
        </div>
    );
};

export default function Layout() {
    return (
        <div>
            <Sidebar />
            <div className="main-content">
                <Outlet />
            </div>
        </div>
    );
}
