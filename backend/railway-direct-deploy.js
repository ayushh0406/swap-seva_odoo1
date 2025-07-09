#!/usr/bin/env node
/**
 * Railway Direct Deployment Script
 * 
 * This script allows you to deploy to Railway without browser login,
 * using a token directly.
 * 
 * Usage:
 * node railway-direct-deploy.js YOUR_RAILWAY_TOKEN
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get the token from command line arguments
const token = process.argv[2];

if (!token) {
  console.error('Please provide a Railway token as a command line argument.');
  console.error('Usage: node railway-direct-deploy.js YOUR_RAILWAY_TOKEN');
  process.exit(1);
}

console.log('=== Mumbai-Swap Direct Railway Deployment ===\n');

// Create a temporary .railwayrc file with the token
const rcFilePath = path.join(process.env.HOME || process.env.USERPROFILE, '.railway', 'config.json');
const rcDirPath = path.dirname(rcFilePath);

try {
  // Make sure the directory exists
  if (!fs.existsSync(rcDirPath)) {
    fs.mkdirSync(rcDirPath, { recursive: true });
  }
  
  // Write the config file
  const config = {
    token
  };
  
  fs.writeFileSync(rcFilePath, JSON.stringify(config, null, 2));
  console.log('Railway token configured.');
  
  // Run the deployment commands
  console.log('\n1. Checking Railway connection...');
  try {
    const whoami = execSync('railway whoami', { encoding: 'utf8' });
    console.log(whoami);
  } catch (error) {
    console.error('Error connecting to Railway. Please check your token.');
    process.exit(1);
  }
  
  console.log('\n2. Creating a new project (if one doesn\'t exist)...');
  try {
    // Check if already linked to a project
    const isLinked = execSync('railway status', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    console.log('Already linked to a project.');
  } catch (error) {
    // If not linked, create a new project
    console.log('Creating a new project...');
    const projectName = 'mumbai-swap-backend-' + Math.floor(Date.now() / 1000);
    execSync(`railway project create ${projectName}`, { stdio: 'inherit' });
    execSync('railway link', { stdio: 'inherit' });
  }
  
  console.log('\n3. Setting environment variables...');
  execSync('railway variables set NODE_ENV=production', { stdio: 'inherit' });
  execSync('railway variables set FRONTEND_URL=https://swap-sewa.vercel.app', { stdio: 'inherit' });
  execSync(`railway variables set JWT_SECRET=mumbai_swap_jwt_${Math.random().toString(36).slice(2)}`, { stdio: 'inherit' });
  
  // Ask for MongoDB URI
  console.log('\nPlease enter your MongoDB URI:');
  console.log('(Press Enter to use default: mongodb+srv://id:Pass@cluster0.ne7hd.mongodb.net/Swap_sewa1?retryWrites=true&w=majority)');
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  readline.question('MongoDB URI: ', (mongoUri) => {
    const uri = mongoUri || 'mongodb+srv://id:Pass@cluster0.ne7hd.mongodb.net/Swap_sewa1?retryWrites=true&w=majority';
    
    try {
      execSync(`railway variables set MONGODB_URI=${uri}`, { stdio: 'inherit' });
      
      console.log('\n4. Deploying to Railway...');
      execSync('railway up', { stdio: 'inherit' });
      
      console.log('\n5. Getting deployment URL...');
      const domain = execSync('railway domain', { encoding: 'utf8' });
      console.log(`\nYour backend is deployed at: ${domain.trim()}`);
      
      console.log('\n=== Deployment Complete ===');
      console.log('Update your frontend to use this backend URL.');
      
    } catch (error) {
      console.error('An error occurred during deployment:', error.message);
    } finally {
      readline.close();
    }
  });
  
} catch (error) {
  console.error('An error occurred:', error.message);
  process.exit(1);
} 