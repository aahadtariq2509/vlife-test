#!/bin/bash

# EC2 Deployment Script for Next.js Application
# This script sets up and deploys the Next.js app on an EC2 instance

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Configuration
EC2_USER="${EC2_USER:-ubuntu}"
EC2_HOST="${EC2_HOST:-3.225.93.41}"
EC2_KEY_PATH="${EC2_KEY_PATH}"
APP_NAME="vlifewrapperfrontend"
APP_DIR="/home/$EC2_USER/$APP_NAME"
NGINX_CONFIG_PATH="/etc/nginx/sites-available/$APP_NAME"
NGINX_ENABLED_PATH="/etc/nginx/sites-enabled/$APP_NAME"
FRONTEND_PORT="${FRONTEND_PORT:-3001}"
BACKEND_PORT="${BACKEND_PORT:-3000}"

# Check if required environment variables are set
check_env_vars() {
    local required_vars=("EC2_KEY_PATH")
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var}" ]]; then
            missing_vars+=("$var")
        fi
    done
    
    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        print_error "Missing required environment variables: ${missing_vars[*]}"
        print_error "Please set these variables:"
        print_error "  export EC2_KEY_PATH='/path/to/your-key.pem'"
        print_error "  export EC2_HOST='3.225.93.41' (optional, defaults to your Elastic IP)"
        exit 1
    fi
    
    print_status "Using EC2 Host: $EC2_HOST"
    print_status "Frontend will run on port: $FRONTEND_PORT"
    print_status "Backend is running on port: $BACKEND_PORT"
}

# Check if SSH key exists
check_ssh_key() {
    if [[ ! -f "$EC2_KEY_PATH" ]]; then
        print_error "SSH key not found at: $EC2_KEY_PATH"
        exit 1
    fi
    
    # Set proper permissions for SSH key
    chmod 600 "$EC2_KEY_PATH"
    print_status "SSH key permissions set correctly"
}

# Test SSH connection
test_ssh_connection() {
    print_step "Testing SSH connection to EC2 instance..."
    
    if ssh -i "$EC2_KEY_PATH" -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" "echo 'SSH connection successful'" > /dev/null 2>&1; then
        print_status "SSH connection successful"
    else
        print_error "Failed to connect to EC2 instance"
        print_error "Please check:"
        print_error "  - EC2 instance is running"
        print_error "  - Security group allows SSH (port 22)"
        print_error "  - SSH key path is correct"
        print_error "  - EC2_HOST is correct"
        exit 1
    fi
}

# Install dependencies on EC2
install_dependencies() {
    print_step "Installing dependencies on EC2 instance..."
    
    ssh -i "$EC2_KEY_PATH" "$EC2_USER@$EC2_HOST" << 'EOF'
        # Update system packages
        sudo apt update && sudo apt upgrade -y
        
        # Install Node.js (using NodeSource repository for latest LTS)
        curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
        sudo apt-get install -y nodejs
        
        # Install PM2 globally
        sudo npm install -g pm2
        
        # Install Nginx
        sudo apt install -y nginx
        
        # Install Git
        sudo apt install -y git
        
        # Install build essentials
        sudo apt install -y build-essential
        
        echo "Dependencies installed successfully"
EOF
    
    print_status "Dependencies installation completed"
}

# Setup application directory
setup_app_directory() {
    print_step "Setting up application directory..."
    
    ssh -i "$EC2_KEY_PATH" "$EC2_USER@$EC2_HOST" << EOF
        # Create application directory
        mkdir -p $APP_DIR
        
        # Navigate to app directory
        cd $APP_DIR
        
        # Initialize git if not already done
        if [ ! -d ".git" ]; then
            git init
        fi
        
        echo "Application directory setup completed"
EOF
    
    print_status "Application directory setup completed"
}

# Deploy application code
deploy_code() {
    print_step "Deploying application code..."
    
    # Create a temporary directory for build
    local temp_dir=$(mktemp -d)
    
    # Copy application files
    cp -r . "$temp_dir/"
    
    # Remove unnecessary files
    rm -rf "$temp_dir/node_modules"
    rm -rf "$temp_dir/.next"
    rm -rf "$temp_dir/out"
    
    # Create deployment archive
    cd "$temp_dir"
    tar -czf "../${APP_NAME}.tar.gz" .
    cd ..
    
    # Upload to EC2
    scp -i "$EC2_KEY_PATH" "${APP_NAME}.tar.gz" "$EC2_USER@$EC2_HOST:$APP_DIR/"
    
    # Extract and install on EC2
    ssh -i "$EC2_KEY_PATH" "$EC2_USER@$EC2_HOST" << EOF
        cd $APP_DIR
        
        # Extract application files
        tar -xzf ${APP_NAME}.tar.gz
        rm ${APP_NAME}.tar.gz
        
        # Copy production environment file
        if [ -f "env.production.example" ]; then
            cp env.production.example .env.production
            echo "Production environment file created"
        fi
        
        # Install dependencies
        npm install --production
        
        # Build the application
        npm run build
        
        echo "Application code deployed successfully"
EOF
    
    # Cleanup
    rm -rf "$temp_dir"
    rm -f "${APP_NAME}.tar.gz"
    
    print_status "Application code deployment completed"
}

# Setup PM2 configuration
setup_pm2() {
    print_step "Setting up PM2 process manager..."
    
    ssh -i "$EC2_KEY_PATH" "$EC2_USER@$EC2_HOST" << EOF
        cd $APP_DIR
        
        # Create PM2 ecosystem file
        cat > ecosystem.config.js << 'PM2EOF'
module.exports = {
  apps: [{
    name: '${APP_NAME}',
    script: 'npm',
    args: 'start',
    cwd: '$APP_DIR',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: $FRONTEND_PORT,
      HOSTNAME: '0.0.0.0',
      NEXT_PUBLIC_API_URL: 'http://$EC2_HOST:$BACKEND_PORT',
      NEXT_PUBLIC_BACKEND_API_URL: 'http://$EC2_HOST:$BACKEND_PORT'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
PM2EOF
        
        # Create logs directory
        mkdir -p logs
        
        # Start application with PM2
        pm2 start ecosystem.config.js
        
        # Save PM2 configuration
        pm2 save
        
        # Setup PM2 startup script
        pm2 startup
        
        echo "PM2 setup completed"
EOF
    
    print_status "PM2 setup completed"
}

# Setup Nginx reverse proxy
setup_nginx() {
    print_step "Setting up Nginx reverse proxy..."
    
    ssh -i "$EC2_KEY_PATH" "$EC2_USER@$EC2_HOST" << EOF
        # Create Nginx configuration for backend API only
        sudo tee $NGINX_CONFIG_PATH > /dev/null << 'NGINXEOF'
server {
    listen 80;
    server_name _;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Proxy API requests to backend (port 3000)
    location /api/ {
        proxy_pass http://localhost:$BACKEND_PORT/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Health check endpoint for backend
    location /health {
        proxy_pass http://localhost:$BACKEND_PORT/health;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Default response for root path
    location / {
        return 200 "Backend API Server Running\nFrontend: http://$EC2_HOST:$FRONTEND_PORT\nBackend API: http://$EC2_HOST:$BACKEND_PORT\n";
        add_header Content-Type text/plain;
    }
}
NGINXEOF
        
        # Enable the site
        sudo ln -sf $NGINX_CONFIG_PATH $NGINX_ENABLED_PATH
        
        # Remove default Nginx site
        sudo rm -f /etc/nginx/sites-enabled/default
        
        # Test Nginx configuration
        sudo nginx -t
        
        # Restart Nginx
        sudo systemctl restart nginx
        sudo systemctl enable nginx
        
        echo "Nginx setup completed"
EOF
    
    print_status "Nginx setup completed"
}

# Setup SSL with Let's Encrypt (optional)
setup_ssl() {
    local domain="$1"
    
    if [[ -z "$domain" ]]; then
        print_warning "No domain provided. Skipping SSL setup."
        print_warning "To setup SSL later, run: ./deploy-ec2.sh ssl your-domain.com"
        return
    fi
    
    print_step "Setting up SSL with Let's Encrypt..."
    
    ssh -i "$EC2_KEY_PATH" "$EC2_USER@$EC2_HOST" << EOF
        # Install Certbot
        sudo apt install -y certbot python3-certbot-nginx
        
        # Obtain SSL certificate
        sudo certbot --nginx -d $domain --non-interactive --agree-tos --email admin@$domain
        
        # Setup auto-renewal
        sudo systemctl enable certbot.timer
        
        echo "SSL setup completed for domain: $domain"
EOF
    
    print_status "SSL setup completed for domain: $domain"
}

# Main deployment function
main() {
    local domain="$1"
    
    print_status "Starting EC2 deployment process..."
    print_status "Target: $EC2_USER@$EC2_HOST"
    
    # Run checks
    check_env_vars
    check_ssh_key
    test_ssh_connection
    
    # Deploy
    install_dependencies
    setup_app_directory
    deploy_code
    setup_pm2
    setup_nginx
    
    # Setup SSL if domain provided
    if [[ -n "$domain" ]]; then
        setup_ssl "$domain"
    fi
    
    print_status "Deployment completed successfully!"
    print_status "Your app is now available at: http://$EC2_HOST"
    if [[ -n "$domain" ]]; then
        print_status "SSL enabled at: https://$domain"
    fi
    print_status ""
    print_status "Useful commands:"
    print_status "  Check app status: ssh -i $EC2_KEY_PATH $EC2_USER@$EC2_HOST 'pm2 status'"
    print_status "  View logs: ssh -i $EC2_KEY_PATH $EC2_USER@$EC2_HOST 'pm2 logs'"
    print_status "  Restart app: ssh -i $EC2_KEY_PATH $EC2_USER@$EC2_HOST 'pm2 restart $APP_NAME'"
}

# Handle SSL-only setup
if [[ "$1" == "ssl" ]]; then
    if [[ -z "$2" ]]; then
        print_error "Please provide a domain name for SSL setup"
        print_error "Usage: $0 ssl your-domain.com"
        exit 1
    fi
    
    check_env_vars
    check_ssh_key
    test_ssh_connection
    setup_ssl "$2"
    exit 0
fi

# Parse command line arguments
if [[ $# -eq 0 ]]; then
    main
elif [[ $# -eq 1 ]]; then
    main "$1"
else
    print_error "Usage: $0 [domain]"
    print_error "  $0                    - Deploy without SSL"
    print_error "  $0 your-domain.com    - Deploy with SSL"
    print_error "  $0 ssl your-domain.com - Setup SSL only"
    exit 1
fi
