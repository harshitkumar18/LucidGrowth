# 📧 IMAP Configuration Guide

## 🚀 Quick Setup Steps

### 1. Create Environment File
```bash
# Copy the example file
cp backend/env.example backend/.env
```

### 2. Configure Your Email Provider

## 📮 Gmail Configuration (Recommended)

### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** if not already enabled

### Step 2: Generate App Password
1. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
2. Select **Mail** and **Other (Custom name)**
3. Enter "Email Analyzer" as the name
4. Copy the generated 16-character password

### Step 3: Update .env File
```bash
# Gmail IMAP Configuration
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=your-email@gmail.com
IMAP_PASS=your-16-character-app-password
IMAP_TLS=true
TEST_EMAIL_ADDRESS=your-email@gmail.com
TEST_EMAIL_SUBJECT=Email Analysis Test
```

## 📮 Outlook/Hotmail Configuration

### Step 1: Enable IMAP Access
1. Go to [Outlook Settings](https://outlook.live.com/mail/options/mail/accounts)
2. Enable **IMAP access**

### Step 2: Update .env File
```bash
# Outlook IMAP Configuration
IMAP_HOST=outlook.office365.com
IMAP_PORT=993
IMAP_USER=your-email@outlook.com
IMAP_PASS=your-email-password
IMAP_TLS=true
TEST_EMAIL_ADDRESS=your-email@outlook.com
TEST_EMAIL_SUBJECT=Email Analysis Test
```

## 📮 Yahoo Mail Configuration

### Step 1: Enable IMAP Access
1. Go to [Yahoo Mail Settings](https://mail.yahoo.com/d/settings/1)
2. Enable **IMAP access**

### Step 2: Generate App Password
1. Go to [Yahoo Account Security](https://login.yahoo.com/account/security)
2. Generate an **App Password** for "Email Analyzer"

### Step 3: Update .env File
```bash
# Yahoo IMAP Configuration
IMAP_HOST=imap.mail.yahoo.com
IMAP_PORT=993
IMAP_USER=your-email@yahoo.com
IMAP_PASS=your-app-password
IMAP_TLS=true
TEST_EMAIL_ADDRESS=your-email@yahoo.com
TEST_EMAIL_SUBJECT=Email Analysis Test
```

## 📮 Other Email Providers

### Custom IMAP Server
```bash
# Generic IMAP Configuration
IMAP_HOST=your-imap-server.com
IMAP_PORT=993
IMAP_USER=your-email@domain.com
IMAP_PASS=your-password
IMAP_TLS=true
TEST_EMAIL_ADDRESS=your-email@domain.com
TEST_EMAIL_SUBJECT=Email Analysis Test
```

## 🔧 Complete .env File Example

```bash
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/email-analyzer

# IMAP Configuration (Gmail Example)
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=your-email@gmail.com
IMAP_PASS=abcd-efgh-ijkl-mnop
IMAP_TLS=true
IMAP_MAILBOX=INBOX
IMAP_POLL_INTERVAL=30000

# Email Settings
TEST_EMAIL_ADDRESS=your-email@gmail.com
TEST_EMAIL_SUBJECT=Email Analysis Test

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

## 🧪 Testing Your Configuration

### 1. Start the Backend
```bash
cd backend
npm run start:dev
```

### 2. Check for Connection Success
Look for these logs:
```
✅ [EmailService] IMAP connection established
✅ [EmailService] Monitoring for emails with subject: "Email Analysis Test"
```

### 3. Send Test Email
1. Open your email client
2. Send an email to your configured email address
3. Use the exact subject: "Email Analysis Test"
4. Check the frontend at http://localhost:3000

## 🔍 Troubleshooting

### Common Issues:

#### 1. "Authentication Failed"
- **Gmail**: Use App Password, not regular password
- **Outlook**: Enable IMAP access in settings
- **Yahoo**: Generate App Password

#### 2. "Connection Refused"
- Check if IMAP is enabled for your email provider
- Verify the IMAP_HOST and IMAP_PORT are correct
- Ensure your firewall allows the connection

#### 3. "TLS/SSL Error"
- Set `IMAP_TLS=true` for most providers
- Some providers use port 143 with STARTTLS

### Port Numbers by Provider:
- **Gmail**: 993 (SSL/TLS)
- **Outlook**: 993 (SSL/TLS)
- **Yahoo**: 993 (SSL/TLS)
- **Custom**: Usually 993 or 143

## 🛡️ Security Best Practices

1. **Never commit .env file** to version control
2. **Use App Passwords** instead of main passwords
3. **Enable 2FA** on your email account
4. **Use strong, unique passwords**
5. **Regularly rotate App Passwords**

## 📞 Support

If you encounter issues:
1. Check the backend logs for specific error messages
2. Verify your email provider's IMAP settings
3. Test with a different email provider
4. Check firewall and network settings

---

**Ready to test?** Start the backend and send a test email! 🚀
