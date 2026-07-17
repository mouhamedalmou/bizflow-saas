export default class ApiError extends Error {
  readonly statusCode: number;
  readonly errors: unknown[];
  readonly isOperational = true;
  constructor(statusCode: number, message: string, errors: unknown[] = []) { super(message); this.name = "ApiError"; this.statusCode = statusCode; this.errors = errors; Error.captureStackTrace(this, this.constructor); }
}
