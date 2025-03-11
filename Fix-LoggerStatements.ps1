# PowerShell script to fix logger statements in all microservices

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

foreach ($service in $services) {
    $appJsPath = "services\$service\src\app.js"
    
    if (Test-Path $appJsPath) {
        Write-Host "Fixing app.js for $service..." -ForegroundColor Cyan
        
        # Read the app.js file
        $content = Get-Content -Path $appJsPath -Raw
        
        # Fix logger.info statement with template literals
        $serviceName = $service -replace "-service", "Service"
        $serviceName = (Get-Culture).TextInfo.ToTitleCase($serviceName) -replace " ", ""
        
        # Replace incorrect logger statement (various potential formats)
        $content = $content -replace "logger\.info\($serviceName service listening on port \);" , "logger.info(`\`$serviceName service listening on port \`${PORT}\`);"
        $content = $content -replace "logger\.info\($serviceName Service listening on port \);" , "logger.info(`\`$serviceName service listening on port \`${PORT}\`);"
        $content = $content -replace "logger\.info\(.*listening on port [^)]*\);", "logger.info(`\`$serviceName service listening on port \`${PORT}\`);"
        
        # Save the updated content
        Set-Content -Path $appJsPath -Value $content
    }
}

Write-Host "All logger statements have been fixed!" -ForegroundColor Green