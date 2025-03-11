# PowerShell script to disable service worker in POS terminal

# Step 1: Create a simplified index.js without service worker registration
$indexJs = @'
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
'@

# Write the updated index.js file
Write-Host "Updating index.js to remove service worker references..." -ForegroundColor Cyan
Set-Content -Path "frontend\pos-terminal\src\index.js" -Value $indexJs

# Step 2: Delete any service worker files
Write-Host "Removing service worker files..." -ForegroundColor Cyan
$serviceWorkerFiles = @(
    "frontend\pos-terminal\src\service-worker.js",
    "frontend\pos-terminal\src\serviceWorkerRegistration.js",
    "frontend\pos-terminal\public\service-worker.js"
)

foreach ($file in $serviceWorkerFiles) {
    if (Test-Path $file) {
        Remove-Item -Path $file -Force
        Write-Host "  Removed $file" -ForegroundColor Gray
    }
}

# Step 3: Update package.json to disable PWA/service worker
Write-Host "Reading package.json..." -ForegroundColor Cyan
$packageJsonPath = "frontend\pos-terminal\package.json"
$packageJson = Get-Content -Path $packageJsonPath -Raw | ConvertFrom-Json

# Add property to ensure CRA doesn't try to register a service worker
$packageJson | Add-Member -Type NoteProperty -Name "homepage" -Value "." -Force

# Write updated package.json
Write-Host "Updating package.json..." -ForegroundColor Cyan
$packageJson | ConvertTo-Json -Depth 10 | Set-Content -Path $packageJsonPath

Write-Host "Service worker has been disabled!" -ForegroundColor Green