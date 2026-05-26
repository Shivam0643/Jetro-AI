# AI Job Application Manager

This repository contains a MERN stack application for managing job applications and generating interview prep questions with OpenAI.

## Project layout

- `server/` — Node.js + Express backend using MongoDB
- `client/` — React frontend with a kanban board, application form, dashboard, and AI question generator

## Running the app

### Backend

```bash
cd server
npm install
cp .env.example .env
# edit .env to set MONGODB_URI and OPENAI_API_KEY
npm run dev
```

### Frontend

```bash
cd client
npm install
npm start
```

## Notes

- The backend API is available at `http://localhost:5000/api`
- The frontend calls the API by default from `client/src/api.js`
- If the backend runs elsewhere, set `REACT_APP_API_URL` before starting the client
