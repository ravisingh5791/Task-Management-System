# TaskFlow Pro (Full Stack + AI)

A simple and professional Task Management project built with React, Node.js, Express, and MongoDB.

This project is good for:
- GitHub portfolio
- LinkedIn post
- Resume projects section

## Live Links
- Frontend: _Add your deployed link here_
- Backend API: _Add your deployed link here_

## What this project does
- User can register and login
- User can create, update, delete tasks
- User can set task status and priority
- User can add due date and tags
- User can search, filter, and sort tasks
- User can archive and restore tasks
- Dashboard shows task stats
- AI Assist helps generate better task description and tags
- Dark and Light theme supported

## Tech Stack
### Frontend
- React
- Vite
- Axios

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)

### Security and Validation
- JWT Authentication
- bcrypt password hashing
- Joi validation
- Helmet
- Rate Limiting

### DevOps and Quality
- Jest + Supertest tests
- Docker + Docker Compose
- GitHub Actions CI

## Project Structure
- `frontend/` - React app
- `backend/` - Express API

## Quick Start (Local)
### 1) Run Backend
```powershell
cd backend
npm.cmd install
Copy-Item .env.example .env -Force
npm.cmd start
```

### 2) Run Frontend
```powershell
cd frontend
npm.cmd install
Copy-Item .env.example .env -Force
npm.cmd run dev
```

Open in browser: `http://localhost:5173`

## Environment Variables
### backend/.env
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/task_management_db
JWT_SECRET=change_this_secret
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
```

### frontend/.env
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Main API Routes
### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PUT /api/auth/me`
- `PUT /api/auth/change-password`

### Tasks
- `GET /api/tasks`
- `GET /api/tasks/stats`
- `POST /api/tasks`
- `PUT /api/tasks/:id`
- `PATCH /api/tasks/:id/archive`
- `DELETE /api/tasks/:id`

### AI
- `POST /api/ai/task-assist`

## Run Tests
```powershell
cd backend
npm.cmd test
```

## Run with Docker
```powershell
docker compose up --build
```

- Frontend: `http://localhost:8080`
- Backend: `http://localhost:5000`

## Why this project is strong for recruiters
- Full stack project with real API and database
- Security best practices used
- Clean UI with good user experience
- AI feature included (extra value)
- Tests and CI added
- Docker support for easy setup

## What I learned
- Building complete auth system
- Writing scalable backend APIs
- Handling validation and errors properly
- Improving UI/UX with themes and dashboards
- Integrating AI in a practical way

## Next Improvements
- Add drag-and-drop Kanban board
- Add frontend test cases
- Add file upload support
- Deploy app and add live links

## LinkedIn/Resume one-line summary
Built an AI-powered full-stack Task Management app using React, Node.js, Express, and MongoDB with secure authentication, advanced task features, testing, CI, and Docker support.

Author - Ravi Singh