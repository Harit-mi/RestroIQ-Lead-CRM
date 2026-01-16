import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import leadsRouter from './routes/leads.js';
import followUpsRouter from './routes/followUps.js';
import dashboardRouter from './routes/dashboard.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: [
        'https://restro-iq-lead-crm.vercel.app',
        'http://localhost:5173',
        process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/leads', leadsRouter);
app.use('/api/follow-ups', followUpsRouter);
app.use('/api/dashboard', dashboardRouter);

// Root route
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>RestroIQ Backend Status</title>
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    background-color: #f0fdf4;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                }
                .container {
                    text-align: center;
                    padding: 3rem;
                    background: white;
                    border-radius: 1.5rem;
                    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
                    max-width: 90%;
                    width: 450px;
                    border: 1px solid #dcfce7;
                    transition: transform 0.2s;
                }
                .container:hover {
                    transform: translateY(-5px);
                }
                h1 {
                    color: #166534;
                    font-size: 2.5rem;
                    margin: 1.5rem 0;
                    font-weight: 800;
                    letter-spacing: -0.025em;
                }
                .status-badge {
                    display: inline-flex;
                    align-items: center;
                    background: #dcfce7;
                    color: #166534;
                    padding: 0.5rem 1rem;
                    border-radius: 9999px;
                    font-weight: 600;
                    font-size: 0.875rem;
                    margin-bottom: 1rem;
                }
                .indicator {
                    width: 0.75rem;
                    height: 0.75rem;
                    background-color: #22c55e;
                    border-radius: 50%;
                    margin-right: 0.5rem;
                    box-shadow: 0 0 0 3px #fff;
                    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: .5; }
                }
                p {
                    color: #4b5563;
                    font-size: 1.125rem;
                    line-height: 1.75;
                }
                .footer {
                    margin-top: 2rem;
                    font-size: 0.875rem;
                    color: #9ca3af;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="status-badge">
                    <span class="indicator"></span>
                    System Online
                </div>
                <h1>Backend is Running</h1>
                <p>RestroIQ Lead CRM API is active and ready to accept requests.</p>
                <div class="footer">
                    Running on Port ${PORT}
                </div>
            </div>
        </body>
        </html>
    `);
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'RestroIQ Backend is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`
    🚀 RestroIQ Backend is running!
    -------------------------------
    Local:   http://localhost:${PORT}
    Health:  http://localhost:${PORT}/api/health
    -------------------------------
    Waiting for requests...
    `);
});
