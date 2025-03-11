# PowerShell script to set up frontend applications with basic React structure

$frontendApps = @(
    "admin-dashboard",
    "pos-terminal"
)

# Create index.html template
$indexHtmlTemplate = @'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="POS System - APP_NAME"
    />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <title>POS System - APP_NAME</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
'@

# Create index.js template
$indexJsTemplate = @'
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
'@

# Create App.js template
$appJsTemplate = @'
import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>POS System - APP_NAME</h1>
        <p>Welcome to our Point of Sales System</p>
      </header>
    </div>
  );
}

export default App;
'@

# Create index.css template
$indexCssTemplate = @'
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}
'@

# Create App.css template
$appCssTemplate = @'
.App {
  text-align: center;
}

.App-header {
  background-color: #282c34;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
  color: white;
}

.App-link {
  color: #61dafb;
}
'@

# Create manifest.json template
$manifestJsonTemplate = @'
{
  "short_name": "APP_NAME",
  "name": "POS System - APP_NAME",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    },
    {
      "src": "logo192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "logo512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff"
}
'@

# Loop through each frontend app and set up the necessary files
foreach ($app in $frontendApps) {
    $appPath = "frontend\$app"
    
    Write-Host "Setting up $app..." -ForegroundColor Cyan
    
    # Create folder structure
    $publicPath = "$appPath\public"
    $srcPath = "$appPath\src"
    
    New-Item -ItemType Directory -Path $publicPath -Force | Out-Null
    New-Item -ItemType Directory -Path $srcPath -Force | Out-Null
    
    # Create files in public folder
    $indexHtml = $indexHtmlTemplate -replace "APP_NAME", $app
    Set-Content -Path "$publicPath\index.html" -Value $indexHtml
    
    $manifestJson = $manifestJsonTemplate -replace "APP_NAME", $app
    Set-Content -Path "$publicPath\manifest.json" -Value $manifestJson
    
    # Create empty favicon and logo files to prevent build errors
    New-Item -ItemType File -Path "$publicPath\favicon.ico" -Force | Out-Null
    New-Item -ItemType File -Path "$publicPath\logo192.png" -Force | Out-Null
    New-Item -ItemType File -Path "$publicPath\logo512.png" -Force | Out-Null
    
    # Create files in src folder
    $indexJs = $indexJsTemplate
    Set-Content -Path "$srcPath\index.js" -Value $indexJs
    
    $appJs = $appJsTemplate -replace "APP_NAME", $app
    Set-Content -Path "$srcPath\App.js" -Value $appJs
    
    $indexCss = $indexCssTemplate
    Set-Content -Path "$srcPath\index.css" -Value $indexCss
    
    $appCss = $appCssTemplate
    Set-Content -Path "$srcPath\App.css" -Value $appCss
}

Write-Host "Done! All frontend applications have been set up with basic React structure." -ForegroundColor Green