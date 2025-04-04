#!/bin/bash
cd /var/app/staging
echo "Building TypeScript application on server..."
npm install typescript tsconfig-paths --save
npm run build
