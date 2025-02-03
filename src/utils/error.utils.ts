// Base error class for the application
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public status: string,
    message: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Type guard function to check if an error is an AppError
export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError;
};

// Specific error types
export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden access') {
    super(403, 'forbidden', message);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(404, 'not_found', message);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Invalid request') {
    super(400, 'bad_request', message);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database error occurred') {
    super(500, 'database_error', message);
  }
}

// Helper function to handle unknown errors
export const handleUnknownError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};
