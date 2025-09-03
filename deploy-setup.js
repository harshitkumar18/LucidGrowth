#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Email Analyzer Deployment Setup\n');

// Check if we're in the right directory
if (!fs.existsSync('backend') || !fs.existsSync('frontend')) {
    console.error('❌ Please run this script from the project root directory');
    process.exit(1);
}

console.log('✅ Project structure looks good');

// Check for required files
const requiredFiles = [
    'backend/package.json',
    'frontend/index.html',
    'backend/src/main.ts',
    'vercel.json',
    'backend/railway.json'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file} exists`);
    } else {
        console.log(`❌ ${file} missing`);
        allFilesExist = false;
    }
});

if (!allFilesExist) {
    console.error('\n❌ Some required files are missing. Please check the setup.');
    process.exit(1);
}

console.log('\n📋 Deployment Checklist:');
console.log('1. ✅ Push code to GitHub');
console.log('2. ⏳ Setup MongoDB Atlas');
console.log('3. ⏳ Generate Gmail App Password');
console.log('4. ⏳ Deploy backend to Railway');
console.log('5. ⏳ Deploy frontend to Vercel');
console.log('6. ⏳ Configure environment variables');
console.log('7. ⏳ Test deployment');

console.log('\n📖 Next Steps:');
console.log('1. Read DEPLOYMENT.md for detailed instructions');
console.log('2. Setup MongoDB Atlas and get connection string');
console.log('3. Generate Gmail App Password');
console.log('4. Deploy backend to Railway with environment variables');
console.log('5. Deploy frontend to Vercel');
console.log('6. Update CORS_ORIGIN in Railway with your Vercel URL');

console.log('\n🔗 Useful Links:');
console.log('- MongoDB Atlas: https://www.mongodb.com/atlas');
console.log('- Railway: https://railway.app');
console.log('- Vercel: https://vercel.com');
console.log('- Gmail App Passwords: https://support.google.com/accounts/answer/185833');

console.log('\n🎉 Ready for deployment!');
