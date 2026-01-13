import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addLead } from '../lib/db';

export default function AddLead() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        restaurantName: '',
        contactPerson: '',
        phone: '',
        city: '',
        source: 'Manual',
        nextFollowUpDate: new Date().toISOString().split('T')[0]
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await addLead(formData);
            navigate('/leads');
        } catch (error) {
            console.error("Failed to add lead", error);
            alert("Error adding lead");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '600px' }}>
            <h1 style={{ marginBottom: 'var(--space-6)' }}>Add New Lead</h1>

            <form onSubmit={handleSubmit} className="card">
                <div className="flex flex-col gap-4">
                    <div>
                        <label className="label">Restaurant Name *</label>
                        <input required type="text" name="restaurantName" className="input" value={formData.restaurantName} onChange={handleChange} />
                    </div>

                    <div>
                        <label className="label">Contact Person</label>
                        <input type="text" name="contactPerson" className="input" value={formData.contactPerson} onChange={handleChange} />
                    </div>

                    <div className="flex gap-4">
                        <div style={{ flex: 1 }}>
                            <label className="label">Phone *</label>
                            <input required type="tel" name="phone" className="input" value={formData.phone} onChange={handleChange} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label className="label">City</label>
                            <input type="text" name="city" className="input" value={formData.city} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div style={{ flex: 1 }}>
                            <label className="label">Source</label>
                            <select name="source" className="input" value={formData.source} onChange={handleChange}>
                                <option value="Manual">Manual</option>
                                <option value="WhatsApp">WhatsApp</option>
                                <option value="Referral">Referral</option>
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label className="label">Next Follow-up Date</label>
                            <input type="date" name="nextFollowUpDate" className="input" value={formData.nextFollowUpDate} onChange={handleChange} />
                        </div>
                    </div>

                    <div style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-4)' }}>
                        <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)} style={{ flex: 1 }}>Cancel</button>
                        <button type="submit" className="btn" disabled={loading} style={{ flex: 1 }}>
                            {loading ? 'Saving...' : 'Save Lead'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
