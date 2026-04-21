# Phishing Detection & Reporting — MERN Starter

This repository contains a minimal MERN scaffold to start the Phishing Detection and Reporting System.

Quick start:

1. Backend

```
cd server
npm install
cp .env.example .env   # edit MONGO_URI if needed
npm run dev
```

2. Frontend

```
cd client
npm install
npm start
```

The backend exposes `POST /api/scan` which accepts `{ inputType, raw, userId }` and stores a placeholder `ScanLog` in MongoDB. Replace the placeholder analysis with the ML microservice and threat-intel integrations next.

Docker (all services)

Start all services (Mongo, backend, client, ML stub) using Docker Compose:

```bash
docker compose up --build
```

After startup:
- frontend will be available at `http://localhost:3000`
- backend API at `http://localhost:5000`
- ML microservice at `http://localhost:9000`

Set `ML_SERVICE_URL` in `server` environment (already wired in compose) when running via Docker.

Threat intelligence placeholders

To enable VirusTotal / HaveIBeenPwned checks, set the following in `server/.env` or your environment:

```
VIRUSTOTAL_KEY=<your_virustotal_api_key>
HIBP_API_KEY=<your_hibp_api_key>
```

When set, the backend will attach the raw API responses under the `meta` field of `ScanLog` (see `server/src/services/threatIntel.js`). These are placeholders — you should implement rate-limiting, error handling, caching, and privacy controls before production use.



py -m venv venv
>> venv\Scripts\activate