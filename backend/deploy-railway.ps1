# Railway Deployment PowerShell Script
# This script helps you deploy your Mumbai-Swap backend to Railway

Write-Host "=== Mumbai-Swap Railway Deployment ===" -ForegroundColor Cyan
Write-Host ""

# Check if Railway CLI is installed
try {
    $railwayVersion = railway --version
    Write-Host "Railway CLI is installed: $railwayVersion" -ForegroundColor Green
} catch {
    Write-Host "Railway CLI is not installed. Installing now..." -ForegroundColor Yellow
    npm install -g @railway/cli
}

# Step 1: Login to Railway
Write-Host ""
Write-Host "Step 1: Login to Railway" -ForegroundColor Cyan
Write-Host "This will open a browser window to login to Railway."
$loginConfirm = Read-Host "Continue? (y/n)"
if ($loginConfirm -eq "y") {
    railway login
} else {
    Write-Host "Login skipped. Exiting..." -ForegroundColor Red
    exit
}

# Step 2: Create a new project or link to existing one
Write-Host ""
Write-Host "Step 2: Create or link to a Railway project" -ForegroundColor Cyan
$projectOption = Read-Host "Do you want to create a new project (n) or link to an existing one (e)? (n/e)"

if ($projectOption -eq "n") {
    $projectName = "mumbai-swap-backend-" + (Get-Date).ToString("yyyyMMddHHmmss")
    Write-Host "Creating new project: $projectName" -ForegroundColor Yellow
    railway project create $projectName
    railway link
} else {
    Write-Host "Linking to existing project..." -ForegroundColor Yellow
    railway link
}

# Step 3: Set environment variables
Write-Host ""
Write-Host "Step 3: Set environment variables" -ForegroundColor Cyan
$setEnvVars = Read-Host "Do you want to set environment variables? (y/n)"
if ($setEnvVars -eq "y") {
    railway variables set NODE_ENV=production
    railway variables set FRONTEND_URL=https://swap-sewa.vercel.app
    
    # Generate a random JWT secret
    $jwtSecret = "mumbai_swap_jwt_" + [System.Guid]::NewGuid().ToString().Substring(0, 8)
    railway variables set JWT_SECRET=$jwtSecret
    
    # MongoDB URI
    $mongoDefault = "mongodb+srv://id:Pass@cluster0.ne7hd.mongodb.net/Swap_sewa1?retryWrites=true&w=majority"
    $mongoUri = Read-Host "Enter MongoDB URI (press Enter to use default)"
    if ([string]::IsNullOrEmpty($mongoUri)) {
        $mongoUri = $mongoDefault
    }
    railway variables set MONGODB_URI=$mongoUri
}

# Step 4: Deploy
Write-Host ""
Write-Host "Step 4: Deploy to Railway" -ForegroundColor Cyan
$deployConfirm = Read-Host "Ready to deploy? (y/n)"
if ($deployConfirm -eq "y") {
    Write-Host "Deploying to Railway..." -ForegroundColor Yellow
    railway up
    
    # Get the deployment URL
    Write-Host ""
    Write-Host "Getting deployment URL..." -ForegroundColor Cyan
    $domain = railway domain
    
    Write-Host ""
    Write-Host "Deployment Complete!" -ForegroundColor Green
    Write-Host "Your backend is deployed at: $domain" -ForegroundColor Green
    Write-Host "Update your frontend to use this backend URL." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Done! Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 