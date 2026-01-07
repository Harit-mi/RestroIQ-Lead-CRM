import { openDB } from 'idb';
import { v4 as uuidv4 } from 'uuid';

const DB_NAME = 'RestroIQ-DB';
const DB_VERSION = 2; // Incremented for schema updates

const VALID_STATUSES = [
    'New', 'Call not picked up', 'Sent details on WhatsApp',
    'Follow up', 'On going', 'Fake lead', 'Reject', 'Converted', 'Not Interested',
    'Interested', 'Demo Scheduled', 'Pending' // Legacy support if needed, but strict list requested
];

// Helper to validate data integrity & security
function validateLead(data) {
    if (!data.restaurantName) throw new Error("Restaurant Name is required");

    // Security: Sanitize inputs to prevent storing scripts or malicious payloads (Defense in Depth)
    // Allow letters, numbers, spaces, and standard punctuation. Reject < > { } to prevent HTML/JS injection attempts.
    const nameRegex = /^[a-zA-Z0-9\s\-\.\,\&\(\)\']+$/;
    if (!nameRegex.test(data.restaurantName)) {
        // We are lenient for now but could throw. For valid HTML safety, we just ensure strictly no script tags.
        if (data.restaurantName.includes('<') || data.restaurantName.includes('>')) {
            throw new Error("Invalid characters in name. Please remove < or > symbols.");
        }
    }

    if (!data.phone) throw new Error("Phone is required");
    // Security: strict phone validation (digits, space, +, -, brackets only)
    // This prevents SQL-like injection strings in phone fields users might paste.
    const phoneRegex = /^[0-9+\-\s\(\)]+$/;
    if (!phoneRegex.test(data.phone)) {
        throw new Error("Invalid phone number format.");
    }

    return true;
}

export async function initDB() {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db, oldVersion, newVersion, transaction) {
            // Create stores if they don't exist
            if (!db.objectStoreNames.contains('leads')) {
                const store = db.createObjectStore('leads', { keyPath: 'leadId' });
                store.createIndex('nextFollowUpDate', 'nextFollowUpDate');
                store.createIndex('currentStatus', 'currentStatus');
                store.createIndex('leadStage', 'leadStage');
                store.createIndex('isArchived', 'isArchived'); // New index for soft deletes
            } else {
                // Upgrade verification for existing store
                const store = transaction.objectStore('leads');
                if (!store.indexNames.contains('isArchived')) {
                    store.createIndex('isArchived', 'isArchived');
                }
            }

            if (!db.objectStoreNames.contains('followUps')) {
                const store = db.createObjectStore('followUps', { keyPath: 'followUpId' });
                store.createIndex('leadId', 'leadId');
                store.createIndex('date', 'followUpDate');
            }
        },
    });
}

export async function getLeads(includeArchived = false) {
    const db = await initDB();
    let leads = await db.getAll('leads');
    if (!includeArchived) {
        leads = leads.filter(l => !l.isArchived);
    }
    return leads;
}

export async function getLead(id) {
    const db = await initDB();
    return db.get('leads', id);
}

export async function addLead(leadData) {
    validateLead(leadData);
    const db = await initDB();
    const leadId = uuidv4();
    const now = new Date().toISOString();

    const newLead = {
        ...leadData,
        leadId,
        // defaults
        currentStatus: leadData.currentStatus || 'New',
        leadStage: leadData.leadStage || 'Cold',
        createdAt: now,
        updatedAt: now,
        isArchived: false
    };
    await db.add('leads', newLead);
    return newLead;
}

export async function updateLead(lead) {
    const db = await initDB();
    lead.updatedAt = new Date().toISOString();
    await db.put('leads', lead);
    return lead;
}

export async function archiveLead(leadId) {
    const db = await initDB();
    const lead = await db.get('leads', leadId);
    if (lead) {
        lead.isArchived = true;
        lead.updatedAt = new Date().toISOString();
        await db.put('leads', lead);
    }
}

export async function getFollowUps(leadId) {
    const db = await initDB();
    const followUps = await db.getAllFromIndex('followUps', 'leadId', leadId);
    // Sort by date descending (newest first)
    return followUps.sort((a, b) => new Date(b.followUpDate) - new Date(a.followUpDate));
}

export async function addFollowUp(followUpData) {
    const db = await initDB();
    const followUpId = uuidv4();
    const now = new Date().toISOString();

    // followUpData should contain: leadId, status, notes, nextFollowUpDate (optional), leadStage (optional, for updating lead)

    const newFollowUp = {
        followUpId,
        leadId: followUpData.leadId,
        followUpDate: followUpData.followUpDate || now,
        status: followUpData.status,
        notes: followUpData.notes,
        nextFollowUpDate: followUpData.nextFollowUpDate, // Recording the generic "next step date" in history
        createdAt: now
    };

    const tx = db.transaction(['leads', 'followUps'], 'readwrite');

    // 1. Add FollowUp
    // Enforce append-only conceptually (IDB allows delete, but we just won't expose it)
    await tx.objectStore('followUps').add(newFollowUp);

    // 2. Update Lead
    const leadStore = tx.objectStore('leads');
    const lead = await leadStore.get(followUpData.leadId);

    if (lead) {
        lead.lastFollowUpDate = newFollowUp.followUpDate;
        lead.currentStatus = followUpData.status;
        lead.updatedAt = now;

        if (followUpData.nextFollowUpDate) {
            lead.nextFollowUpDate = followUpData.nextFollowUpDate;
        }

        if (followUpData.leadStage) {
            lead.leadStage = followUpData.leadStage;
        }

        await leadStore.put(lead);
    }

    await tx.done;
    return newFollowUp;
}

// Optimized "View" for Today's Calls
export async function getTodaysCalls() {
    const db = await initDB();
    const todayStr = new Date().toISOString().split('T')[0];

    // Get all leads (optimized: could use index range if index key was just date, but index is full iso string...)
    // Actually nextFollowUpDate is YYYY-MM-DD in our app mostly.
    // However, to be safe and mimicking "View" logic:
    const allLeads = await db.getAll('leads');

    return allLeads.filter(l => {
        if (l.isArchived) return false;
        if (!l.nextFollowUpDate) return false;

        // Logic: Due today or overdue, AND not closed
        return l.nextFollowUpDate <= todayStr &&
            !['Converted', 'Not Interested', 'Fake lead', 'Reject'].includes(l.currentStatus);
    });
}

export async function getDashboardStats() {
    const leads = await getLeads();
    const today = new Date().toISOString().split('T')[0];

    const totalLeads = leads.length;
    const callsDueToday = leads.filter(l => {
        if (!l.nextFollowUpDate) return false;
        // Simple string comparison for dates works if format is YYYY-MM-DD
        // Assuming nextFollowUpDate is YYYY-MM-DD or ISO.
        return l.nextFollowUpDate.startsWith(today) &&
            !['Converted', 'Not Interested'].includes(l.currentStatus);
    }).length;

    const cold = leads.filter(l => l.leadStage === 'Cold').length;
    const warm = leads.filter(l => l.leadStage === 'Warm').length;
    const hot = leads.filter(l => l.leadStage === 'Hot').length;
    const converted = leads.filter(l => l.currentStatus === 'Converted').length;

    return {
        totalLeads,
        callsDueToday,
        cold,
        warm,
        hot,
        converted
    };
}
