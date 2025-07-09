#!/usr/bin/env node
/**
 * Railway Token Generator
 * 
 * This script helps you generate a Railway token without using a browser.
 * You can then use this token with railway-direct-deploy.js.
 * 
 * Usage:
 * node get-railway-token.js
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== Railway Token Generator ===\n');
console.log('This script will generate a Railway token you can use for browserless deployment.\n');

// Generate a random token (not a real Railway token, but can be used for demonstration)
const generateDemoToken = () => {
  return 'railway_' + crypto.randomBytes(32).toString('hex');
};

// Check if Railway CLI is installed
try {
  execSync('railway --version', { stdio: 'ignore' });
  console.log('Railway CLI is installed. Attempting to get a real token...');
  
  try {
    // Try to get a real token if possible
    const token = execSync('railway login --browserless', { encoding: 'utf8' }).trim();
    console.log('\nRailway token generated successfully!');
    console.log('\nYour Railway token:');
    console.log('--------------------------------------------------');
    console.log(token);
    console.log('--------------------------------------------------');
    console.log('\nRun this command to deploy using this token:');
    console.log(`node railway-direct-deploy.js ${token}`);
    
  } catch (error) {
    // If browserless login is not supported, show demo token
    console.log('\nBrowserless login not supported in this version of Railway CLI.');
    const demoToken = generateDemoToken();
    console.log('\nHere\'s a demo token (this is not a real Railway token):');
    console.log('--------------------------------------------------');
    console.log(demoToken);
    console.log('--------------------------------------------------');
    
    console.log('\nTo get a real token:');
    console.log('1. Run "railway login" in a terminal');
    console.log('2. Complete the browser login');
    console.log('3. Run "railway whoami --token"');
    console.log('4. Copy the token');
    console.log('5. Use that token with railway-direct-deploy.js');
  }
} catch (error) {
  console.log('Railway CLI is not installed. Please install it first:');
  console.log('npm install -g @railway/cli');
  
  // Show a demo token anyway
  const demoToken = generateDemoToken();
  console.log('\nHere\'s a demo token (this is not a real Railway token):');
  console.log('--------------------------------------------------');
  console.log(demoToken);
  console.log('--------------------------------------------------');
} 