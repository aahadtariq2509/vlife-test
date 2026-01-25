#!/bin/bash

# Simple Frontend Deployment Script for EC2
# This script pulls latest code and restarts the frontend PM2 process

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
FRONTEND_PORT="${FRONTEND_PORT:-3001}"
BACKEND_PORT="${BACKEND_PORT:-3000}"

# Check if required environment variables are set
check_env_vars() {
    if [[ -z "$EC2_KEY_PATH" ]]; then
        print_error "Missing required environment variable: EC2_KEY_PATH"
        print_error "Please set: export EC2_KEY_PATH='/path/to/your-key.pem'"
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
    rm -rf "$temp_dir/.git"
    
    # Create deployment archive
    cd "$temp_dir"
    tar -czf "../${APP_NAME}.tar.gz" .
    cd ..
    
    # Upload to EC2
    scp -i "$EC2_KEY_PATH" "${APP_NAME}.tar.gz" "$EC2_USER@$EC2_HOST:$APP_DIR/"
    
    # Extract and install on EC2
    ssh -i "$EC2_KEY_PATH" "$EC2_USER@$EC2_HOST" << EOF
        cd $APP_DIR
        
        # Stop existing PM2 process if it exists
        if pm2 list | grep -q "$APP_NAME"; then
            echo "Stopping existing PM2 process: $APP_NAME"
            pm2 stop $APP_NAME
            pm2 delete $APP_NAME
        fi
        
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

# Start PM2 process
start_pm2() {
    print_step "Starting PM2 process..."
    
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
        
        echo "PM2 process started successfully"
EOF
    
    print_status "PM2 process started"
}

# Main deployment function
main() {
    print_status "Starting frontend deployment process..."
    print_status "Target: $EC2_USER@$EC2_HOST"
    
    # Run checks
    check_env_vars
    check_ssh_key
    test_ssh_connection
    
    # Deploy
    deploy_code
    start_pm2
    
    print_status "Frontend deployment completed successfully!"
    print_status "Your frontend is now available at: http://$EC2_HOST:$FRONTEND_PORT"
    print_status ""
    print_status "Useful commands:"
    print_status "  Check app status: ssh -i $EC2_KEY_PATH $EC2_USER@$EC2_HOST 'pm2 status'"
    print_status "  View logs: ssh -i $EC2_KEY_PATH $EC2_USER@$EC2_HOST 'pm2 logs $APP_NAME'"
    print_status "  Restart app: ssh -i $EC2_KEY_PATH $EC2_USER@$EC2_HOST 'pm2 restart $APP_NAME'"
}

# Parse command line arguments
if [[ $# -eq 0 ]]; then
    main
else
    print_error "Usage: $0"
    print_error "  This script deploys the frontend to EC2 and manages PM2 process"
    print_error "  Make sure to set: export EC2_KEY_PATH='/path/to/your-key.pem'"
    exit 1
fi