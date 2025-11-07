# Concreexpo Development Roadmap

## ✅ Completed (Phase 1A & 1B)

### Backend Foundation
- ✅ Express + TypeScript + Prisma setup
- ✅ JWT authentication with refresh tokens
- ✅ Password hashing and validation
- ✅ SMS service integration (Twilio)
- ✅ OTP generation utilities
- ✅ Error handling middleware
- ✅ Rate limiting
- ✅ Database schema (8 models)
- ✅ Database seeding

### Master Modules Backend
- ✅ Client Master CRUD API
- ✅ Client Types management
- ✅ Engineer Master CRUD API
- ✅ Engineer password reset
- ✅ Material Master CRUD API with stock calculation

### Frontend Setup
- ✅ Next.js 14 with TypeScript
- ✅ Tailwind CSS + Dark Theme
- ✅ shadcn/ui component library
- ✅ API client with axios
- ✅ Utility functions
- ✅ Design system (colors, animations, typography)
- ✅ Environment configuration

## 🔄 In Progress (Phase 1C-E)

### Backend APIs to Complete

#### 1. Appointment Management Controller
Location: `backend/src/controllers/appointment.controller.ts`

**Endpoints Needed:**
```typescript
// Admin Functions
- getAppointments() // List all with filters
- getAppointment(id) // Single appointment details
- createAppointment() // Create with optional OTP mobile
- updateAppointment(id) // Update appointment
- cancelAppointment(id) // Cancel appointment

// Engineer Functions
- getDashboard() // Engineer's appointments
- sendOTP(id) // Generate & send OTP to client
- verifyOTP(id, otp) // Verify OTP code
- submitFeedback(id, feedback) // Add meeting notes

// Reports (Admin)
- getReports(filters) // Comprehensive reports
- exportReports(format) // Excel/PDF export
```

**OTP Logic:**
```typescript
// In sendOTP():
1. Get appointment with client data
2. Generate 6-digit OTP
3. Set 15-minute expiry
4. Determine recipient:
   - If appointment.otpMobileNumber exists → use it
   - Else → use client.primaryContact
5. Send SMS via Twilio
6. Update appointment: status = OTP_SENT
7. Return success

// In verifyOTP():
1. Check OTP matches
2. Check not expired (< 15 min)
3. Check attempts < 3
4. If valid: status = VERIFIED
5. If invalid: increment attempts, return error
```

#### 2. Inventory Management Controller
Location: `backend/src/controllers/inventory.controller.ts`

**Endpoints Needed:**
```typescript
// Stock Management
- stockIn(data) // Record material received
- stockOut(data) // Record material dispatched
- getStock(filters) // Current stock levels
- getTransactions(filters) // Transaction history

// Reports
- getUsageReport(timeframe, materials) // Usage by time
- getBySiteReport(client, dateRange) // Usage per client
- getBalanceReport() // Current stock snapshot
- getLowStockItems() // Materials below reorder level

// Dashboard Stats
- getTodayStockIn() // Today's receipts
- getTodayStockOut() // Today's dispatches
- getTotalStock() // All materials balance
```

**Stock Calculation:**
```typescript
// For each material:
const stockIn = sum(transactions where type = STOCK_IN)
const stockOut = sum(transactions where type = STOCK_OUT)
const balance = stockIn - stockOut
const isLow = balance < reorderLevel
```

#### 3. Worker Count Management Controller
Location: `backend/src/controllers/workerVisit.controller.ts`

**Endpoints Needed:**
```typescript
// Visit Management (Engineer)
- createVisit(data) // Create visit & send dual OTP
- submitWorkerCount(id, otp, count) // Verify & save count
- getPendingVisits(engineerId) // Pending for engineer
- getCompletedVisits(engineerId, filters) // History

// Reports (Admin)
- getEngineerSummary(filters) // Engineer productivity
- getSiteWiseSummary(client, dateRange) // Site attendance
- getDateWiseAnalysis(month) // Calendar view
- calculateContractorPayment(client, period) // Payment calc
```

**Dual OTP Logic:**
```typescript
// In createVisit():
1. Generate single 6-digit OTP
2. Set 24-hour expiry
3. Send SMS to client.primaryContact
4. Get admin phone from Settings table
5. Send same OTP to admin phone
6. Create visit: status = PENDING
7. Return success

// In submitWorkerCount():
1. Verify OTP (from either client or admin)
2. Check not expired (< 24 hours)
3. No attempt limit (24hr validity allows retries)
4. Save worker count + remarks
5. Update: status = COMPLETED
6. Record submission timestamp
```

### Frontend Components to Build

#### Core Components Needed

```
frontend/
├── components/
│   ├── ui/                    # shadcn components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── table.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── toast.tsx
│   │   └── ...
│   │
│   ├── layout/
│   │   ├── Sidebar.tsx        # 280px collapsible nav
│   │   ├── Topbar.tsx         # Breadcrumb + user menu
│   │   ├── MobileNav.tsx      # Hamburger menu
│   │   └── DashboardLayout.tsx
│   │
│   ├── auth/
│   │   ├── LoginForm.tsx      # Email/password login
│   │   └── ProtectedRoute.tsx # Auth guard
│   │
│   ├── master/
│   │   ├── ClientForm.tsx     # Create/edit client
│   │   ├── ClientList.tsx     # Table/cards view
│   │   ├── EngineerForm.tsx
│   │   ├── EngineerList.tsx
│   │   ├── MaterialForm.tsx
│   │   └── MaterialList.tsx
│   │
│   ├── appointment/
│   │   ├── AppointmentForm.tsx      # Admin creates
│   │   ├── AppointmentCard.tsx      # Engineer view
│   │   ├── OTPInput.tsx             # 6-digit input
│   │   ├── FeedbackForm.tsx         # After verification
│   │   └── AppointmentDashboard.tsx # Engineer grid
│   │
│   ├── inventory/
│   │   ├── StockInForm.tsx          # Side panel
│   │   ├── StockOutForm.tsx         # Side panel
│   │   ├── StockSummaryCards.tsx    # 4 metrics
│   │   ├── TransactionTable.tsx     # Recent activity
│   │   └── InventoryDashboard.tsx
│   │
│   ├── worker/
│   │   ├── CreateVisitForm.tsx      # Engineer creates
│   │   ├── PendingVisitCard.tsx     # Countdown timer
│   │   ├── WorkerCountForm.tsx      # OTP + count
│   │   └── WorkerDashboard.tsx      # Pending/completed
│   │
│   └── reports/
│       ├── AppointmentReports.tsx
│       ├── InventoryReports.tsx
│       ├── WorkerReports.tsx
│       └── ChartComponents.tsx
│
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx
│   │
│   ├── (dashboard)/
│   │   ├── layout.tsx           # Sidebar + Topbar
│   │   ├── page.tsx             # Role-based dashboard
│   │   │
│   │   ├── clients/
│   │   │   ├── page.tsx         # Client list
│   │   │   └── [id]/page.tsx    # Client details
│   │   │
│   │   ├── engineers/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   │
│   │   ├── materials/
│   │   │   └── page.tsx
│   │   │
│   │   ├── appointments/
│   │   │   ├── page.tsx         # Admin list view
│   │   │   ├── dashboard/page.tsx # Engineer cards
│   │   │   └── [id]/page.tsx
│   │   │
│   │   ├── inventory/
│   │   │   ├── page.tsx
│   │   │   └── reports/page.tsx
│   │   │
│   │   ├── worker-counts/
│   │   │   ├── page.tsx
│   │   │   └── reports/page.tsx
│   │   │
│   │   └── reports/
│   │       └── page.tsx
│   │
│   └── api/ (if using Next.js API routes)
│
├── hooks/
│   ├── useAuth.ts               # Authentication hook
│   ├── useClients.ts            # React Query hooks
│   ├── useEngineers.ts
│   ├── useMaterials.ts
│   ├── useAppointments.ts
│   ├── useInventory.ts
│   └── useWorkerVisits.ts
│
└── store/
    ├── authStore.ts             # Zustand auth state
    └── uiStore.ts               # UI state (sidebar, modals)
```

### Key UI Patterns

#### Status Badges
```typescript
const statusConfig = {
  SCHEDULED: { color: 'gray', label: 'Scheduled' },
  OTP_SENT: { color: 'yellow', label: 'OTP Sent', pulse: true },
  VERIFIED: { color: 'green', label: 'Verified' },
  COMPLETED: { color: 'blue', label: 'Completed' },
};
```

#### Card Hover Animation
```css
.card-hover {
  transition: all 0.3s ease;
}
.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px rgba(0,0,0,0.3);
}
```

#### Modal/Side Panel Pattern
```typescript
// For Stock In/Out, Worker Count forms
<Sheet open={isOpen} onOpenChange={setIsOpen}>
  <SheetContent side="right" className="w-[400px]">
    <SheetHeader>
      <SheetTitle>Stock In</SheetTitle>
    </SheetHeader>
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  </SheetContent>
</Sheet>
```

## 📋 Implementation Checklist

### Week 3-4: Appointment Module
- [ ] Create appointment.controller.ts with all endpoints
- [ ] Create appointment.routes.ts
- [ ] Test OTP sending logic with Twilio
- [ ] Build AppointmentForm component
- [ ] Build Engineer dashboard with cards
- [ ] Build OTP verification UI
- [ ] Build feedback form
- [ ] Test complete appointment flow
- [ ] Build appointment reports page

### Week 5-6: Inventory Module
- [ ] Create inventory.controller.ts
- [ ] Create inventory.routes.ts
- [ ] Build Stock In/Out forms
- [ ] Build inventory dashboard
- [ ] Build transaction table
- [ ] Build stock balance calculations
- [ ] Build inventory reports with charts
- [ ] Test stock management flow

### Week 7-8: Worker Count Module
- [ ] Create workerVisit.controller.ts
- [ ] Create workerVisit.routes.ts
- [ ] Test dual OTP sending
- [ ] Build visit creation form
- [ ] Build pending visits list
- [ ] Build worker count submission form
- [ ] Build worker reports
- [ ] Test complete worker count flow

### Week 9: Polish & Deploy
- [ ] Add loading states everywhere
- [ ] Add error boundaries
- [ ] Optimize mobile responsiveness
- [ ] Add animations and transitions
- [ ] Test on real devices
- [ ] Set up production database
- [ ] Deploy backend (Railway/Render)
- [ ] Deploy frontend (Vercel)
- [ ] Configure environment variables
- [ ] Test production deployment
- [ ] User acceptance testing
- [ ] Create user documentation
- [ ] Training sessions

## 🎯 Development Tips

### Backend Development
1. **Test APIs with curl first** before building UI
2. **Use Prisma Studio** to verify data: `npm run prisma:studio`
3. **Check SMS logs** in database to debug delivery issues
4. **Test OTP expiry** by manipulating timestamps

### Frontend Development
1. **Build components in isolation** using Storybook (optional)
2. **Use React Query DevTools** to debug API calls
3. **Test on mobile viewport** in browser DevTools
4. **Use browser console** to debug state changes

### Testing Strategy
1. **Unit tests**: Critical business logic functions
2. **Integration tests**: API endpoints with database
3. **E2E tests**: Complete user flows (Playwright)
4. **Manual testing**: All features on real devices

## 🚀 Quick Commands

```bash
# Backend
cd backend
npm run dev              # Start dev server
npm run prisma:studio    # Open database GUI
npm run prisma:seed      # Re-seed data

# Frontend
cd frontend
npm run dev              # Start Next.js
npm run build            # Production build
npm run lint             # Check code quality

# Git
git add -A && git commit -m "feat: description"
git push origin claude/wall-flooring-management-system-011CUt5myP8P6JC5aSQHLfbz
```

## 📊 Project Status

**Current Phase:** 1C (Appointment Module Development)
**Overall Completion:** ~35%
**Estimated Time Remaining:** 6-7 weeks

**Completed:**
- Project setup (100%)
- Authentication system (100%)
- Master modules backend (100%)
- Master modules frontend (0% - next priority)
- Design system (100%)

**In Progress:**
- Core business modules backend (30%)
- Frontend UI components (10%)

**Not Started:**
- Reports and analytics
- Mobile optimization
- Deployment configuration

---

**Last Updated:** November 7, 2025
**Next Milestone:** Complete Appointment backend API and frontend UI
