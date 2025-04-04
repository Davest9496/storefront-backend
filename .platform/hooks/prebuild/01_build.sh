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
