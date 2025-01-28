#!/bin/bash

# Check if .env exists, if not create it from example
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "Please update .env with your configuration"
fi

# Check if .env.test exists, if not create it
if [ ! -f .env.test ]; then
    echo "Creating .env.test file..."
    cp .env.example .env.test
    # Update database name for test environment
    sed -i 's/storefront_dev/storefront_test/g' .env.test
    echo "Please update .env.test with your test configuration"
fi

# Install dependencies
echo "Installing dependencies..."
yarn install

# Create databases if they don't exist
echo "Setting up databases..."
psql -U postgres -c "CREATE DATABASE storefront_dev;" || true
psql -U postgres -c "CREATE DATABASE storefront_test;" || true

# Run migrations
echo "Running migrations..."
yarn run migrate:up
yarn run migrate:up:test

echo "Setup complete! Please ensure you have updated the environment files with your local configuration."