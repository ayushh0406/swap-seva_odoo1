#!/usr/bin/env node
/**
 * GitHub Action Setup Script for Railway Deployment
 * 
 * This script helps you set up the GitHub Action for Railway deployment.
 * 
 * Requirements:
 * - Railway CLI installed (npm install -g @railway/cli)
 * - GitHub CLI installed (https://cli.github.com/)
 * 
 * Usage:
 * node setup-github-action.js
 */

const { exec } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('=== Mumbai-Swap GitHub Action Setup for Railway ===\n');
console.log('This script will help you set up the GitHub Action for Railway deployment.\n');

const steps = [
  {
    title: 'Login to Railway',
    command: 'railway login',
    description: 'This will open a browser window to login to Railway.'
  },
  {
    title: 'Generate Railway Token',
    command: 'railway whoami --token',
    description: 'This will generate a Railway token for GitHub Actions.',
    action: (resolve) => {
      console.log('\nExecuting: railway whoami --token');
      
      exec('railway whoami --token', (error, stdout, stderr) => {
        if (error) {
          console.error(`Error: ${error.message}`);
          resolve();
          return;
        }
        
        if (stderr) {
          console.error(`stderr: ${stderr}`);
          resolve();
          return;
        }
        
        const token = stdout.trim();
        console.log('\nYour Railway token has been generated.');
        console.log('IMPORTANT: Copy this token, you will need it in the next step:');
        console.log('\n' + token + '\n');
        
        rl.question('Have you copied the token? (y/n): ', answer => {
          if (answer.toLowerCase() === 'y') {
            resolve();
          } else {
            console.log('\nPlease copy the token before continuing.');
            process.exit(0);
          }
        });
      });
    }
  },
  {
    title: 'Login to GitHub',
    command: 'gh auth login',
    description: 'This will log you into GitHub using GitHub CLI.'
  },
  {
    title: 'Add Railway Token to GitHub Secrets',
    description: 'This will add your Railway token to your GitHub repository secrets.',
    action: () => {
      return new Promise(resolve => {
        rl.question('\nEnter your GitHub username: ', username => {
          rl.question('Enter the repository name (e.g., Swap-Sewa): ', repo => {
            rl.question('Enter the Railway token you copied earlier: ', token => {
              const command = `gh secret set RAILWAY_TOKEN -b"${token}" -R ${username}/${repo}`;
              
              console.log(`\nExecuting: gh secret set RAILWAY_TOKEN -b"[HIDDEN]" -R ${username}/${repo}`);
              
              exec(command, (error, stdout, stderr) => {
                if (error) {
                  console.error(`Error: ${error.message}`);
                  resolve();
                  return;
                }
                
                if (stderr) {
                  console.error(`stderr: ${stderr}`);
                  resolve();
                  return;
                }
                
                console.log('Railway token has been added to GitHub secrets.');
                resolve();
              });
            });
          });
        });
      });
    }
  }
];

async function runSteps() {
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    console.log(`\n[Step ${i+1}/${steps.length}] ${step.title}`);
    console.log(step.description);
    
    if (step.action) {
      await new Promise(resolve => step.action(resolve));
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
  
  console.log('\n=== Setup Complete ===');
  console.log('\nYour GitHub Action is now set up to deploy to Railway automatically!');
  console.log('When you push changes to the "main" branch, it will automatically deploy to Railway.');
  rl.close();
}

runSteps().catch(err => {
  console.error('An error occurred:', err);
  rl.close();
}); 