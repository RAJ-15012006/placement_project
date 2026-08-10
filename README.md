# 🚀 Mini ERP + CRM Operations Portal (3D UI & Shadcn)

An enterprise-grade, high-performance Wholesale & Distribution Operations Portal built with **Node.js, Express, TypeScript, PostgreSQL, React, Tailwind CSS, Three.js / React Three Fiber, and Shadcn UI styling**.

---

## 🌟 Key Highlights & Tech Stack

### **Frontend**
* **Framework:** React 18 + Vite + TypeScript
* **Styling & Aesthetics:** Tailwind CSS + Dark Glassmorphism + Shadcn UI design system
* **3D Visualizations:** Three.js + `@react-three/fiber` + `@react-three/drei` for interactive 3D hero engine & 3D warehouse stock cube visualizer
* **Document Generation:** `jsPDF` + `jspdf-autotable` for downloadable PDF sales invoices
* **State & Icons:** React Context API + Lucide React Icons + Framer Motion

### **Backend**
* **Framework:** Node.js + Express.js + TypeScript
* **Database:** PostgreSQL (with resilient local in-memory DB fallback)
* **Security & Auth:** JWT (JSON Web Tokens) + Role-Based Access Control (RBAC) + `bcryptjs` + `helmet` + `cors`
* **Validation:** `express-validator` + HTTP status codes + Atomic transactions (`BEGIN ... COMMIT`)

### **DevOps & Infrastructure**
* **Containerization:** Multi-stage `Dockerfile` & `docker-compose.yml`
* **CI/CD:** GitHub Actions workflow (`.github/workflows/deploy.yml`)
* **API Documentation:** Included Postman Collection (`postman_collection.json`)

---

## 🔑 Test User Credentials (Role-Based Access)

Use any of the following accounts to test role-restricted permissions:

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@erp.com` | `Admin@123` | Full access across all modules |
| **Sales** | `sales@erp.com` | `Sales@123` | Customer CRM, Lead follow-ups, Sales Challan creation |
| **Warehouse** | `warehouse@erp.com` | `Warehouse@123` | Product catalog, Stock IN/OUT adjustments, Audit logs |
| **Accounts** | `accounts@erp.com` | `Accounts@123` | Read-only analytics, Invoices & PDF exports |

> *Tip: Click the **ROLE switcher pill** in the top navigation bar during testing to switch roles instantly with 1 click!*

---

## ⚡ Core Business Modules

### 1. **Authentication & Role-Based Security**
* JWT authentication middleware verifying role permissions on protected REST endpoints.
* Frontend navbar displaying current active role badge.

### 2. **Customer CRM Module**
* Complete customer management for Retail, Wholesale, and Distributor partners.
* Filters by customer status (`Lead`, `Active`, `Inactive`) & type.
* Customer detail drawer with interactive **Follow-up Notes Timeline**.

### 3. **Product & Inventory Module**
* Product catalog tracking SKU, category, unit price, current stock, and warehouse rack/shelf location.
* Low stock alert thresholds highlighting items below minimum stock.
* **Stock Movement Audit Trail Log:** Tracks stock `IN` / `OUT` movements with quantity, reason, timestamp, and user audit.

### 4. **Sales Challan & Invoice Flow**
* Auto-generated Challan Numbers (`CH-2026-0001`).
* Product line-item builder with automatic total subtotal calculation.
* **Atomic Stock Control:** When a challan is set to `CONFIRMED`, database transaction checks stock levels, prevents negative stock (returns HTTP 400 if stock is insufficient), and deducts inventory atomically.
* Product snapshot data saved directly inside challan line items for historical immutability.
* **PDF Invoice Generator:** Export confirmed sales challans to downloadable PDF invoices.

---

## 🛠️ Local Development Setup

### **Prerequisites**
* Node.js v18+ or v20+
* npm or yarn

### **Step 1: Clone Repository**
```bash
git clone <repository_url>
cd mini-erp-crm
```

### **Step 2: Start Backend**
```bash
cd backend
npm install
npm run dev
```
*Backend server will start at `http://localhost:5000`.*

### **Step 3: Start Frontend**
```bash
cd ../frontend
npm install
npm run dev
```
*Frontend app will open at `http://localhost:5173`.*

---

## 🐳 Docker Deployment (`docker-compose`)

Launch PostgreSQL, Express Backend, and React Frontend containers with a single command:

```bash
docker-compose up --build
```
- **Frontend App:** `http://localhost`
- **Backend API:** `http://localhost:5000`
- **PostgreSQL DB:** `localhost:5432`

---

## ☁️ Free Cloud Deployment Guide

1. **Database (Neon / Supabase):** Create a free PostgreSQL database instance and set `DATABASE_URL` in backend environment variables.
2. **Backend (Render / Railway / Fly.io):** Deploy `backend/` directory as a Web Service. Set environment variables: `PORT=5000`, `DATABASE_URL`, `JWT_SECRET`.
3. **Frontend (Vercel / Netlify):** Deploy `frontend/` directory. Set `VITE_API_URL` pointing to live backend URL.

---

## 🎤 Candidate Defense & Interview Explanation Guide

### **Frontend**
> *"I built the frontend using React 18, TypeScript, Vite, Tailwind CSS, and Shadcn UI design principles. For high visual engagement, I integrated Three.js and React Three Fiber to render an interactive 3D hero core node and a 3D stock cube visualizer. State management uses React Context for auth tokens, role switching, and modular components."*

### **Backend**
> *"The backend API is built with Node.js, Express, and TypeScript. Authentication is secured using JWT with bcrypt password encryption. Route access is controlled by custom role-based middleware (`admin`, `sales`, `warehouse`, `accounts`)."*

### **Database & Stock Logic**
> *"Database transactions run on PostgreSQL. For Sales Challan confirmation, we execute an atomic transaction (`BEGIN ... COMMIT`) that checks current stock, prevents negative stock with clear error details, deducts inventory, and records `OUT` audit logs in `stock_movements`."*

### **DevOps**
> *"Containerized via multi-stage Dockerfiles and `docker-compose`. Configured GitHub Actions CI/CD to validate builds on pull requests."*
