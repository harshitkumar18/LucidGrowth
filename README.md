# LucidGrowth Email Analyzer

A comprehensive email analysis system that automatically identifies the receiving chain and ESP (Email Service Provider) type of any email using IMAP integration.

## 🚀 Features

- **IMAP Email Monitoring**: Automatically detects and processes incoming emails
- **Receiving Chain Analysis**: Extracts and visualizes the email's journey through servers
- **ESP Detection**: Identifies the Email Service Provider used to send the email
- **Real-time Processing**: Live email analysis with responsive UI
- **Professional Dashboard**: Clean, intuitive interface for technical and non-technical users

## 🛠️ Tech Stack

- **Frontend**: React.js with modern UI components
- **Backend**: Node.js with NestJS framework
- **Database**: MongoDB for email storage and metadata
- **Email Processing**: IMAP integration for email monitoring

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Email account with IMAP access (Gmail, Outlook, etc.)

## 🚀 Quick Start

1. **Clone and Install Dependencies**
   ```bash
   git clone <repository-url>
   cd LucidGrowth
   npm run install:all
   ```

2. **Environment Setup**
   ```bash
   # Copy backend environment template
   cp backend/.env.example backend/.env
   
   # Edit backend/.env with your configuration
   # - MongoDB connection string
   # - IMAP email credentials
   # - Email address for testing
   ```

3. **Start Development Servers**
   ```bash
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## 📧 How to Test

1. Open the application in your browser
2. Note the displayed email address and subject line
3. Send a test email to the displayed address with the specified subject
4. Watch the system automatically process and analyze the email
5. View the receiving chain and ESP detection results

## 📁 Project Structure

```
LucidGrowth/
├── backend/                 # NestJS backend
│   ├── src/
│   │   ├── email/          # Email processing modules
│   │   ├── database/       # MongoDB schemas and connections
│   │   └── common/         # Shared utilities
│   └── package.json
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Application pages
│   │   └── services/       # API integration
│   └── package.json
└── README.md
```

## 🔧 Configuration

### Backend Environment Variables

```env
# Database
MONGODB_URI=mongodb://localhost:27017/email-analyzer

# IMAP Configuration
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=your-email@gmail.com
IMAP_PASS=your-app-password

# Email Settings
TEST_EMAIL_ADDRESS=your-email@gmail.com
TEST_EMAIL_SUBJECT=Email Analysis Test

# Server
PORT=3001
```

## 📊 API Endpoints

- `GET /api/emails` - Retrieve all processed emails
- `GET /api/emails/:id` - Get specific email analysis
- `POST /api/emails/process` - Manually trigger email processing
- `GET /api/status` - System status and configuration

## 🎨 UI Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Live email processing status
- **Visual Timeline**: Interactive receiving chain visualization
- **ESP Badges**: Clear identification of email service providers
- **Professional Dashboard**: Clean, modern interface

## 🔍 Email Analysis

The system analyzes email headers to extract:

1. **Receiving Chain**: Complete path from sender to recipient
2. **ESP Type**: Email service provider (Gmail, Outlook, Amazon SES, etc.)
3. **Timestamps**: Processing times and delays
4. **Server Information**: Mail server details and configurations

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For questions or issues, please open a GitHub issue or contact the development team.
