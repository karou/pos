# PowerShell script to create package.json files for all components

# Microservice package.json template
$microservicePackageJson = @'
{
  "name": "SERVICE_NAME",
  "version": "1.0.0",
  "description": "SERVICE_DESCRIPTION microservice for POS system",
  "main": "src/app.js",
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "test": "jest",
    "lint": "eslint ."
  },
  "dependencies": {
    "amqplib": "^0.10.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "joi": "^17.11.0",
    "mongoose": "^7.6.3",
    "pino": "^8.16.1",
    "pino-pretty": "^10.2.3",
    "redis": "^4.6.10"
  },
  "devDependencies": {
    "eslint": "^8.52.0",
    "jest": "^29.7.0",
    "nodemon": "^3.0.1",
    "supertest": "^6.3.3"
  }
}
'@

# Frontend package.json template
$frontendPackageJson = @'
{
  "name": "FRONTEND_NAME",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@testing-library/jest-dom": "^5.17.0",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^13.5.0",
    "axios": "^1.5.1",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.16.0",
    "react-scripts": "5.0.1",
    "web-vitals": "^2.1.4"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
'@

# API Gateway package.json
$apiGatewayPackageJson = @'
{
  "name": "api-gateway",
  "version": "1.0.0",
  "description": "API Gateway for POS System",
  "main": "src/app.js",
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "test": "jest",
    "lint": "eslint ."
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "express": "^4.18.2",
    "express-rate-limit": "^6.7.0",
    "helmet": "^6.1.5",
    "http-proxy-middleware": "^2.0.6",
    "jsonwebtoken": "^9.0.0",
    "pino": "^8.11.0",
    "pino-pretty": "^10.0.0"
  },
  "devDependencies": {
    "eslint": "^8.38.0",
    "jest": "^29.5.0",
    "nodemon": "^2.0.22",
    "supertest": "^6.3.3"
  }
}
'@

# Microservices configuration
$microservices = @(
    @{Name = "auth-service"; Description = "Authentication and authorization"},
    @{Name = "product-service"; Description = "Product management"},
    @{Name = "inventory-service"; Description = "Inventory management"},
    @{Name = "order-service"; Description = "Order processing"},
    @{Name = "payment-service"; Description = "Payment processing"},
    @{Name = "store-service"; Description = "Store management"},
    @{Name = "sync-service"; Description = "Offline synchronization"},
    @{Name = "notification-service"; Description = "Notification handling"}
)

# Frontend apps
$frontendApps = @(
    "admin-dashboard",
    "pos-terminal"
)

# Create microservice package.json files
foreach ($service in $microservices) {
    $path = "services\$($service.Name)\package.json"
    $content = $microservicePackageJson -replace "SERVICE_NAME", $service.Name -replace "SERVICE_DESCRIPTION", $service.Description
    
    Write-Host "Creating package.json for $($service.Name)..." -ForegroundColor Cyan
    Set-Content -Path $path -Value $content
}

# Create frontend package.json files
foreach ($app in $frontendApps) {
    $path = "frontend\$app\package.json"
    $content = $frontendPackageJson -replace "FRONTEND_NAME", $app
    
    Write-Host "Creating package.json for $app..." -ForegroundColor Cyan
    Set-Content -Path $path -Value $content
}

# Create API Gateway package.json
Write-Host "Creating package.json for API Gateway..." -ForegroundColor Cyan
Set-Content -Path "api-gateway\package.json" -Value $apiGatewayPackageJson

Write-Host "Done! All package.json files have been created." -ForegroundColor Green