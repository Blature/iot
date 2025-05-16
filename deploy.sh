#!/bin/bash

set -e

echo "🛡️  IoT App Deployment Script (Ubuntu 22.04+)"
echo "---------------------------------------------"

read -p "🌐 Enter your main domain (e.g. yourdomain.com): " DOMAIN
read -p "📧 Enter your email for SSL (e.g. admin@example.com): " EMAIL

API_SUBDOMAIN="api.$DOMAIN"


echo "📦 Installing Docker from official source..."
sudo apt remove docker docker-engine docker.io containerd runc -y || true
sudo apt update
sudo apt install -y ca-certificates curl gnupg lsb-release

sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

echo "🌐 Installing Nginx and Certbot..."
sudo apt install -y nginx certbot python3-certbot-nginx

sudo systemctl start nginx
sudo certbot --nginx --non-interactive --agree-tos -m "$EMAIL" -d "$DOMAIN" -d "$API_SUBDOMAIN"

echo "🛠️ Setting up Nginx config..."

sudo tee /etc/nginx/sites-available/iot-app > /dev/null <<EOF
server {
    listen 80;
    server_name \$DOMAIN;
    return 301 https://\$host\$request_uri;
}

server {
    listen 80;
    server_name \$API_SUBDOMAIN;
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl;
    server_name \$DOMAIN;

    ssl_certificate /etc/letsencrypt/live/\$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/\$DOMAIN/privkey.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}

server {
    listen 443 ssl;
    server_name \$API_SUBDOMAIN;

    ssl_certificate /etc/letsencrypt/live/\$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/\$DOMAIN/privkey.pem;

    location /socket.io/ {
        proxy_pass http://localhost:3000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/iot-app /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx

echo "🚀 Running docker-compose..."
docker compose up -d

echo ""
echo "Deployment Completed!"
echo "Frontend: https://$DOMAIN"
echo "Backend API: https://$API_SUBDOMAIN"
