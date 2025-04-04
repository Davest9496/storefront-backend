#!/bin/bash

# Environment Configuration
POSTGRES_HOST=database-1.cpgm042cq1en.eu-west-2.rds.amazonaws.com
POSTGRES_PORT=5432
POSTGRES_DB=storefront
POSTGRES_USER=dave
POSTGRES_PASSWORD=mophir3digit
JWT_SECRET=very-long-and-notsecure-secret-key
BCRYPT_PASSWORD=very-long-and-notsecure-bcrypt-value
SALT_ROUNDS=10
FRONTEND_URL=https://storefront-virid.vercel.app
NODE_ENV=production

eb setenv \
  POSTGRES_HOST=$POSTGRES_HOST \
  POSTGRES_PORT=$POSTGRES_PORT \
  POSTGRES_DB=$POSTGRES_DB \
  POSTGRES_USER=$POSTGRES_USER \
  POSTGRES_PASSWORD=$POSTGRES_PASSWORD \
  JWT_SECRET=$JWT_SECRET \
  BCRYPT_PASSWORD=$BCRYPT_PASSWORD \
  SALT_ROUNDS=$SALT_ROUNDS \
  FRONTEND_URL=$FRONTEND_URL \
  NODE_ENV=production

echo "Environment variables have been set on Elastic Beanstalk"