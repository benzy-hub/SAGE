# SAGE – Student Advising & Guidance Environment

<div align="center">

![SAGE Logo](https://img.shields.io/badge/SAGE-Academic%20Advising-0F766E?style=for-the-badge&logo=graduation-cap&logoColor=white)

**A Professional Web-Based Academic Advising Platform**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-Components-000?style=flat-square)](https://ui.shadcn.com/)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Project Structure](#-project-structure) • [User Roles](#-user-roles)

</div>

---

## 📋 Overview

**SAGE (Student Advising & Guidance Environment)** is a comprehensive, web-based academic advising platform designed to streamline communication between students, academic advisors, and institutional administrators. The system centralizes advising workflows, improves communication efficiency, and enhances student academic outcomes.

### 🎯 Goals

- **Improve Accessibility** – Provide 24/7 access to academic advising services
- **Streamline Communication** – Enable efficient messaging between students and advisors
- **Digitize Workflows** – Replace manual advising processes with digital solutions
- **Track Progress** – Monitor student academic progress and advising history

---

## ✨ Features

### 🎓 For Students

| Feature | Description |
|---------|-------------|
| **Dashboard** | Personalized overview of academic status, upcoming appointments, and notifications |
| **Academic Profile** | View personal information, program details, and academic progress |
| **Advising Requests** | Submit requests for advising sessions with preferred advisor and time |
| **Appointment Scheduling** | Book, view, cancel, or reschedule advising appointments |
| **Messaging System** | Direct communication with assigned advisors |
| **Support Resources** | Access FAQs, academic policies, and downloadable resources |

### 👨‍🏫 For Advisors

| Feature | Description |
|---------|-------------|
| **Dashboard** | Overview of assigned students, workload, and pending requests |
| **Student Management** | View student profiles, academic history, and add advising notes |
| **Appointment Management** | Accept/decline requests, schedule sessions, record outcomes |
| **Communication** | Messaging with students and notification alerts |

### 🔧 For Administrators

| Feature | Description |
|---------|-------------|
| **Control Dashboard** | System metrics, user statistics, and administrative alerts |
| **User Management** | Create, update, and deactivate users; assign roles and permissions |
| **Advisor Assignment** | Assign students to advisors and manage workloads |
| **Content Management** | Manage FAQs, resources, and system announcements |
| **Reporting & Analytics** | User activity reports, appointment statistics, system insights |

---

## 🛠 Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| **Next.js 15** (App Router) | React framework with server-side rendering |
| **TypeScript** | Type-safe JavaScript |
| **Tailwind CSS** | Utility-first CSS framework |
| **shadcn/ui** | Accessible, customizable component library |

### Backend

| Technology | Purpose |
|------------|---------|
| **Next.js API Routes** | Backend API endpoints |
| **Server Actions** | Server-side mutations |
| **Prisma** | Type-safe ORM for database operations |
| **PostgreSQL** | Primary relational database |

### Authentication & Security

| Technology | Purpose |
|------------|---------|
| **NextAuth.js / Auth.js** | Authentication and session management |
| **bcrypt** | Password hashing |
| **Role-Based Access Control** | Permission management |

### Deployment

| Technology | Purpose |
|------------|---------|
| **Vercel** | Hosting and deployment |
| **Environment Variables** | Configuration management |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **pnpm** or **yarn**
- **PostgreSQL** database (local or cloud)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/sage.git
   cd sage
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Configure the following variables:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/sage"

   # Authentication
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"

   # App
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   # Optional: Seed the database
   npx prisma db seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
sage/
├── app/                      # Next.js App Router
│   ├── (auth)/               # Authentication routes
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/          # Protected dashboard routes
│   │   ├── student/          # Student portal
│   │   ├── advisor/          # Advisor portal
│   │   └── admin/            # Admin panel
│   ├── api/                  # API routes
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Landing page
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── forms/                # Form components
│   ├── layouts/              # Layout components
│   └── shared/               # Shared components
├── lib/
│   ├── auth/                 # Authentication utilities
│   ├── db/                   # Database utilities
│   ├── utils.ts              # Utility functions
│   └── validations/          # Zod schemas
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Database seeding
├── hooks/                    # Custom React hooks
├── types/                    # TypeScript type definitions
└── public/                   # Static assets
```

---

## 👥 User Roles

### 🎓 Student
Students can access their academic profile, request advising sessions, communicate with advisors, and access support resources.

**Permissions:**
- View own academic profile and progress
- Submit and track advising requests
- Schedule and manage appointments
- Send/receive messages with assigned advisors
- Access support resources and FAQs

### 👨‍🏫 Advisor
Advisors manage their assigned students, handle appointment requests, and maintain advising records.

**Permissions:**
- View assigned student profiles
- Accept/decline advising requests
- Schedule and conduct advising sessions
- Add advising notes and track student progress
- Communicate with assigned students

### 🔧 Administrator
Administrators have full system access for user management, configuration, and reporting.

**Permissions:**
- Full CRUD operations on all users
- Assign/reassign students to advisors
- Manage system content (FAQs, announcements)
- View analytics and generate reports
- Configure system settings

---

## 🎨 Design System

### Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| **Primary** | `#0F766E` | Primary actions, headers |
| **Primary Light** | `#14B8A6` | Hover states, accents |
| **Secondary** | `#1E40AF` | Secondary actions |
| **Background** | `#F8FAFC` | Page backgrounds |
| **Surface** | `#FFFFFF` | Card backgrounds |
| **Text Primary** | `#0F172A` | Headings, body text |
| **Text Secondary** | `#64748B` | Muted text |

### Typography

- **Headings:** Inter (Bold/Semibold)
- **Body:** Inter (Regular/Medium)
- **Monospace:** JetBrains Mono (Code blocks)

### Design Principles

- ✅ Clean and minimal layout
- ✅ Consistent spacing and alignment
- ✅ Accessible (WCAG 2.1 AA compliant)
- ✅ Responsive (Mobile-first approach)
- ✅ Professional academic appearance

---

## 📱 Pages Overview

### Public Pages

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Hero, features, how it works, CTA |
| Login | `/login` | User authentication |
| Register | `/register` | New user registration |

### Student Portal

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/student` | Academic overview, quick actions |
| Profile | `/student/profile` | Academic profile management |
| Appointments | `/student/appointments` | Appointment scheduling |
| Messages | `/student/messages` | Advisor communication |
| Resources | `/student/resources` | Support materials |

### Advisor Portal

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/advisor` | Workload overview, alerts |
| Students | `/advisor/students` | Assigned student list |
| Appointments | `/advisor/appointments` | Appointment management |
| Messages | `/advisor/messages` | Student communication |

### Admin Panel

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/admin` | System metrics, alerts |
| Users | `/admin/users` | User management |
| Assignments | `/admin/assignments` | Advisor assignments |
| Content | `/admin/content` | FAQ & resource management |
| Reports | `/admin/reports` | Analytics & reporting |

---

## 🔐 Security Features

- **Password Hashing** – bcrypt with salt rounds
- **Session Protection** – HTTP-only cookies, CSRF protection
- **Role-Based Access** – Middleware-level route protection
- **Input Validation** – Zod schema validation
- **SQL Injection Prevention** – Prisma parameterized queries
- **XSS Protection** – React's built-in escaping

---

## 📊 Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| **Page Load Time** | < 3 seconds |
| **System Uptime** | 99% minimum |
| **Concurrent Users** | 500+ |
| **Browser Support** | Chrome, Firefox, Safari, Edge (latest 2 versions) |
| **Accessibility** | WCAG 2.1 AA compliant |

---

## 🗺 Roadmap

### Phase 1: Foundation ✅
- [x] Project setup with Next.js
- [x] shadcn/ui component library integration
- [ ] Database schema design
- [ ] Authentication system
- [ ] Landing page

### Phase 2: Core Features
- [ ] Student dashboard and profile
- [ ] Advisor dashboard
- [ ] Appointment scheduling system
- [ ] Messaging system

### Phase 3: Administration
- [ ] Admin dashboard
- [ ] User management
- [ ] Reporting and analytics
- [ ] Content management

### Phase 4: Polish & Launch
- [ ] Performance optimization
- [ ] Security audit
- [ ] Documentation
- [ ] Deployment

### Future Enhancements
- 🤖 AI-powered academic recommendations
- 📹 Video conferencing integration
- 📚 LMS integration
- 📱 Progressive Web App (PWA)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support

For support, please contact the development team or open an issue in the repository.

---

<div align="center">

**Built with ❤️ for Academic Excellence**

</div>
