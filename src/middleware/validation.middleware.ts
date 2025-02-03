import { Request, Response, NextFunction } from 'express';
import { CreateUserDTO } from '../types/shared.types';

export const validateUserCreate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const user = req.body as CreateUserDTO;

  if (!user.email || !user.email.includes('@')) {
    res.status(400).json({ error: 'Valid email is required' });
    return;
  }

  if (!user.password || user.password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters' });
    return;
  }

  if (!user.first_name || !user.last_name) {
    res.status(400).json({ error: 'First and last name are required' });
    return;
  }

  next();
};

export const validateUserUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const updates = req.body;

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: 'No update fields provided' });
    return;
  }

  if (updates.email && !updates.email.includes('@')) {
    res.status(400).json({ error: 'Valid email is required' });
    return;
  }

  if (updates.password !== undefined) {
    res
      .status(400)
      .json({ error: 'Password cannot be updated through this endpoint' });
    return;
  }

  next();
};
