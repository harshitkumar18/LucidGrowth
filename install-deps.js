#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Installing Email Analyzer Dependencies');
console.log('==========================================\n');

// Function to run command with error handling
function runCommand(command, cwd = process.cwd()) {
  try {
    console.log(`Running: ${command} in ${cwd}`);
    execSync(command, { 
      cwd, 
      stdio: 'inherit',
      shell: true 
    });
    return true;
  } catch (error) {
    console.error(`❌ Error running command: ${command}`);
    console.error(error.message);
    return false;
  }
}

// Install root dependencies
console.log('📦 Installing root dependencies...');
if (!runCommand('npm install')) {
  console.error('❌ Failed to install root dependencies');
  process.exit(1);
}

// Install backend dependencies
console.log('\n📦 Installing backend dependencies...');
if (!runCommand('npm install', path.join(__dirname, 'backend'))) {
  console.error('❌ Failed to install backend dependencies');
  process.exit(1);
}

// Install frontend dependencies
console.log('\n📦 Installing frontend dependencies...');
if (!runCommand('npm install', path.join(__dirname, 'frontend'))) {
  console.error('❌ Failed to install frontend dependencies');
  process.exit(1);
}

console.log('\n🎉 All dependencies installed successfully!');
console.log('\n📋 Next Steps:');
console.log('1. Edit backend/.env with your email credentials');
console.log('2. Start MongoDB (if using local instance)');
console.log('3. Run: npm run dev');
console.log('4. Open http://localhost:3000 in your browser');
