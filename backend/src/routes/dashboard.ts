import { Router, Request, Response } from 'express';
import { pool } from '../config/database';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET /api/dashboard/stats
router.get('/stats', authenticate, async (req: Request, res: Response) => {
  try {
    const [
      totalCustRes,
      activeCustRes,
      leadsRes,
      totalProdRes,
      lowStockRes,
      totalChallanRes,
      confirmedChallanRes,
      draftChallanRes,
      recentChallansRes,
      recentCustRes,
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM customers'),
      pool.query("SELECT COUNT(*) FROM customers WHERE status = 'active'"),
      pool.query("SELECT COUNT(*) FROM customers WHERE status = 'lead'"),
      pool.query('SELECT COUNT(*) FROM products WHERE is_active = true'),
      pool.query('SELECT COUNT(*) FROM products WHERE current_stock <= min_stock_alert AND is_active = true'),
      pool.query('SELECT COUNT(*) FROM challans'),
      pool.query("SELECT COUNT(*) FROM challans WHERE status = 'confirmed'"),
      pool.query("SELECT COUNT(*) FROM challans WHERE status = 'draft'"),
      pool.query(`
        SELECT ch.*, c.name as customer_name, c.business_name as customer_business
        FROM challans ch
        LEFT JOIN customers c ON ch.customer_id = c.id
        ORDER BY ch.created_at DESC LIMIT 5
      `),
      pool.query('SELECT * FROM customers ORDER BY created_at DESC LIMIT 5'),
    ]);

    return res.json({
      totalCustomers: parseInt(totalCustRes.rows[0].count),
      activeCustomers: parseInt(activeCustRes.rows[0].count),
      leads: parseInt(leadsRes.rows[0].count),
      totalProducts: parseInt(totalProdRes.rows[0].count),
      lowStockProducts: parseInt(lowStockRes.rows[0].count),
      totalChallans: parseInt(totalChallanRes.rows[0].count),
      confirmedChallans: parseInt(confirmedChallanRes.rows[0].count),
      draftChallans: parseInt(draftChallanRes.rows[0].count),
      recentChallans: recentChallansRes.rows,
      recentCustomers: recentCustRes.rows,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return res.status(500).json({ message: 'Error fetching dashboard metrics' });
  }
});

export default router;
