# Deployment Guide

This guide covers deploying your NestJS application to various platforms.

## Prerequisites

Before deploying, ensure you have:
- Production Dockerfile (already created)
- Environment variables configured
- PostgreSQL database for production

## Free Deployment Options

### 1. **Render.com** (Recommended - Easiest)

**Pros:**
- Free tier includes PostgreSQL database
- Automatic deployments from GitHub
- Easy environment variables setup
- HTTPS by default
- No credit card required

**Free Tier Limits:**
- App sleeps after 15 minutes of inactivity
- 750 hours/month (enough for one service)
- 100GB bandwidth/month

**Steps:**

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Add production Dockerfile"
   git push
   ```

2. **Sign up at render.com**
   - Go to https://render.com
   - Sign up with GitHub

3. **Create PostgreSQL Database**
   - Dashboard → New → PostgreSQL
   - Name: nest-postgres
   - Free tier
   - Copy the "Internal Database URL" (you'll need it)

4. **Create Web Service**
   - Dashboard → New → Web Service
   - Connect your GitHub repository
   - Settings:
     - **Name**: nest-app
     - **Environment**: Docker
     - **Dockerfile Path**: Dockerfile
     - **Port**: 7000

5. **Add Environment Variables**
   Click "Environment" and add:
   ```
   NODE_ENV=production
   PORT=7000
   POSTGRES_HOST=<from internal database URL>
   POSTGRES_PORT=5432
   POSTGRES_USERNAME=<from database URL>
   POSTGRES_PASSWORD=<from database URL>
   POSTGRES_DB=<from database URL>
   PRIVATE_KEY=your-secret-jwt-key-change-this
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USER=your-email@gmail.com
   MAIL_PASSWORD=your-app-password
   MAIL_FROM=noreply@yourapp.com
   FRONTEND_URL=https://your-frontend.com
   ```

6. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy automatically
   - Your app will be at: https://nest-app.onrender.com

---

### 2. **Railway.app**

**Pros:**
- Very simple setup
- Good free tier ($5 credit/month)
- PostgreSQL included
- Fast deployments

**Free Tier:**
- $5/month credit (enough for small apps)
- No sleep mode

**Steps:**

1. **Sign up at railway.app**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - New Project → Deploy from GitHub repo
   - Select your repository

3. **Add PostgreSQL**
   - Add → Database → PostgreSQL
   - Railway will create it automatically

4. **Configure Service**
   - Click on your service
   - Settings → Generate Domain
   - Variables → Add environment variables (same as above)
   - Railway auto-detects Dockerfile

5. **Deploy**
   - Automatic on every git push

---

### 3. **Fly.io**

**Pros:**
- Generous free tier
- Fast global deployment
- Good for learning DevOps

**Free Tier:**
- 3 shared-cpu VMs with 256MB RAM
- 3GB persistent storage

**Steps:**

1. **Install flyctl**
   ```bash
   brew install flyctl
   ```

2. **Login**
   ```bash
   fly auth login
   ```

3. **Launch app**
   ```bash
   fly launch
   ```
   - Follow prompts
   - Select region
   - Create PostgreSQL? → Yes

4. **Set environment variables**
   ```bash
   fly secrets set PRIVATE_KEY=your-secret-key
   fly secrets set NODE_ENV=production
   ```

5. **Deploy**
   ```bash
   fly deploy
   ```

---

### 4. **Heroku** (Still Free with Eco Dynos)

**Pros:**
- Well-documented
- Easy CLI
- Many add-ons

**Cons:**
- Requires credit card (even for free tier)
- Sleep after 30 minutes

**Steps:**

1. **Install Heroku CLI**
   ```bash
   brew tap heroku/brew && brew install heroku
   ```

2. **Login**
   ```bash
   heroku login
   ```

3. **Create app**
   ```bash
   heroku create your-app-name
   ```

4. **Add PostgreSQL**
   ```bash
   heroku addons:create heroku-postgresql:mini
   ```

5. **Set environment variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set PRIVATE_KEY=your-secret-key
   ```

6. **Deploy**
   ```bash
   git push heroku main
   ```

---

## Comparison Table

| Platform | Free DB | Sleep Mode | Setup Difficulty | Best For |
|----------|---------|------------|------------------|----------|
| **Render** | ✅ Yes | After 15min | ⭐ Easy | Beginners |
| **Railway** | ✅ Yes | ❌ No | ⭐ Easy | Small projects |
| **Fly.io** | ✅ Yes | ❌ No | ⭐⭐ Medium | Learning DevOps |
| **Heroku** | ✅ Yes | After 30min | ⭐ Easy | Quick prototypes |

## My Recommendation for You

**Start with Render.com** because:
1. No credit card needed
2. Free PostgreSQL included
3. Simplest setup
4. Good documentation
5. Auto-deploy from GitHub

---

## After Deployment

### Test your deployment:

```bash
# Health check
curl https://your-app.onrender.com/api/v1/health

# Swagger docs
open https://your-app.onrender.com/api/docs
```

### Monitor logs:

- **Render**: Dashboard → Logs tab
- **Railway**: Dashboard → Deployments → Logs
- **Fly.io**: `fly logs`
- **Heroku**: `heroku logs --tail`

---

## Production Checklist

Before deploying to production:

- [ ] Environment variables set (especially PRIVATE_KEY)
- [ ] Database connection string configured
- [ ] CORS configured for your frontend domain
- [ ] Swagger disabled or protected in production (optional)
- [ ] Error logging configured
- [ ] Health endpoint working
- [ ] Database migrations tested

---

## Troubleshooting

### "Cannot connect to database"
- Check POSTGRES_HOST uses internal URL (not external)
- Verify all database credentials

### "Application error"
- Check logs for detailed error
- Verify PORT environment variable matches Dockerfile EXPOSE

### "Build failed"
- Ensure Dockerfile is in root directory
- Check build logs for npm errors
- Verify package.json scripts are correct

---

## Next Steps

1. Deploy to Render (takes 10 minutes)
2. Test all endpoints via Swagger
3. Connect your frontend
4. Set up monitoring (optional)
5. Configure custom domain (optional)

Good luck with your deployment! 🚀
