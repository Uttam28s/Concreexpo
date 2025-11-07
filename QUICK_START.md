# 🚀 Quick Start Guide - Wall & Flooring Management System

## ✅ What's Been Built (Phase 1A - Complete)

### Backend Foundation
- ✅ Complete database schema with 8 models (Users, Clients, Materials, Appointments, Inventory, Worker Visits, Settings, SMS Logs)
- ✅ JWT authentication system with refresh tokens
- ✅ SMS service integration (Twilio) for OTP delivery
- ✅ Role-based access control (Admin/Engineer)
- ✅ Password hashing and validation
- ✅ OTP generation and validation utilities
- ✅ Error handling middleware
- ✅ Rate limiting for security
- ✅ Database seed script with demo data

### Frontend Foundation
- ✅ Next.js 14 with TypeScript
- ✅ Tailwind CSS configured
- ✅ Project structure set up

### Documentation
- ✅ Comprehensive README files
- ✅ API documentation
- ✅ Environment templates
- ✅ Setup instructions

## 🎯 Getting Started

### Step 1: Set Up Backend

```bash
cd backend

# Install dependencies
npm install

# Set up your database (PostgreSQL required)
# Update .env file with your DATABASE_URL

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed database with initial data
npm run prisma:seed

# Start backend server
npm run dev
```

Backend will run on: http://localhost:3001

### Step 2: Test Backend API

**Health Check:**
```bash
curl http://localhost:3001/api/health
```

**Login (Admin):**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@wallfloor.com",
    "password": "Admin@123456"
  }'
```

**Login (Engineer):**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "engineer@wallfloor.com",
    "password": "Engineer@123"
  }'
```

### Step 3: Set Up Frontend

```bash
cd frontend

# Install dependencies
npm install

# Install additional packages needed
npm install zustand @tanstack/react-query axios react-hook-form zod @hookform/resolvers date-fns react-hot-toast recharts

# Initialize shadcn/ui
npx shadcn@latest init

# Start frontend development server
npm run dev
```

Frontend will run on: http://localhost:3000

## 📊 Seeded Data

After running `npm run prisma:seed`, you'll have:

**Users:**
- Admin: `admin@wallfloor.com` / `Admin@123456`
- Engineer: `engineer@wallfloor.com` / `Engineer@123`

**Client Types:**
- Client, Architect, Contractor, Builder, Interior Designer, Property Developer

**Materials:**
- Wall Putty, Tile Adhesive, Grout, Leveling Compound, Primer, Waterproofing Compound, Epoxy, Sealant

**Demo Client:**
- ABC Construction (Mumbai)

## 🛠️ What to Build Next

### Priority 1: Master Modules (Week 2)
You need to create:

1. **Client Master** (backend/src/controllers/client.controller.ts)
   - List all clients (with pagination)
   - Create client
   - Update client
   - Delete client (soft delete)
   - Manage client types

2. **Engineer Master** (backend/src/controllers/engineer.controller.ts)
   - List all engineers
   - Create engineer
   - Update engineer
   - Deactivate engineer
   - Reset password

3. **Material Master** (backend/src/controllers/material.controller.ts)
   - List all materials
   - Create material
   - Update material (name only)
   - Deactivate material

### Priority 2: Frontend UI Components
Create these components:

1. **Layout Components:**
   - Sidebar navigation
   - Top bar with user menu
   - Responsive mobile menu

2. **Auth Pages:**
   - Login page
   - Password change form

3. **Dashboard:**
   - Admin dashboard (summary cards)
   - Engineer dashboard (appointments)

4. **Master Module Pages:**
   - Client list and forms
   - Engineer list and forms
   - Material list and forms

### Priority 3: Appointment Module
After master modules, build the appointment system:

1. Backend:
   - Appointment CRUD operations
   - OTP sending logic
   - OTP verification
   - Feedback submission

2. Frontend:
   - Appointment creation form (Admin)
   - Engineer appointment dashboard
   - OTP verification UI
   - Feedback form

## 📁 Project Structure

```
Concreexpo/
├── backend/               ← Backend API (Express + TypeScript)
│   ├── src/
│   │   ├── config/       ← Database, environment config
│   │   ├── controllers/  ← Route logic (add new modules here)
│   │   ├── middleware/   ← Auth, error handling
│   │   ├── routes/       ← API routes (add new routes here)
│   │   ├── services/     ← Business logic (SMS, etc.)
│   │   ├── utils/        ← Helpers (JWT, OTP, password)
│   │   └── index.ts      ← Server entry point
│   ├── prisma/
│   │   ├── schema.prisma ← Database schema
│   │   └── seed.ts       ← Seed data
│   └── .env              ← Environment variables
│
├── frontend/              ← Frontend (Next.js + TypeScript)
│   ├── app/              ← Next.js App Router
│   │   ├── (auth)/       ← Create: Login page
│   │   ├── (dashboard)/  ← Create: Dashboard pages
│   │   ├── layout.tsx    ← Root layout
│   │   └── page.tsx      ← Home page
│   ├── components/       ← Create: Reusable components
│   ├── lib/              ← Create: API client, utilities
│   └── .env.local        ← Create: Environment variables
│
└── README.md             ← Project overview
```

## 🔧 Development Workflow

### Adding a New API Endpoint

1. Create controller in `backend/src/controllers/`
2. Create route in `backend/src/routes/`
3. Import route in `backend/src/routes/index.ts`
4. Test with curl or Postman

### Adding a New Frontend Page

1. Create page in `frontend/app/`
2. Create components in `frontend/components/`
3. Set up API calls in `frontend/lib/`
4. Add navigation links

## 🗄️ Database Management

### View Database
```bash
cd backend
npm run prisma:studio
```
Opens GUI at http://localhost:5555

### Create Migration
```bash
# After modifying schema.prisma
npm run prisma:migrate
```

### Reset Database
```bash
npx prisma migrate reset
# This will drop all data and re-seed
```

## 🔐 Environment Variables

### Backend (.env)
Required:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT (32+ chars)
- `TWILIO_ACCOUNT_SID` - Twilio account SID
- `TWILIO_AUTH_TOKEN` - Twilio auth token
- `TWILIO_PHONE_NUMBER` - Twilio phone number

### Frontend (.env.local)
Create this file:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## 📚 Useful Commands

### Backend
```bash
npm run dev              # Start dev server
npm run prisma:studio    # Open database GUI
npm run prisma:seed      # Re-seed database
npm run build            # Build for production
```

### Frontend
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run lint     # Run linter
```

## 🐛 Common Issues

### Database connection error
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Verify database exists

### Prisma client not found
Run: `npm run prisma:generate`

### Port already in use
- Backend: Change PORT in .env (default 3001)
- Frontend: Change port in package.json or kill process

### TypeScript errors
Run: `npm install` in the respective directory

## 📞 API Testing

Use Postman or create a `.http` file for VS Code REST Client:

```http
### Health Check
GET http://localhost:3001/api/health

### Login
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "admin@wallfloor.com",
  "password": "Admin@123456"
}

### Get Current User (replace TOKEN)
GET http://localhost:3001/api/auth/me
Authorization: Bearer YOUR_TOKEN_HERE
```

## 🎨 UI Component Libraries

Recommended to install:
- shadcn/ui (already configured) - Pre-built components
- Lucide React - Icons (`npm install lucide-react`)
- Framer Motion - Animations (`npm install framer-motion`)

## 📈 Development Progress

- ✅ Phase 1A: Setup & Infrastructure (COMPLETE)
- ⏳ Phase 1B: Master Modules (IN PROGRESS)
- 🔜 Phase 1C: Appointment Module
- 🔜 Phase 1D: Inventory Module
- 🔜 Phase 1E: Worker Count Module
- 🔜 Phase 1F: Testing & Deployment

## 💡 Tips

1. **Start with Backend APIs first** for each module, then build the UI
2. **Use Prisma Studio** to verify data while developing
3. **Test APIs with curl** before building frontend
4. **Follow the documentation** provided in the main requirements
5. **Commit frequently** with clear messages
6. **Use the todo list** to track progress

## 🚀 Next Immediate Steps

1. **Set up your database** (PostgreSQL)
2. **Update backend/.env** with your credentials
3. **Run migrations and seed**
4. **Test the backend API** (login, health check)
5. **Start building Client Master** (backend first, then frontend)

## 📖 Documentation

- Main README: `README.md`
- Backend README: `backend/README.md`
- Database Schema: `backend/prisma/schema.prisma`
- Full Requirements: See the original project documentation

---

**Status:** Foundation Complete ✅
**Ready to build:** Master Modules
**Estimated time:** 2-3 weeks for full Phase 1 completion

Happy coding! 🎉
