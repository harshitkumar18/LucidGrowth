# 🚀 Deployment Guide - Email Analyzer

This guide will help you deploy the Email Analyzer application to production using Vercel (frontend) and Railway (backend).

## 📋 Prerequisites

- GitHub account
- Vercel account (free)
- Railway account (free)
- MongoDB Atlas account (free)
- Gmail account with App Password

## 🗄️ Step 1: Setup MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account and cluster
3. Create a database user
4. Whitelist your IP (or use 0.0.0.0/0 for all IPs)
5. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/email-analyzer`)

## 🔧 Step 2: Setup Gmail App Password

1. Go to your Google Account settings
2. Enable 2-Factor Authentication
3. Generate an App Password for "Mail"
4. Save this password (you'll need it for the backend)

## 🚂 Step 3: Deploy Backend to Railway

### 3.1 Prepare Repository
1. Push your code to GitHub
2. Make sure all files are committed

### 3.2 Deploy to Railway
1. Go to [Railway](https://railway.app)
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Choose the `backend` folder as the root directory

### 3.3 Configure Environment Variables
In Railway dashboard, go to Variables tab and add:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/email-analyzer
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=your-email@gmail.com
IMAP_PASS=your-app-password
IMAP_TLS=true
TEST_EMAIL_ADDRESS=your-email@gmail.com
TEST_EMAIL_SUBJECT=Email Analysis Test
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://your-vercel-app.vercel.app
```

### 3.4 Get Backend URL
After deployment, Railway will give you a URL like: `https://your-app.railway.app`

## 🌐 Step 4: Deploy Frontend to Vercel

### 4.1 Deploy to Vercel
1. Go to [Vercel](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your repository
5. Set the **Root Directory** to `frontend`
6. Click "Deploy"

### 4.2 Configure Environment Variables
In Vercel dashboard, go to Settings → Environment Variables and add:

```
REACT_APP_API_URL=https://your-app.railway.app/api
```

### 4.3 Redeploy
After adding environment variables, trigger a new deployment.

## 🔄 Step 5: Update CORS Settings

1. Go back to Railway dashboard
2. Update the `CORS_ORIGIN` variable to your Vercel URL:
   ```
   CORS_ORIGIN=https://your-vercel-app.vercel.app
   ```
3. Railway will automatically redeploy

## ✅ Step 6: Test Your Deployment

1. Visit your Vercel URL
2. Check that the frontend loads
3. Send a test email to the configured address
4. Verify that emails are being processed

## 🔧 Alternative Backend Hosting

If you prefer other hosting options:

### Render
- Similar to Railway
- Use the same environment variables
- Deploy from GitHub

### Heroku
- Add `Procfile` (already created)
- Set environment variables in dashboard
- Deploy from GitHub

## 🐛 Troubleshooting

### Frontend Issues
- Check browser console for CORS errors
- Verify `REACT_APP_API_URL` is set correctly
- Ensure backend URL is accessible

### Backend Issues
- Check Railway logs for errors
- Verify all environment variables are set
- Test MongoDB connection
- Check IMAP credentials

### IMAP Issues
- Ensure Gmail App Password is correct
- Check if 2FA is enabled
- Verify IMAP is enabled in Gmail settings

## 📱 Custom Domain (Optional)

### Vercel Custom Domain
1. Go to Vercel dashboard
2. Select your project
3. Go to Settings → Domains
4. Add your custom domain
5. Update DNS records as instructed

### Railway Custom Domain
1. Go to Railway dashboard
2. Select your service
3. Go to Settings → Domains
4. Add your custom domain
5. Update DNS records

## 🔒 Security Considerations

- Use strong passwords for MongoDB
- Keep Gmail App Password secure
- Regularly rotate credentials
- Monitor logs for suspicious activity
- Consider rate limiting for production

## 📊 Monitoring

- Railway provides built-in monitoring
- Vercel provides analytics
- Set up MongoDB monitoring
- Monitor IMAP connection health

## 🆘 Support

If you encounter issues:
1. Check the logs in both platforms
2. Verify all environment variables
3. Test locally first
4. Check network connectivity
5. Review this guide step by step

---

**🎉 Congratulations!** Your Email Analyzer is now live and ready to analyze emails!
