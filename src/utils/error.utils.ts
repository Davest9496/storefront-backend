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
