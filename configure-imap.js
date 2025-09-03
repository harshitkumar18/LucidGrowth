const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 IMAP Configuration Setup');
console.log('============================\n');

const questions = [
  {
    key: 'IMAP_HOST',
    question: 'IMAP Host (e.g., imap.gmail.com): ',
    default: 'imap.gmail.com'
  },
  {
    key: 'IMAP_PORT',
    question: 'IMAP Port (e.g., 993): ',
    default: '993'
  },
  {
    key: 'IMAP_USER',
    question: 'Your Email Address: ',
    default: ''
  },
  {
    key: 'IMAP_PASS',
    question: 'Your Email Password/App Password: ',
    default: ''
  },
  {
    key: 'TEST_EMAIL_ADDRESS',
    question: 'Test Email Address (same as above): ',
    default: ''
  }
];

const config = {};

function askQuestion(index) {
  if (index >= questions.length) {
    createEnvFile();
    return;
  }

  const q = questions[index];
  rl.question(q.question, (answer) => {
    config[q.key] = answer || q.default;
    
    // Auto-fill test email address if it's the same as IMAP_USER
    if (q.key === 'IMAP_USER' && !config.TEST_EMAIL_ADDRESS) {
      config.TEST_EMAIL_ADDRESS = answer || q.default;
    }
    
    askQuestion(index + 1);
  });
}

function createEnvFile() {
  const envContent = `# Database Configuration
MONGODB_URI=mongodb://localhost:27017/email-analyzer

# IMAP Configuration
IMAP_HOST=${config.IMAP_HOST}
IMAP_PORT=${config.IMAP_PORT}
IMAP_USER=${config.IMAP_USER}
IMAP_PASS=${config.IMAP_PASS}
IMAP_TLS=true
IMAP_MAILBOX=INBOX
IMAP_POLL_INTERVAL=30000

# Email Settings
TEST_EMAIL_ADDRESS=${config.TEST_EMAIL_ADDRESS}
TEST_EMAIL_SUBJECT=Email Analysis Test

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
`;

  const envPath = path.join(__dirname, 'backend', '.env');
  
  try {
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ Configuration saved to backend/.env');
    console.log('\n📧 IMAP Configuration Summary:');
    console.log(`   Host: ${config.IMAP_HOST}`);
    console.log(`   Port: ${config.IMAP_PORT}`);
    console.log(`   User: ${config.IMAP_USER}`);
    console.log(`   Test Email: ${config.TEST_EMAIL_ADDRESS}`);
    console.log('\n🚀 Next steps:');
    console.log('   1. Start the backend: cd backend && npm run start:dev');
    console.log('   2. Start the frontend: cd frontend && npm run dev');
    console.log('   3. Send a test email with subject: "Email Analysis Test"');
    console.log('\n📖 For detailed setup instructions, see IMAP_SETUP_GUIDE.md');
  } catch (error) {
    console.error('❌ Error creating .env file:', error.message);
  }
  
  rl.close();
}

// Start the configuration process
askQuestion(0);
