# MitigationAI MVP

This workspace contains a minimal MVP scaffold for your MitigationAI project:

- `frontend/` - Vite + React + Tailwind frontend (hybrid conversational form)
- `backend/` - Express backend with a `/api/generate` stub that returns a placeholder mitigation statement and reads `prompt.txt` as sample context
- `prompt.txt` - Your Claude prompt and question set (used as sample RAG context)

Goals: give you a local, runnable MVP you can use to test prompt changes and form UX before connecting to Claude API, Pinecone, Google OAuth and Stripe.

How to run locally

1. Install dependencies for backend:

```bash
cd backend
npm install
npm start
```

2. Install frontend dependencies and run dev server:

```bash
cd frontend
npm install
npm run dev
```

3. Open http://localhost:5173 (Vite default) and the frontend will call the backend at `/api/generate`.

Planned next steps to connect services

- Replace backend stub with Claude API calls, and implement Pinecone retrieval for RAG.
- Add Google OAuth (frontend + backend) to avoid storing user PII.
- Integrate Stripe Checkout for payment on submission.
- Deploy backend to Render (you can use your existing Render MCP server) and host frontend on Vercel/Netlify or similar.

Environment variables (create `.env` from `.env.example` in the backend):

- CLAUDE_API_KEY=your_key
- PINECONE_API_KEY=your_key
- PINECONE_ENV=your_env
- STRIPE_SECRET=your_key
- GOOGLE_CLIENT_ID=your_client_id

If you'd like, I can implement the Claude + Pinecone integration and add Google OAuth/Stripe wiring in the next iteration.
