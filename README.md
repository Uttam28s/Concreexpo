# Wall & Flooring Business Management System

A comprehensive web-based management system for wall and flooring businesses to streamline engineer visits, inventory tracking, and worker management across multiple client sites.

## 🎯 Project Overview

This system provides:
- **Appointment Management**: Schedule engineer visits with OTP verification
- **Inventory Management**: Track materials (measured in buckets) with Stock In/Out
- **Worker Count Management**: Daily worker attendance tracking with dual OTP verification
- **Master Data Management**: Clients, Engineers, and Materials
- **Comprehensive Reports**: Business insights and analytics

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- Next.js 14+ (App Router)
- React 18+ with TypeScript
- Tailwind CSS + shadcn/ui
- Zustand for state management
- React Query for server state
- React Hook Form + Zod validation

**Backend:**
- Node.js + Express.js + TypeScript
- PostgreSQL + Prisma ORM
- JWT Authentication
- Twilio SMS Integration
- Rate Limiting & Security

**Infrastructure:**
- Frontend: Vercel (recommended)
- Backend: Railway/Render
- Database: PostgreSQL (managed)

## 📁 Project Structure

```
Concreexpo/
├── frontend/          # Next.js frontend application
├── backend/           # Express.js backend API
│   ├── src/
│   │   ├── config/      # Configuration files
│   │   ├── controllers/ # Route controllers
│   │   ├── middleware/  # Express middleware
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic
│   │   ├── utils/       # Utility functions
│   │   └── index.ts     # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   └── seed.ts        # Seed data
│   └── package.json
└── README.md          # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Twilio account (for SMS)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your database and Twilio credentials.

4. **Set up database:**
   ```bash
   # Generate Prisma client
   npm run prisma:generate

   # Run migrations (creates tables)
   npm run prisma:migrate

   # Seed initial data
   npm run prisma:seed
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:3001`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Install additional dependencies:**
   ```bash
   # shadcn/ui components
   npx shadcn@latest init

   # State management and data fetching
   npm install zustand @tanstack/react-query axios

   # Form handling and validation
   npm install react-hook-form zod @hookform/resolvers

   # Date utilities
   npm install date-fns

   # Notifications
   npm install react-hot-toast

   # Charts for reports
   npm install recharts
   ```

4. **Configure environment:**
   Create `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```
   App runs on `http://localhost:3000`

## 🔐 Default Credentials

After seeding the database:

**Admin:**
- Email: `admin@wallfloor.com`
- Password: `Admin@123456`

**Engineer:**
- Email: `engineer@wallfloor.com`
- Password: `Engineer@123`

## 📊 Database Schema

The system uses PostgreSQL with the following main tables:
- `users` - Admin and Engineer users
- `clients` - Client/site information
- `client_types` - Client type categories
- `materials` - Material inventory items
- `appointments` - Engineer visit appointments
- `inventory_transactions` - Stock In/Out records
- `worker_visits` - Daily worker count records
- `settings` - System configuration
- `sms_logs` - SMS delivery logs

See `backend/prisma/schema.prisma` for complete schema.

## 🛣️ API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/change-password` - Change password

### Master Modules
- `/api/clients` - Client management (CRUD)
- `/api/engineers` - Engineer management (CRUD)
- `/api/materials` - Material management (CRUD)

### Appointments
- `/api/appointments` - Appointment management
- `/api/appointments/:id/send-otp` - Send OTP
- `/api/appointments/:id/verify-otp` - Verify OTP
- `/api/appointments/:id/feedback` - Submit feedback

### Inventory
- `/api/inventory/stock-in` - Record stock in
- `/api/inventory/stock-out` - Record stock out
- `/api/inventory/transactions` - Transaction history
- `/api/inventory/reports/*` - Various reports

### Worker Visits
- `/api/worker-visits` - Worker visit management
- `/api/worker-visits/:id/submit-count` - Submit worker count
- `/api/worker-visits/reports/*` - Various reports

## 🔧 Development Scripts

### Backend
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio
npm run prisma:seed      # Seed database
```

### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 📱 User Roles & Permissions

### Admin
- Full system access
- Manage all master data (Clients, Engineers, Materials)
- Create and assign appointments
- View all reports and analytics
- Manage inventory
- Configure system settings

### Engineer
- View assigned appointments
- Send and verify OTPs for visits
- Add feedback after appointments
- Manage inventory (Stock In/Out)
- Create worker count visits
- Submit daily worker counts
- View personal history

## 🔄 Core Workflows

### 1. Appointment Flow
1. Admin creates appointment → SMS sent to client and engineer
2. Engineer completes visit → Sends OTP
3. OTP sent to client's phone (or custom OTP mobile number)
4. Engineer enters OTP from client
5. System verifies OTP
6. Engineer adds feedback
7. Appointment marked complete

### 2. Inventory Flow
1. **Stock In**: Material received → Record quantity and details
2. **Stock Out**: Material dispatched → Record quantity, client, and details
3. Real-time stock balance calculation
4. Low stock alerts
5. Reports by material, client, and timeframe

### 3. Worker Count Flow
1. Engineer creates visit → OTP sent to both client AND admin
2. Engineer requests OTP (from either client or admin)
3. Engineer enters worker count with OTP
4. System verifies and saves record
5. Reports for contractor payments

## 🎨 Frontend Components (To Be Built)

Key components to implement:
- **Layout**: Sidebar navigation, top bar, responsive menu
- **Dashboard**: Summary cards, recent activities
- **Forms**: Reusable form components with validation
- **Tables**: Data tables with sorting, filtering, pagination
- **Modals**: Side panels for forms
- **Cards**: Appointment cards, client cards
- **Charts**: Bar, line, pie charts for reports
- **OTP Input**: Custom 6-digit OTP input component

## 📈 Development Timeline

**Phase 1A**: Setup & Infrastructure (Week 1) ✅ **COMPLETED**
- ✅ Project initialization
- ✅ Database schema
- ✅ Authentication system

**Phase 1B**: Master Modules (Week 2)
- Client Master CRUD
- Engineer Master CRUD
- Material Master CRUD

**Phase 1C**: Appointment Module (Weeks 3-4)
- Appointment creation
- Engineer dashboard
- OTP verification flow
- Feedback system
- Reports

**Phase 1D**: Inventory Module (Weeks 5-6)
- Stock In/Out forms
- Dashboard
- Reports and analytics

**Phase 1E**: Worker Count Module (Weeks 7-8)
- Visit creation
- Worker count entry
- Dual OTP verification
- Reports

**Phase 1F**: Testing & Deployment (Week 9)
- Testing
- Deployment
- Training

## 🔒 Security Features

- JWT-based authentication with refresh tokens
- HTTP-only cookies for token storage
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS protection
- SQL injection prevention (Prisma parameterized queries)
- XSS protection
- Input validation and sanitization

## 📝 Next Steps

1. **Install shadcn/ui** components in frontend
2. **Build authentication UI** (login page)
3. **Create main layout** (sidebar, navigation)
4. **Implement Master Modules UI** (Clients, Engineers, Materials)
5. **Build Appointment Module** (creation, dashboard, OTP flow)
6. **Build Inventory Module** (forms, dashboard, reports)
7. **Build Worker Count Module** (visits, counting, reports)
8. **Add comprehensive testing**
9. **Deploy to production**

## 🤝 Contributing

This is a client project. For development questions or issues, contact the project team.

## 📄 License

Proprietary - All rights reserved

---

**Project Status:** Foundation Complete ✅
**Current Phase:** Master Modules Development
**Last Updated:** November 7, 2025
