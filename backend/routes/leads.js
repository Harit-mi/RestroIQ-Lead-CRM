import express from 'express';
import { supabase } from '../lib/supabaseClient.js';

const router = express.Router();

// Helper: Convert snake_case to camelCase
const toCamelCase = (lead) => ({
    leadId: lead.lead_id,
    restaurantName: lead.restaurant_name,
    phone: lead.phone,
    city: lead.city,
    currentStatus: lead.current_status,
    leadStage: lead.lead_stage,
    nextFollowUpDate: lead.next_follow_up_date,
    lastFollowUpDate: lead.last_follow_up_date,
    createdAt: lead.created_at,
    updatedAt: lead.updated_at
});

// GET all leads
router.get('/', async (req, res, next) => {
    try {
        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .order('next_follow_up_date', { ascending: true, nullsFirst: false });

        if (error) throw error;

        res.json(data.map(toCamelCase));
    } catch (error) {
        next(error);
    }
});

// GET single lead by ID
router.get('/:id', async (req, res, next) => {
    try {
        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .eq('lead_id', req.params.id)
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Lead not found' });

        res.json(toCamelCase(data));
    } catch (error) {
        next(error);
    }
});

// POST create new lead
router.post('/', async (req, res, next) => {
    try {
        const { restaurantName, phone, city, currentStatus, leadStage, nextFollowUpDate } = req.body;

        const newLead = {
            restaurant_name: restaurantName,
            phone: phone,
            city: city,
            current_status: currentStatus || 'New',
            lead_stage: leadStage || 'Cold',
            next_follow_up_date: nextFollowUpDate || null
        };

        const { data, error } = await supabase
            .from('leads')
            .insert([newLead])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(toCamelCase(data));
    } catch (error) {
        next(error);
    }
});

// PUT update lead
router.put('/:id', async (req, res, next) => {
    try {
        const { restaurantName, phone, city, currentStatus, leadStage, nextFollowUpDate, lastFollowUpDate } = req.body;

        const updatedLead = {
            restaurant_name: restaurantName,
            phone: phone,
            city: city,
            current_status: currentStatus,
            lead_stage: leadStage,
            next_follow_up_date: nextFollowUpDate || null,
            last_follow_up_date: lastFollowUpDate || null
        };

        const { data, error } = await supabase
            .from('leads')
            .update(updatedLead)
            .eq('lead_id', req.params.id)
            .select()
            .single();

        if (error) throw error;

        res.json(toCamelCase(data));
    } catch (error) {
        next(error);
    }
});

// DELETE lead
router.delete('/:id', async (req, res, next) => {
    try {
        const { error } = await supabase
            .from('leads')
            .delete()
            .eq('lead_id', req.params.id);

        if (error) throw error;

        res.json({ success: true, message: 'Lead deleted successfully' });
    } catch (error) {
        next(error);
    }
});

export default router;
