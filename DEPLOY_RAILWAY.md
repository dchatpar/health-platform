# Railway Deployment Guide

## Prerequisites
- [Railway Account](https://railway.app) (sign up with GitHub)
- GitHub repository with your code

---

## 1. Deploy Backend (NestJS)

### Steps:
1. Go to [railway.app](https://railway.app) and click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose the `apps/backend` folder as the root
4. Add a PostgreSQL database:
   - Click "Add Plugin" → "PostgreSQL"
   - Wait for it to provision
5. Add Redis:
   - Click "Add Plugin" → "Redis"
   - Or use Upstash Redis for production
6. Set environment variables (replace placeholder values):

```
NODE_ENV=production
PORT=3000

# Database - Railway provides these automatically
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Redis - Update with Railway's Redis host/port
REDIS_URL=redis://host:port

# JWT - Generate secure values
JWT_SECRET=<generate-a-secure-64-char-string>
JWT_REFRESH_SECRET=<generate-another-secure-64-char-string>
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# AWS S3 (for file uploads) - Optional
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<your-aws-key>
AWS_SECRET_ACCESS_KEY=<your-aws-secret>
S3_BUCKET_NAME=health-platform-uploads

# Frontend URLs
ALLOWED_ORIGINS=https://your-pharmacy-app.railway.app,https://your-admin-panel.railway.app
```

7. Click "Deploy"

### Notes:
- Railway auto-detects Node.js and runs `npm run build`
- `start:prod` script runs `prisma migrate deploy` then starts the server
- Check logs for migration status

---

## 2. Deploy Pharmacy Web App (Next.js)

### Steps:
1. In Railway, create another project
2. Select "Deploy from GitHub repo"
3. Choose the `apps/pharmacy-app` folder as root
4. Add environment variables:

```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_SOCKET_URL=wss://your-backend.railway.app
NEXT_PUBLIC_APP_URL=https://your-pharmacy-app.railway.app
NODE_ENV=production
```

5. Click "Deploy"

---

## 3. Deploy Admin Panel (Next.js)

### Steps:
1. In Railway, create another project
2. Select "Deploy from GitHub repo"
3. Choose the `apps/admin-panel` folder as root
4. Add environment variables:

```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_APP_URL=https://your-admin-panel.railway.app
NODE_ENV=production
```

5. Click "Deploy"

---

## 4. Update Backend Environment

After deploying, update the backend's `ALLOWED_ORIGINS` to include your actual web app URLs:

```
ALLOWED_ORIGINS=https://pharmacy-app-xxx.railway.app,https://admin-panel-xxx.railway.app
```

---

## 5. Mobile Apps (Expo)

### For Development Build:
```bash
cd apps/patient-app
eas build --platform ios --profile preview
eas build --platform android --profile preview
```

### For Production:
```bash
eas build --platform ios --profile production
eas build --platform android --profile production
```

Update `app.json` with your production API URL before building.

---

## 6. Database Migrations

Railway runs migrations automatically via `prisma migrate deploy` in the start script. For manual runs:

1. Go to your backend project in Railway
2. Click on "Databases" → your PostgreSQL
3. Use "Database UI" to run Prisma Studio or execute queries

---

## Troubleshooting

### Backend fails to start
- Check logs for migration errors
- Verify `DATABASE_URL` is correct
- Ensure `JWT_SECRET` is set

### Web apps show 500 errors
- Verify `NEXT_PUBLIC_API_URL` points to your backend
- Check backend CORS settings include your web app URLs

### WebSocket connection fails
- Ensure backend uses `wss://` for production WebSocket
- Check ALLOWED_ORIGINS includes web app URLs

---

## Useful Railway Commands

```bash
# View logs
railway logs -p <project-id>

# Open shell to container
railway shell

# Check environment variables
railway variables

# Redeploy
railway up
```
