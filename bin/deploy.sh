#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "📦 Starting TypeScript application deployment to Elastic Beanstalk..."

# Ensure necessary configurations exist
ensure_eb_config() {
  echo "🔧 Ensuring Elastic Beanstalk configuration files exist..."
  
  # Create .ebextensions directory if it doesn't exist
  if [ ! -d ".ebextensions" ]; then
    mkdir -p .ebextensions
    echo "Created .ebextensions directory"
  fi
  
# Create Node.js configuration file
if [ ! -f ".ebextensions/nodecommand.config" ]; then
  cat > .ebextensions/nodecommand.config << EOL
option_settings:
  aws:elasticbeanstalk:environment:proxy:
    ProxyServer: nginx
  aws:elasticbeanstalk:application:environment:
    NODE_ENV: production
    PORT: 8000
EOL
  echo "Created .ebextensions/nodecommand.config"
fi

  # Create platform hooks directory if it doesn't exist
  if [ ! -d ".platform/hooks/prebuild" ]; then
    mkdir -p .platform/hooks/prebuild
    echo "Created .platform/hooks/prebuild directory"
  fi

  # Create prebuild script
  cat > .platform/hooks/prebuild/01_build.sh << EOL
#!/bin/bash
set -e  # Exit on any error

cd /var/app/staging

echo "Building TypeScript application on server..."

# Install needed type definitions
npm install --save-dev @types/express @types/pg @types/jsonwebtoken @types/body-parser @types/cors

# Install all dependencies
npm install

# Create dist directory with proper permissions
mkdir -p dist
chmod 755 dist

# Run the build
npm run build

# Verify build output exists
if [ -f "dist/server.js" ]; then
  echo "Build successful! dist/server.js exists."
else
  echo "Build failed! dist/server.js not found."
  exit 1
fi
EOL

  # Make the prebuild script executable
  chmod +x .platform/hooks/prebuild/01_build.sh
  echo "Created and made executable .platform/hooks/prebuild/01_build.sh"
  
  # Create Procfile if it doesn't exist
  if [ ! -f "Procfile" ]; then
    echo "web: node -r tsconfig-paths/register dist/server.js" > Procfile
    echo "Created Procfile"
  fi
} # <-- This closing brace was missing

# Build the TypeScript application
build_application() {
  echo "🔨 Building TypeScript application..."
  npm run build
  echo "✅ Build completed successfully"
}

# Temporarily modify package.json to remove devDependencies
modify_package_json() {
  echo "📄 Creating production-ready package.json..."
  
  # Create a backup of the original package.json
  cp package.json package.json.bak
  
  # Use jq to create a new package.json without devDependencies
  # If jq is available, use it
  if command -v jq &> /dev/null; then
    jq 'del(.devDependencies)' package.json > package.json.prod
    mv package.json.prod package.json
  else
    # Fallback method using Node.js if jq is not available
    node -e "
      const fs = require('fs');
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      delete pkg.devDependencies;
      fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
    "
  fi
  
  echo "✅ Created production package.json"
}

# Restore the original package.json
restore_package_json() {
  echo "📄 Restoring original package.json..."
  mv package.json.bak package.json
  echo "✅ Original package.json restored"
}

# Deploy to Elastic Beanstalk
deploy_to_eb() {
  echo "🚀 Deploying to Elastic Beanstalk..."
  eb deploy
  echo "✅ Deployment completed successfully"
}

# Main function
main() {
  # Ensure EB configuration files exist
  ensure_eb_config
  
  # Build the application
  build_application
  
  # Modify package.json for production
  modify_package_json
  
  # Deploy to Elastic Beanstalk
  deploy_to_eb
  
  # Restore original package.json
  restore_package_json
  
  echo "🎉 Deployment process completed! Your TypeScript application is now live on Elastic Beanstalk."
}

# Run the main function
main