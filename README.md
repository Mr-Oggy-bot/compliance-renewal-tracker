# Compliance Renewal Tracker

Web app for tracking licences, certificates and other regulatory approvals that need to be renewed periodically. Sends reminders before something expires and keeps a full history of past renewals instead of overwriting them.

Software Engineering project (UCS503), TIET.

## Why

Most orgs track this stuff in spreadsheets or calendar reminders. Both fall apart quickly: spreadsheets overwrite old rows so you lose history, and calendar reminders have no ownership or record of whether anyone actually acted on them. This app keeps every renewal as a separate record so you can always answer "were we compliant on date X" instead of just "what's the latest status".

## Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: SQLite locally, Postgres in Docker
- **Auth**: JWT
- **Worker**: reminder scheduler (idempotent — safe to restart without double-sending)

## Running it locally

```bash
# backend
cd backend
npm install
npm run migrate
npm run seed      # optional, adds sample data
npm start

# frontend (separate terminal)
cd frontend
npm install
npm run dev
```

Or with Docker:

```bash
docker-compose up
```

Windows users can also just double-click `run-backend.bat` and `run-frontend.bat`.

## Reminder worker

The reminder emails are sent by a separate worker process so it can be killed and restarted without duplicating alerts:

```bash
cd backend
npm run worker
```

## Tests

```bash
cd backend
npm test
```

## Project structure

```
backend/    Express API, DB migrations/seed, reminder worker
frontend/   React app
docs/       project report
```

## University report

The complete university lab report is in [`report/`](report/):

- [Compiled report PDF](report/compliance-renewal-tracker-report.pdf)
- [Overleaf-ready ZIP](report/compliance-renewal-tracker-overleaf.zip)
- [Editable LaTeX source](report/main.tex) and [technical diagrams](report/diagrams/)

Replace the student, roll-number, group and guide placeholders in `report/metadata.tex` before submission. Upload the ZIP to Overleaf and select `main.tex` as the main document.
