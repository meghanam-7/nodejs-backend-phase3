# Placements Backend — Phase 3

## Overview

Phase 3 is the final backend phase of the Placements Backend project.

The focus is on building a production-ready backend with reliable failure handling, incident response, defect triage, operational workflows, scalability, security, and enterprise-level backend practices.

---

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- Redis
- Socket.io
- JWT Authentication
- Jest
- Postman

---

## Project Structure

```text
p3task-node-server/
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── persistence/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── validations/
│   ├── app.js
│   └── server.js
├── tests/
├── scripts/
├── .env
├── package.json
└── README.md
```
---

## Phase 3 Capabilities

Phase 3 covers production-focused backend capabilities including:

- Incident response and incident lifecycle management
- Incident event tracking
- Defect identification and triage
- Defect prioritization and ranking
- Engineering backlog management
- Postmortem management
- Idempotent API operations
- Validation and failure handling
- Role-based authorization
- Database integrity and migrations
- Redis-based infrastructure
- Automated testing
- Production-readiness and operational verification

---

## How to Run

### Install dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file with the required database, JWT, Redis, and application configuration.

### Run Database Migrations

```bash
npx prisma migrate deploy
```

### Generate Prisma Client

```bash
npx prisma generate
```

### Start the Development Server
```bash
npm run dev
```

#### The API runs locally on:
 
http://localhost:3000


---

## Author

### Meghana M

Computer Science Graduate | Backend Developer | Node.js

GitHub: https://github.com/meghanam-7