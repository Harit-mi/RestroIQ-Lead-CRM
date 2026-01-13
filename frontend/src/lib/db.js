const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function handleResponse(response) {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
}

// Get all leads
export async function getLeads() {
    try {
        const response = await fetch(`${API_BASE_URL}/leads`);
        return await handleResponse(response);
    } catch (error) {
        console.error('Error fetching leads:', error);
        return [];
    }
}

// Get a single lead by ID
export async function getLead(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/leads/${id}`);
        return await handleResponse(response);
    } catch (error) {
        console.error('Error fetching lead:', error);
        return null;
    }
}

// Add a new lead
export async function addLead(leadData) {
    const response = await fetch(`${API_BASE_URL}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData)
    });
    return await handleResponse(response);
}

// Update an existing lead
export async function updateLead(lead) {
    const response = await fetch(`${API_BASE_URL}/leads/${lead.leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead)
    });
    return await handleResponse(response);
}

// Delete a lead
export async function deleteLead(leadId) {
    const response = await fetch(`${API_BASE_URL}/leads/${leadId}`, {
        method: 'DELETE'
    });
    return await handleResponse(response);
}

// Get all follow-ups for a specific lead
export async function getFollowUps(leadId) {
    try {
        const response = await fetch(`${API_BASE_URL}/follow-ups/lead/${leadId}`);
        return await handleResponse(response);
    } catch (error) {
        console.error('Error fetching follow-ups:', error);
        return [];
    }
}

// Add a follow-up and update the lead
export async function addFollowUp(followUpData) {
    const response = await fetch(`${API_BASE_URL}/follow-ups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(followUpData)
    });
    return await handleResponse(response);
}

// Get dashboard statistics
export async function getDashboardStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard/stats`);
        return await handleResponse(response);
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return {
            totalLeads: 0,
            callsDueToday: 0,
            cold: 0,
            warm: 0,
            hot: 0,
            converted: 0
        };
    }
}
