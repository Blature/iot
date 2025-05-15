#!/bin/bash

set -e

echo "🛡️  IoT App Deployment Script (Ubuntu 22.04+)"
echo "---------------------------------------------"

read -p "🌐 Enter your main domain (e.g. yourdomain.com): " DOMAIN
read -p "📧 Enter your email for SSL (e.g. admin@example.com): " EMAIL

API_SUBDOMAIN="api.$DOMAIN"

echo "📦 Installing Docker & Docker Compose..."
sudo apt update
sudo apt install -y docker.io docker-compose
sudo systemctl enable docker
sudo systemctl start docker

echo "🌐 Installing Nginx and Certbot..."
sudo apt install -y nginx certbot python3-certbot-nginx

echo "🛠️ Setting up Nginx config..."

sudo tee /etc/nginx/sites-available/iot-app > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN $API_SUBDOMAIN;

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /socket.io/ {
        proxy_pass http://localhost:3000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
    }

    location /api/ {
        rewrite ^/api/(.*)\$ /\$1 break;
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


echo "🔐 Obtaining SSL certificate..."
sudo certbot --nginx --non-interactive --agree-tos -m "$EMAIL" -d "$DOMAIN" -d "$API_SUBDOMAIN"

echo "🚀 Running docker-compose..."
docker-compose up -d

echo ""
echo "✅ Deployment Completed!"
echo "Frontend: https://$DOMAIN"
echo "Backend API: https://$API_SUBDOMAIN"
