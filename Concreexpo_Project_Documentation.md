# Concreexpo
## Complete Project Documentation

**Version:** 1.0  
**Date:** November 7, 2025  
**Project Type:** Web Application  
**Phase:** 1 (MVP)

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [System Users & Access Control](#system-users--access-control)
3. [Master Modules](#master-modules)
4. [Core Module 1: Appointment & Visit Verification](#core-module-1-appointment--visit-verification)
5. [Core Module 2: Inventory Management](#core-module-2-inventory-management)
6. [Core Module 3: Worker Count Management](#core-module-3-worker-count-management)
7. [Technical Requirements](#technical-requirements)
8. [Database Schema](#database-schema)
9. [API Endpoints](#api-endpoints)
10. [Development Timeline](#development-timeline)

---

## Project Overview

A comprehensive web-based management system for a wall and flooring business to streamline engineer visits, inventory tracking, and worker management across multiple client sites.

### Business Context
- **Industry:** Wall and flooring construction services
- **Primary Users:** Admin and Engineers
- **Key Challenge:** Manual tracking of visits, materials, and workers
- **Solution:** Automated system with OTP verification and real-time reporting

### Core Objectives
1. Digitize appointment scheduling and verification
2. Track material inventory (measured in buckets)
3. Monitor daily worker count per site for contractor payments
4. Generate comprehensive reports for business insights

---

## System Users & Access Control

### User Roles

#### 1. Admin
**Access Level:** Full system access

**Capabilities:**
- Manage all master data (Clients, Engineers, Materials)
- Create and assign appointments
- View all reports and analytics
- Manage inventory transactions
- Receive OTP notifications for worker count verification
- Configure system settings

#### 2. Engineer
**Access Level:** Limited to assigned tasks

**Capabilities:**
- View assigned appointments on dashboard
- Send and verify OTPs for visit completion
- Add feedback after appointments
- Manage inventory (Stock In/Out)
- Create worker count visits
- Submit daily worker counts
- View personal history

#### 3. Client (Not a system user)
**Interaction:** SMS-based only

**Touchpoints**:
- Receives appointment notification SMS
- Receives OTP SMS for visit verification
- Receives OTP SMS for worker count verification
- Provides OTP verbally to engineer

---

## Master Modules

### 1. Client Master

**Purpose:** Centralized database of all clients/sites

#### Data Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Client Name | Text | Yes | Full name of client/company |
| Address | Text Area | Yes | Complete site/office address |
| Primary Contact | Mobile (10 digits) | Yes | Main contact number for SMS |
| Client Type | Dropdown | Yes | Admin-configurable types |
| Alt Contact Name | Text | No | Secondary contact person |
| Alt Contact Phone | Mobile | No | Secondary contact number |
| Status | Boolean | Auto | Active/Inactive |

#### Client Types (Examples)
- Client
- Architect
- Contractor
- Builder
- Interior Designer
- Property Developer

**Note:** Admin can add/edit client types dynamically

#### Features
- Add new clients
- Edit existing client details
- Search and filter clients
- Mark clients as active/inactive
- Bulk import (future phase)

---

### 2. Engineer Master

**Purpose:** Manage engineer database and credentials

#### Data Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Engineer Name | Text | Yes | Full name |
| Contact Number | Mobile | Yes | For login and SMS |
| Email | Email | Yes | Login credential |
| Employee ID | Auto-generated | Auto | Unique identifier |
| Password | Encrypted | Yes | Login password |
| Status | Boolean | Auto | Active/Inactive |

#### Features
- Add new engineers
- Edit engineer details
- Reset passwords
- Deactivate engineers
- View engineer performance metrics

---

### 3. Material Master

**Purpose:** Define and manage material inventory types

#### Data Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Material Name | Text | Yes | Name of material (e.g., Wall Putty, Tile Adhesive, Grout) |
| Status | Boolean | Auto | Active/Inactive |

**Note:** Only Material Name is required. No material type or category field needed in Phase 1.

#### Material Examples
- Wall Putty
- Tile Adhesive
- Grout
- Leveling Compound
- Primer
- Waterproofing Compound
- Epoxy
- Sealant

#### Features
- Add new materials
- Edit material name
- Mark as active/inactive
- Track usage per material
- Search and filter materials

---

## Core Module 1: Appointment & Visit Verification

### Overview
Engineers visit client sites for consultations, measurements, or inspections. This module ensures visit accountability through OTP verification and captures meeting feedback.

### 1.1 Appointment Creation (Admin Only)

#### Appointment Form

**Required Fields:**
- **Engineer Name:** Dropdown (from Engineer Master)
- **Client Name:** Dropdown (from Client Master)
- **Attendee Person Name:** Text input (person to meet at site)
- **Date & Time:** Date-time picker
- **Location:** Manual text input (site address)

**Optional Field:**
- **OTP Mobile Number:** Mobile (10 digits) - Optional field for sending OTP to a different number

#### OTP Number Logic for Appointments
When engineer sends OTP after completing visit:
- **If OTP Mobile Number is filled in appointment:** Send OTP to this number
- **If OTP Mobile Number is empty:** Send OTP to Client's Primary Contact number (from Client Master)

This provides flexibility to send OTP to a specific person for each appointment.

#### Creation Workflow

```
1. Admin fills appointment form
2. System validates all fields
3. Appointment created with unique ID
4. SMS sent to Client's Primary Contact: "Appointment scheduled with [Engineer] on [Date/Time] at [Location]"
5. SMS sent to Engineer: "New appointment: Client [Name], Date: [Date/Time], Location: [Location]"
6. Appointment appears on Engineer's dashboard
```

**SMS Templates:**

*To Client (Primary Contact):*
```
Appointment scheduled with [ENGINEER_NAME] on [DATE] at [TIME]. 
Location: [LOCATION]. You will receive an OTP after the visit 
for verification. - [COMPANY_NAME]
```

*To Engineer:*
```
New appointment: Client [CLIENT_NAME], Date: [DATE] [TIME], 
Location: [LOCATION], Attendee: [ATTENDEE_NAME]. 
Check dashboard for details. - [COMPANY_NAME]
```

---

### 1.2 Engineer Dashboard

#### Dashboard Layout

**View:** Card-based grid (3 columns on desktop, 1 on mobile)

**Each Card Shows:**
- Client Name (Header)
- Attendee Name
- Date & Time (with calendar icon)
- Location (with map pin icon)
- Status Badge (color-coded)
- Action Button (context-based)

#### Status States

| Status | Badge Color | Description | Available Action |
|--------|-------------|-------------|------------------|
| Scheduled | Gray | Upcoming appointment | View Details |
| In-Progress | Yellow (pulsing) | After appointment time | Send OTP |
| OTP Sent | Blue (pulsing) | OTP sent to client | Enter OTP |
| Verified | Green | OTP verified | Add Feedback |
| Completed | Blue | Feedback submitted | View Feedback |

---

### 1.3 Visit Verification Process

#### Step-by-Step Flow

**Step 1: Engineer Completes Visit**
- Engineer arrives at site
- Meets with attendee
- Completes required work/consultation

**Step 2: Send OTP**
- Engineer clicks "Send OTP" button on appointment card
- System generates 6-digit OTP
- OTP validity: 15 minutes
- **SMS sent to:**
  - Appointment's OTP Mobile Number (if filled during appointment creation)
  - OR Client's Primary Contact (if OTP Mobile Number was not filled in appointment)
- Button changes to "Resend OTP" (with 60-second cooldown)

**OTP SMS to Client:**
```
Your OTP for visit verification with [ENGINEER_NAME] is: [OTP]. 
Valid for 15 minutes. Share this with the engineer. - [COMPANY_NAME]
```

**Step 3: Client Provides OTP**
- Client receives SMS
- Client verbally tells OTP to engineer (6 digits)

**Step 4: Engineer Enters OTP**
- Engineer types 6-digit OTP in app
- Clicks "Verify OTP" button
- System validates OTP:
  - ✅ **Valid:** Status changes to "Verified"
  - ❌ **Invalid:** Error message shown, can retry
  - ⏱️ **Expired:** Must click "Resend OTP"
- Maximum 3 attempts before OTP expires

**Step 5: Add Feedback**
- After successful OTP verification
- Text area appears: "Enter feedback or notes from the meeting..."
- Engineer types meeting notes (minimum 10 characters)
- Clicks "Submit Feedback"
- Appointment marked as "Completed"
- Timestamp recorded

---

### 1.4 Appointment Reports (Admin)

#### Report Features

**Filters Available:**
- Date range (From - To)
- Engineer name (Multi-select)
- Client name (Multi-select)
- Status (All/Scheduled/Completed/Pending)

**Display Columns:**
- Appointment ID
- Engineer Name
- Client Name
- Attendee Name
- Date & Time
- Location
- Status
- OTP Sent Time
- Verification Time
- Feedback/Notes

**Export Options:**
- Excel (.xlsx)
- PDF (formatted report)
- Print view

**Summary Cards (Top of Report):**
- Total Appointments This Month
- Completed Appointments
- Pending Verifications
- Average Feedback Length

---

## Core Module 2: Inventory Management

### Overview
Track material inventory measured in buckets. Record when materials arrive at office (Stock In) and when sent to sites (Stock Out).

### 2.1 Inventory Transaction Types

#### Stock In
**Definition:** Material received at office/warehouse

**Use Cases:**
- New material purchase received
- Returned material from site
- Inter-office transfer received

#### Stock Out
**Definition:** Material sent to client site

**Use Cases:**
- Material dispatched to active site
- Material used for specific client project
- Inter-office transfer sent

---

### 2.2 Stock In Entry Form

#### Form Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Material Name | Dropdown | Yes | Select from Material Master |
| Number of Buckets | Number Input | Yes | Quantity received |
| Date & Time | DateTime Picker | Yes | When material received |
| Remarks | Text Area | No | Additional notes |

#### Auto-Captured Data
- **Entry By:** Current user name (Admin/Engineer)
- **Entry Timestamp:** System datetime
- **Transaction Type:** STOCK_IN

#### Validation Rules
- Quantity must be positive integer
- Material must be active
- Date cannot be future date

---

### 2.3 Stock Out Entry Form

#### Form Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Material Name | Dropdown | Yes | Select from Material Master |
| Client Name | Dropdown | Yes | Site/project destination |
| Number of Buckets | Number Input | Yes | Quantity sent |
| Date & Time | DateTime Picker | Yes | When material dispatched |
| Remarks | Text Area | No | Purpose/notes |

#### Auto-Captured Data
- **Entry By:** Current user name
- **Entry Timestamp:** System datetime
- **Transaction Type:** STOCK_OUT

#### Validation Rules
- Quantity must be positive integer
- Check available stock (warning if exceeds)
- Material must be active
- Client must be active
- Date cannot be future date

---

### 2.4 Inventory Dashboard

#### Layout Sections

**Top Section: Summary Cards**

1. **Total Stock Balance**
   - Sum of all materials in stock
   - Color: Blue gradient
   - Icon: Package

2. **Today's Stock In**
   - Total buckets received today
   - Color: Green gradient
   - Icon: Arrow Down

3. **Today's Stock Out**
   - Total buckets sent today
   - Color: Red gradient
   - Icon: Arrow Up

4. **Low Stock Items**
   - Count of materials below threshold
   - Color: Yellow gradient
   - Icon: Alert Triangle

**Middle Section: Quick Actions**
- Button: "Stock In" (Green, with + icon)
- Button: "Stock Out" (Red, with - icon)
- Opens side panel form

**Bottom Section: Recent Transactions**
- Table showing last 20 transactions
- Real-time updates
- Infinite scroll or pagination

#### Transaction Table

**Columns:**

| Column | Width | Content |
|--------|-------|---------|
| Type | 80px | Icon (↓ Green for In, ↑ Red for Out) |
| Material | 20% | Material name |
| Quantity | 10% | Number + "buckets" |
| Client/Site | 20% | Client name (only for Out) |
| Entry By | 15% | User avatar + name |
| Date | 15% | Relative time ("2 hours ago") |
| Actions | 10% | View icon |

---

### 2.5 Inventory Reports (Admin Only)

#### Report 1: Material Usage by Timeframe

**Purpose:** Track material consumption over time

**Filters:**
- Date Range (with presets: Today, This Week, This Month, Custom)
- Material Name (Multi-select)

**Data Display:**

| Material Name | Stock In (Buckets) | Stock Out (Buckets) | Current Balance | % Change |
|---------------|-------------------|---------------------|-----------------|----------|
| Wall Putty | 150 | 120 | 30 | -80% |
| Tile Adhesive | 200 | 180 | 20 | -90% |

**Visualizations:**
- Bar Chart: Material usage trend over selected period
- Line Chart: Stock levels over time
- Pie Chart: Distribution of materials

---

#### Report 2: Material Usage by Site/Client

**Purpose:** Track material consumption per client/project

**Filters:**
- Client Name (Multi-select)
- Date Range
- Material Name (Multi-select)

**Data Display:**

| Client Name | Material Name | Total Buckets Used | Last Dispatch Date |
|-------------|---------------|-------------------|-------------------|
| ABC Builders | Wall Putty | 45 | 2024-11-05 |
| ABC Builders | Tile Adhesive | 30 | 2024-11-04 |

**Grouping:** By Client → By Material

**Export:** Excel with multiple sheets (one per client)

---

#### Report 3: Stock Balance Report

**Purpose:** Current inventory snapshot

**Display:**

| Material Name | Current Stock | Reorder Level | Status | Last Stock In | Last Stock Out |
|---------------|---------------|---------------|--------|---------------|----------------|
| Wall Putty | 15 buckets | 20 buckets | Low | 2 days ago | 1 hour ago |
| Tile Adhesive | 50 buckets | 20 buckets | Good | 1 week ago | 3 hours ago |

**Features:**
- Color-coded status (Red: Low, Green: Good, Yellow: Medium)
- Alert indicators for low stock
- Quick reorder suggestions

---

## Core Module 3: Worker Count Management

### Overview
Track daily worker attendance at each site for accurate contractor payments. Workers are paid daily, so exact count per day is critical.

### 3.1 Purpose & Business Context

**Why This Module:**
- Contractors are paid based on number of workers
- Workers are on daily wage
- Multiple sites running simultaneously
- Need verified attendance records
- Prevent disputes with contractors

**Verification Method:** Dual OTP system (Client OR Admin can verify)

---

### 3.2 Visit Creation (Engineer Only)

#### Create Visit Form

**Fields:**
- **Client Name:** Dropdown (represents site)
- **Visit Date & Time:** DateTime picker (default: current)

#### Creation Workflow

```
1. Engineer fills visit form
2. Clicks "Create Visit & Send OTP"
3. System generates 6-digit OTP
4. Visit record created (Status: PENDING)
5. SMS sent to:
   - Client's Primary Contact Number (from Client Master)
   - Admin's mobile number (configured in settings)
6. Visit appears in Engineer's pending visits list
```

**OTP SMS Templates:**

*To Client:*
```
Worker count verification for [SITE_NAME] on [DATE]. Your OTP is: [OTP_CODE]. 
Valid for 24 hours. - [COMPANY_NAME]
```

*To Admin:*
```
Worker visit created by [ENGINEER_NAME] for [CLIENT_NAME] on [DATE]. 
Verification OTP: [OTP_CODE]. - [COMPANY_NAME]
```

**OTP Validity:** 24 hours (longer than appointment OTP because site work timing varies)

---

### 3.3 Worker Count Entry Process

#### Step-by-Step Flow

**Step 1: Engineer Creates Visit**
- At the end of workday
- Engineer opens app
- Clicks "Add Worker Count"
- Fills form with client and date
- Submits → OTP sent to both client and admin

**Step 2: Request OTP**
- Engineer asks Client OR Admin for OTP
- Both received same OTP via SMS
- Engineer can use either source

**Step 3: Enter Worker Count**
- Engineer selects pending visit from list
- Enters 6-digit OTP
- Enters number of workers present today
- Adds optional remarks (work type, notes)
- Clicks "Verify & Submit"

**Step 4: Verification**
- System validates OTP
- If valid:
  - Worker count saved
  - Visit status: COMPLETED
  - Timestamp recorded
- If invalid:
  - Error shown
  - Can retry (no attempt limit due to 24-hour validity)

---

### 3.4 Engineer Dashboard - Worker Count Section

#### Pending Visits Card View

**Layout:** 2-column grid (1 on mobile)

**Each Card Shows:**
- Client/Site Name (large, bold)
- Visit Date (with calendar icon)
- OTP Status Badge: "OTP Sent" (blue, pulsing)
- Time remaining (e.g., "23 hours left")
- Button: "Enter Worker Count"

**Empty State:**
```
No pending worker counts
Create a new visit to get started
[+ Create Visit Button]
```

#### Completed Visits List

**Table View:**

| Date | Client/Site | Workers | Verified By | Status |
|------|-------------|---------|-------------|--------|
| Nov 6, 2024 | ABC Site | 15 | Client OTP | ✓ Completed |
| Nov 5, 2024 | XYZ Site | 12 | Admin OTP | ✓ Completed |

**Features:**
- Filter by date range
- Search by client name
- Export to Excel

---

### 3.5 Worker Count Reports (Admin Only)

#### Report 1: Engineer Visit Summary

**Purpose:** Track engineer productivity and site coverage

**Filters:**
- Date Range
- Engineer Name (Multi-select)
- Client Name (Multi-select)

**Data Display:**

| Engineer Name | Client/Site | Number of Visits | Total Workers | Avg Workers/Visit | Last Visit |
|---------------|-------------|------------------|---------------|-------------------|------------|
| John Doe | ABC Site | 15 | 225 | 15 | Nov 6, 2024 |
| John Doe | XYZ Site | 10 | 120 | 12 | Nov 5, 2024 |

**Summary Metrics:**
- Total visits this period
- Total unique sites covered
- Most active engineer
- Most active site

---

#### Report 2: Site-wise Worker Count

**Purpose:** Calculate contractor payments per site

**Filters:**
- Client/Site Name (Multi-select)
- Date Range

**Data Display:**

| Date | Engineer Name | Number of Workers | Verified By | Time | Remarks |
|------|---------------|-------------------|-------------|------|---------|
| Nov 6 | John Doe | 15 | Client | 6:30 PM | Finishing work |
| Nov 5 | John Doe | 15 | Admin | 7:00 PM | Tiling section 2 |
| Nov 4 | Jane Smith | 12 | Client | 6:15 PM | Wall preparation |

**Subtotal per Site:**
- Total work days: 22 days
- Total worker-days: 330
- Average workers per day: 15

**Export:** Excel with payment calculation template

---

#### Report 3: Date-wise Worker Analysis

**Purpose:** Bird's-eye view of all site activities

**View Options:**
- Calendar View: Shows worker count per site on each date
- Table View: All sites, all dates

**Filters:**
- Month/Year selector
- Client filter

**Calendar View:**
```
[Date: Nov 6, 2024]
  ABC Site: 15 workers (John Doe)
  XYZ Site: 12 workers (Jane Smith)
  DEF Site: 8 workers (Bob Wilson)
  
Total for day: 35 workers
```

**Export:** PDF with daily breakdown for monthly contractor billing

---

## Technical Requirements

### 7.1 Technology Stack

#### Frontend

**Framework & Core:**
- **Next.js 14+** (App Router for optimal performance)
- **React 18+** (Component-based architecture)
- **TypeScript** (Type safety and better DX)

**Styling:**
- **Tailwind CSS 3+** (Utility-first CSS)
- **shadcn/ui** (Pre-built, customizable components)
- **Framer Motion** (Smooth animations and transitions)

**State Management:**
- **Zustand** (Lightweight, simple state management)
- **React Query / TanStack Query** (Server state management)

**Forms & Validation:**
- **React Hook Form** (Performant form handling)
- **Zod** (Schema validation)

**Data Visualization:**
- **Recharts** (Responsive charts)
- **Chart.js** (Alternative for complex visualizations)

**Utilities:**
- **date-fns** or **Day.js** (Date manipulation)
- **axios** (HTTP client)
- **react-hot-toast** (Notifications)

---

#### Backend

**Framework:**
- **Node.js** with **Express.js** (REST API)
- OR **Python** with **FastAPI** (Alternative, modern Python framework)

**Language:**
- **TypeScript** (For Node.js option)
- OR **Python 3.11+** (For FastAPI option)

**Database:**
- **PostgreSQL 14+** (Relational database)
- **Prisma ORM** (Type-safe database client)

**Authentication:**
- **JWT (JSON Web Tokens)** (Stateless auth)
- **bcrypt** (Password hashing)
- **HTTP-only cookies** (Secure token storage)

**SMS Integration:**
- **Twilio** (Recommended, reliable)
- OR **AWS SNS** (If using AWS infrastructure)
- OR **MSG91** (Indian SMS provider)

**File Generation:**
- **ExcelJS** (Excel file generation)
- **PDFKit** or **Puppeteer** (PDF generation)

---

#### Infrastructure & DevOps

**Hosting Options:**

*Frontend:*
- **Vercel** (Recommended for Next.js)
- OR **Netlify**
- OR **AWS Amplify**

*Backend:*
- **Railway** (Simplest deployment)
- OR **Render** (Free tier available)
- OR **AWS EC2** (More control)
- OR **DigitalOcean Droplets**

*Database:*
- **Railway PostgreSQL** (Managed)
- OR **Supabase** (PostgreSQL with extras)
- OR **AWS RDS**

**Monitoring & Logging:**
- **Sentry** (Error tracking)
- **LogRocket** (Session replay - optional)
- **Winston** or **Pino** (Backend logging)

**CI/CD:**
- **GitHub Actions** (Automated deployments)
- OR **GitLab CI**

---

### 7.2 Security Requirements

#### Authentication & Authorization
- Role-based access control (RBAC)
- JWT with refresh tokens (7-day access, 30-day refresh)
- HTTP-only cookies for web security
- Password requirements: Min 8 chars, 1 uppercase, 1 number, 1 special char
- Bcrypt hashing with salt rounds: 10

#### API Security
- HTTPS encryption (SSL/TLS)
- CORS configuration (whitelist frontend domain)
- Rate limiting:
  - General API: 100 requests/15 minutes per user
  - OTP generation: 5 requests/15 minutes
  - Login: 5 attempts/15 minutes
- SQL injection prevention via Prisma parameterized queries
- XSS protection via input sanitization
- CSRF tokens for state-changing operations

#### Data Security
- Sensitive data encrypted at rest
- Environment variables for secrets (never commit)
- Database backups: Daily automated
- Soft deletes (data never truly deleted)
- Audit logs for critical operations

---

### 7.3 Performance Requirements

#### Response Times
- Page load (initial): < 2 seconds
- Page load (subsequent): < 500ms (cached)
- API response time: < 500ms (p95)
- SMS delivery: < 10 seconds

#### Scalability
- Support 100+ concurrent users
- Handle 1000+ appointments per month
- Store 10,000+ inventory transactions per year
- Database query optimization with indexes

#### Optimization Strategies
- Code splitting by route
- Lazy loading of heavy components
- Image optimization (Next.js Image component)
- API response caching (5-minute TTL)
- Database connection pooling
- CDN for static assets

---

### 7.4 Browser & Device Support

#### Desktop Browsers
- Chrome 90+ ✓
- Firefox 88+ ✓
- Safari 14+ ✓
- Edge 90+ ✓

#### Mobile Browsers
- iOS Safari 14+ ✓
- Android Chrome 90+ ✓

#### Screen Sizes
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

---

## Database Schema

### Prisma Schema

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// ENUMS
// ============================================

enum UserRole {
  ADMIN
  ENGINEER
}

enum AppointmentStatus {
  SCHEDULED
  OTP_SENT
  VERIFIED
  COMPLETED
  CANCELLED
}

enum TransactionType {
  STOCK_IN
  STOCK_OUT
}

enum VisitStatus {
  PENDING
  COMPLETED
}

// ============================================
// MODELS
// ============================================

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String
  name          String
  phone         String    @unique
  role          UserRole
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relations
  appointmentsAsEngineer  Appointment[]
  inventoryTransactions   InventoryTransaction[]
  workerVisits            WorkerVisit[]
  
  @@index([email])
  @@index([phone])
  @@map("users")
}

model ClientType {
  id        String   @id @default(cuid())
  name      String   @unique
  createdAt DateTime @default(now())
  
  // Relations
  clients   Client[]
  
  @@map("client_types")
}

model Client {
  id                    String      @id @default(cuid())
  name                  String
  address               String
  primaryContact        String
  clientTypeId          String
  alternateContactName  String?
  alternateContactPhone String?
  isActive              Boolean     @default(true)
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt
  
  // Relations
  clientType            ClientType  @relation(fields: [clientTypeId], references: [id])
  appointments          Appointment[]
  inventoryTransactions InventoryTransaction[]
  workerVisits          WorkerVisit[]
  
  @@index([name])
  @@index([primaryContact])
  @@map("clients")
}

model Material {
  id           String    @id @default(cuid())
  name         String
  unit         String    @default("Bucket")
  reorderLevel Int?
  isActive     Boolean   @default(true)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  
  // Relations
  inventoryTransactions InventoryTransaction[]
  
  @@index([name])
  @@map("materials")
}

model Appointment {
  id              String            @id @default(cuid())
  engineerId      String
  clientId        String
  attendeeName    String
  appointmentDate DateTime
  location        String
  otpMobileNumber String?
  status          AppointmentStatus @default(SCHEDULED)
  otp             String?
  otpExpiresAt    DateTime?
  otpSentAt       DateTime?
  verifiedAt      DateTime?
  feedback        String?
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
  
  // Relations
  engineer        User              @relation(fields: [engineerId], references: [id])
  client          Client            @relation(fields: [clientId], references: [id])
  
  @@index([engineerId])
  @@index([clientId])
  @@index([appointmentDate])
  @@index([status])
  @@map("appointments")
}

model InventoryTransaction {
  id              String          @id @default(cuid())
  materialId      String
  transactionType TransactionType
  quantity        Int
  clientId        String?
  remarks         String?
  entryBy         String
  entryByName     String
  transactionDate DateTime
  createdAt       DateTime         @default(now())
  
  // Relations
  material        Material         @relation(fields: [materialId], references: [id])
  client          Client?          @relation(fields: [clientId], references: [id])
  user            User             @relation(fields: [entryBy], references: [id])
  
  @@index([materialId])
  @@index([clientId])
  @@index([transactionDate])
  @@index([transactionType])
  @@map("inventory_transactions")
}

model WorkerVisit {
  id            String      @id @default(cuid())
  engineerId    String
  clientId      String
  visitDate     DateTime
  otp           String
  otpExpiresAt  DateTime
  workerCount   Int?
  remarks       String?
  status        VisitStatus @default(PENDING)
  submittedAt   DateTime?
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  
  // Relations
  engineer      User        @relation(fields: [engineerId], references: [id])
  client        Client      @relation(fields: [clientId], references: [id])
  
  @@index([engineerId])
  @@index([clientId])
  @@index([visitDate])
  @@index([status])
  @@map("worker_visits")
}

model Settings {
  id        String   @id @default(cuid())
  key       String   @unique
  value     String
  updatedAt DateTime @updatedAt
  
  @@map("settings")
}

model SMSLog {
  id          String   @id @default(cuid())
  phone       String
  message     String
  status      String
  provider    String?
  providerId  String?
  error       String?
  sentAt      DateTime @default(now())
  
  @@index([phone])
  @@index([status])
  @@index([sentAt])
  @@map("sms_logs")
}
```

---

## API Endpoints

### Authentication Endpoints

```
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
GET    /api/auth/me
PUT    /api/auth/change-password
```

### Master Module Endpoints

#### Clients
```
GET    /api/clients              // List all clients (with pagination)
GET    /api/clients/:id          // Get single client
POST   /api/clients              // Create client (Admin only)
PUT    /api/clients/:id          // Update client (Admin only)
DELETE /api/clients/:id          // Soft delete (Admin only)
GET    /api/clients/types        // Get client types
POST   /api/clients/types        // Add new client type (Admin)
```

#### Engineers
```
GET    /api/engineers            // List all engineers
GET    /api/engineers/:id        // Get single engineer
POST   /api/engineers            // Create engineer (Admin)
PUT    /api/engineers/:id        // Update engineer (Admin)
DELETE /api/engineers/:id        // Deactivate engineer (Admin)
```

#### Materials
```
GET    /api/materials            // List all materials
GET    /api/materials/:id        // Get single material
POST   /api/materials            // Create material (Admin)
PUT    /api/materials/:id        // Update material (Admin)
DELETE /api/materials/:id        // Deactivate material (Admin)
```

### Appointment Module Endpoints

```
GET    /api/appointments                    // List appointments (role-based)
GET    /api/appointments/:id                // Get single appointment
POST   /api/appointments                    // Create appointment (Admin)
PUT    /api/appointments/:id                // Update appointment (Admin)
POST   /api/appointments/:id/send-otp       // Send OTP (Engineer)
POST   /api/appointments/:id/verify-otp     // Verify OTP (Engineer)
POST   /api/appointments/:id/feedback       // Submit feedback (Engineer)
GET    /api/appointments/engineer/dashboard // Engineer's appointments
GET    /api/appointments/reports            // Admin reports
GET    /api/appointments/export             // Export to Excel (Admin)
```

### Inventory Module Endpoints

```
GET    /api/inventory/stock              // Current stock levels
GET    /api/inventory/transactions       // Transaction history
POST   /api/inventory/stock-in           // Add stock
POST   /api/inventory/stock-out          // Remove stock
GET    /api/inventory/transactions/:id   // Get transaction details
GET    /api/inventory/reports/usage      // Material usage report
GET    /api/inventory/reports/by-site    // Site-wise report
GET    /api/inventory/reports/balance    // Stock balance report
GET    /api/inventory/export             // Export to Excel
```

### Worker Count Module Endpoints

```
GET    /api/worker-visits                    // List visits (role-based)
POST   /api/worker-visits                    // Create visit (Engineer)
GET    /api/worker-visits/:id                // Get visit details
POST   /api/worker-visits/:id/submit-count   // Submit worker count (Engineer)
GET    /api/worker-visits/pending            // Engineer's pending visits
GET    /api/worker-visits/reports/summary    // Engineer visit summary (Admin)
GET    /api/worker-visits/reports/by-site    // Site-wise worker count (Admin)
GET    /api/worker-visits/reports/by-date    // Date-wise analysis (Admin)
GET    /api/worker-visits/export             // Export to Excel (Admin)
```

### Admin Settings Endpoints

```
GET    /api/settings/admin-phone         // Get admin phone for OTP
PUT    /api/settings/admin-phone         // Update admin phone (Admin)
GET    /api/settings/sms-config          // Get SMS gateway config
PUT    /api/settings/sms-config          // Update SMS config (Admin)
GET    /api/settings/company             // Get company details
PUT    /api/settings/company             // Update company details (Admin)
```

---

## Development Timeline

### Phase 1A: Setup & Infrastructure (Week 1)

**Days 1-2: Project Initialization**
- [ ] Create Git repository
- [ ] Initialize Next.js project with TypeScript
- [ ] Setup Tailwind CSS + shadcn/ui
- [ ] Configure ESLint, Prettier
- [ ] Setup backend (Express + TypeScript)
- [ ] Initialize Prisma with PostgreSQL
- [ ] Setup environment variables

**Days 3-4: Database & Authentication**
- [ ] Design database schema
- [ ] Run Prisma migrations
- [ ] Implement JWT authentication
- [ ] Create login/logout API endpoints
- [ ] Build login page UI
- [ ] Setup protected route middleware

**Days 5-7: Core Layout**
- [ ] Build sidebar navigation component
- [ ] Build top bar component
- [ ] Create main layout wrapper
- [ ] Implement responsive menu
- [ ] Setup routing structure
- [ ] Create dashboard skeleton

---

### Phase 1B: Master Modules (Week 2)

**Days 8-9: Client Master**
- [ ] Client list page with table
- [ ] Add client form + modal
- [ ] Edit client functionality
- [ ] Client type management
- [ ] Search and filter
- [ ] API endpoints (CRUD)

**Days 10-11: Engineer Master**
- [ ] Engineer list/cards view
- [ ] Add engineer form
- [ ] Edit engineer functionality
- [ ] Password reset
- [ ] Activate/deactivate engineers
- [ ] API endpoints (CRUD)

**Days 12-14: Material Master**
- [ ] Material list page (name only, no type field)
- [ ] Add material form (simplified)
- [ ] Edit material functionality
- [ ] Reorder level configuration
- [ ] API endpoints (CRUD)
- [ ] Integration testing of masters

---

### Phase 1C: Appointment Module (Weeks 3-4)

**Days 15-17: Appointment Creation**
- [ ] Appointment form UI (with optional OTP mobile field)
- [ ] Form validation (Zod schemas)
- [ ] Create appointment API
- [ ] SMS integration setup (Twilio)
- [ ] Send appointment notifications
- [ ] Admin appointment list view

**Days 18-20: Engineer Dashboard**
- [ ] Engineer dashboard layout
- [ ] Appointment cards component
- [ ] Status badges and styling
- [ ] Filter by date/status
- [ ] Real-time data fetching

**Days 21-24: OTP Verification**
- [ ] Send OTP button functionality (uses appointment OTP number if filled, else client primary)
- [ ] OTP generation API
- [ ] OTP SMS sending logic
- [ ] OTP input component (6 digits)
- [ ] Verify OTP API
- [ ] Error handling (expired/invalid)
- [ ] Resend OTP functionality

**Days 25-28: Feedback & Reports**
- [ ] Feedback form after verification
- [ ] Submit feedback API
- [ ] Admin reports page
- [ ] Filters (date, engineer, client)
- [ ] Data table with export
- [ ] Excel export functionality
- [ ] Testing appointment flow end-to-end

---

### Phase 1D: Inventory Module (Weeks 5-6)

**Days 29-31: Stock Entry Forms**
- [ ] Stock In form (side panel)
- [ ] Stock Out form (side panel)
- [ ] Material dropdown integration
- [ ] Quantity input (+/- buttons)
- [ ] Date-time picker
- [ ] API endpoints for stock transactions

**Days 32-34: Inventory Dashboard**
- [ ] Summary cards (Total, In, Out, Low)
- [ ] Quick action buttons
- [ ] Recent transactions table
- [ ] Stock balance calculation
- [ ] Real-time updates

**Days 35-38: Inventory Reports**
- [ ] Material usage by timeframe report
- [ ] Site-wise usage report
- [ ] Stock balance report
- [ ] Filter implementation
- [ ] Charts (Recharts integration)
- [ ] Excel export
- [ ] Testing inventory flow

**Days 39-42: Stock Alerts**
- [ ] Low stock threshold settings
- [ ] Alert indicators
- [ ] Stock validation (prevent negative)
- [ ] Inventory audit logs

---

### Phase 1E: Worker Count Module (Weeks 7-8)

**Days 43-45: Visit Creation**
- [ ] Create visit form UI
- [ ] Visit creation API
- [ ] Dual OTP generation (client + admin)
- [ ] Send OTP to both numbers
- [ ] Admin phone configuration in settings

**Days 46-48: Worker Count Entry**
- [ ] Pending visits list (Engineer)
- [ ] Worker count entry modal
- [ ] OTP verification (24-hour validity)
- [ ] Worker count submission
- [ ] API endpoints

**Days 49-52: Worker Count Reports**
- [ ] Engineer visit summary report
- [ ] Site-wise worker count report
- [ ] Date-wise analysis report
- [ ] Calendar view
- [ ] Export to Excel
- [ ] Testing worker count flow

**Days 53-56: Final Integrations**
- [ ] Cross-module data consistency
- [ ] Performance optimization
- [ ] Mobile responsiveness fixes
- [ ] Animation polish

---

### Phase 1F: Testing & Deployment (Week 9)

**Days 57-59: Testing**
- [ ] Unit tests for critical functions
- [ ] API endpoint testing
- [ ] User flow testing (Admin)
- [ ] User flow testing (Engineer)
- [ ] SMS delivery testing
- [ ] Error scenario testing
- [ ] Performance testing

**Days 60-63: Deployment**
- [ ] Setup production database
- [ ] Configure environment variables
- [ ] Deploy backend (Railway/Render)
- [ ] Deploy frontend (Vercel)
- [ ] SSL certificate setup
- [ ] Domain configuration
- [ ] Monitoring setup (Sentry)

**Days 64-65: Training & Handover**
- [ ] Admin training session
- [ ] Engineer training session
- [ ] Documentation handover
- [ ] Support channel setup
- [ ] Go-live checklist completion

---

## Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/flooring_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-min-32-chars-long-change-in-production"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_SECRET="your-refresh-token-secret-different-from-jwt-secret"
JWT_REFRESH_EXPIRES_IN="30d"

# SMS Gateway (Twilio)
SMS_PROVIDER="twilio"
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="your-auth-token"
TWILIO_PHONE_NUMBER="+1234567890"

# Application
NODE_ENV="development"
PORT=3001
FRONTEND_URL="http://localhost:3000"

# Admin Settings (Initial)
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="Admin@123456"
ADMIN_PHONE="+919876543210"

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
OTP_RATE_LIMIT_MAX=5

# OTP Settings
OTP_EXPIRY_MINUTES=15
OTP_LENGTH=6
WORKER_VISIT_OTP_EXPIRY_HOURS=24
```

---

## Key Updates Summary

### Changes Made Based on Client Feedback:

1. **Appointment OTP Mobile Number**
   - ✅ Added optional "OTP Mobile Number" field in Appointment creation form
   - ✅ NOT in Client Master (client already has 2 contacts: Primary and Alternative)
   - ✅ Logic: If OTP Mobile filled in appointment → use it, else use Client's Primary Contact

2. **Material Master Simplified**
   - ✅ Removed "Material Type" field
   - ✅ Only "Material Name" field required
   - ✅ Unit field auto-set to "Bucket" (not editable)

3. **Database Schema Updated**
   - ✅ Appointments table has `otpMobileNumber` field (nullable)
   - ✅ Materials table has only `name` and `unit` (no type field)

---

## Out of Scope (Future Phases)

The following features are NOT included in Phase 1:
- Client login and self-service portal
- Mobile native apps (iOS/Android)
- Real-time notifications via WebSocket
- Advanced analytics and dashboards
- Email notifications
- Document/photo upload for visits
- GPS-based location tracking
- Multi-language support
- Automated report scheduling
- Payment integration
- Advanced search and filters
- Audit logs and activity tracking
- Custom fields configuration
- Bulk data import/export

---

## Success Criteria

### Phase 1 Completion Criteria:
- ✅ All three core modules functional
- ✅ SMS integration working reliably
- ✅ All reports generating correctly
- ✅ Role-based access working
- ✅ Mobile-responsive design
- ✅ No critical bugs
- ✅ Admin and Engineer training completed
- ✅ Deployed to production environment

---

## Risk Assessment

### Technical Risks:
- **SMS delivery failures**: Mitigation - Implement retry mechanism and delivery status tracking
- **OTP expiry issues**: Mitigation - Clear expiry notifications and resend option
- **Database performance**: Mitigation - Proper indexing and query optimization
- **Concurrent user handling**: Mitigation - Load testing and scaling strategy

### Business Risks:
- **User adoption**: Mitigation - Simple, intuitive UI and comprehensive training
- **Data accuracy**: Mitigation - Validation rules and confirmation prompts
- **Scope creep**: Mitigation - Strict adherence to documented requirements

---

## Next Steps After Documentation

1. **Review & Approval**: Client reviews and approves this document
2. **Design Phase**: Create wireframes and UI mockups (use UI/UX prompt)
3. **Development Kickoff**: Set up development environment
4. **Sprint Planning**: Break down features into 2-week sprints
5. **Weekly Reviews**: Demo working features every week
6. **UAT**: Client testing in week 7-8
7. **Deployment**: Go-live in week 9

---

**Document Version**: 1.0  
**Last Updated**: November 7, 2025  
**Prepared For**: Phase 1 Development

---

**END OF PROJECT DOCUMENTATION**