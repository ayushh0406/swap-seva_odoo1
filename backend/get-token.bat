@echo off
echo === Railway Token Generator ===
echo.
echo This script will help you get a Railway token.
echo.

echo 1. First, we'll log you in to Railway...
railway login

echo.
echo 2. Now, we'll get your token...
railway whoami --token

echo.
echo Copy the token above and use it with railway-direct-deploy.js:
echo node railway-direct-deploy.js YOUR_TOKEN
echo.

pause 