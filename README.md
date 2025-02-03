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

### Using Bash Script (Recommended for first-time setup)
```bash
# Make the setup script executable
chmod +x setup.sh

# Run the setup script
./setup.sh
```

The setup script will:
1. Create environment files from templates
2. Install dependencies
3. Set up databases
4. Run initial migrations

## Environment Setup

1. Create a `.env` file in the root directory with the following variables:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=storefront_dev
DB_USER=postgres
DB_PASSWORD=storefront_dev

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=very-long-and-secure-secret-key
PASSWORD_PEPPER=very-long-and-secure-pepper-value
SALT_ROUNDS=10
```

2. Create a `.env.test` file for testing:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=storefront_test
DB_USER=postgres
DB_PASSWORD=storefront_test
JWT_SECRET=JWT_SECRET
PORT=3001
```

## Database Setup

### Using Docker (Option 1)
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
```

## Scripts Reference

```bash
# Development
yarn dev          # Start development server
yarn build        # Build the project
yarn watch        # Watch for changes

# Database
yarn db:create    # Create databases
yarn migrate:up   # Run migrations (dev)
yarn migrate:up:test # Run migrations (test)
yarn db:populate  # Populate with sample data

# Migrations
yarn migrate:create   # Create new migration
yarn migrate:down     # Rollback migration (dev)
yarn migrate:down:test # Rollback migration (test)
yarn migrate:reset    # Reset migrations (dev)
yarn migrate:reset:test # Reset migrations (test)

# Testing
yarn test         # Run tests
yarn test:watch   # Run tests in watch mode

# Utility
yarn lint         # Run ESLint
yarn format       # Format code with Prettier
yarn clean        # Clean build
yarn rebuild      # Clean and rebuild project
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
- Bcrypt for password hashing
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