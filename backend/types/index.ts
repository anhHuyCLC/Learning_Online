import { Request } from 'express';

/**
 * Extends the default Express Request interface to include the 'user'
 * object that is attached by the 'protect' authentication middleware.
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    // Other properties like 'role' can be added here if they exist on the user object
  };
}
