import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

export let isPgConnected = false;

export const pool = new Pool({
  connectionString: connectionString || 'postgresql://postgres:postgres@localhost:5432/mini_erp',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 2000,
});

// Original pool.query reference
const originalPoolQuery = pool.query.bind(pool);

// In-Memory Storage for Mock Mode Fallback
export class InMemoryDB {
  users: any[] = [];
  customers: any[] = [];
  follow_ups: any[] = [];
  products: any[] = [];
  stock_movements: any[] = [];
  challans: any[] = [];
  challan_items: any[] = [];

  async seed() {
    const adminPass = await bcrypt.hash('Admin@123', 10);
    const salesPass = await bcrypt.hash('Sales@123', 10);
    const warehousePass = await bcrypt.hash('Warehouse@123', 10);
    const accountsPass = await bcrypt.hash('Accounts@123', 10);

    this.users = [
      { id: 1, name: 'System Admin', email: 'admin@erp.com', password: adminPass, role: 'admin', is_active: true, created_at: new Date().toISOString() },
      { id: 2, name: 'Sales Officer', email: 'sales@erp.com', password: salesPass, role: 'sales', is_active: true, created_at: new Date().toISOString() },
      { id: 3, name: 'Warehouse Manager', email: 'warehouse@erp.com', password: warehousePass, role: 'warehouse', is_active: true, created_at: new Date().toISOString() },
      { id: 4, name: 'Accounts Executive', email: 'accounts@erp.com', password: accountsPass, role: 'accounts', is_active: true, created_at: new Date().toISOString() },
    ];

    this.customers = [
      { id: 1, name: 'Rajesh Sharma', mobile: '9876543210', email: 'rajesh@sharmatraders.com', business_name: 'Sharma Traders Pvt Ltd', gst: '24AAACS1424N1ZB', customer_type: 'wholesale', address: 'Plot 45, GIDC Industrial Estate, Vadodara, Gujarat', status: 'active', follow_up_date: '2026-08-20', notes: 'Key wholesale partner for western region', created_by: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 2, name: 'Ankit Patel', mobile: '9898012345', email: 'ankit@patelretail.in', business_name: 'Patel Retail Supermarket', gst: '24BAPPT5544R1ZA', customer_type: 'retail', address: 'Shop 12, Sunrise Complex, Alkapuri, Vadodara', status: 'active', follow_up_date: '2026-08-15', notes: 'Regular monthly order customer', created_by: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 3, name: 'Sanjay Verma', mobile: '9123456789', email: 'sanjay@vermadistributors.com', business_name: 'Verma Global Distribution', gst: '27AACCV9988K1ZM', customer_type: 'distributor', address: 'Building B, Logistics Park, Thane, Maharashtra', status: 'lead', follow_up_date: '2026-08-12', notes: 'Discussing bulk distribution agreement', created_by: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    ];

    this.products = [
      { id: 1, name: 'Industrial Hydraulic Oil 20L', sku: 'OIL-HYD-20L', category: 'Lubricants', unit_price: 3450.00, current_stock: 150, min_stock_alert: 20, location: 'Warehouse A - Rack 04', is_active: true, created_by: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 2, name: 'Heavy Duty Bearing 6204-2RS', sku: 'BRG-6204-2RS', category: 'Spare Parts', unit_price: 280.00, current_stock: 500, min_stock_alert: 50, location: 'Warehouse B - Shelf 12', is_active: true, created_by: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 3, name: 'Stainless Steel Fastener Set M8', sku: 'FST-SS-M8', category: 'Hardware', unit_price: 450.00, current_stock: 12, min_stock_alert: 15, location: 'Warehouse A - Rack 01', is_active: true, created_by: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 4, name: 'Pneumatic Control Valve 1/2"', sku: 'VALVE-PN-12', category: 'Pneumatics', unit_price: 1850.00, current_stock: 45, min_stock_alert: 10, location: 'Warehouse B - Shelf 05', is_active: true, created_by: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    ];

    this.challans = [
      { id: 1, challan_number: 'CH-2026-0001', customer_id: 1, customer_name: 'Sharma Traders Pvt Ltd', total_qty: 10, subtotal: 34500.00, status: 'confirmed', created_by: 2, created_by_name: 'Sales Officer', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    ];

    this.challan_items = [
      { id: 1, challan_id: 1, product_id: 1, product_name: 'Industrial Hydraulic Oil 20L', sku: 'OIL-HYD-20L', unit_price: 3450.00, quantity: 10 }
    ];

    this.stock_movements = [
      { id: 1, product_id: 1, product_name: 'Industrial Hydraulic Oil 20L', sku: 'OIL-HYD-20L', quantity: 10, movement_type: 'OUT', reason: 'Challan confirmed (CH-2026-0001)', created_by: 2, created_by_name: 'Sales Officer', created_at: new Date().toISOString() }
    ];

    this.follow_ups = [
      { id: 1, customer_id: 1, note: 'Initial onboarding meeting completed.', created_by: 1, created_by_name: 'System Admin', created_at: new Date().toISOString() }
    ];
  }
}

export const inMemoryDB = new InMemoryDB();

// Override pool.query with intelligent fallback runner
(pool as any).query = async function (queryText: any, values?: any) {
  if (isPgConnected) {
    return originalPoolQuery(queryText, values);
  }

  const sql = (typeof queryText === 'string' ? queryText : queryText.text || '').trim();
  const params = values || [];

  // USERS
  if (sql.includes('FROM users WHERE email')) {
    const email = params[0]?.toLowerCase();
    const rows = inMemoryDB.users.filter((u) => u.email.toLowerCase() === email);
    return { rows, rowCount: rows.length };
  }
  if (sql.includes('FROM users WHERE id')) {
    const id = params[0];
    const rows = inMemoryDB.users.filter((u) => u.id === Number(id));
    return { rows, rowCount: rows.length };
  }
  if (sql.includes('SELECT COUNT(*) FROM users')) {
    return { rows: [{ count: inMemoryDB.users.length }], rowCount: 1 };
  }

  // CUSTOMERS
  if (sql.includes('SELECT COUNT(*) FROM customers')) {
    let list = [...inMemoryDB.customers];
    if (params.length > 0 && typeof params[0] === 'string' && params[0].startsWith('%')) {
      const q = params[0].replace(/%/g, '').toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.mobile.includes(q) ||
          (c.email && c.email.toLowerCase().includes(q)) ||
          c.business_name.toLowerCase().includes(q)
      );
    }
    return { rows: [{ count: list.length }], rowCount: 1 };
  }

  if (sql.includes('SELECT') && sql.includes('FROM customers WHERE id')) {
    const id = Number(params[0]);
    const rows = inMemoryDB.customers.filter((c) => c.id === id);
    return { rows, rowCount: rows.length };
  }

  if (sql.includes('SELECT') && sql.includes('FROM customers')) {
    let list = [...inMemoryDB.customers];
    return { rows: list, rowCount: list.length };
  }

  if (sql.startsWith('INSERT INTO customers')) {
    const newCustomer = {
      id: inMemoryDB.customers.length + 1,
      name: params[0],
      mobile: params[1],
      email: params[2],
      business_name: params[3],
      gst: params[4],
      customer_type: params[5],
      address: params[6],
      status: params[7] || 'lead',
      follow_up_date: params[8],
      notes: params[9],
      created_by: params[10] || 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    inMemoryDB.customers.unshift(newCustomer);
    return { rows: [newCustomer], rowCount: 1 };
  }

  if (sql.startsWith('UPDATE customers')) {
    const id = Number(params[params.length - 1]);
    const cust = inMemoryDB.customers.find((c) => c.id === id);
    if (cust) {
      cust.name = params[0] || cust.name;
      cust.mobile = params[1] || cust.mobile;
      cust.email = params[2] || cust.email;
      cust.business_name = params[3] || cust.business_name;
      cust.gst = params[4] || cust.gst;
      cust.customer_type = params[5] || cust.customer_type;
      cust.address = params[6] || cust.address;
      cust.status = params[7] || cust.status;
      cust.follow_up_date = params[8] || cust.follow_up_date;
      cust.notes = params[9] || cust.notes;
      cust.updated_at = new Date().toISOString();
      return { rows: [cust], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // FOLLOW UPS
  if (sql.startsWith('INSERT INTO follow_ups')) {
    const newNote = {
      id: inMemoryDB.follow_ups.length + 1,
      customer_id: Number(params[0]),
      note: params[1],
      created_by: Number(params[2]),
      created_by_name: 'Staff Member',
      created_at: new Date().toISOString(),
    };
    inMemoryDB.follow_ups.unshift(newNote);
    return { rows: [newNote], rowCount: 1 };
  }
  if (sql.includes('FROM follow_ups')) {
    const custId = Number(params[0]);
    const rows = inMemoryDB.follow_ups.filter((f) => f.customer_id === custId);
    return { rows, rowCount: rows.length };
  }

  // PRODUCTS
  if (sql.includes('SELECT COUNT(*) FROM products')) {
    return { rows: [{ count: inMemoryDB.products.length }], rowCount: 1 };
  }
  if (sql.includes('SELECT') && sql.includes('FROM products WHERE id')) {
    const id = Number(params[0]);
    const rows = inMemoryDB.products.filter((p) => p.id === id);
    return { rows, rowCount: rows.length };
  }
  if (sql.includes('SELECT') && sql.includes('FROM products')) {
    return { rows: [...inMemoryDB.products], rowCount: inMemoryDB.products.length };
  }
  if (sql.startsWith('INSERT INTO products')) {
    const newProd = {
      id: inMemoryDB.products.length + 1,
      name: params[0],
      sku: params[1],
      category: params[2],
      unit_price: Number(params[3]),
      current_stock: Number(params[4]),
      min_stock_alert: Number(params[5]),
      location: params[6],
      is_active: true,
      created_by: params[7] || 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    inMemoryDB.products.unshift(newProd);
    return { rows: [newProd], rowCount: 1 };
  }
  if (sql.startsWith('UPDATE products SET current_stock')) {
    const newStock = Number(params[0]);
    const id = Number(params[1]);
    const prod = inMemoryDB.products.find((p) => p.id === id);
    if (prod) {
      prod.current_stock = newStock;
      prod.updated_at = new Date().toISOString();
      return { rows: [prod], rowCount: 1 };
    }
  }

  // STOCK MOVEMENTS
  if (sql.startsWith('INSERT INTO stock_movements')) {
    const prod = inMemoryDB.products.find((p) => p.id === Number(params[0]));
    const newMov = {
      id: inMemoryDB.stock_movements.length + 1,
      product_id: Number(params[0]),
      product_name: prod?.name || 'Product',
      sku: prod?.sku || 'SKU',
      quantity: Number(params[1]),
      movement_type: params[2],
      reason: params[3],
      created_by: Number(params[4]),
      created_by_name: 'Warehouse Officer',
      created_at: new Date().toISOString(),
    };
    inMemoryDB.stock_movements.unshift(newMov);
    return { rows: [newMov], rowCount: 1 };
  }
  if (sql.includes('FROM stock_movements')) {
    return { rows: [...inMemoryDB.stock_movements], rowCount: inMemoryDB.stock_movements.length };
  }

  // CHALLANS
  if (sql.includes('SELECT COUNT(*) FROM challans')) {
    return { rows: [{ count: inMemoryDB.challans.length }], rowCount: 1 };
  }
  if (sql.includes('FROM challans WHERE id')) {
    const id = Number(params[0]);
    const rows = inMemoryDB.challans.filter((c) => c.id === id);
    return { rows, rowCount: rows.length };
  }
  if (sql.includes('FROM challan_items WHERE challan_id')) {
    const id = Number(params[0]);
    const rows = inMemoryDB.challan_items.filter((ci) => ci.challan_id === id);
    return { rows, rowCount: rows.length };
  }
  if (sql.includes('FROM challans')) {
    return { rows: [...inMemoryDB.challans], rowCount: inMemoryDB.challans.length };
  }
  if (sql.startsWith('INSERT INTO challans')) {
    const cust = inMemoryDB.customers.find((c) => c.id === Number(params[1]));
    const newChallan = {
      id: inMemoryDB.challans.length + 1,
      challan_number: params[0],
      customer_id: Number(params[1]),
      customer_name: cust?.business_name || cust?.name || 'Customer',
      total_qty: Number(params[2]),
      subtotal: Number(params[3]),
      status: params[4] || 'draft',
      created_by: Number(params[5]),
      created_by_name: 'Sales Officer',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    inMemoryDB.challans.unshift(newChallan);
    return { rows: [newChallan], rowCount: 1 };
  }
  if (sql.startsWith('INSERT INTO challan_items')) {
    const newItem = {
      id: inMemoryDB.challan_items.length + 1,
      challan_id: Number(params[0]),
      product_id: Number(params[1]),
      product_name: params[2],
      sku: params[3],
      unit_price: Number(params[4]),
      quantity: Number(params[5]),
    };
    inMemoryDB.challan_items.push(newItem);
    return { rows: [newItem], rowCount: 1 };
  }
  if (sql.startsWith('UPDATE challans SET status')) {
    const status = params[0];
    const id = Number(params[1]);
    const ch = inMemoryDB.challans.find((c) => c.id === id);
    if (ch) {
      ch.status = status;
      ch.updated_at = new Date().toISOString();
      return { rows: [ch], rowCount: 1 };
    }
  }

  // Fallback default
  return { rows: [], rowCount: 0 };
};

export async function initDB() {
  try {
    const client = await pool.connect();
    isPgConnected = true;
    console.log('✅ Connected to PostgreSQL Database!');
    await inMemoryDB.seed();
    client.release();
  } catch (error) {
    console.warn('⚠️ Could not connect to local PostgreSQL. Initializing resilient In-Memory Data Store fallback...');
    isPgConnected = false;
    await inMemoryDB.seed();
    console.log('✅ Resilient In-Memory DB Mode Ready for testing!');
  }
}
