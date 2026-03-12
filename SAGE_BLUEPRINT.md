# SAGE — Full System Blueprint

## Student Advising & Guidance Environment

> **Version:** 1.0 | **Status:** Planning | **Stack:** Next.js 16 · TypeScript · Prisma · PostgreSQL · Tailwind CSS · shadcn/ui | **Host:** Render

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Technology Stack Decisions](#2-technology-stack-decisions)
3. [Professional Folder Structure](#3-professional-folder-structure)
4. [Database Schema Design](#4-database-schema-design)
5. [Authentication & Authorization System](#5-authentication--authorization-system)
6. [API Design & Route Map](#6-api-design--route-map)
7. [Server Actions Architecture](#7-server-actions-architecture)
8. [Page & Route Structure](#8-page--route-structure)
9. [Feature Specifications — Student Portal](#9-feature-specifications--student-portal)
10. [Feature Specifications — Advisor Portal](#10-feature-specifications--advisor-portal)
11. [Feature Specifications — Admin Panel](#11-feature-specifications--admin-panel)
12. [Edge Cases & Error Handling](#12-edge-cases--error-handling)
13. [Email System](#13-email-system)
14. [Notification System](#14-notification-system)
15. [Security Architecture](#15-security-architecture)
16. [Component Architecture](#16-component-architecture)
17. [Middleware Strategy](#17-middleware-strategy)
18. [Development Phases — Step-by-Step](#18-development-phases--step-by-step)
19. [Render Deployment Guide](#19-render-deployment-guide)
20. [Environment Variables Reference](#20-environment-variables-reference)
21. [Non-Functional Requirements](#21-non-functional-requirements)
22. [Future Enhancements Roadmap](#22-future-enhancements-roadmap)

---

## 1. System Overview

### What SAGE Is

SAGE is a full-stack, web-based academic advising platform that connects three types of users — **Students**, **Advisors**, and **Administrators** — into a unified environment. It replaces manual, fragmented advising processes with a structured, digital workflow.

### What SAGE Does

| For Students               | For Advisors                        | For Administrators          |
| -------------------------- | ----------------------------------- | --------------------------- |
| Request advising sessions  | View & manage assigned students     | Manage all users & roles    |
| Book & manage appointments | Accept/decline appointment requests | Assign students to advisors |
| Message assigned advisor   | Maintain session notes              | Monitor system metrics      |
| View academic profile      | View student academic history       | Manage FAQs & announcements |
| Access resources & FAQs    | Communicate with students           | Generate usage reports      |

### Core User Flow

```
Public Landing Page
       │
       ▼
   Login / Register
       │
       ▼
   Role Detection (Student / Advisor / Admin)
       │
   ┌───┴──────────────┬─────────────────┐
   ▼                  ▼                 ▼
Student           Advisor            Admin
Dashboard         Dashboard          Dashboard
   │                  │                 │
[All student      [All advisor       [All admin
 features]         features]          features]
```

### Architecture Pattern

```
Browser (React / Next.js Client Components)
         │
Next.js App Router (Server Components + Server Actions)
         │
    ┌────┴────┐
    │  API    │  ← REST API Routes (for external/complex calls)
    │ Routes  │
    └────┬────┘
         │
    Prisma ORM
         │
   PostgreSQL (Render)
```

---

## 2. Technology Stack Decisions

### Why Each Technology Was Chosen

| Technology                | Version | Role                 | Reason                                                         |
| ------------------------- | ------- | -------------------- | -------------------------------------------------------------- |
| **Next.js**               | 16.x    | Full-stack framework | App Router, Server Actions, SSR, API Routes all in one         |
| **TypeScript**            | 5.x     | Type safety          | Catch bugs at compile time, better DX                          |
| **Tailwind CSS**          | 4.x     | Styling              | Utility-first, consistent with existing codebase               |
| **shadcn/ui**             | Latest  | UI Components        | 53 components already installed, consistent design             |
| **Prisma**                | 5.x     | ORM                  | Type-safe DB queries, easy migrations, great DX                |
| **PostgreSQL**            | 16.x    | Database             | Relational, supports complex queries, hosted on Render         |
| **Auth.js (NextAuth v5)** | 5.x     | Authentication       | Native Next.js integration, session management                 |
| **Zod**                   | 3.x     | Validation           | Client + server validation sharing same schemas                |
| **Resend**                | Latest  | Email                | Modern email API, React email templates                        |
| **React Email**           | Latest  | Email templates      | JSX-based email templates                                      |
| **bcryptjs**              | Latest  | Password hashing     | Industry standard, works in Node.js                            |
| **Render**                | —       | Hosting              | Free/low-cost PostgreSQL + web service, no cold starts on paid |

### Dependencies to Install (Phase by Phase)

```bash
# Phase 1 — Core backend
npm install @auth/prisma-adapter next-auth@beta prisma @prisma/client bcryptjs zod

# Phase 2 — Email
npm install resend @react-email/components @react-email/render

# Phase 3 — Utilities
npm install date-fns@4 nanoid

# Dev dependencies
npm install -D @types/bcryptjs prisma
```

---

## 3. Professional Folder Structure

```
SAGE/
│
├── app/                                  # Next.js App Router
│   │
│   ├── (public)/                         # Route group — no auth required
│   │   ├── layout.tsx                    # Public layout (landing header/footer)
│   │   └── page.tsx                      # Landing page (already built)
│   │
│   ├── (auth)/                           # Route group — auth pages
│   │   ├── layout.tsx                    # Centered card layout, logo header
│   │   ├── login/
│   │   │   └── page.tsx                  # Login page
│   │   ├── signup/
│   │   │   └── page.tsx                  # Registration (Coming Soon → then real form)
│   │   ├── forgot-password/
│   │   │   └── page.tsx                  # Request password reset
│   │   └── reset-password/
│   │       └── page.tsx                  # Set new password via token
│   │
│   ├── (dashboard)/                      # Route group — protected, role-based
│   │   ├── layout.tsx                    # Dashboard shell (sidebar + topbar)
│   │   │
│   │   ├── student/                      # Student Portal
│   │   │   ├── layout.tsx                # Student sidebar config
│   │   │   ├── page.tsx                  # Student dashboard overview
│   │   │   ├── profile/
│   │   │   │   └── page.tsx              # Academic profile view/edit
│   │   │   ├── appointments/
│   │   │   │   ├── page.tsx              # All appointments list
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx          # Single appointment detail
│   │   │   ├── requests/
│   │   │   │   ├── page.tsx              # All advising requests + status
│   │   │   │   └── new/
│   │   │   │       └── page.tsx          # New request form
│   │   │   ├── messages/
│   │   │   │   ├── page.tsx              # Inbox / conversation list
│   │   │   │   └── [advisorId]/
│   │   │   │       └── page.tsx          # Individual conversation thread
│   │   │   └── resources/
│   │   │       └── page.tsx              # FAQs, policies, downloads
│   │   │
│   │   ├── advisor/                      # Advisor Portal
│   │   │   ├── layout.tsx                # Advisor sidebar config
│   │   │   ├── page.tsx                  # Advisor dashboard overview
│   │   │   ├── students/
│   │   │   │   ├── page.tsx              # All assigned students list
│   │   │   │   └── [studentId]/
│   │   │   │       └── page.tsx          # Student detail + notes + history
│   │   │   ├── appointments/
│   │   │   │   ├── page.tsx              # Calendar + list view
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx          # Appointment detail + actions
│   │   │   └── messages/
│   │   │       ├── page.tsx              # Inbox / conversation list
│   │   │       └── [studentId]/
│   │   │           └── page.tsx          # Individual conversation thread
│   │   │
│   │   └── admin/                        # Admin Panel
│   │       ├── layout.tsx                # Admin sidebar config
│   │       ├── page.tsx                  # Admin dashboard + system metrics
│   │       ├── users/
│   │       │   ├── page.tsx              # Full user list + search/filter
│   │       │   ├── new/
│   │       │   │   └── page.tsx          # Create new user form
│   │       │   └── [userId]/
│   │       │       └── page.tsx          # Edit user + deactivate
│   │       ├── assignments/
│   │       │   └── page.tsx              # Advisor–student assignment manager
│   │       ├── content/
│   │       │   ├── page.tsx              # Content management hub
│   │       │   ├── faqs/
│   │       │   │   └── page.tsx          # FAQ CRUD
│   │       │   ├── resources/
│   │       │   │   └── page.tsx          # Resource file management
│   │       │   └── announcements/
│   │       │       └── page.tsx          # System-wide announcements
│   │       └── reports/
│   │           └── page.tsx              # Analytics + downloadable reports
│   │
│   ├── api/                              # REST API Routes
│   │   ├── auth/
│   │   │   ├── [...nextauth]/
│   │   │   │   └── route.ts              # NextAuth handler
│   │   │   ├── register/
│   │   │   │   └── route.ts              # POST /api/auth/register
│   │   │   └── forgot-password/
│   │   │       └── route.ts              # POST /api/auth/forgot-password
│   │   ├── users/
│   │   │   ├── route.ts                  # GET (list), POST (create)
│   │   │   └── [userId]/
│   │   │       └── route.ts              # GET, PATCH, DELETE
│   │   ├── appointments/
│   │   │   ├── route.ts                  # GET (list), POST (create)
│   │   │   └── [id]/
│   │   │       └── route.ts              # GET, PATCH, DELETE
│   │   ├── requests/
│   │   │   ├── route.ts                  # GET, POST
│   │   │   └── [id]/
│   │   │       └── route.ts              # GET, PATCH (status update)
│   │   ├── messages/
│   │   │   ├── route.ts                  # GET conversations, POST message
│   │   │   └── [conversationId]/
│   │   │       └── route.ts              # GET thread
│   │   ├── resources/
│   │   │   ├── route.ts                  # GET, POST
│   │   │   └── [id]/
│   │   │       └── route.ts              # GET, PATCH, DELETE
│   │   ├── notifications/
│   │   │   ├── route.ts                  # GET unread, PATCH mark read
│   │   │   └── [id]/
│   │   │       └── route.ts              # PATCH single read
│   │   ├── admin/
│   │   │   ├── assignments/
│   │   │   │   └── route.ts              # POST assign, DELETE unassign
│   │   │   ├── analytics/
│   │   │   │   └── route.ts              # GET system metrics
│   │   │   └── reports/
│   │   │       └── route.ts              # GET exportable reports
│   │   └── upload/
│   │       └── route.ts                  # POST file upload handler
│   │
│   ├── not-found.tsx                     # Global 404 (already built)
│   ├── globals.css                       # Global styles (already built)
│   ├── layout.tsx                        # Root layout (already built)
│   └── page.tsx                          # Landing page (already built)
│
├── components/
│   ├── ui/                               # shadcn/ui — 53 components (already installed)
│   ├── landing/                          # Landing sections (already built)
│   │
│   ├── auth/                             # Authentication forms
│   │   ├── login-form.tsx
│   │   ├── signup-form.tsx
│   │   └── forgot-password-form.tsx
│   │
│   ├── dashboard/                        # Dashboard shell components
│   │   ├── sidebar.tsx                   # Role-aware collapsible sidebar
│   │   ├── topbar.tsx                    # Top navigation bar
│   │   ├── breadcrumb-nav.tsx            # Dynamic breadcrumb
│   │   └── notifications-panel.tsx       # Slide-out notification panel
│   │
│   ├── student/                          # Student-specific components
│   │   ├── dashboard-stats.tsx           # Stats cards grid
│   │   ├── request-form.tsx              # New advising request form
│   │   ├── appointment-card.tsx          # Single appointment card
│   │   ├── appointment-calendar.tsx      # Calendar view
│   │   └── resource-card.tsx             # Resource/FAQ card
│   │
│   ├── advisor/                          # Advisor-specific components
│   │   ├── dashboard-stats.tsx           # Advisor stats
│   │   ├── student-card.tsx              # Student overview card
│   │   ├── student-detail.tsx            # Full student panel
│   │   ├── notes-editor.tsx              # Session notes rich editor
│   │   └── appointment-actions.tsx       # Accept/decline/complete actions
│   │
│   ├── admin/                            # Admin-specific components
│   │   ├── dashboard-metrics.tsx         # System metrics cards
│   │   ├── user-table.tsx                # Sortable user data table
│   │   ├── assignment-panel.tsx          # Drag-or-select assignment UI
│   │   ├── content-editor.tsx            # FAQ/announcement editor
│   │   └── reports-chart.tsx             # Recharts analytics charts
│   │
│   └── shared/                           # Used across all roles
│       ├── message-thread.tsx            # Conversation UI
│       ├── message-input.tsx             # Message composition box
│       ├── appointment-list.tsx          # Reusable appointment list
│       ├── status-badge.tsx              # Status chips (pending/active/etc)
│       ├── empty-state.tsx               # No-data illustrations
│       ├── data-table.tsx                # Generic sortable/filterable table
│       ├── confirm-dialog.tsx            # Reusable destructive confirm
│       ├── page-header.tsx               # Section heading + action buttons
│       └── loading-skeleton.tsx          # Reusable skeleton loaders
│
├── lib/
│   ├── auth/
│   │   ├── config.ts                     # NextAuth / Auth.js config
│   │   ├── session.ts                    # getServerSession helper
│   │   └── permissions.ts                # Role-based permission checks
│   │
│   ├── db/
│   │   └── index.ts                      # Prisma client singleton
│   │
│   ├── validations/                      # Zod schemas (shared client+server)
│   │   ├── auth.ts                       # login, register, resetPassword
│   │   ├── appointment.ts                # create, update, cancel
│   │   ├── request.ts                    # advising request schemas
│   │   ├── message.ts                    # message schema
│   │   ├── user.ts                       # user create/update
│   │   └── content.ts                    # FAQ, resource, announcement
│   │
│   ├── actions/                          # Server Actions (mutations)
│   │   ├── auth.ts                       # login, logout, register, resetPassword
│   │   ├── appointments.ts               # CRUD + status changes
│   │   ├── requests.ts                   # submit, cancel, update status
│   │   ├── messages.ts                   # send, markRead
│   │   ├── users.ts                      # admin: create, update, deactivate
│   │   ├── assignments.ts                # admin: assign/unassign
│   │   └── content.ts                    # admin: FAQ, resources, announcements
│   │
│   ├── email/
│   │   ├── index.ts                      # Resend client config
│   │   └── templates/
│   │       ├── welcome.tsx               # New user welcome email
│   │       ├── appointment-confirmed.tsx # Booking confirmation
│   │       ├── appointment-cancelled.tsx # Cancellation notice
│   │       ├── request-update.tsx        # Request status changed
│   │       ├── new-message.tsx           # New message notification
│   │       └── password-reset.tsx        # Reset password link
│   │
│   └── utils.ts                          # Existing cn() + new helpers
│
├── hooks/
│   ├── use-mobile.ts                     # Existing
│   ├── use-session.ts                    # Auth session access
│   ├── use-notifications.ts              # Notification polling
│   ├── use-debounce.ts                   # Search input debounce
│   └── use-optimistic.ts                # Optimistic UI updates
│
├── types/
│   ├── index.ts                          # Re-exports all types
│   ├── auth.ts                           # Session, User, Role types
│   ├── appointment.ts                    # AppointmentStatus, etc.
│   ├── message.ts                        # Message, Conversation types
│   ├── request.ts                        # RequestStatus types
│   └── api.ts                            # ApiResponse<T>, PaginatedResponse<T>
│
├── prisma/
│   ├── schema.prisma                     # Full database schema
│   └── seed.ts                           # Dev seed data (admin + demo users)
│
├── middleware.ts                          # Route protection + role redirects
│
├── public/                               # Static assets (existing SVGs + logo)
│
├── .env.example                          # Template of required env vars
├── .env.local                            # Local secrets (git-ignored)
├── .gitignore
├── components.json
├── next.config.ts
├── postcss.config.mjs
├── tsconfig.json
└── package.json
```

---

## 4. Database Schema Design

### Entity Relationship Overview

```
User ──────────┬── StudentProfile
               ├── AdvisorProfile
               └── AdminProfile

StudentProfile ──── AdvisorAssignment ──── AdvisorProfile

User ──── Appointment (as student)
AdvisorProfile ──── Appointment (as advisor)

User ──── Message (as sender)
User ──── Message (as receiver)

Appointment ──── AdvisingNote

User ──── Notification
User ──── PasswordResetToken

Admin ──── Resource
Admin ──── FAQ
Admin ──── Announcement
```

### Full Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────

enum Role {
  STUDENT
  ADVISOR
  ADMIN
}

enum AppointmentStatus {
  PENDING       // Student requested
  CONFIRMED     // Advisor accepted
  COMPLETED     // Session happened
  CANCELLED     // Either party cancelled
  DECLINED      // Advisor declined
  NO_SHOW       // Student did not attend
}

enum RequestStatus {
  PENDING       // Submitted, awaiting advisor review
  REVIEWED      // Advisor acknowledged
  CONVERTED     // Turned into a scheduled appointment
  CLOSED        // Resolved without appointment
  CANCELLED     // Student cancelled before review
}

enum NotificationType {
  APPOINTMENT_CONFIRMED
  APPOINTMENT_CANCELLED
  APPOINTMENT_REMINDER
  REQUEST_REVIEWED
  REQUEST_CONVERTED
  NEW_MESSAGE
  NEW_ANNOUNCEMENT
  ACCOUNT_CREATED
  ADVISOR_ASSIGNED
}

enum ResourceCategory {
  ACADEMIC_POLICY
  FAQ
  FORM
  GUIDE
  ANNOUNCEMENT
  OTHER
}

enum AppointmentType {
  IN_PERSON
  ONLINE
  PHONE
}

// ─────────────────────────────────────────
// CORE USER MODEL
// ─────────────────────────────────────────

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String    // bcrypt hashed
  role          Role
  isActive      Boolean   @default(true)
  emailVerified DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  lastLoginAt   DateTime?

  // Profile relations (one per role)
  studentProfile  StudentProfile?
  advisorProfile  AdvisorProfile?
  adminProfile    AdminProfile?

  // Communication
  sentMessages      Message[]       @relation("SentMessages")
  receivedMessages  Message[]       @relation("ReceivedMessages")

  // Notifications
  notifications     Notification[]

  // Auth tokens
  passwordResetTokens PasswordResetToken[]
  sessions            Session[]

  @@index([email])
  @@index([role])
  @@index([isActive])
}

// ─────────────────────────────────────────
// PROFILE MODELS
// ─────────────────────────────────────────

model StudentProfile {
  id              String    @id @default(cuid())
  userId          String    @unique
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Personal / Academic
  firstName       String
  lastName        String
  studentId       String    @unique  // Institution student ID
  phone           String?
  profileImage    String?   // URL
  department      String?
  program         String?   // e.g., "Computer Science"
  year            Int?      // Academic year (1, 2, 3, 4)
  gpa             Float?
  enrollmentDate  DateTime?
  expectedGrad    DateTime?

  // Relations
  advisorAssignment   AdvisorAssignment?
  appointments        Appointment[]
  advisingRequests    AdvisingRequest[]

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([studentId])
  @@index([program])
}

model AdvisorProfile {
  id              String    @id @default(cuid())
  userId          String    @unique
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Personal / Professional
  firstName       String
  lastName        String
  title           String?   // e.g., "Dr.", "Prof."
  phone           String?
  profileImage    String?
  department      String?
  specialization  String?
  officeLocation  String?
  officeHours     String?
  bio             String?

  // Capacity
  maxStudents     Int       @default(30)
  isAvailable     Boolean   @default(true)

  // Relations
  assignedStudents    AdvisorAssignment[]
  appointments        Appointment[]
  advisingNotes       AdvisingNote[]

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([department])
  @@index([isAvailable])
}

model AdminProfile {
  id              String    @id @default(cuid())
  userId          String    @unique
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  firstName       String
  lastName        String
  phone           String?
  profileImage    String?

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

// ─────────────────────────────────────────
// ADVISOR ASSIGNMENT
// ─────────────────────────────────────────

model AdvisorAssignment {
  id              String    @id @default(cuid())
  studentProfileId String   @unique  // One advisor per student at a time
  studentProfile  StudentProfile  @relation(fields: [studentProfileId], references: [id], onDelete: Cascade)

  advisorProfileId String
  advisorProfile  AdvisorProfile  @relation(fields: [advisorProfileId], references: [id])

  assignedAt      DateTime  @default(now())
  assignedById    String    // Admin user ID who made the assignment
  notes           String?

  @@index([advisorProfileId])
}

// ─────────────────────────────────────────
// APPOINTMENTS
// ─────────────────────────────────────────

model Appointment {
  id                String            @id @default(cuid())
  studentProfileId  String
  studentProfile    StudentProfile    @relation(fields: [studentProfileId], references: [id])

  advisorProfileId  String
  advisorProfile    AdvisorProfile    @relation(fields: [advisorProfileId], references: [id])

  requestedAt       DateTime          @default(now())
  scheduledAt       DateTime          // Confirmed date/time
  duration          Int               @default(30) // minutes
  type              AppointmentType   @default(IN_PERSON)
  location          String?           // Room or meeting link
  status            AppointmentStatus @default(PENDING)

  // Student-provided context
  topic             String
  notes             String?           // Student pre-notes

  // Advisor actions
  advisorNotes      String?           // Post-meeting outcome notes
  cancelledAt       DateTime?
  cancelledById     String?           // Who cancelled
  cancellationReason String?
  completedAt       DateTime?

  // Linked advising note record
  advisingNote      AdvisingNote?

  // Linked from a request
  advisingRequestId String?           @unique
  advisingRequest   AdvisingRequest?  @relation(fields: [advisingRequestId], references: [id])

  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt

  @@index([studentProfileId])
  @@index([advisorProfileId])
  @@index([status])
  @@index([scheduledAt])
}

// ─────────────────────────────────────────
// ADVISING REQUESTS
// ─────────────────────────────────────────

model AdvisingRequest {
  id                String         @id @default(cuid())
  studentProfileId  String
  studentProfile    StudentProfile @relation(fields: [studentProfileId], references: [id])

  topic             String
  description       String
  preferredDate     DateTime?
  preferredTime     String?        // e.g., "Morning", "Afternoon"
  urgency           String?        // "Low", "Medium", "High"
  status            RequestStatus  @default(PENDING)

  reviewedAt        DateTime?
  reviewedById      String?        // Advisor user ID
  reviewNote        String?

  // If converted to appointment
  appointment       Appointment?

  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt

  @@index([studentProfileId])
  @@index([status])
}

// ─────────────────────────────────────────
// ADVISING NOTES
// ─────────────────────────────────────────

model AdvisingNote {
  id                String         @id @default(cuid())
  appointmentId     String         @unique
  appointment       Appointment    @relation(fields: [appointmentId], references: [id])

  advisorProfileId  String
  advisorProfile    AdvisorProfile @relation(fields: [advisorProfileId], references: [id])

  content           String
  actionItems       String?        // Follow-up tasks
  isVisibleToStudent Boolean       @default(false)

  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt

  @@index([advisorProfileId])
}

// ─────────────────────────────────────────
// MESSAGES
// ─────────────────────────────────────────

model Message {
  id              String    @id @default(cuid())
  senderId        String
  sender          User      @relation("SentMessages", fields: [senderId], references: [id])
  receiverId      String
  receiver        User      @relation("ReceivedMessages", fields: [receiverId], references: [id])

  content         String
  isRead          Boolean   @default(false)
  readAt          DateTime?
  deletedBySender   Boolean @default(false)
  deletedByReceiver Boolean @default(false)

  createdAt       DateTime  @default(now())

  @@index([senderId])
  @@index([receiverId])
  @@index([isRead])
  @@index([createdAt])
}

// ─────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────

model Notification {
  id          String           @id @default(cuid())
  userId      String
  user        User             @relation(fields: [userId], references: [id], onDelete: Cascade)

  type        NotificationType
  title       String
  message     String
  link        String?          // Optional deep-link
  isRead      Boolean          @default(false)
  readAt      DateTime?

  createdAt   DateTime         @default(now())

  @@index([userId])
  @@index([isRead])
}

// ─────────────────────────────────────────
// CONTENT MANAGEMENT
// ─────────────────────────────────────────

model Resource {
  id          String           @id @default(cuid())
  title       String
  description String?
  fileUrl     String?          // Uploaded file URL
  externalUrl String?          // External link
  category    ResourceCategory @default(OTHER)
  isPublished Boolean          @default(true)
  createdById String           // Admin user ID
  downloadCount Int            @default(0)

  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  @@index([category])
  @@index([isPublished])
}

model FAQ {
  id          String    @id @default(cuid())
  question    String
  answer      String
  category    String?
  order       Int       @default(0)
  isPublished Boolean   @default(true)
  createdById String

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([isPublished])
}

model Announcement {
  id          String    @id @default(cuid())
  title       String
  content     String
  targetRole  Role?     // null = all roles
  isPublished Boolean   @default(false)
  publishedAt DateTime?
  expiresAt   DateTime?
  createdById String

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([targetRole])
  @@index([isPublished])
}

// ─────────────────────────────────────────
// AUTH TOKENS & SESSIONS
// ─────────────────────────────────────────

model PasswordResetToken {
  id          String    @id @default(cuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  token       String    @unique  // hashed
  expiresAt   DateTime
  usedAt      DateTime?

  createdAt   DateTime  @default(now())

  @@index([token])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expires      DateTime

  @@index([userId])
}
```

---

## 5. Authentication & Authorization System

### 5.1 Authentication Flow

```
1. User visits /auth/login
2. Submits email + password
3. Server Action validates with Zod
4. Finds user in DB, verifies bcrypt hash
5. Auth.js creates session (JWT or DB session)
6. Session stored in HTTP-only cookie
7. Middleware reads session on every request
8. Redirects to correct dashboard based on role
```

### 5.2 Session Strategy

Use **JWT sessions** (stateless) for performance with Auth.js v5:

```typescript
// lib/auth/config.ts
export const authConfig = {
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.isActive = user.isActive;
      }
      return token;
    },
    session({ session, token }) {
      session.user.role = token.role;
      session.user.id = token.id;
      session.user.isActive = token.isActive;
      return session;
    },
  },
};
```

### 5.3 Middleware Route Protection

```typescript
// middleware.ts

import { auth } from "@/lib/auth/config";
import { NextResponse } from "next/server";

const PUBLIC_ROUTES = [
  "/",
  "/auth/login",
  "/auth/signup",
  "/auth/forgot-password",
];
const ROLE_ROUTES = {
  STUDENT: "/student",
  ADVISOR: "/advisor",
  ADMIN: "/admin",
};

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Allow public routes
  if (PUBLIC_ROUTES.some((r) => pathname.startsWith(r)))
    return NextResponse.next();

  // No session → redirect to login
  if (!session) return NextResponse.redirect(new URL("/auth/login", req.url));

  // Deactivated account
  if (!session.user.isActive)
    return NextResponse.redirect(
      new URL("/auth/login?error=deactivated", req.url),
    );

  // Wrong role trying to access another role's route
  const userBase = ROLE_ROUTES[session.user.role];
  if (pathname.startsWith("/student") && session.user.role !== "STUDENT") {
    return NextResponse.redirect(new URL(userBase, req.url));
  }
  if (pathname.startsWith("/advisor") && session.user.role !== "ADVISOR") {
    return NextResponse.redirect(new URL(userBase, req.url));
  }
  if (pathname.startsWith("/admin") && session.user.role !== "ADMIN") {
    return NextResponse.redirect(new URL(userBase, req.url));
  }

  return NextResponse.next();
});
```

### 5.4 Password Reset Flow

```
1. User submits email on /auth/forgot-password
2. Server checks if email exists (always respond with success to prevent enumeration)
3. If exists: generate random token → hash it → store in PasswordResetToken table
4. Send email with reset link: /auth/reset-password?token=<raw>
5. User clicks link, submits new password
6. Server hashes raw token, finds match, checks expiry (1 hour)
7. Updates password, marks token as used
8. Deletes all other tokens for this user
9. Redirect to login
```

### 5.5 Role-Based Permission Helpers

```typescript
// lib/auth/permissions.ts

export const permissions = {
  canViewStudent: (role: Role) => ["ADVISOR", "ADMIN"].includes(role),
  canManageUsers: (role: Role) => role === "ADMIN",
  canAssignAdvisors: (role: Role) => role === "ADMIN",
  canViewAllAppointments: (role: Role) => role === "ADMIN",
  canModifyContent: (role: Role) => role === "ADMIN",
  canAccessOwnAppointments: (role: Role) =>
    ["STUDENT", "ADVISOR"].includes(role),
};
```

---

## 6. API Design & Route Map

### 6.1 Standard Response Shape

All API routes return a consistent shape:

```typescript
// types/api.ts

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

type PaginatedResponse<T> = ApiResponse<{
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}>;
```

### 6.2 Full API Route Map

| Method | Route                            | Auth Required | Role             | Description                           |
| ------ | -------------------------------- | ------------- | ---------------- | ------------------------------------- |
| POST   | `/api/auth/register`             | No            | —                | Register new user                     |
| POST   | `/api/auth/forgot-password`      | No            | —                | Request password reset email          |
| GET    | `/api/users`                     | Yes           | ADMIN            | List all users (paginated + filtered) |
| POST   | `/api/users`                     | Yes           | ADMIN            | Create a new user                     |
| GET    | `/api/users/[userId]`            | Yes           | ADMIN, SELF      | Get user by ID                        |
| PATCH  | `/api/users/[userId]`            | Yes           | ADMIN, SELF      | Update user info                      |
| DELETE | `/api/users/[userId]`            | Yes           | ADMIN            | Deactivate user (soft delete)         |
| GET    | `/api/appointments`              | Yes           | ALL              | Get appointments (scoped by role)     |
| POST   | `/api/appointments`              | Yes           | STUDENT          | Create appointment request            |
| GET    | `/api/appointments/[id]`         | Yes           | OWNER            | Get single appointment                |
| PATCH  | `/api/appointments/[id]`         | Yes           | ADVISOR, ADMIN   | Update status/notes                   |
| DELETE | `/api/appointments/[id]`         | Yes           | OWNER            | Cancel appointment                    |
| GET    | `/api/requests`                  | Yes           | STUDENT, ADVISOR | Get advising requests                 |
| POST   | `/api/requests`                  | Yes           | STUDENT          | Submit new request                    |
| PATCH  | `/api/requests/[id]`             | Yes           | ADVISOR          | Update request status                 |
| DELETE | `/api/requests/[id]`             | Yes           | STUDENT          | Cancel own request                    |
| GET    | `/api/messages`                  | Yes           | ALL              | Get conversation list                 |
| POST   | `/api/messages`                  | Yes           | STUDENT, ADVISOR | Send a message                        |
| GET    | `/api/messages/[conversationId]` | Yes           | PARTICIPANT      | Get conversation thread               |
| GET    | `/api/resources`                 | Yes           | ALL              | Get all published resources           |
| POST   | `/api/resources`                 | Yes           | ADMIN            | Create resource                       |
| PATCH  | `/api/resources/[id]`            | Yes           | ADMIN            | Update resource                       |
| DELETE | `/api/resources/[id]`            | Yes           | ADMIN            | Delete resource                       |
| GET    | `/api/notifications`             | Yes           | ALL              | Get user's notifications              |
| PATCH  | `/api/notifications`             | Yes           | ALL              | Mark all as read                      |
| PATCH  | `/api/notifications/[id]`        | Yes           | OWNER            | Mark single as read                   |
| POST   | `/api/admin/assignments`         | Yes           | ADMIN            | Assign student to advisor             |
| DELETE | `/api/admin/assignments`         | Yes           | ADMIN            | Unassign student from advisor         |
| GET    | `/api/admin/analytics`           | Yes           | ADMIN            | Get system metrics                    |
| GET    | `/api/admin/reports`             | Yes           | ADMIN            | Get exportable report data            |
| POST   | `/api/upload`                    | Yes           | ADMIN            | Upload resource file                  |

---

## 7. Server Actions Architecture

Server Actions are used for **mutations** (creates, updates, deletes). They run on the server, integrate directly with Prisma, revalidate paths after changes.

### Pattern for Every Action

```typescript
// lib/actions/appointments.ts

"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth/config";
import { revalidatePath } from "next/cache";
import { appointmentSchema } from "@/lib/validations/appointment";

export async function createAppointment(rawData: unknown) {
  // 1. Get session
  const session = await auth();
  if (!session || session.user.role !== "STUDENT") {
    return { success: false, error: "Unauthorized" };
  }

  // 2. Validate input
  const validation = appointmentSchema.safeParse(rawData);
  if (!validation.success) {
    return { success: false, error: validation.error.flatten().fieldErrors };
  }

  const data = validation.data;

  try {
    // 3. Business logic checks (edge cases)
    const existingConflict = await db.appointment.findFirst({
      where: {
        advisorProfileId: data.advisorProfileId,
        scheduledAt: data.scheduledAt,
        status: { notIn: ["CANCELLED", "DECLINED"] },
      },
    });

    if (existingConflict) {
      return {
        success: false,
        error: "This time slot is no longer available.",
      };
    }

    // 4. Create record
    const appointment = await db.appointment.create({ data: { ...data } });

    // 5. Send notification
    await createNotification({
      userId: data.advisorUserId,
      type: "APPOINTMENT_CONFIRMED",
      message: "A student has requested an appointment.",
    });

    // 6. Revalidate relevant pages
    revalidatePath("/student/appointments");

    return { success: true, data: appointment };
  } catch (error) {
    console.error("[createAppointment]", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
```

---

## 8. Page & Route Structure

### 8.1 Auth Pages

| Route                   | Purpose                          | Key Components              |
| ----------------------- | -------------------------------- | --------------------------- |
| `/auth/login`           | Email + password sign in         | `LoginForm`, error handling |
| `/auth/signup`          | Coming Soon → then register form | `SignupForm`                |
| `/auth/forgot-password` | Request reset email              | `ForgotPasswordForm`        |
| `/auth/reset-password`  | Set new password                 | `ResetPasswordForm`         |

### 8.2 Student Portal

| Route                           | Purpose                            | Key Data Fetched                                               |
| ------------------------------- | ---------------------------------- | -------------------------------------------------------------- |
| `/student`                      | Overview dashboard                 | Upcoming appointments, pending requests, unread messages count |
| `/student/profile`              | View/edit academic profile         | StudentProfile, AdvisorAssignment                              |
| `/student/appointments`         | All appointments (upcoming + past) | Appointments paginated                                         |
| `/student/appointments/[id]`    | Single appointment detail          | Appointment + advisor info                                     |
| `/student/requests`             | All advising requests + status     | AdvisingRequests                                               |
| `/student/requests/new`         | Submit new request form            | AdvisorProfile (assigned advisor)                              |
| `/student/messages`             | Inbox with conversation list       | Message threads                                                |
| `/student/messages/[advisorId]` | Chat thread with advisor           | Messages, marks read                                           |
| `/student/resources`            | FAQs, documents, policies          | Resources, FAQs, Announcements                                 |

### 8.3 Advisor Portal

| Route                           | Purpose                          | Key Data Fetched                                                |
| ------------------------------- | -------------------------------- | --------------------------------------------------------------- |
| `/advisor`                      | Overview dashboard               | Assigned students count, today's appointments, pending requests |
| `/advisor/students`             | All assigned students            | StudentProfiles with GPA, year, last contact                    |
| `/advisor/students/[studentId]` | Student detail + notes + history | Full student record + appointments + notes                      |
| `/advisor/appointments`         | Calendar + list of all sessions  | Appointments with status filters                                |
| `/advisor/appointments/[id]`    | Appointment management           | Full appointment + student info                                 |
| `/advisor/messages`             | All student conversations        | Message threads                                                 |
| `/advisor/messages/[studentId]` | Chat thread with student         | Messages, marks read                                            |

### 8.4 Admin Panel

| Route                          | Purpose                     | Key Data Fetched                                |
| ------------------------------ | --------------------------- | ----------------------------------------------- |
| `/admin`                       | System metrics dashboard    | User counts, appointment stats, recent activity |
| `/admin/users`                 | User management table       | All users with search/filter                    |
| `/admin/users/new`             | Create user form            | —                                               |
| `/admin/users/[userId]`        | Edit user / deactivate      | User + profile data                             |
| `/admin/assignments`           | Assign students to advisors | All students + advisors                         |
| `/admin/content`               | Content management hub      | —                                               |
| `/admin/content/faqs`          | FAQ CRUD                    | All FAQs                                        |
| `/admin/content/resources`     | Resource file management    | All resources                                   |
| `/admin/content/announcements` | Announcements               | Active announcements                            |
| `/admin/reports`               | Analytics + export          | Aggregated system data                          |

---

## 9. Feature Specifications — Student Portal

### 9.1 Student Dashboard (`/student`)

**Displays:**

- Welcome message: "Good morning, [First Name]"
- Stats row: Upcoming appointments, Pending requests, Unread messages
- Next appointment card (date, time, advisor name, location)
- Recent activity feed (last 5 notifications)
- Quick action buttons: "Book Session", "Message Advisor", "Browse Resources"
- Active announcements from admin

**Data Sources:** `appointment.findMany({ status: "CONFIRMED" })`, `notification.findMany()`, `announcement.findMany({ isPublished: true })`

### 9.2 Academic Profile (`/student/profile`)

**Displays:**

- Profile photo (placeholder if none)
- Personal info: name, student ID, email, phone
- Academic info: program, year, GPA, enrollment date, expected graduation
- Assigned advisor card: name, title, office, contact

**Editable Fields:** phone only (admin controls everything else)

**Edge Cases:**

- GPA not yet assigned → show "Not Available"
- No advisor assigned → show "Not yet assigned" with prompt to contact admin
- Program change mid-year → admin updates, student notified

### 9.3 Advising Requests (`/student/requests`)

**Request Form Fields:**

- Topic (required, max 100 chars)
- Description (required, min 20 chars)
- Preferred date (optional)
- Preferred time of day (Morning / Afternoon / Evening)
- Urgency level (Low / Medium / High)

**Status Flow:**

```
PENDING → REVIEWED → CONVERTED (appointment created)
                   → CLOSED
       → CANCELLED (by student)
```

**Business Rules:**

- Students can only cancel PENDING requests
- Students cannot submit more than 3 pending requests simultaneously
- Once CONVERTED, request becomes read-only

### 9.4 Appointment Scheduling (`/student/appointments`)

**Booking Flow:**

1. Student sees available slots from assigned advisor
2. Selects date, time, type (in-person/online/phone)
3. Enters topic and pre-meeting notes
4. Submits → status = PENDING
5. Advisor confirms → status = CONFIRMED → email sent to student
6. 24h before: reminder notification sent

**Cancellation Rules:**

- Student can cancel up to 2 hours before the appointment
- Cancellation after 2 hours → still allowed but flagged
- 3+ cancellations → admin notified
- Advisor cancellation → student immediately notified

**Calendar View:** Shows all confirmed appointments. Past appointments shown greyed out.

### 9.5 Messaging System (`/student/messages`)

**Features:**

- Conversation list (sorted by most recent)
- Unread badge count on sidebar icon
- Message thread view
- Message input with character limit (2000 chars)
- Read receipts ("Seen" timestamp)
- Messages cannot be edited or deleted (for audit purposes)

**Business Rules:**

- Students can only message their assigned advisor
- If no advisor assigned → messaging locked with prompt
- Messages marked as read when thread is opened

### 9.6 Resources (`/student/resources`)

**Content Types:**

- FAQs (accordion layout)
- Policy documents (PDF links)
- Forms (downloadable)
- Guides (external links)
- Active announcements

**Filter/Search:** by category, search by title

---

## 10. Feature Specifications — Advisor Portal

### 10.1 Advisor Dashboard (`/advisor`)

**Displays:**

- Stats: Total assigned students, Today's appointments, Pending requests, Unread messages
- Today's schedule (time-ordered appointments)
- Pending request alerts (action required)
- Student activity highlights (recent profile updates, new requests)

### 10.2 Student Management (`/advisor/students`)

**Student List:**

- Table columns: Name, Student ID, Program, Year, GPA, Last Contact, Status
- Search by name or student ID
- Filter by program, year, GPA range
- Sort by any column

**Student Detail Page (`/advisor/students/[studentId]`):**

- Full student profile (read-only)
- Appointment history (all sessions)
- Advising notes per session
- Request history
- "Add Note" button (opens notes editor)
- "Schedule Appointment" shortcut

### 10.3 Appointment Management (`/advisor/appointments`)

**Views:** List view + Calendar view toggle

**Appointment Actions by Status:**

| Current Status | Available Actions            |
| -------------- | ---------------------------- |
| PENDING        | Confirm, Decline             |
| CONFIRMED      | Complete, Cancel, Reschedule |
| COMPLETED      | View notes                   |
| CANCELLED      | View only                    |

**Recording Meeting Outcome:**

- After completing: opens notes modal
- Notes fields: Content (required), Action items, Visible to student (toggle)

### 10.4 Communication (`/advisor/messages`)

- Same thread-based UI as student
- Advisors can message ANY of their assigned students
- Cannot message students not assigned to them
- Cannot message other advisors (admin-only function)

---

## 11. Feature Specifications — Admin Panel

### 11.1 Admin Dashboard (`/admin`)

**Metrics Cards:**

- Total users by role (students, advisors, admins)
- Active vs. inactive users
- Total appointments this month / all time
- Pending advising requests
- Messages sent this week

**Charts (using Recharts):**

- Appointments per month (bar chart, last 6 months)
- Request status distribution (pie chart)
- User registration over time (line chart)

### 11.2 User Management (`/admin/users`)

**User Table:**

- Columns: Name, Email, Role, Status, Created Date, Last Login
- Actions: View, Edit, Deactivate/Reactivate, Reset Password
- Search: by name or email
- Filter: by role, by status (active/inactive)
- Pagination: 20 per page

**Create User Form:**

- Fields: First name, Last name, Email, Role, (auto-generated temp password, emailed to user)
- Role selection determines which profile form appears
- For Student: student ID, program, year, department
- For Advisor: title, department, specialization, office

**Deactivation:**

- Soft delete only (set `isActive = false`)
- Deactivated users cannot log in
- Pending appointments reassigned or notified
- Advisor deactivation: triggers reassignment of all students

### 11.3 Advisor Assignment (`/admin/assignments`)

**Interface:**

- Left panel: Unassigned students list
- Right panel: Advisors with current load (e.g., "18/30 students")
- Drag-and-drop OR select-and-assign button
- Filter students by program, year
- Filter advisors by department, availability

**Business Rules:**

- One advisor per student at a time
- Admin must confirm if advisor is at max capacity
- Reassignment: old assignment ends, new one begins (history preserved)
- Bulk assign: select multiple students → assign to one advisor

### 11.4 Content Management (`/admin/content`)

**FAQs:**

- CRUD editor with rich text answer
- Category tag
- Publish/unpublish toggle
- Drag to reorder

**Resources:**

- Title + description
- Upload file OR add external URL
- Category selection
- Publish/unpublish

**Announcements:**

- Title + rich content
- Target role: All / Students / Advisors
- Schedule publish date + expiry date

### 11.5 Reports & Analytics (`/admin/reports`)

**Available Reports:**

- Appointment Summary: total, by status, by advisor, date range
- Student Engagement: login frequency, requests submitted
- Advisor Workload: students assigned, sessions completed
- System Usage: page visits (if analytics added), message volume

**Export:** Each report exportable as CSV

---

## 12. Edge Cases & Error Handling

### 12.1 Authentication Edge Cases

| Scenario                                       | Handling                                                                             |
| ---------------------------------------------- | ------------------------------------------------------------------------------------ |
| Wrong password entered                         | Show generic error: "Invalid email or password" (never specify which field is wrong) |
| Account locked (5 failed attempts)             | Show: "Account locked. Check email for unlock instructions."                         |
| Deactivated account tries to login             | Show: "Your account is inactive. Contact your administrator."                        |
| Expired session                                | Middleware catches → redirect to `/auth/login?reason=session_expired` → toast shown  |
| Concurrent session from two devices            | Both allowed (JWT stateless)                                                         |
| Password reset token expired (>1hr)            | Show: "This link has expired. Request a new one."                                    |
| Password reset token already used              | Show: "This link has already been used."                                             |
| Unverified email (if email verify added later) | Block login with prompt to check inbox                                               |

### 12.2 Appointment Edge Cases

| Scenario                                          | Handling                                                                                        |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Time slot taken between browsing and booking      | On submit: check for conflict → return error "This slot was just taken. Please choose another." |
| Student books while advisor is set to unavailable | Block booking, show "Advisor is currently unavailable for new appointments"                     |
| Student tries to book with no assigned advisor    | Block, show "You have not been assigned an advisor yet"                                         |
| Student cancels within 2 hours                    | Allow but show warning modal + record late cancellation flag                                    |
| Student has 3+ late cancellations                 | Admin is notified via notification                                                              |
| Advisor declines without reason                   | Required field: decline reason (min 10 chars)                                                   |
| Past appointment rescheduled                      | Block: cannot reschedule appointments with scheduled time in the past                           |
| Appointment time zone mismatch                    | Store all times in UTC, display in local time using browser locale                              |
| Student tries to cancel completed appointment     | Block: "Completed appointments cannot be cancelled"                                             |

### 12.3 Messaging Edge Cases

| Scenario                                          | Handling                                                              |
| ------------------------------------------------- | --------------------------------------------------------------------- |
| Student with no assigned advisor tries to message | Show locked state: "You must be assigned an advisor to send messages" |
| Advisor deactivated mid-conversation              | Messages preserved in history, reply blocked with notice              |
| Empty message submitted                           | Client-side validation prevents send                                  |
| Message > 2000 characters                         | Character counter shown, submission blocked over limit                |
| Message to unassigned student (advisor)           | Server-side permission check rejects with 403                         |
| Very rapid message sending (spam)                 | Rate limit: 10 messages per minute per user                           |

### 12.4 User Management Edge Cases (Admin)

| Scenario                                         | Handling                                                                                          |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| Deactivating advisor with CONFIRMED appointments | Admin warned: "This advisor has X upcoming appointments. Reassign or cancel before deactivating." |
| Deactivating student with PENDING requests       | Requests auto-closed, advisor notified                                                            |
| Duplicate email on create                        | Server returns: "A user with this email already exists"                                           |
| Student ID already exists                        | Server returns: "This student ID is already registered"                                           |
| Changing a user's role                           | Not allowed after creation (structural change — admin must deactivate + create new)               |
| Admin tries to deactivate themselves             | Block with: "You cannot deactivate your own account"                                              |
| Last admin tries to deactivate themselves        | Block: "There must be at least one active admin"                                                  |
| Bulk actions with partial failures               | Return: list of successful + failed IDs with reasons                                              |

### 12.5 Assignment Edge Cases

| Scenario                                         | Handling                                                                       |
| ------------------------------------------------ | ------------------------------------------------------------------------------ |
| Assigning to advisor at max capacity             | Warning modal: "This advisor has reached their limit of X students. Continue?" |
| Student already assigned, reassigning            | Auto-ends previous assignment, records history                                 |
| Assigning advisor to themselves (data error)     | Server rejects                                                                 |
| Advisor deactivated after assignment             | Student's assignment shows "Advisor Unavailable", admin alerted                |
| Student has pending appointments when reassigned | Existing appointments retain original advisor, new requests go to new advisor  |

### 12.6 General Form & API Edge Cases

| Scenario                                                 | Handling                                                                 |
| -------------------------------------------------------- | ------------------------------------------------------------------------ |
| Network timeout on form submit                           | Show toast: "Request timed out. Please try again."                       |
| Server error 500                                         | Show toast: "Something went wrong on our end. Please try again shortly." |
| Unauthorized API access (wrong role)                     | Return 403 with `{ success: false, error: "Forbidden" }`                 |
| Missing required fields (bypassed client-side)           | Server-side Zod validation catches all                                   |
| SQL/NoSQL injection via inputs                           | Prisma parameterized queries protect against all SQL injection           |
| XSS via message/note content                             | React escapes all string rendering; dangerouslySetInnerHTML never used   |
| File upload wrong type                                   | Server validates MIME type; only PDF, DOC, DOCX, PNG, JPG, ZIP allowed   |
| File upload too large                                    | Reject files over 10MB with clear message                                |
| Pagination out of range (e.g., page 999 on 10-item list) | Return last valid page                                                   |
| Search query with special characters                     | URL-encode properly; Prisma handles safely                               |

### 12.7 Empty State Handling (UI)

Every list/table in the app must handle the empty state gracefully:

| Page                 | Empty State Message                                               |
| -------------------- | ----------------------------------------------------------------- |
| Student appointments | "No appointments yet. Book your first session with your advisor." |
| Student requests     | "No advising requests submitted yet."                             |
| Student messages     | "No conversations yet. Send your advisor a message."              |
| Advisor students     | "No students assigned to you yet."                                |
| Advisor appointments | "No appointments scheduled."                                      |
| Admin users          | "No users found matching your search."                            |

---

## 13. Email System

### 13.1 Email Provider Setup

Use **Resend** with React Email templates:

```typescript
// lib/email/index.ts
import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  template,
}: {
  to: string;
  subject: string;
  template: React.ReactElement;
}) {
  try {
    await resend.emails.send({
      from: "SAGE <noreply@yourdomain.com>",
      to,
      subject,
      react: template,
    });
  } catch (error) {
    console.error("[sendEmail]", error);
    // Don't throw — email failure should not block the main action
  }
}
```

### 13.2 Email Templates Required

| Template                    | Trigger                      | Recipients               |
| --------------------------- | ---------------------------- | ------------------------ |
| `welcome.tsx`               | User account created         | New user                 |
| `appointment-confirmed.tsx` | Advisor confirms appointment | Student                  |
| `appointment-cancelled.tsx` | Either party cancels         | Other party              |
| `appointment-reminder.tsx`  | 24h before session           | Student + Advisor        |
| `request-reviewed.tsx`      | Advisor reviews request      | Student                  |
| `request-converted.tsx`     | Request becomes appointment  | Student                  |
| `new-message.tsx`           | New unread message           | Receiver (if not online) |
| `password-reset.tsx`        | Reset requested              | User                     |
| `advisor-assigned.tsx`      | Admin assigns advisor        | Student                  |

### 13.3 Email Edge Cases

- **Bounce handling:** Log but do not crash if email fails to deliver
- **Invalid email:** Validate format before storing in DB
- **Email to deactivated account:** Skip sending
- **Rate limiting:** Max 3 password reset emails per hour per user

---

## 14. Notification System

### 14.1 In-App Notification Strategy

Use **polling** (simpler, no WebSocket complexity):

```typescript
// hooks/use-notifications.ts
export function useNotifications() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch("/api/notifications?unreadOnly=true");
      const data = await res.json();
      setCount(data.data?.total ?? 0);
    }, 30_000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return count;
}
```

### 14.2 Notification Types & Messages

| Type                    | Title                   | Message                                                              |
| ----------------------- | ----------------------- | -------------------------------------------------------------------- |
| `APPOINTMENT_CONFIRMED` | "Appointment Confirmed" | "Your appointment with [Advisor] on [Date] has been confirmed."      |
| `APPOINTMENT_CANCELLED` | "Appointment Cancelled" | "[Name] has cancelled the appointment scheduled for [Date]."         |
| `APPOINTMENT_REMINDER`  | "Upcoming Appointment"  | "Reminder: Your appointment is tomorrow at [Time]."                  |
| `REQUEST_REVIEWED`      | "Request Reviewed"      | "Your advising request has been reviewed by [Advisor]."              |
| `NEW_MESSAGE`           | "New Message"           | "[Name] sent you a message."                                         |
| `ADVISOR_ASSIGNED`      | "Advisor Assigned"      | "You have been assigned to [Advisor Name] as your academic advisor." |
| `NEW_ANNOUNCEMENT`      | "New Announcement"      | "[Title]: [Preview]..."                                              |

---

## 15. Security Architecture

### 15.1 Security Measures

| Layer                   | Measure                                                                        |
| ----------------------- | ------------------------------------------------------------------------------ |
| **Passwords**           | bcrypt with salt rounds = 12                                                   |
| **Sessions**            | HTTP-only, Secure, SameSite=Lax cookies                                        |
| **CSRF**                | Auth.js handles via CSRF tokens on all mutations                               |
| **SQL Injection**       | Prisma parameterized queries (zero raw SQL)                                    |
| **XSS**                 | React escapes all output; no `dangerouslySetInnerHTML`                         |
| **Route Protection**    | Middleware + server-side session checks on every protected action              |
| **API Authorization**   | Every API route and Server Action checks session role                          |
| **Rate Limiting**       | Middleware-level rate limiting on auth routes (5 req/min)                      |
| **Input Validation**    | Zod schemas on both client and server for all inputs                           |
| **File Uploads**        | Validate MIME type + size server-side, never execute uploaded files            |
| **Sensitive Data**      | Passwords never returned in API responses, `.select()` excludes password field |
| **Environment Secrets** | Never committed, loaded via env vars                                           |

### 15.2 Data Privacy

- Students only see their own data
- Advisors only see data for their assigned students
- Admin sees all data
- Advising notes marked `isVisibleToStudent: false` are never exposed to student endpoints
- Soft deletes preserve data for auditing

---

## 16. Component Architecture

### 16.1 Dashboard Layout Shell

```
DashboardLayout
├── Sidebar (role-aware nav items)
│   ├── Logo + app name
│   ├── Navigation links (role-filtered)
│   ├── Active indicator
│   └── User avatar + name + logout
├── TopBar
│   ├── Page title / breadcrumb
│   ├── Notification bell (with unread count badge)
│   └── User menu dropdown
└── Main Content Area (children)
```

### 16.2 Shared Reusable Components

| Component         | Props                                     | Usage                                |
| ----------------- | ----------------------------------------- | ------------------------------------ |
| `StatusBadge`     | `status`, `type`                          | Show colored status chips everywhere |
| `EmptyState`      | `title`, `description`, `icon`, `action?` | All empty list states                |
| `ConfirmDialog`   | `title`, `description`, `onConfirm`       | All destructive actions              |
| `DataTable`       | `columns`, `data`, `pagination`           | User list, appointment list          |
| `PageHeader`      | `title`, `description`, `actions?`        | Top of every page                    |
| `LoadingSkeleton` | `variant`, `rows?`                        | While async data loads               |
| `MessageThread`   | `messages`, `currentUserId`               | Chat UI (student + advisor)          |

### 16.3 Form Pattern

All forms follow this pattern using Zod + React Hook Form:

```typescript
// Example: Login Form
const form = useForm<LoginInput>({
  resolver: zodResolver(loginSchema), // Zod schema
  defaultValues: { email: "", password: "" },
});

async function onSubmit(data: LoginInput) {
  setLoading(true);
  const result = await loginAction(data); // Server Action
  if (!result.success) {
    form.setError("root", { message: result.error });
  }
  setLoading(false);
}
```

---

## 17. Middleware Strategy

```typescript
// middleware.ts — execution order

1. Check if route is public → pass through
2. Parse JWT session from cookie
3. If no valid session → redirect /auth/login
4. If session exists but user.isActive === false → redirect /auth/login?error=deactivated
5. Check role vs. route prefix → wrong role gets redirected to own dashboard
6. API routes: 401 JSON response instead of redirect
7. Allow request through
```

**Matcher config:**

```typescript
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.svg|.*\\.svg$).*)"],
};
```

---

## 18. Development Phases — Step-by-Step

### Phase 1 — Project Foundation (Week 1)

**Goal:** Set up the full project structure and core infrastructure

**Steps:**

1. Create the full folder structure as documented above
2. Install all required dependencies (Prisma, Auth.js, Zod, Resend, bcryptjs)
3. Create `.env.example` and `.env.local` with all required variables
4. Set up Prisma: `npx prisma init` → write full schema → `npx prisma generate`
5. Set up PostgreSQL locally (Docker or local install)
6. Run first migration: `npx prisma migrate dev --name init`
7. Create `lib/db/index.ts` Prisma singleton
8. Write and run `prisma/seed.ts` with one admin, one advisor, one student
9. Set up Auth.js with Prisma adapter
10. Write `middleware.ts` (route protection)
11. Write `lib/auth/config.ts`, `session.ts`, `permissions.ts`
12. Write all Zod validation schemas in `lib/validations/`
13. Write all TypeScript types in `types/`
14. Write `.env.example` documentation

**Deliverable:** Running DB, auth working, all schemas defined, seed data in DB

---

### Phase 2 — Authentication Pages (Week 1-2)

**Goal:** Complete, polished auth flow matching landing page style

**Steps:**

1. Build `(auth)/layout.tsx` — centered card with logo, matching design system
2. Build Login page + `LoginForm` component
3. Wire login form to Auth.js `signIn` action
4. Build Forgot Password page + form + server action
5. Build Reset Password page (token validation + new password)
6. Write `lib/actions/auth.ts` — login, logout, forgotPassword, resetPassword
7. Set up Resend email client
8. Write `password-reset.tsx` email template
9. Write `welcome.tsx` email template
10. Test full login → session → redirect → logout flow
11. Test password reset end-to-end

**Deliverable:** Full auth flow functional, sessions working, emails sending

---

### Phase 3 — Dashboard Shell & Navigation (Week 2)

**Goal:** Shared dashboard layout used by all three portals

**Steps:**

1. Build `(dashboard)/layout.tsx` — renders sidebar + topbar + children
2. Build `Sidebar` component with role-aware navigation items
3. Build `TopBar` component with breadcrumb + notifications bell
4. Build `NotificationsPanel` slide-out
5. Build `use-notifications.ts` polling hook
6. Build API route `GET /api/notifications`
7. Build `shared/empty-state.tsx`, `shared/status-badge.tsx`, `shared/page-header.tsx`
8. Build `shared/confirm-dialog.tsx`, `shared/loading-skeleton.tsx`
9. Build `shared/data-table.tsx` (generic sortable table with pagination)
10. Test role-based sidebar rendering (Student / Advisor / Admin all show correct nav)

**Deliverable:** Full dashboard shell, no content yet but layout complete

---

### Phase 4 — Student Portal (Week 3-4)

**Goal:** All student-facing pages functional

**Steps (in order):**

1. Student Dashboard — fetch upcoming appointments + pending requests + unread count
2. Academic Profile — display StudentProfile + AdvisorAssignment
3. Advising Requests list — all requests with status badges
4. New Request Form — Zod-validated, server action to create
5. Appointments list — sorted, with status filter tabs
6. Single Appointment detail page
7. Appointment booking form (select slot → submit → PENDING)
8. Messaging inbox — conversation list
9. Message thread view — render messages + input
10. Send message server action
11. Mark messages as read on thread open
12. Resources page — FAQs accordion + resource cards + announcements
13. Wire all notification creation in server actions
14. Test all student flows end-to-end

**Deliverable:** Complete, functional student portal

---

### Phase 5 — Advisor Portal (Week 5-6)

**Goal:** All advisor-facing pages functional

**Steps:**

1. Advisor Dashboard — stats + today's schedule + pending requests
2. Students list with search + filter
3. Student detail page with full history
4. Notes editor component (for post-session notes)
5. Appointments list with calendar + list toggle
6. Single appointment page with Accept/Decline/Complete actions
7. Appointment status change server actions
8. Decline appointment form (with required reason field)
9. Complete appointment → trigger notes editor modal
10. Messaging (reuse student messaging components with different role)
11. Wire all email sends for appointment status changes
12. Test all advisor flows end-to-end

**Deliverable:** Complete, functional advisor portal

---

### Phase 6 — Admin Panel (Week 7-8)

**Goal:** Full system administration capabilities

**Steps:**

1. Admin Dashboard — system metrics using aggregated DB queries
2. Recharts charts: appointment bar chart, status pie chart, registration line chart
3. User Management table with search + filter + pagination
4. Create User form (role-aware sub-forms)
5. Edit User page (update info + deactivate)
6. Deactivation warning/blocker for advisors with active appointments
7. Advisor Assignment interface — student list + advisor list + assign action
8. Bulk assignment capability
9. FAQ management (CRUD)
10. Resource management (CRUD + file upload)
11. Announcement management (with target role + schedule)
12. Reports page — summary tables + CSV export
13. Audit all admin actions for permission checks
14. Test all admin flows end-to-end

**Deliverable:** Complete, functional admin panel

---

### Phase 7 — Polish, Testing & Deployment Prep (Week 9)

**Goal:** Production-ready application

**Steps:**

1. Audit every page for loading states (add skeletons everywhere)
2. Audit every page for empty states
3. Audit every form for validation messages and error handling
4. Add global error boundary
5. Test all edge cases documented in Section 12
6. Review and clean up all TypeScript errors (`npm run build` with zero errors)
7. Run ESLint across entire codebase
8. Optimize images with `next/image` where not done
9. Add `metadata` to all page files for SEO
10. Test responsiveness on mobile/tablet
11. Write `prisma/seed.ts` with realistic demo data for all roles
12. Create `.env.example` with all required variables documented

**Deliverable:** Production-quality, tested application

---

### Phase 8 — Render Deployment (Week 10)

See Section 19 below.

---

## 19. Render Deployment Guide

### 19.1 Services to Create on Render

You need **two services** on Render:

1. **PostgreSQL Database** — managed database
2. **Web Service** — the Next.js application

### 19.2 Step-by-Step Render Setup

**Step 1 — Create PostgreSQL on Render:**

1. Go to render.com → New → PostgreSQL
2. Name: `sage-db`
3. Plan: Free (for dev) or Starter ($7/mo for production)
4. Region: Choose closest to your users
5. Click "Create Database"
6. Copy the **Internal Database URL** (for same-region web service) and **External Database URL** (for local dev)

**Step 2 — Prepare Next.js for Render:**

Update `next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // Required for Render deployment
};

export default nextConfig;
```

Update `package.json` build script:

```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "start": "next start",
    "postinstall": "prisma generate"
  }
}
```

**Step 3 — Create Web Service on Render:**

1. Go to render.com → New → Web Service
2. Connect your GitHub repository
3. Name: `sage-app`
4. Region: Same as database
5. Branch: `main`
6. Runtime: Node
7. Build Command: `npm install && npm run build`
8. Start Command: `npm start`
9. Plan: Free (limited) or Starter ($7/mo)

**Step 4 — Set Environment Variables on Render:**

In the web service Settings → Environment:

```
DATABASE_URL         = [Internal Database URL from Render PostgreSQL]
NEXTAUTH_SECRET      = [Generate: openssl rand -base64 32]
NEXTAUTH_URL         = https://your-app-name.onrender.com
RESEND_API_KEY       = [From resend.com]
EMAIL_FROM           = noreply@yourdomain.com
NODE_ENV             = production
```

**Step 5 — Run Migrations on Render:**

Add a one-time migration job OR run via the build command:

```json
"build": "prisma generate && prisma migrate deploy && next build"
```

> ⚠️ `prisma migrate deploy` (not `dev`) is used in production. It applies existing migrations without creating new ones.

**Step 6 — Deploy:**

1. Push to `main` branch → Render auto-deploys
2. Monitor the build log in Render dashboard
3. Once deployed, run seed if needed via Render Shell:
   ```bash
   npx prisma db seed
   ```

### 19.3 Render Deployment Considerations

| Concern                  | Solution                                                                        |
| ------------------------ | ------------------------------------------------------------------------------- |
| **Cold starts**          | Free plan sleeps after inactivity. Use Starter plan for production.             |
| **File uploads**         | Render's filesystem is ephemeral. Use Cloudinary or Supabase Storage for files. |
| **Build time**           | `prisma generate` adds ~30s to build. Normal.                                   |
| **Database connections** | Use Prisma connection pooling (`datasource db { url: env("DATABASE_URL") }`)    |
| **Environment secrets**  | Never commit `.env.local`. All secrets go in Render's environment panel.        |
| **Logs**                 | Use Render's log viewer + add structured console logging in server actions      |

### 19.4 Custom Domain (Optional)

1. In Render web service → Settings → Custom Domain
2. Add your domain (e.g., `sage.youruniversity.edu`)
3. Point your DNS CNAME to the Render URL
4. Render auto-provisions SSL certificate

---

## 20. Environment Variables Reference

```bash
# .env.example

# ─── Database ───────────────────────────────────────────
DATABASE_URL="postgresql://user:password@localhost:5432/sage_dev"

# ─── Authentication (NextAuth v5 / Auth.js) ─────────────
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
# Production: NEXTAUTH_URL="https://your-app.onrender.com"

# ─── Email (Resend) ──────────────────────────────────────
RESEND_API_KEY="re_xxxxxxxxxxxxxxxx"
EMAIL_FROM="SAGE <noreply@yourdomain.com>"

# ─── File Storage (if using Cloudinary) ─────────────────
# CLOUDINARY_CLOUD_NAME=""
# CLOUDINARY_API_KEY=""
# CLOUDINARY_API_SECRET=""

# ─── App ────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

---

## 21. Non-Functional Requirements

### 21.1 Performance Targets

| Metric            | Target      | Method                                                |
| ----------------- | ----------- | ----------------------------------------------------- |
| Page load (LCP)   | < 3 seconds | Server Components, image optimization, no blocking JS |
| API response time | < 500ms     | Indexed DB columns, Prisma query optimization         |
| Dashboard load    | < 2 seconds | Parallel data fetching with `Promise.all()`           |
| Concurrent users  | 200+        | Stateless JWT sessions, connection pooling            |

### 21.2 Accessibility (WCAG 2.1 AA)

- All interactive elements keyboard-navigable
- Sufficient color contrast (4.5:1 minimum)
- All images have descriptive `alt` text
- Form fields have associated `<label>` elements
- Error messages announced to screen readers via `aria-live`
- shadcn/ui components are ARIA-compliant out of the box

### 21.3 Browser Support

Chrome 100+, Firefox 100+, Safari 15+, Edge 100+

### 21.4 Uptime Target

99% monthly uptime. Render's Starter plan provides SLA for web services.

---

## 22. Future Enhancements Roadmap

| Enhancement                                      | Priority | Complexity |
| ------------------------------------------------ | -------- | ---------- |
| Real-time messaging via WebSockets (Pusher/Ably) | High     | Medium     |
| Video conferencing integration (Whereby/Jitsi)   | High     | High       |
| Email verification on signup                     | Medium   | Low        |
| OAuth login (Google / Microsoft)                 | Medium   | Low        |
| Mobile app (React Native)                        | Low      | High       |
| AI-powered advising suggestions                  | Low      | Very High  |
| LMS integration (Canvas, Blackboard)             | Low      | Very High  |
| Advanced analytics with export to Excel          | Medium   | Medium     |
| Automated appointment reminders (cron)           | Medium   | Medium     |
| Two-factor authentication (2FA)                  | Medium   | Medium     |
| Offline mode (PWA)                               | Low      | High       |

---

## Summary Checklist Before Starting Development

- [ ] PRD read and fully understood ✅
- [ ] Folder structure created
- [ ] All dependencies listed and ready to install
- [ ] PostgreSQL set up (local + Render planned)
- [ ] Prisma schema written
- [ ] All env variables documented in `.env.example`
- [ ] Auth.js flow mapped
- [ ] All edge cases reviewed per feature
- [ ] Email provider account created (Resend)
- [ ] Render account created, services planned
- [ ] GitHub repository connected to Render for auto-deploy
- [ ] Development phases planned with realistic timeline
- [ ] Design system confirmed (Space Grotesk, OKLCH colors, shadcn/ui)

---

_Document prepared for SAGE development. All architecture decisions are made to prioritize developer experience, type safety, scalability, and production readiness on Render._
