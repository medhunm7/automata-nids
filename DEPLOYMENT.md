# Automated CI/CD & Deployment Guide

This document details the single-action automated deployment pipeline for the **Automata-Based Network Intrusion Detection System (NIDS)**.

Once connected to your GitHub repository, **every future push to the `main` branch automatically triggers zero-downtime deployments**:
- **Frontend** &rarr; Automatically built and deployed on **Vercel**
- **Backend** &rarr; Automatically built and deployed on **Render**
- **CI/CD Quality Gate** &rarr; Automatically validated via **GitHub Actions**

---

## 1. Single-Action Deployment Workflow

After the initial one-time service linking on Render and Vercel, deploying updates requires only one standard action:

```bash
git add .
git commit -m "feat: your new feature or update"
git push origin main
```

When this command runs:
1. **GitHub Actions** runs the test matrix (`.github/workflows/node.yml`), executing FSM automata unit tests, verifying API startup, and testing the Vite production build.
2. **Render Webhook** detects the push on `main`, checks out `server/`, runs `npm install`, launches `npm start`, and verifies `/health`.
3. **Vercel Webhook** detects the push on `main`, checks out `client/`, executes `npm run build`, and distributes the new static assets globally across edge nodes.

---

## 2. Infrastructure & Directory Mapping

| Service | Target Directory | Build Command | Start / Output | Health Check |
| :--- | :--- | :--- | :--- | :--- |
| **Backend (Render)** | `server` | `npm install` | `npm start` | `GET /health` (`{"status":"OK"}`) |
| **Frontend (Vercel)** | `client` | `npm run build` | `dist` | Automated SPA Edge Routing |
| **Database (Atlas)** | Cloud Managed | N/A | Port 27017 | Built-in in-memory fallback |

---

## 3. Step-by-Step Initial Setup

### Step 3.1: Connect GitHub Repository
Repository Remote configured:
```bash
git remote add origin https://github.com/medhunm7/automata-nids.git
git branch -M main
git push -u origin main
```

---

### Step 3.2: Backend Deployment on Render

1. Log into [Render](https://render.com).
2. Click **New +** &rarr; **Web Service**.
3. Select your GitHub repository (`automata-nids`).
4. Configure service parameters:
   - **Name:** `automata-nids-backend`
   - **Root Directory:** `server`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
5. Under **Environment Variables**, add:
   | Variable | Value | Description |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Enables optimized production logging & error handling |
   | `PORT` | `10000` | Render standard port (detected automatically) |
   | `MONGO_URI` | `mongodb+srv://...` | MongoDB Atlas URI (or leave blank to use fallback) |
   | `JWT_SECRET` | `<random-32-char-string>` | Secret for signing analyst JWT session tokens |
   | `CLIENT_URL` | `https://your-frontend.vercel.app` | Vercel production URL for CORS |
6. Set **Health Check Path** to:
   ```
   /health
   ```
7. Ensure **Auto-Deploy** is set to **Yes**.
8. Click **Create Web Service**.
9. Note your Render backend URL:
   `https://automata-nids-backend.onrender.com`

---

### Step 3.3: Frontend Deployment on Vercel

1. Log into [Vercel](https://vercel.com).
2. Click **Add New...** &rarr; **Project**.
3. Import your GitHub repository (`automata-nids`).
4. Configure build settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click **Edit** &rarr; select `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
5. Under **Environment Variables**, add:
   | Variable | Value | Description |
   | :--- | :--- | :--- |
   | `VITE_API_URL` | `https://automata-nids-backend.onrender.com` | Render backend URL (no trailing slash) |
6. Click **Deploy**.
7. Once deployment finishes, copy your Vercel URL (e.g. `https://automata-nids.vercel.app`).
8. Return to Render &rarr; Update `CLIENT_URL` with your Vercel domain &rarr; save changes.

---

## 4. Configuration File Reference

### `render.yaml` (Render Blueprint)
Enables automated infrastructure-as-code provisioning on Render:
```yaml
services:
  - type: web
    name: automata-nids-backend
    env: node
    plan: free
    region: oregon
    rootDir: server
    buildCommand: npm install
    startCommand: npm start
    healthCheckPath: /health
    autoDeploy: true
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: MONGO_URI
        sync: false
      - key: JWT_SECRET
        generateValue: true
      - key: CLIENT_URL
        sync: false
```

### `vercel.json` (SPA Routing Rewrites)
Ensures client-side React Router handles all deep links (`/alerts`, `/simulator`, `/upload`, etc.) without 404s:
```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "cleanUrls": true,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 5. Pre-Deployment Verification Checklist

- [x] **Git Repository Clean:** Working tree clean, `.gitignore` excludes node_modules, build outputs, and `.env`.
- [x] **No Secrets Exposed:** Secrets reside exclusively in platform dashboard environment variables.
- [x] **Zero Localhost Dependencies:** Frontend resolves API base dynamically from `import.meta.env.VITE_API_URL`.
- [x] **Backend Health Check Active:** `GET /health` verified returning `{"status":"OK"}`.
- [x] **Production Build Verified:** Vite production build generates valid static assets in `client/dist`.
- [x] **Automata FSM Test Suite:** 5/5 unit tests pass deterministically.
- [x] **Automated Future Pushes:** Pushes to `main` auto-trigger GitHub Actions, Render, and Vercel builds.
