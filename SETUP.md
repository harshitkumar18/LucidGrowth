# Email Analyzer Setup Guide

This guide will help you set up and run the Email Analyzer system step by step.

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (local or cloud instance) - [Download here](https://www.mongodb.com/try/download/community)
- **Git** (optional, for version control)

## Quick Start

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install all project dependencies (backend + frontend)
npm run install:all
```

### 2. Environment Configuration

#### Backend Environment Setup

1. Copy the environment template:
   ```bash
   cp backend/env.example backend/.env
   ```

2. Edit `backend/.env` with your configuration:
   ```env
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/email-analyzer

   # IMAP Configuration (Gmail example)
   IMAP_HOST=imap.gmail.com
   IMAP_PORT=993
   IMAP_USER=your-email@gmail.com
   IMAP_PASS=your-app-password
   IMAP_TLS=true

   # Email Settings
   TEST_EMAIL_ADDRESS=your-email@gmail.com
   TEST_EMAIL_SUBJECT=Email Analysis Test

   # Server Configuration
   PORT=3001
   NODE_ENV=development

   # CORS Configuration
   CORS_ORIGIN=http://localhost:3000
   ```

#### Gmail IMAP Setup

For Gmail, you'll need to:

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password in `IMAP_PASS`

### 3. Start the Application

#### Development Mode (Recommended)
```bash
# Start both backend and frontend
npm run dev
```

#### Manual Start
```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm start
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api

## Testing the System

1. **Open the application** in your browser (http://localhost:3000)
2. **Note the test email address and subject** displayed in the System Status section
3. **Send a test email** to the displayed address with the exact subject line
4. **Watch the system** automatically detect and analyze the email
5. **View the results** showing the receiving chain and ESP detection

## Project Structure

```
LucidGrowth/
├── backend/                 # NestJS backend
│   ├── src/
│   │   ├── email/          # Email processing modules
│   │   │   ├── email.service.ts
│   │   │   ├── email.controller.ts
│   │   │   ├── email-analysis.service.ts
│   │   │   └── email.module.ts
│   │   ├── database/       # MongoDB schemas and connections
│   │   │   ├── schemas/email.schema.ts
│   │   │   └── database.module.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── env.example
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   │   ├── EmailCard.tsx
│   │   │   ├── ReceivingChain.tsx
│   │   │   ├── ESPDetails.tsx
│   │   │   └── SystemStatus.tsx
│   │   ├── pages/          # Application pages
│   │   │   └── Dashboard.tsx
│   │   ├── services/       # API integration
│   │   │   └── api.ts
│   │   ├── types/          # TypeScript types
│   │   │   └── email.ts
│   │   ├── App.tsx
│   │   ├── App.css
│   │   └── index.tsx
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── webpack.config.js
├── package.json
├── README.md
└── SETUP.md
```

## API Endpoints

### Email Endpoints
- `GET /api/emails` - Get all processed emails
- `GET /api/emails/:id` - Get specific email by ID
- `GET /api/emails/message/:messageId` - Get email by message ID
- `GET /api/emails/status` - Get system status
- `POST /api/emails/process` - Manually trigger email processing

## Troubleshooting

### Common Issues

#### 1. IMAP Connection Failed
- **Check credentials**: Ensure email and password are correct
- **Gmail users**: Use App Password, not regular password
- **Check IMAP settings**: Verify host, port, and TLS settings

#### 2. MongoDB Connection Error
- **Start MongoDB**: Ensure MongoDB service is running
- **Check connection string**: Verify MONGODB_URI in .env file
- **Network issues**: Check firewall and network connectivity

#### 3. Frontend Can't Connect to Backend
- **Check CORS settings**: Verify CORS_ORIGIN in backend .env
- **Port conflicts**: Ensure ports 3000 and 3001 are available
- **Backend running**: Verify backend is running on port 3001

#### 4. No Emails Being Detected
- **Check subject line**: Use exact subject from system status
- **IMAP folder**: Ensure emails are in INBOX
- **Email format**: Send plain text emails for best results

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

### Logs

Backend logs are displayed in the terminal where you started the backend server.

## Production Deployment

### Backend Deployment
1. Build the application:
   ```bash
   cd backend
   npm run build
   ```

2. Start in production mode:
   ```bash
   npm run start:prod
   ```

### Frontend Deployment
1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Serve the `dist` folder with a web server (nginx, Apache, etc.)

### Environment Variables for Production
- Set `NODE_ENV=production`
- Use secure MongoDB connection string
- Configure proper CORS origins
- Use environment-specific IMAP credentials

## Security Considerations

1. **Environment Variables**: Never commit .env files to version control
2. **IMAP Credentials**: Use App Passwords for Gmail, not regular passwords
3. **CORS**: Configure appropriate origins for production
4. **MongoDB**: Use authentication and SSL in production
5. **Rate Limiting**: Consider implementing rate limiting for API endpoints

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Check the console logs for error messages
4. Ensure all environment variables are correctly set
5. Test with a simple email first

## Features

### ✅ Implemented Features
- IMAP email monitoring
- Automatic email detection and processing
- Receiving chain analysis
- ESP (Email Service Provider) detection
- Responsive web interface
- Real-time status updates
- Email history and details
- Professional UI/UX design

### 🔍 ESP Detection
The system can detect:
- Gmail
- Outlook/Hotmail
- Yahoo Mail
- Amazon SES
- SendGrid
- Mailgun
- Zoho Mail
- Custom/Private servers

### 📊 Analysis Features
- Complete receiving chain visualization
- ESP confidence scoring
- Detection indicators
- Email metadata extraction
- Timestamp analysis
- Server identification
