# Internship Management, Collaboration & Mentorship Portal

Full-stack portal scaffolded with:

- **Frontend (`/frontend`)**: Next.js, React, TypeScript, Tailwind CSS, Socket.IO client
- **Backend (`/backend`)**: Node.js, Express.js, TypeScript, PostgreSQL-ready Prisma ORM, JWT auth, Socket.IO

## Role-based access control

Supported roles:

- `ADMIN`
- `MENTOR`
- `TEAM_LEAD`
- `INTERN`

Backend RBAC is enforced through authentication and authorization middleware for protected routes.

## Project structure

- `/frontend` – App Router UI and portal overview page
- `/backend/src/config` – environment handling
- `/backend/src/middleware` – JWT auth + RBAC guards
- `/backend/src/routes` – auth, projects, mentorship APIs
- `/backend/src/socket` – real-time collaboration events
- `/backend/prisma` – PostgreSQL data models (users, internships, memberships)

## Quick start

### Frontend

```bash
cd /home/runner/work/internship-management-portal/internship-management-portal/frontend
npm install
npm run dev
```

### Backend

```bash
cd /home/runner/work/internship-management-portal/internship-management-portal/backend
cp .env.example .env
npm install
npm run prisma:generate
npm run dev
```

## Validation commands

```bash
cd /home/runner/work/internship-management-portal/internship-management-portal/frontend && npm run lint && npm run build
cd /home/runner/work/internship-management-portal/internship-management-portal/backend && npm run lint && npm test && npm run build
```
