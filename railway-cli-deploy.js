#!/usr/bin/env node
/**
 * Railway CLI Deployment Helper
 * 
 * This script helps with deploying to Railway using their CLI.
 * You need to have Railway CLI installed to use this.
 * 
 * Installation:
 * npm install -g @railway/cli
 * 
 * Usage:
 * node railway-cli-deploy.js
 */

const { exec } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('=== Mumbai-Swap Railway Deployment Helper ===\n');

const steps = [
  {
    title: 'Login to Railway',
    command: 'railway login',
    description: 'This will open a browser window to login to Railway.'
  },
  {
    title: 'Link to Railway Project',
    command: 'railway link',
    description: 'This will link your local project to a Railway project.'
  },
  {
    title: 'Add environment variables',
    command: null,
    description: 'You\'ll need to add these environment variables in the Railway dashboard:',
    action: () => {
      console.log('\nRequired environment variables:');
      console.log('- NODE_ENV=production');
      console.log('- FRONTEND_URL=https://swap-sewa.vercel.app');
      console.log('- JWT_SECRET=[generate a secure random string]');
      console.log('- MONGODB_URI=[your MongoDB connection string]');
      
      return new Promise(resolve => {
        rl.question('\nHave you added these environment variables? (y/n): ', answer => {
          if (answer.toLowerCase() === 'y') {
            resolve();
          } else {
            console.log('\nPlease add the environment variables in the Railway dashboard before continuing.');
            process.exit(0);
          }
        });
      });
    }
  },
  {
    title: 'Deploy to Railway',
    command: 'railway up',
    description: 'This will deploy your project to Railway.'
  },
  {
    title: 'Get your deployment URL',
    command: 'railway domain',
    description: 'This will show your deployment URL.'
  }
];

async function runSteps() {
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    console.log(`\n[Step ${i+1}/${steps.length}] ${step.title}`);
    console.log(step.description);
    
    if (step.action) {
      await step.action();
      continue;
    }
    
    if (step.command) {
      await new Promise(resolve => {
        rl.question(`\nRun "${step.command}"? (y/n): `, answer => {
          if (answer.toLowerCase() === 'y') {
            console.log(`\nExecuting: ${step.command}`);
            
            const childProcess = exec(step.command);
            
            childProcess.stdout.on('data', data => {
              process.stdout.write(data);
            });
            
            childProcess.stderr.on('data', data => {
              process.stderr.write(data);
            });
            
            childProcess.on('close', code => {
              console.log(`\nCommand completed with code ${code}`);
              resolve();
            });
          } else {
            console.log('\nSkipping this step.');
            resolve();
          }
        });
      });
    }
  }
  
  console.log('\n=== Deployment Complete ===');
  console.log('\nNow update your frontend with the new backend URL!');
  rl.close();
}

runSteps().catch(err => {
  console.error('An error occurred:', err);
  rl.close();
}); 