# Render Deployment Guide

## Quick Deploy

### 1. Deploy All Services at Once

Go to [render.com/blueprints](https://render.com/blueprints) and connect your GitHub repo, then upload the `render.yaml` file.

Or use the CLI:
```bash
# Install Render CLI
npm install -g @render/cicd

# Login
render login

# Deploy from render.yaml
render blueprint create
```

### 2. Deploy Services Individually via Dashboard

**Backend (NestJS):**
1. Go to [render.com](https://render.com) → New → Web Service
2. Connect GitHub repo, select `apps/backend` as root
3. Configure:
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npm run start:prod`
4. Add Environment Variables:
   - `DATABASE_URL` - from PostgreSQL (create below)
   - `REDIS_URL` - from Redis (create below)
   - `JWT_SECRET` - generate secure value
   - `JWT_REFRESH_SECRET` - generate secure value
   - `MONGODB_URI` - MongoDB connection string
5. Create PostgreSQL: New → PostgreSQL → free tier
6. Create Redis: New → Redis → free tier
7. Deploy

**Pharmacy App (Next.js):**
1. New → Web Service
2. Select `apps/pharmacy-app` as root
3. Configure:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
4. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL` = your backend URL (e.g., `https://health-backend.onrender.com`)
5. Deploy

**Admin Panel (Next.js):**
1. Same as Pharmacy App but select `apps/admin-panel`

---

## Required Environment Variables

### Backend
| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | PostgreSQL connection string (from Render dashboard) |
| `REDIS_URL` | Redis connection string (from Render dashboard) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Generate secure 64-char string |
| `JWT_REFRESH_SECRET` | Generate another secure string |
| `JWT_EXPIRES_IN` | `1h` |
| `JWT_REFRESH_EXPIRES_IN` | `7d` |
| `PORT` | `3000` |
| `ALLOWED_ORIGINS` | `*` (or your domain) |

### Pharmacy App
| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `NEXT_PUBLIC_API_URL` | Your backend URL |
| `NEXT_PUBLIC_SOCKET_URL` | Your backend URL (ws:// for WebSocket) |

### Admin Panel
| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `NEXT_PUBLIC_API_URL` | Your backend URL |

---

## Useful Render Commands (CLI)

```bash
# Install CLI
npm install -g @render/cicd

# Login
render login

# List services
render services list

# View logs
render logs -s health-backend

# Redeploy
render deploy -s health-backend
```

---

## Notes

- **Free tier**: Auto-shuts down after 15 min of inactivity, takes ~30s to wake
- **PostgreSQL**: Free tier has 1GB storage, 90 day connection limit
- **Redis**: Free tier has 30MB storage
- **Build time**: May take 3-5 minutes for first deploy
