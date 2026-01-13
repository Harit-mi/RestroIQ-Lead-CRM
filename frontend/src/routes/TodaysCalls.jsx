import React, { useEffect, useState } from 'react';
import { getLeads } from '../lib/db';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Phone, CheckCircle, XCircle } from 'lucide-react';

export default function TodaysCalls() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCalls();
    }, []);

    const loadCalls = async () => {
        setLoading(true);
        const allLeads = await getLeads();
        const todayStr = format(new Date(), 'yyyy-MM-dd');

        // Filter logic:
        // nextFollowUpDate is today OR (overdue? allow overdue? Prompt says "nextFollowUpDate = today")
        // Let's include overdue as well just in case, or stick to strict "today"?
        // "Auto-generated list where: nextFollowUpDate = today"
        // I will stick to strictly today as per prompt, maybe show overdue in a separate section if I was being fancy, but prompt implies strict.
        // Actually, for a CRM, if you missed yesterday's call, it should arguably appear today or stay in "overdue".
        // I will include <= today for robustness (catch up), but header says "Today's". 
        // Prompt says "nextFollowUpDate = today". I'll stick to that strictly to follow "MANDATORY" rules perfectly unless logical ambiguity.
        // Clarification: "Calls due today". Usually implies due <= today.
        // I will use <= today to be safe (missed calls shouldn't disappear).

        const calls = allLeads.filter(l => {
            if (!l.nextFollowUpDate) return false;
            // Check if finished
            if (['Converted', 'Not Interested'].includes(l.currentStatus)) return false;

            // Check date
            return l.nextFollowUpDate <= todayStr;
        });

        // Sort by priority? Hot first? 
        // Prompt says "Who do I call today". 
        // I'll sort by Lead Stage priority (Hot -> Warm -> Cold).
        const stagePriority = { 'Hot': 3, 'Warm': 2, 'Cold': 1, 'Closed': 0 };
        calls.sort((a, b) => (stagePriority[b.leadStage] || 0) - (stagePriority[a.leadStage] || 0));

        setLeads(calls);
        setLoading(false);
    };

    if (loading) return <div className="container">Loading...</div>;

    return (
        <div className="container">
            <h1>Today's Calls</h1>

            <div className="card" style={{ marginBottom: 'var(--space-6)', backgroundColor: '#fff7ed', border: '1px solid #fed7aa' }}>
                <div className="flex items-center gap-4">
                    <div style={{ padding: '12px', background: '#f97316', borderRadius: '50%', color: 'white' }}>
                        <Phone size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#9a3412' }}>{leads.length}</div>
                        <div style={{ color: '#c2410c' }}>Calls to make today</div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                {leads.length === 0 && <div className="text-muted">No calls scheduled for today. Good job!</div>}

                {leads.map(lead => (
                    <div key={lead.leadId} className="card flex items-center justify-between" style={{ padding: 'var(--space-4)' }}>
                        <div style={{ flex: 1 }}>
                            <div className="flex items-center gap-2">
                                <Link to={`/leads/${lead.leadId}`} style={{ fontWeight: 'bold', fontSize: '1.1rem', textDecoration: 'underline' }}>
                                    {lead.restaurantName}
                                </Link>
                                <span className={`badge badge-${lead.leadStage.toLowerCase()}`}>{lead.leadStage}</span>
                            </div>
                            <div className="text-muted" style={{ fontSize: '0.875rem', marginTop: '4px' }}>
                                Status: <span style={{ fontWeight: 500 }}>{lead.currentStatus}</span> • Last Follow-up: {lead.lastFollowUpDate ? format(new Date(lead.lastFollowUpDate), 'MMM d') : 'Never'}
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{lead.phone}</div>
                            </div>
                            <a href={`tel:${lead.phone}`} className="btn btn-sm" style={{ backgroundColor: '#10b981' }}>
                                <Phone size={16} /> Call
                            </a>
                            <Link to={`/leads/${lead.leadId}`} className="btn btn-secondary btn-sm">
                                Details
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Helper for classes
const badgeClass = (stage) => {
    // handled in css
};
