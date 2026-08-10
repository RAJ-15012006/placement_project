import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { pool } from '../config/database';
import { authenticate, authorize } from '../middleware/auth';
import { handleValidation } from '../middleware/validate';

const router = Router();

// GET /api/products — List products with search, low stock alert
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const { search, category, low_stock } = req.query;

    let query = 'SELECT * FROM products WHERE is_active = true';
    let countQuery = 'SELECT COUNT(*) FROM products WHERE is_active = true';
    const params: any[] = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND (name ILIKE $${paramIndex} OR sku ILIKE $${paramIndex} OR category ILIKE $${paramIndex})`;
      countQuery += ` AND (name ILIKE $${paramIndex} OR sku ILIKE $${paramIndex} OR category ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (category) {
      query += ` AND category = $${paramIndex}`;
      countQuery += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (low_stock === 'true') {
      query += ` AND current_stock <= min_stock_alert`;
      countQuery += ` AND current_stock <= min_stock_alert`;
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
      products: dataRes.rows,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error) {
    console.error('Fetch products error:', error);
    return res.status(500).json({ message: 'Error fetching products' });
  }
});

// POST /api/products — Create product
router.post(
  '/',
  authenticate,
  authorize('admin', 'warehouse'),
  [
    body('name').notEmpty().withMessage('Product name is required'),
    body('sku').notEmpty().withMessage('SKU code is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('unit_price').isNumeric().withMessage('Valid unit price is required'),
    body('location').notEmpty().withMessage('Location is required'),
  ],
  handleValidation,
  async (req: Request, res: Response) => {
    try {
      const { name, sku, category, unit_price, current_stock, min_stock_alert, location } = req.body;
      const created_by = req.user?.id;

      // Check SKU uniqueness
      const skuCheck = await pool.query('SELECT id FROM products WHERE sku = $1', [sku.toUpperCase().trim()]);
      if (skuCheck.rows.length > 0) {
        return res.status(400).json({ message: `SKU '${sku}' already exists` });
      }

      const initialStock = parseInt(current_stock) || 0;
      const minAlert = parseInt(min_stock_alert) || 10;

      const result = await pool.query(
        `INSERT INTO products (name, sku, category, unit_price, current_stock, min_stock_alert, location, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [name, sku.toUpperCase().trim(), category, unit_price, initialStock, minAlert, location, created_by]
      );

      const newProduct = result.rows[0];

      // Log initial stock movement if > 0
      if (initialStock > 0) {
        await pool.query(
          `INSERT INTO stock_movements (product_id, quantity, movement_type, reason, created_by)
           VALUES ($1, $2, 'IN', 'Initial stock entry on creation', $3)`,
          [newProduct.id, initialStock, created_by]
        );
      }

      return res.status(201).json({
        message: 'Product created successfully',
        product: newProduct,
      });
    } catch (error) {
      console.error('Create product error:', error);
      return res.status(500).json({ message: 'Error creating product' });
    }
  }
);

// GET /api/products/:id — Get product detail with movement history
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const prodRes = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (prodRes.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const movementsRes = await pool.query(
      `SELECT sm.*, u.name as created_by_name 
       FROM stock_movements sm 
       LEFT JOIN users u ON sm.created_by = u.id 
       WHERE sm.product_id = $1 
       ORDER BY sm.created_at DESC`,
      [id]
    );

    return res.json({
      product: prodRes.rows[0],
      stock_movements: movementsRes.rows,
    });
  } catch (error) {
    console.error('Fetch product detail error:', error);
    return res.status(500).json({ message: 'Error fetching product details' });
  }
});

// PUT /api/products/:id — Update product details
router.put(
  '/:id',
  authenticate,
  authorize('admin', 'warehouse'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, category, unit_price, min_stock_alert, location } = req.body;

      const result = await pool.query(
        `UPDATE products SET
           name = COALESCE($1, name),
           category = COALESCE($2, category),
           unit_price = COALESCE($3, unit_price),
           min_stock_alert = COALESCE($4, min_stock_alert),
           location = COALESCE($5, location),
           updated_at = NOW()
         WHERE id = $6
         RETURNING *`,
        [name, category, unit_price, min_stock_alert, location, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }

      return res.json({
        message: 'Product updated successfully',
        product: result.rows[0],
      });
    } catch (error) {
      console.error('Update product error:', error);
      return res.status(500).json({ message: 'Error updating product' });
    }
  }
);

// POST /api/products/:id/stock — Adjust stock (IN or OUT movement)
router.post(
  '/:id/stock',
  authenticate,
  authorize('admin', 'warehouse'),
  [
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('movement_type').isIn(['IN', 'OUT']).withMessage('Movement type must be IN or OUT'),
    body('reason').notEmpty().withMessage('Reason for stock movement is required'),
  ],
  handleValidation,
  async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
      const { id } = req.params;
      const { quantity, movement_type, reason } = req.body;
      const created_by = req.user?.id;
      const qty = parseInt(quantity);

      await client.query('BEGIN');

      const prodRes = await client.query('SELECT * FROM products WHERE id = $1 FOR UPDATE', [id]);
      if (prodRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'Product not found' });
      }

      const product = prodRes.rows[0];

      if (movement_type === 'OUT' && product.current_stock < qty) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          message: `Insufficient stock! Current: ${product.current_stock}, Requested: ${qty}`,
        });
      }

      const newStock = movement_type === 'IN' ? product.current_stock + qty : product.current_stock - qty;

      const updateRes = await client.query(
        'UPDATE products SET current_stock = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [newStock, id]
      );

      await client.query(
        'INSERT INTO stock_movements (product_id, quantity, movement_type, reason, created_by) VALUES ($1, $2, $3, $4, $5)',
        [id, qty, movement_type, reason, created_by]
      );

      await client.query('COMMIT');

      return res.json({
        message: `Stock updated successfully (${movement_type} ${qty})`,
        product: updateRes.rows[0],
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Update stock error:', error);
      return res.status(500).json({ message: 'Error updating stock' });
    } finally {
      client.release();
    }
  }
);

export default router;
