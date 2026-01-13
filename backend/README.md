# RestroIQ Backend

Express.js backend server for the RestroIQ Lead CRM application.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

3. Add your Supabase credentials to `.env`:
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_SERVICE_KEY` - Your Supabase service role key (from Project Settings > API)

4. Run the server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Leads
- `GET /api/leads` - Get all leads
- `GET /api/leads/:id` - Get single lead
- `POST /api/leads` - Create new lead
- `PUT /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead

### Follow-ups
- `GET /api/follow-ups/lead/:leadId` - Get follow-ups for a lead
- `POST /api/follow-ups` - Create follow-up

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Health Check
- `GET /api/health` - Server health check
