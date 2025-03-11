# PowerShell script to update Dockerfiles in all microservice directories

$services = @(
    "auth-service",
    "product-service",
    "inventory-service",
    "order-service",
    "payment-service",
    "store-service",
    "sync-service",
    "notification-service"
)

$dockerfileContent = @"
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Using npm install instead of npm ci
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["node", "src/app.js"]
"@

foreach ($service in $services) {
    $path = "services\$service\Dockerfile"
    Write-Host "Updating Dockerfile for $service..." -ForegroundColor Cyan
    Set-Content -Path $path -Value $dockerfileContent
}

Write-Host "Done! All microservice Dockerfiles have been updated." -ForegroundColor Green