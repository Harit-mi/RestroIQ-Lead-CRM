import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLead, getFollowUps, addFollowUp, deleteLead } from '../lib/db';
import { format } from 'date-fns';
import { Phone, MapPin, User, Calendar, ArrowLeft, Trash2 } from 'lucide-react';

export default function LeadDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [lead, setLead] = useState(null);
    const [followUps, setFollowUps] = useState([]);
    const [loading, setLoading] = useState(true);

    // Follow Up Form State
    const [fuStatus, setFuStatus] = useState('');
    const [fuNotes, setFuNotes] = useState('');
    const [fuNextDate, setFuNextDate] = useState('');
    const [fuStage, setFuStage] = useState('');

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        setLoading(true);
        const l = await getLead(id);
        if (!l) {
            alert("Lead not found");
            navigate('/leads');
            return;
        }
        const f = await getFollowUps(id);
        setLead(l);
        setFollowUps(f);

        // Initialize form with current values
        setFuStatus(l.currentStatus);
        setFuStage(l.leadStage);
        setFuNextDate(new Date(Date.now() + 86400000).toISOString().split('T')[0]); // Default next day
        setLoading(false);
    };

    // Drip sequence logic
    const calculateNextDate = (status) => {
        // Sequence gaps: 2, 3, 7, 9, 7, 8, 8, 8, 29 (approx 1 mo)
        // Applied when status is "Call not picked up" or "Sent details on WhatsApp"
        const gaps = [2, 3, 7, 9, 7, 8, 8, 8, 29];

        if (['Call not picked up', 'Sent details on WhatsApp'].includes(status)) {
            // Count consecutive occurrences of these statuses in history
            let count = 0;
            // followUps is sorted desc (newest first)
            for (let fu of followUps) {
                if (['Call not picked up', 'Sent details on WhatsApp'].includes(fu.status)) {
                    count++;
                } else {
                    break;
                }
            }

            const daysToAdd = gaps[count] || 30; // fallback to 30 days if sequence exceeded
            const today = new Date();
            today.setDate(today.getDate() + daysToAdd);
            return today.toISOString().split('T')[0];
        }
        return ''; // no auto-date for others
    };

    const handleStatusChange = (e) => {
        const newStatus = e.target.value;
        setFuStatus(newStatus);
        const autoDate = calculateNextDate(newStatus);
        if (autoDate) {
            setFuNextDate(autoDate);
        }
    };

    const handleAddFollowUp = async (e) => {
        e.preventDefault();
        if (!fuStatus) return;

        await addFollowUp({
            leadId: lead.leadId,
            status: fuStatus,
            notes: fuNotes,
            nextFollowUpDate: fuNextDate, // can be empty
            leadStage: fuStage
        });

        // Reset notes but keep status/stage sticky or reset? 
        // Usually notes are unique.
        setFuNotes('');
        loadData(); // Refresh to show new history and updated lead header
    };

    const handleDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete "${lead.restaurantName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await deleteLead(lead.leadId);
            navigate('/leads');
        } catch (error) {
            alert('Failed to delete lead. Please try again.');
        }
    };

    if (loading || !lead) return <div className="container">Loading...</div>;

    return (
        <div className="container">
            <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-4)' }}>
                <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm" style={{ border: 'none', paddingLeft: 0 }}>
                    <ArrowLeft size={16} /> Back
                </button>
                <button onClick={handleDelete} className="btn" style={{ backgroundColor: '#ef4444', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Trash2 size={16} /> Delete Lead
                </button>
            </div>

            {/* Header Info */}
            <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                <div className="flex justify-between items-start flex-col gap-4">
                    <div>
                        <h1 style={{ marginBottom: 'var(--space-2)' }}>{lead.restaurantName}</h1>
                        <div className="flex gap-2">
                            <span className={`badge badge-${lead.currentStatus.toLowerCase().replace(/ /g, '-')}`}>{lead.currentStatus}</span>
                            <span className={`badge badge-${lead.leadStage.toLowerCase()}`}>{lead.leadStage}</span>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', width: '100%', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
                        <div className="flex items-center gap-2 text-muted"> <User size={16} /> {lead.contactPerson || 'No Contact'} </div>
                        <div className="flex items-center gap-2 text-muted"> <Phone size={16} /> <a href={`tel:${lead.phone}`}>{lead.phone}</a> </div>
                        <div className="flex items-center gap-2 text-muted"> <MapPin size={16} /> {lead.city || 'Unknown City'} </div>
                        <div className="flex items-center gap-2 text-muted"> <Calendar size={16} /> Created: {format(new Date(lead.createdAt), 'MMM d, yyyy')} </div>
                        <div className="flex items-center gap-2 text-muted"> <Calendar size={16} /> Next Call: {lead.nextFollowUpDate ? format(new Date(lead.nextFollowUpDate), 'MMM d, yyyy') : 'None'} </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>

                {/* Add Follow Up */}
                <div>
                    <h2 style={{ fontSize: '1.25rem' }}>Log Interaction</h2>
                    <form onSubmit={handleAddFollowUp} className="card">
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="label">Result / Status</label>
                                <select className="input" value={fuStatus} onChange={handleStatusChange} required>
                                    <option value="New">New</option>
                                    <option value="Call not picked up">Call not picked up</option>
                                    <option value="Sent details on WhatsApp">Sent details on WhatsApp</option>
                                    <option value="Follow up">Follow up</option>
                                    <option value="On going">On going</option>
                                    <option value="Fake lead">Fake lead</option>
                                    <option value="Reject">Reject</option>
                                </select>
                            </div>

                            <div>
                                <label className="label">Stage</label>
                                <select className="input" value={fuStage} onChange={e => setFuStage(e.target.value)} required>
                                    <option value="Cold">Cold</option>
                                    <option value="Warm">Warm</option>
                                    <option value="Hot">Hot</option>
                                    <option value="Closed">Closed</option>
                                </select>
                            </div>

                            <div>
                                <label className="label">Notes</label>
                                <textarea className="input" rows="3" value={fuNotes} onChange={e => setFuNotes(e.target.value)} placeholder="Call summary..."></textarea>
                            </div>

                            <div>
                                <label className="label">Next Follow-up Date</label>
                                <input type="date" className="input" value={fuNextDate} onChange={e => setFuNextDate(e.target.value)} />
                            </div>

                            <button type="submit" className="btn" style={{ width: '100%' }}>Save Interaction</button>
                        </div>
                    </form>
                </div>

                {/* Timeline */}
                <div>
                    <h2 style={{ fontSize: '1.25rem' }}>History</h2>
                    <div className="flex flex-col gap-4">
                        {followUps.length === 0 && <div className="text-muted" style={{ fontStyle: 'italic' }}>No history yet.</div>}
                        {followUps.map(fu => (
                            <div key={fu.followUpId} className="card" style={{ padding: 'var(--space-4)' }}>
                                <div className="flex justify-between items-start" style={{ marginBottom: 'var(--space-2)' }}>
                                    <span style={{ fontWeight: 600 }}>{fu.status}</span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                        {format(new Date(fu.followUpDate), 'MMM d, h:mm a')}
                                    </span>
                                </div>
                                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-main)', whiteSpace: 'pre-wrap' }}>{fu.notes}</p>
                                {fu.nextFollowUpDate && (
                                    <div style={{ marginTop: 'var(--space-2)', fontSize: '0.75rem', color: 'var(--color-info)' }}>
                                        Next: {format(new Date(fu.nextFollowUpDate), 'MMM d')}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
