# 🚀 Production Deployment Guide: Content Moderation AI

This guide explains how to deploy both the **FastAPI Backend** and the **React Frontend** to production environments for free in under 10 minutes.

---

## 🛠️ Architecture Overview

For maximum performance, security, and scalability, we deploy the system in a **Decoupled Architecture**:

```
[🌐 User Browser]
       │
       ├─► (Static Assets) ──► [⚡ React Frontend (Vercel)]
       │
       └─► (API Queries) ────► [🧠 FastAPI Backend (Render/Railway)]
                                      │
                                      └─► [🗄️ SQLite Database]
```

---

## 📦 Part 1: Deploy FastAPI Backend (Render or Railway)

Choose either **Render** or **Railway** (both are completely free and excellent).

### Option A: Deploying on Render (Recommended for SQLite persistence)

Render allows attaching a free **Persistent Disk** so your database data isn't wiped out when the server sleeps/restarts.

1. **Push your code to GitHub**: Create a private or public repository on GitHub and push the entire codebase.
2. **Sign up/in to Render**: Go to [Render.com](https://render.com/) and link your GitHub account.
3. **Create a New Web Service**:
   * Click **New +** -> **Web Service**.
   * Select your GitHub repository.
4. **Configure Settings**:
   * **Name**: `content-moderation-api`
   * **Language/Runtime**: `Docker` (Since we have a `Dockerfile` in the root, selecting **Docker** is highly recommended as it builds automatically!).
   * **Instance Type**: Select **Free**.
5. **Add Environment Variables**:
   * Click **Advanced** -> **Add Environment Variable**:
     * `PORT` = `8000`
6. **Set up Disk (For SQLite Persistence)**:
   * Scroll to the **Disks** section.
   * Click **Add Disk**:
     * **Name**: `sqlite-db-storage`
     * **Mount Path**: `/app/database`
     * **Size**: `1 GB` (More than enough for millions of moderation records!).
   * Update the database path in your backend to point to `/app/database/content_moderation.db` (Render will save it safely!).
7. Click **Create Web Service**! Render will build and deploy your backend. Your API URL will look like: `https://content-moderation-api.onrender.com`.

---

## ⚡ Part 2: Deploy React Frontend (Vercel)

Vercel is the industry-standard hosting for React apps. It is completely free, offers global CDN speeds, and deploys in seconds.

### Step 1: Update API URL in Frontend
Before deploying, we must tell our React app where our deployed backend API is located!

1. Open `frontend/src/App.jsx`.
2. Go to **Line 6** and update the `API` constant to point to your live Render/Railway URL:
   ```javascript
   // Change from empty string to your deployed backend URL:
   const API = 'https://content-moderation-api.onrender.com';
   ```

### Step 2: Deploy on Vercel
1. Go to [Vercel.com](https://vercel.com/) and sign in with GitHub.
2. Click **Add New** -> **Project**.
3. Select your GitHub repository.
4. **Configure Project Settings**:
   * **Framework Preset**: Select `Create React App` (Vercel automatically detects this).
   * **Root Directory**: Click Edit and select the **`frontend`** directory (Since our React app is in the nested `frontend` folder).
   * **Build & Development Settings**: Vercel will automatically set:
     * **Build Command**: `npm run build`
     * **Output Directory**: `build`
5. Click **Deploy**! Vercel will build your static assets and serve them globally.

Your live React frontend link is ready! (e.g. `https://content-moderation-ai.vercel.app`).

---

## 🔑 Part 3: Enable Google Sign-In in Production

Once both URLs are ready, you can configure your official Google OAuth in under 60 seconds:

1. Copy your live Vercel URL (e.g., `https://content-moderation-ai.vercel.app`).
2. Go back to your [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
3. Click the **Pencil (Edit)** icon next to your client ID.
4. In **Authorized JavaScript origins**, click **"+ ADD URI"** and paste your Vercel URL.
5. In `frontend/src/App.jsx`:
   * Set `const USE_REAL_GOOGLE_LOGIN = true;` (Line 28)
   * Paste your Client ID at Line 27.
6. Push changes to GitHub. Vercel will instantly redeploy automatically!

---

### ⚠️ IMPORTANT: Production CORS Settings
Ensure your FastAPI backend permits requests from your Vercel URL. In `main.py`, under CORS middleware, verify `allow_origins=["*"]` or add your specific Vercel domain link to allow seamless secure API requests!
