# Storefront Backend API

This is a RESTful API built with Node.js/Express and PostgreSQL for an e-commerce storefront. It provides endpoints for managing products, users, and orders with JWT authentication.

## Table of Contents
- Prerequisites
- Installation
- Environment Setup
- Database Setup
- Running the Application
- Testing
- API Documentation
- Technologies Used

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- npm or Yarn
- PostgreSQL (v12 or higher)
- Docker and Docker Compose (optional, for containerized setup)

## Installation

### Using Yarn
```bash
yarn install
```

## Environment Setup
1. Create a `.env.test` file for testing:

- Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_TEST_DB=storefront_test
POSTGRES_USER=postgres
POSTGRES_PASSWORD=storefront_test

- Server Configuration
PORT=8080
ENV=test


- JWT Configuration
JWT_SECRET=very-long-and-secure-secret-key
BCRYPT_PASSWORD=very-long-and-secure-bcrypt-value
SALT_ROUNDS=10


## Database Setup
### Using Docker (Option 1)
1. Start the PostgreSQL container:
- This command will create development and test databases
```bash
docker-compose up -d
```

2. Run migrations:
```bash
yarn migrate:up
yarn migrate:up:test  # For test database
```

### Manual Setup (Option 2)
1. Create development and test databases:
```sql
psql -U postgres
CREATE DATABASE storefront_dev;
CREATE DATABASE storefront_test;
GRANT ALL PRIVILEGES ON DATABASE storefront_dev TO postgres;
GRANT ALL PRIVILEGES ON DATABASE storefront_test TO postgres;
```

2. Run migrations:
### Database Migration Scripts
```bash
# Run migrations
yarn migrate:up         # Development database
yarn migrate:up:test    # Test database

# Rollback migrations
yarn migrate:down       # Development database
yarn migrate:down:test  # Test database

# Reset migrations
yarn migrate:reset      # Development database
yarn migrate:reset:test # Test database
```

## Running the Application

### Development Mode
```bash
# Start with live reload
yarn dev

# Build and start
yarn build
yarn start
```

The server will start at http://localhost:3000 (or the PORT specified in your .env)

## Testing

```bash
# Run all tests
yarn test

# Run tests with watch mode
yarn test:watch

# Run specific test file
yarn test specs/path/to/file.spec.ts


## API Documentation

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product (requires auth token)
- `GET /api/products/popular` - Get top 5 popular products
- `GET /api/products/category/:category` - Get products by category

### User Authentication
- `GET /api/users` - Get all users (requires auth token)
- `GET /api/users/:id` - Get user by ID - login (requires auth token)
- `POST /api/users` - Create new user - signup

### Orders
- `GET /api/orders/current/:userId` - Get active order for user (requires auth token)
- `GET /api/orders/completed/:userId` - Get completed orders for user (requires auth token)
- `POST /api/orders` - Create new order (requires auth token)


## Technologies Used
- Node.js & Express.js
- TypeScript
- PostgreSQL
- JWT for authentication
- Bcrypt for password hashing
- Jasmine for testing
- db-migrate for database migrations
- Docker
