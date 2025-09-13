# VectorScan Heroku Deployment Guide

## Pre-Deployment Checklist ✅

- [x] Flask app configured (`app.py`)
- [x] Procfile present (`web: gunicorn app:app`)
- [x] Requirements.txt with all dependencies
- [x] Static files in correct location (`/static/`)
- [x] Templates in correct location (`/templates/`)
- [x] Landing page layout improved
- [x] Images loading correctly

## Deployment Commands

```bash
# 1. Navigate to project directory
cd C:/Users/neilg/vectorscan/venv

# 2. Initialize git (if not already done)
git init
git add .
git commit -m "Initial VectorScan deployment with improved landing page"

# 3. Connect to Heroku (if not already connected)
heroku git:remote -a your-heroku-app-name

# 4. Deploy to Heroku
git push heroku main

# 5. Open your app
heroku open
```

## Expected Results After Deployment

- ✅ `vectorscan.io/` → Beautiful landing page with logo, welcome text, and login
- ✅ `vectorscan.io/query` → Query page (accessible after login)
- ✅ `vectorscan.io/login` → API endpoint for authentication

## Environment Variables (if needed)

```bash
# Set JWT secret for production
heroku config:set JWT_SECRET_KEY=your-secure-production-key
```

## Troubleshooting

- Check logs: `heroku logs --tail`
- Restart app: `heroku restart`
- Check dyno status: `heroku ps`
