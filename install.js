#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 LucidGrowth Email Analyzer - Installation Script');
console.log('================================================\n');

// Check if Node.js is installed
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
  console.log(`✅ Node.js version: ${nodeVersion}`);
} catch (error) {
  console.error('❌ Node.js is not installed. Please install Node.js v16 or higher.');
  process.exit(1);
}

// Check if npm is installed
try {
  const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
  console.log(`✅ npm version: ${npmVersion}\n`);
} catch (error) {
  console.error('❌ npm is not installed. Please install npm.');
  process.exit(1);
}

// Install root dependencies
console.log('📦 Installing root dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Root dependencies installed\n');
} catch (error) {
  console.error('❌ Failed to install root dependencies');
  process.exit(1);
}

// Install backend dependencies
console.log('📦 Installing backend dependencies...');
try {
  execSync('cd backend && npm install', { stdio: 'inherit' });
  console.log('✅ Backend dependencies installed\n');
} catch (error) {
  console.error('❌ Failed to install backend dependencies');
  process.exit(1);
}

// Install frontend dependencies
console.log('📦 Installing frontend dependencies...');
try {
  execSync('cd frontend && npm install', { stdio: 'inherit' });
  console.log('✅ Frontend dependencies installed\n');
} catch (error) {
  console.error('❌ Failed to install frontend dependencies');
  process.exit(1);
}

// Create backend .env file if it doesn't exist
const backendEnvPath = path.join(__dirname, 'backend', '.env');
if (!fs.existsSync(backendEnvPath)) {
  console.log('📝 Creating backend .env file...');
  const envContent = `# Database Configuration
MONGODB_URI=mongodb://localhost:27017/email-analyzer

# IMAP Configuration
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
`;
  
  fs.writeFileSync(backendEnvPath, envContent);
  console.log('✅ Backend .env file created\n');
} else {
  console.log('✅ Backend .env file already exists\n');
}

console.log('🎉 Installation completed successfully!');
console.log('\n📋 Next Steps:');
console.log('1. Edit backend/.env with your email credentials');
console.log('2. Start MongoDB (if using local instance)');
console.log('3. Run: npm run dev');
console.log('4. Open http://localhost:3000 in your browser');
console.log('\n📖 For detailed setup instructions, see SETUP.md');
console.log('\n🔧 Gmail Setup:');
console.log('- Enable 2-Factor Authentication');
console.log('- Generate an App Password');
console.log('- Use the App Password in IMAP_PASS');
