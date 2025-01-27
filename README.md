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
- yarn install


## Environment Setup

1. Create a `.env` file in the root directory with the following variables:
```env
NODE_ENV=development
PORT=3000

# Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=storefront_dev
POSTGRES_TEST_DB=storefront_test
POSTGRES_USER=your_username
POSTGRES_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
SALT_ROUNDS=10
```

## Database Setup

### Using Docker (Recommended)
1. Start the PostgreSQL container:
```bash
docker-compose up -d
```

2. Create databases:
```bash
yarn db:create
```

3. Run migrations:
```bash
yarn db:migrate up
```

### Manual Setup
1. Create development and test databases:
```sql
CREATE DATABASE storefront_dev;
CREATE DATABASE storefront_test;
```

2. Run migrations:
```bash
yarn db:migrate up
```

3. (Optional) Populate with sample data:
```bash
yarn db:populate
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

Run the test suite:
```bash
# Run all tests
yarn test

# Run tests with watch mode
yarn test:watch

# Run specific test file
yarn test specs/path/to/file.spec.ts
```

## API Documentation

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product (requires auth token)
- `GET /api/products/popular` - Get top 5 popular products
- `GET /api/products/category/:category` - Get products by category

### Users
- `GET /api/users` - Get all users (requires auth token)
- `GET /api/users/:id` - Get user by ID (requires auth token)
- `POST /api/users` - Create new user

### Orders
- `GET /api/orders/current/:userId` - Get active order for user (requires auth token)
- `GET /api/orders/completed/:userId` - Get completed orders for user (requires auth token)
- `POST /api/orders` - Create new order (requires auth token)

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/signup` - Register new user

## Technologies Used
- Node.js & Express.js
- TypeScript
- PostgreSQL
- JWT for authentication
- Jasmine for testing
- db-migrate for database migrations
- Docker & Docker Compose

## Scripts Reference

```bash
# Development
yarn dev          # Start development server
yarn build        # Build the project
yarn watch        # Watch for changes

# Database
yarn db:create    # Create databases
yarn db:migrate   # Run migrations
yarn db:populate  # Populate with sample data

# Testing
yarn test         # Run tests
yarn test:watch   # Run tests in watch mode

# Utility
yarn lint         # Run ESLint
yarn format       # Format code with Prettier
yarn clean        # Clean build artifacts
yarn rebuild      # Clean and rebuild project
```

## Project Structure
```
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Custom middleware
│   ├── models/         # Database models
│   ├── routes/         # Route definitions
│   ├── services/       # Business logic
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Utility functions
├── specs/              # Test files
├── migrations/         # Database migrations
└── docker/            # Docker configuration
```

## License
This project is licensed under the ISC License.