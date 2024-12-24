import { Response, Request } from 'express';
import { dbPool } from '../server';

// Get all users
export const getUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const client = await dbPool.connect();
    try {
      const result = await client.query(
        'SELECT id, first_name, last_name FROM users'
      );
      res.json(result.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.log('Error fetching users:', error);
    res.status(501).json({ error: 'Internal server error' });
  }
};


// Get user by Id
export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);
    const client = await dbPool.connect();

    try {
      const result = await client.query(
        'SELECT id, first_name, last_name FROM users WHERE id=$1',
        [userId]
      );
      if (result.rows.length === 0) {
        res.status(404).json({ error: 'User not found' });
      }
      res.json(result.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.log('Error fetching user data:', error);
    res.status(500).json({ details: 'Internal server Error' });
  }
};

// Update user
export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);
    const { first_name, last_name, email } = req.body;

    // Ensure user can only update their own profile
    if (req.user?.id !== userId) {
      res.status(403).json({ error: 'Unauthorized to update this user' });
      return;
    }

    const client = await dbPool.connect();
    try {
      const result = await client.query(
        `UPDATE users 
                 SET first_name = COALESCE($1, first_name),
                     last_name = COALESCE($2, last_name),
                     email = COALESCE($3, email)
                 WHERE id = $4
                 RETURNING id, first_name, last_name, email`,
        [first_name, last_name, email, userId]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete user
export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);

    // Ensure user can only delete their own account
    if (req.user?.id !== userId) {
      res.status(403).json({ error: 'Unauthorized to delete this user' });
      return;
    }

    const client = await dbPool.connect();
    try {
      const result = await client.query(
        'DELETE FROM users WHERE id = $1 RETURNING id',
        [userId]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({ message: 'User successfully deleted' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};