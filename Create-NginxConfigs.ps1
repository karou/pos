# PowerShell script to create nginx.conf files for frontend applications

$nginxConfTemplate = @'
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Handle static files
    location /static/ {
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
        try_files $uri =404;
    }

    # Handle service worker
    location /service-worker.js {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        try_files $uri =404;
    }

    # Proxy API requests to the API Gateway
    location /api/ {
        proxy_pass http://api-gateway:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Handle React routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Error pages
    error_page 404 /index.html;
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
'@

$frontendApps = @(
    "admin-dashboard",
    "pos-terminal"
)

foreach ($app in $frontendApps) {
    $path = "frontend\$app\nginx.conf"
    
    Write-Host "Creating nginx.conf for $app..." -ForegroundColor Cyan
    Set-Content -Path $path -Value $nginxConfTemplate
}

Write-Host "Done! All nginx.conf files have been created." -ForegroundColor Green