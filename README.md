# RestroIQ Lead CRM

A lead management system for restaurant sales teams, built with React and Express.js.

## Project Structure

```
RestroIQ-Lead-CRM/
├── frontend/          # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   ├── routes/
│   │   └── lib/
│   └── package.json
├── backend/           # Express.js backend
│   ├── routes/
│   ├── lib/
│   └── package.json
└── README.md
```

## Quick Start

### Prerequisites
- Node.js 18+
- Supabase account with configured database

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Add your Supabase credentials to .env
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and the backend on `http://localhost:5000`.

## Environment Variables

### Backend (`backend/.env`)
| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase service role key |
| `PORT` | Server port (default: 5000) |
| `FRONTEND_URL` | Frontend URL for CORS |

### Frontend (`frontend/.env`)
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL |

## API Documentation

See [backend/README.md](backend/README.md) for full API documentation.

## Tech Stack

**Frontend:** React 19, Vite, React Router, Lucide Icons

**Backend:** Express.js, Supabase

**Database:** PostgreSQL (via Supabase)
