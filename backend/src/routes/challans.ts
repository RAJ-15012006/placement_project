import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { pool } from '../config/database';
import { authenticate, authorize } from '../middleware/auth';
import { handleValidation } from '../middleware/validate';

const router = Router();

// Helper: Generate Challan Number like CH-2026-0001
async function generateChallanNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const countRes = await pool.query('SELECT COUNT(*) FROM challans');
  const nextNum = parseInt(countRes.rows[0].count) + 1;
  return `CH-${year}-${String(nextNum).padStart(4, '0')}`;
}

// GET /api/challans — List challans with status filter & pagination
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const { status } = req.query;

    let query = `
      SELECT ch.*, c.name as customer_name, c.business_name as customer_business, u.name as created_by_name
      FROM challans ch
      LEFT JOIN customers c ON ch.customer_id = c.id
      LEFT JOIN users u ON ch.created_by = u.id
      WHERE 1=1
    `;
    let countQuery = 'SELECT COUNT(*) FROM challans WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND ch.status = $${paramIndex}`;
      countQuery += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ` ORDER BY ch.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    const queryParams = [...params, limit, offset];

    const [dataRes, countRes] = await Promise.all([
      pool.query(query, queryParams),
      pool.query(countQuery, params),
    ]);

    const total = parseInt(countRes.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    return res.json({
      challans: dataRes.rows,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error) {
    console.error('Fetch challans error:', error);
    return res.status(500).json({ message: 'Error fetching sales challans' });
  }
});

// POST /api/challans — Create new challan (Draft or Confirmed)
router.post(
  '/',
  authenticate,
  authorize('admin', 'sales'),
  [
    body('customer_id').isInt().withMessage('Customer ID is required'),
    body('items').isArray({ min: 1 }).withMessage('At least one line item is required'),
    body('items.*.product_id').isInt().withMessage('Valid product ID required'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('status').optional().isIn(['draft', 'confirmed']),
  ],
  handleValidation,
  async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
      const { customer_id, items, status } = req.body;
      const created_by = req.user?.id;
      const challanStatus = status || 'draft';

      await client.query('BEGIN');

      // 1. Verify Customer
      const custRes = await client.query('SELECT id, name FROM customers WHERE id = $1', [customer_id]);
      if (custRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'Customer not found' });
      }

      // 2. Fetch and snapshot products
      const productIds = items.map((i: any) => i.product_id);
      const prodRes = await client.query(
        'SELECT id, name, sku, unit_price, current_stock FROM products WHERE id = ANY($1) AND is_active = true',
        [productIds]
      );

      const productMap = new Map<number, any>();
      prodRes.rows.forEach(p => productMap.set(p.id, p));

      // Validate all items exist
      for (const item of items) {
        if (!productMap.has(item.product_id)) {
          await client.query('ROLLBACK');
          return res.status(404).json({ message: `Product ID ${item.product_id} not found or inactive` });
        }
      }

      // 3. If saving as 'confirmed', perform strict stock check
      if (challanStatus === 'confirmed') {
        const insufficientItems: string[] = [];
        for (const item of items) {
          const product = productMap.get(item.product_id);
          if (product.current_stock < item.quantity) {
            insufficientItems.push(
              `'${product.name}' (SKU: ${product.sku}): Requested ${item.quantity}, Available ${product.current_stock}`
            );
          }
        }

        if (insufficientItems.length > 0) {
          await client.query('ROLLBACK');
          return res.status(400).json({
            message: 'Insufficient stock to confirm challan!',
            details: insufficientItems,
          });
        }
      }

      // 4. Calculate total qty and subtotal
      let totalQty = 0;
      let subtotal = 0;
      const itemsToInsert: any[] = [];

      for (const item of items) {
        const product = productMap.get(item.product_id);
        const qty = parseInt(item.quantity);
        const price = parseFloat(product.unit_price);

        totalQty += qty;
        subtotal += qty * price;

        itemsToInsert.push({
          product_id: product.id,
          product_name: product.name,
          sku: product.sku,
          unit_price: price,
          quantity: qty,
        });
      }

      // 5. Generate Challan Number & Insert Header
      const challanNumber = await generateChallanNumber();

      const challanRes = await client.query(
        `INSERT INTO challans (challan_number, customer_id, total_qty, subtotal, status, created_by)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [challanNumber, customer_id, totalQty, subtotal, challanStatus, created_by]
      );

      const newChallan = challanRes.rows[0];

      // 6. Insert Snapshot Items
      for (const item of itemsToInsert) {
        await client.query(
          `INSERT INTO challan_items (challan_id, product_id, product_name, sku, unit_price, quantity)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [newChallan.id, item.product_id, item.product_name, item.sku, item.unit_price, item.quantity]
        );

        // Deduct stock if status is 'confirmed'
        if (challanStatus === 'confirmed') {
          await client.query(
            'UPDATE products SET current_stock = current_stock - $1, updated_at = NOW() WHERE id = $2',
            [item.quantity, item.product_id]
          );

          await client.query(
            `INSERT INTO stock_movements (product_id, quantity, movement_type, reason, created_by)
             VALUES ($1, $2, 'OUT', $3, $4)`,
            [item.product_id, item.quantity, `Challan confirmed (${challanNumber})`, created_by]
          );
        }
      }

      await client.query('COMMIT');

      return res.status(201).json({
        message: `Challan created successfully as ${challanStatus}`,
        challan: { ...newChallan, items: itemsToInsert },
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Create challan error:', error);
      return res.status(500).json({ message: 'Error creating sales challan' });
    } finally {
      client.release();
    }
  }
);

// GET /api/challans/:id — Get single challan with snapshot items & customer info
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const challanRes = await pool.query(
      `SELECT ch.*, c.name as customer_name, c.business_name as customer_business, c.mobile as customer_mobile, c.address as customer_address, u.name as created_by_name
       FROM challans ch
       LEFT JOIN customers c ON ch.customer_id = c.id
       LEFT JOIN users u ON ch.created_by = u.id
       WHERE ch.id = $1`,
      [id]
    );

    if (challanRes.rows.length === 0) {
      return res.status(404).json({ message: 'Challan not found' });
    }

    const itemsRes = await pool.query('SELECT * FROM challan_items WHERE challan_id = $1', [id]);

    return res.json({
      challan: {
        ...challanRes.rows[0],
        items: itemsRes.rows,
      },
    });
  } catch (error) {
    console.error('Fetch challan detail error:', error);
    return res.status(500).json({ message: 'Error fetching challan details' });
  }
});

// POST /api/challans/:id/confirm — BUSINESS LOGIC: Confirm draft challan & deduct stock
router.post('/:id/confirm', authenticate, authorize('admin', 'sales'), async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const user_id = req.user?.id;

    await client.query('BEGIN');

    // 1. Fetch Challan
    const challanRes = await client.query('SELECT * FROM challans WHERE id = $1 FOR UPDATE', [id]);
    if (challanRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Challan not found' });
    }

    const challan = challanRes.rows[0];

    if (challan.status === 'confirmed') {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Challan is already confirmed' });
    }

    if (challan.status === 'cancelled') {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Cannot confirm a cancelled challan' });
    }

    // 2. Fetch Challan Items
    const itemsRes = await client.query('SELECT * FROM challan_items WHERE challan_id = $1', [id]);
    const items = itemsRes.rows;

    // 3. Strict Stock Check
    const insufficientItems: string[] = [];
    for (const item of items) {
      const prodRes = await client.query('SELECT name, sku, current_stock FROM products WHERE id = $1', [item.product_id]);
      if (prodRes.rows.length === 0) {
        insufficientItems.push(`Product '${item.product_name}' no longer exists`);
      } else {
        const prod = prodRes.rows[0];
        if (prod.current_stock < item.quantity) {
          insufficientItems.push(
            `'${prod.name}' (SKU: ${prod.sku}): Requested ${item.quantity}, Available ${prod.current_stock}`
          );
        }
      }
    }

    if (insufficientItems.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        message: 'Cannot confirm challan due to insufficient stock!',
        details: insufficientItems,
      });
    }

    // 4. Deduct Stock & Create Movement Logs
    for (const item of items) {
      await client.query(
        'UPDATE products SET current_stock = current_stock - $1, updated_at = NOW() WHERE id = $2',
        [item.quantity, item.product_id]
      );

      await client.query(
        `INSERT INTO stock_movements (product_id, quantity, movement_type, reason, created_by)
         VALUES ($1, $2, 'OUT', $3, $4)`,
        [item.product_id, item.quantity, `Challan confirmed (${challan.challan_number})`, user_id]
      );
    }

    // 5. Update Status
    const updatedChallan = await client.query(
      'UPDATE challans SET status = \'confirmed\', updated_at = NOW() WHERE id = $1 RETURNING *',
      [id]
    );

    await client.query('COMMIT');

    return res.json({
      message: 'Challan confirmed and stock deducted successfully!',
      challan: updatedChallan.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Confirm challan error:', error);
    return res.status(500).json({ message: 'Error confirming challan' });
  } finally {
    client.release();
  }
});

// POST /api/challans/:id/cancel — Cancel challan (Restore stock if previously confirmed)
router.post('/:id/cancel', authenticate, authorize('admin', 'sales'), async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const user_id = req.user?.id;

    await client.query('BEGIN');

    const challanRes = await client.query('SELECT * FROM challans WHERE id = $1 FOR UPDATE', [id]);
    if (challanRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Challan not found' });
    }

    const challan = challanRes.rows[0];

    if (challan.status === 'cancelled') {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Challan is already cancelled' });
    }

    // If it was confirmed, restore product stock
    if (challan.status === 'confirmed') {
      const itemsRes = await client.query('SELECT * FROM challan_items WHERE challan_id = $1', [id]);
      for (const item of itemsRes.rows) {
        await client.query(
          'UPDATE products SET current_stock = current_stock + $1, updated_at = NOW() WHERE id = $2',
          [item.quantity, item.product_id]
        );

        await client.query(
          `INSERT INTO stock_movements (product_id, quantity, movement_type, reason, created_by)
           VALUES ($1, $2, 'IN', $3, $4)`,
          [item.product_id, item.quantity, `Challan cancelled (${challan.challan_number})`, user_id]
        );
      }
    }

    const updatedChallan = await client.query(
      'UPDATE challans SET status = \'cancelled\', updated_at = NOW() WHERE id = $1 RETURNING *',
      [id]
    );

    await client.query('COMMIT');

    return res.json({
      message: 'Challan cancelled successfully',
      challan: updatedChallan.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Cancel challan error:', error);
    return res.status(500).json({ message: 'Error cancelling challan' });
  } finally {
    client.release();
  }
});

export default router;
