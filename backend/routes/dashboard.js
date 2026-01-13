import express from 'express';
import { supabase } from '../lib/supabaseClient.js';

const router = express.Router();

// GET dashboard statistics
router.get('/stats', async (req, res, next) => {
    try {
        const { data: leads, error } = await supabase
            .from('leads')
            .select('*');

        if (error) throw error;

        const today = new Date().toISOString().split('T')[0];

        const totalLeads = leads.length;
        const callsDueToday = leads.filter(l => {
            if (!l.next_follow_up_date) return false;
            const followUpDate = new Date(l.next_follow_up_date).toISOString().split('T')[0];
            return followUpDate === today &&
                !['Converted', 'Not Interested'].includes(l.current_status);
        }).length;

        const cold = leads.filter(l => l.lead_stage === 'Cold').length;
        const warm = leads.filter(l => l.lead_stage === 'Warm').length;
        const hot = leads.filter(l => l.lead_stage === 'Hot').length;
        const converted = leads.filter(l => l.current_status === 'Converted').length;

        res.json({
            totalLeads,
            callsDueToday,
            cold,
            warm,
            hot,
            converted
        });
    } catch (error) {
        next(error);
    }
});

export default router;
