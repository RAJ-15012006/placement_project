# Mini ERP + CRM Operations Portal Documentation

## 📌 Executive Summary
This repository contains a complete Mini ERP + CRM Operations Portal built as a production-ready full-stack solution. It combines a modern React user interface with a strong Node.js + TypeScript backend, a reliable PostgreSQL data layer, and containerized deployment.

The platform is built for wholesale distribution, inventory control, customer relationship management, sales document creation, and executive analytics. It is designed to help business teams operate faster, make inventory decisions confidently, and maintain audit-ready traceability.

---

## 🧩 Project Structure

The repository is organized to separate concerns clearly and support scalable development:

- `mini-erp-crm/`
  - `backend/` - Full API server, business logic, and database integration
  - `frontend/` - Customer-facing React dashboard and operational UI
  - `docker-compose.yml` - Local multi-container deployment for PostgreSQL, backend, and frontend
  - `postman_collection.json` - API testing bundle for functional validation
  - `.github/workflows/deploy.yml` - CI/CD workflow for build validation

- `package.json` - Root workspace manifest

---

## 🛠️ Technologies and Tools Included

### Backend
- Node.js 20
- Express.js
- TypeScript
- PostgreSQL
- `pg` database driver
- `bcryptjs` for password encryption
- `jsonwebtoken` for JWT-based authentication
- `express-validator` for request validation
- `helmet` for security headers
- `cors` for cross-origin request support
- `morgan` for request logging
- `dotenv` for environment configuration

### Frontend
- React 18
- Vite
- TypeScript
- Tailwind CSS for modern styling
- `@react-three/fiber` and `@react-three/drei` for interactive 3D UI elements
- `three` for 3D scene rendering
- `axios` for API communication
- `jsPDF` and `jspdf-autotable` for downloadable invoice PDFs
- `lucide-react` for iconography
- `framer-motion` for smooth animations
- `react-router-dom` for page routing
- `clsx` for clean class composition

### DevOps & Deployment
- Docker for reproducible environments
- `docker-compose` for full stack orchestration
- Multi-stage Docker builds in `backend/Dockerfile` and `frontend/Dockerfile`
- GitHub Actions pipeline in `.github/workflows/deploy.yml`
- Postman collection for API validation and QA

---

## 🔧 System Architecture

### Backend Architecture
- `backend/src/index.ts` starts the server, applies middleware, and registers API routes.
- `backend/src/config/database.ts` manages the PostgreSQL connection and includes an in-memory demo fallback.
- `backend/src/middleware/auth.ts` handles authentication and role-based authorization.
- `backend/src/middleware/validate.ts` handles centralized request validation responses.
- `backend/src/routes/` contains modular API route definitions:
  - `auth.ts` - login, token generation, and user info
  - `customers.ts` - customer management and CRM operations
  - `products.ts` - product catalog, inventory, and stock adjustments
  - `challans.ts` - sales challan creation, confirmation, and stock deduction
  - `dashboard.ts` - analytics and KPI summaries

### Frontend Architecture
- `frontend/src/App.tsx` contains the global layout, navigation, route protection, and role-based access controls.
- `frontend/src/context/AuthContext.tsx` implements authentication state and quick role login presets for evaluation.
- `frontend/src/pages/` contains the main business interfaces:
  - `Dashboard.tsx` - metrics, inventory view, and 3D visual presentation
  - `Customers.tsx` - customer CRM operations
  - `Products.tsx` - inventory management and stock control
  - `Challans.tsx` - sales challan lifecycle and invoice export
- `frontend/src/components/3d/` provides interactive 3D components for engagement and data visualization.
- `frontend/src/services/api.ts` centralizes API calls and request handling.

### Data Flow and Business Logic
- The backend stores core entities in PostgreSQL: users, customers, products, stock movements, challans, and challan items.
- The system performs transactional stock validation and updates when a challan is confirmed, ensuring inventory integrity.
- All stock movements are logged for audit and traceability.
- Demo seed data is included to support quick evaluation and demonstration.

---

## 🚀 Key Functional Capabilities

### Role-Based Operations
- Four user roles: Admin, Sales, Warehouse, Accounts
- Fine-grained authorization for business workflows
- API-level protection using JWT authentication
- Frontend role switcher to simulate real user responsibilities quickly

### Customer CRM
- Customer listing with search, filters, and status indicators
- Create, edit, and view customer details
- Lead management and follow-up note tracking
- Designed to support sales and account management workflows

### Inventory & Product Management
- Product catalog with SKU, price, stock, category, and location details
- Stock adjustment operations for IN and OUT movements
- Low-stock alerts for proactive replenishment
- Stock movement history for auditing and operational review

### Sales Challans and Invoice Management
- Create sales challans with line-item details
- Manage drafts and confirmed invoices separately
- Auto-generated challan numbers for consistency
- Stock validation and deduction at confirmation time
- Export professional PDF invoices from the UI

### Business Dashboard and Visualization
- Executive dashboard with operational KPIs
- Recent challan and inventory summaries
- Interactive 3D visual elements for product and inventory insights
- Suitable for managers and decision makers

---

## 📁 Files and Components Overview

### Backend Files
- `backend/src/index.ts` - Main API server and route registration
- `backend/src/config/database.ts` - Data access and demo fallback
- `backend/src/middleware/auth.ts` - JWT authentication and authorization
- `backend/src/middleware/validate.ts` - Request validation helper
- `backend/src/routes/auth.ts` - Authentication endpoints
- `backend/src/routes/customers.ts` - CRM endpoints
- `backend/src/routes/products.ts` - Inventory and stock endpoints
- `backend/src/routes/challans.ts` - Sales challan workflow
- `backend/src/routes/dashboard.ts` - Dashboard metrics
- `backend/Dockerfile` - Backend container build definition

### Frontend Files
- `frontend/src/App.tsx` - App shell, router, and layout
- `frontend/src/context/AuthContext.tsx` - Authentication and role context
- `frontend/src/pages/Dashboard.tsx` - Executive dashboard page
- `frontend/src/pages/Customers.tsx` - Customer relationship page
- `frontend/src/pages/Products.tsx` - Inventory management page
- `frontend/src/pages/Challans.tsx` - Sales challan and invoicing page
- `frontend/src/services/api.ts` - API service interface
- `frontend/Dockerfile` - Frontend container build definition

### Infrastructure Files
- `docker-compose.yml` - Local development orchestration
- `mini-erp-crm/postman_collection.json` - API test collection
- `.github/workflows/deploy.yml` - CI/CD build validation

---

## ⚙️ Setup & Run Instructions

### Local Development
1. Open a terminal in `mini-erp-crm/`.
2. Start the backend:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
3. Start the frontend:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```
4. Open the application at `http://localhost:5173`.

### Docker Deployment
1. From `mini-erp-crm/`, run:
   ```bash
   docker-compose up --build
   ```
2. App endpoints after startup:
   - Frontend: `http://localhost`
   - Backend API: `http://localhost:5000`
   - PostgreSQL: `localhost:5432`

### CI/CD Verification
- The provided GitHub Actions workflow validates the backend and frontend build process on `main` / `master`.
- The backend build verifies TypeScript compilation and package installation.
- The frontend build verifies production bundle creation.

---

## 🎯 Business Value and Impact

### Benefits for Business Teams
- Accelerates sales operations with digital challan creation
- Improves inventory control with stock status visibility
- Reduces manual paperwork through PDF invoice generation
- Ensures process control via role-based access
- Supports timely customer follow-up and lead management

### Benefits for Technology Teams
- Clean separation of frontend and backend responsibilities
- Reusable architecture supporting future feature growth
- Production-oriented deployment using Docker
- Automated build validation for reliability
- Easily extensible API and UI components

---

## 💼 HR-Friendly Summary
This project is a ready-to-present enterprise solution that demonstrates:

- End-to-end product delivery: UI, API, database, deployment
- Practical business process automation for wholesale and distribution
- Secure user control through role-based authorization
- Modern web technologies and production tooling
- Attention to business metrics, auditability, and maintainability

It is suitable for portfolio review, stakeholder demonstrations, or interview presentations.

---

## 📄 Downloadable Link
The full documentation is saved locally as:

`file:///Users/rajsamrendrakumar/Desktop/AIML_HACKATHON/PROJECT_DOCUMENTATION.md`

Open or download it directly from the workspace viewer in VS Code.

---

## 📌 Notes
- The project contains demo preset user accounts and an in-memory fallback for fast evaluation.
- This documentation is written to serve both technical and non-technical readers.
- If you want, I can also generate a PDF version of this documentation file.
