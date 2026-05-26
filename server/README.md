# AI Job Application Manager — Server

This directory contains the Express backend for the AI Job Application Manager.

## Setup

1. Copy `.env.example` to `.env`
2. Set `MONGODB_URI` and `OPENAI_API_KEY`
3. Run `npm install`
4. Run `npm run dev` or `npm start`

## API Endpoints

- `GET /api/applications`
- `POST /api/applications`
- `GET /api/applications/:id`
- `PUT /api/applications/:id`
- `DELETE /api/applications/:id`
- `POST /api/ai/questions`

## Notes

- The backend supports both OpenAI keys and OpenRouter keys.
- If your key starts with `sk-or-`, the server will use the OpenRouter endpoint automatically.
