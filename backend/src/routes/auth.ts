import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';
import { handleValidation } from '../middleware/validate';
import { authenticate } from '../middleware/auth';

const router = Router();

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  handleValidation,
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      const userRes = await pool.query(
        'SELECT id, name, email, password, role, is_active FROM users WHERE email = $1',
        [email.toLowerCase().trim()]
      );

      if (userRes.rows.length === 0) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const user = userRes.rows[0];

      if (!user.is_active) {
        return res.status(403).json({ message: 'User account is deactivated' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const secret = process.env.JWT_SECRET || 'mini-erp-super-secret-jwt-key-2026';
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        secret,
        { expiresIn: '7d' }
      );

      return res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ message: 'Server error during authentication' });
    }
  }
);

// GET /api/auth/me
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const userRes = await pool.query(
      'SELECT id, name, email, role, is_active, created_at FROM users WHERE id = $1',
      [req.user?.id]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(userRes.rows[0]);
  } catch (error) {
    console.error('Get me error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
