import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { pool } from '../config/database';
import { authenticate, authorize } from '../middleware/auth';
import { handleValidation } from '../middleware/validate';

const router = Router();

// GET /api/customers — List with pagination, search & filters
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const { search, customer_type, status } = req.query;

    let query = 'SELECT * FROM customers WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) FROM customers WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND (name ILIKE $${paramIndex} OR mobile ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR business_name ILIKE $${paramIndex})`;
      countQuery += ` AND (name ILIKE $${paramIndex} OR mobile ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR business_name ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (customer_type) {
      query += ` AND customer_type = $${paramIndex}`;
      countQuery += ` AND customer_type = $${paramIndex}`;
      params.push(customer_type);
      paramIndex++;
    }

    if (status) {
      query += ` AND status = $${paramIndex}`;
      countQuery += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    const queryParams = [...params, limit, offset];

    const [dataRes, countRes] = await Promise.all([
      pool.query(query, queryParams),
      pool.query(countQuery, params),
    ]);

    const total = parseInt(countRes.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    return res.json({
      customers: dataRes.rows,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error) {
    console.error('Fetch customers error:', error);
    return res.status(500).json({ message: 'Error fetching customers' });
  }
});

// POST /api/customers — Create customer
router.post(
  '/',
  authenticate,
  authorize('admin', 'sales'),
  [
    body('name').notEmpty().withMessage('Customer name is required'),
    body('mobile').notEmpty().withMessage('Mobile number is required'),
    body('business_name').notEmpty().withMessage('Business name is required'),
    body('customer_type').isIn(['retail', 'wholesale', 'distributor']).withMessage('Valid customer type required'),
    body('address').notEmpty().withMessage('Address is required'),
  ],
  handleValidation,
  async (req: Request, res: Response) => {
    try {
      const { name, mobile, email, business_name, gst, customer_type, address, status, follow_up_date, notes } = req.body;
      const created_by = req.user?.id;

      const result = await pool.query(
        `INSERT INTO customers 
         (name, mobile, email, business_name, gst, customer_type, address, status, follow_up_date, notes, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [
          name, mobile, email || null, business_name, gst || null,
          customer_type, address, status || 'lead',
          follow_up_date || null, notes || null, created_by
        ]
      );

      return res.status(201).json({
        message: 'Customer created successfully',
        customer: result.rows[0],
      });
    } catch (error) {
      console.error('Create customer error:', error);
      return res.status(500).json({ message: 'Error creating customer' });
    }
  }
);

// GET /api/customers/:id — Get customer detail with follow-ups
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const customerRes = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);
    if (customerRes.rows.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const followUpsRes = await pool.query(
      `SELECT f.*, u.name as created_by_name 
       FROM follow_ups f 
       LEFT JOIN users u ON f.created_by = u.id 
       WHERE f.customer_id = $1 
       ORDER BY f.created_at DESC`,
      [id]
    );

    return res.json({
      customer: customerRes.rows[0],
      follow_ups: followUpsRes.rows,
    });
  } catch (error) {
    console.error('Fetch customer detail error:', error);
    return res.status(500).json({ message: 'Error fetching customer details' });
  }
});

// PUT /api/customers/:id — Update customer
router.put(
  '/:id',
  authenticate,
  authorize('admin', 'sales'),
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('customer_type').optional().isIn(['retail', 'wholesale', 'distributor']),
    body('status').optional().isIn(['lead', 'active', 'inactive']),
  ],
  handleValidation,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, mobile, email, business_name, gst, customer_type, address, status, follow_up_date, notes } = req.body;

      const result = await pool.query(
        `UPDATE customers SET
           name = COALESCE($1, name),
           mobile = COALESCE($2, mobile),
           email = COALESCE($3, email),
           business_name = COALESCE($4, business_name),
           gst = COALESCE($5, gst),
           customer_type = COALESCE($6, customer_type),
           address = COALESCE($7, address),
           status = COALESCE($8, status),
           follow_up_date = COALESCE($9, follow_up_date),
           notes = COALESCE($10, notes),
           updated_at = NOW()
         WHERE id = $11
         RETURNING *`,
        [name, mobile, email, business_name, gst, customer_type, address, status, follow_up_date, notes, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      return res.json({
        message: 'Customer updated successfully',
        customer: result.rows[0],
      });
    } catch (error) {
      console.error('Update customer error:', error);
      return res.status(500).json({ message: 'Error updating customer' });
    }
  }
);

// POST /api/customers/:id/followup — Add follow-up note
router.post(
  '/:id/followup',
  authenticate,
  authorize('admin', 'sales'),
  [body('note').notEmpty().withMessage('Follow-up note is required')],
  handleValidation,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { note } = req.body;
      const created_by = req.user?.id;

      // Check customer existence
      const custCheck = await pool.query('SELECT id FROM customers WHERE id = $1', [id]);
      if (custCheck.rows.length === 0) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      const result = await pool.query(
        'INSERT INTO follow_ups (customer_id, note, created_by) VALUES ($1, $2, $3) RETURNING *',
        [id, note, created_by]
      );

      return res.status(201).json({
        message: 'Follow-up note added',
        follow_up: result.rows[0],
      });
    } catch (error) {
      console.error('Add follow-up error:', error);
      return res.status(500).json({ message: 'Error adding follow-up note' });
    }
  }
);

export default router;
