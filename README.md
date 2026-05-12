# AcademicX School management Platform

## Architecture

```
academicx/
├── apps/
│   ├── landing-page/      → Marketing & signup (port 3000)
│   ├── admin-app/         → School admin dashboard (port 3001)
│   ├── staff-app/         → Teacher portal (port 3002)
│   ├── student-parent-app/ → Student & parent portal (port 3003)
│   └── super-admin-web/   → Platform admin (port 3004)
├── backend/
│   ├── functions/         → Auth, results, PINs, notifications
│   ├── database/          → Schema definitions & sample data
│   ├── auth/              → RBAC middleware
│   ├── cron/              → whatsapp cron job for school fees reminders
│   └── payment/           → Squad (GTBank) integration
└── shared/
    ├── components/        → Reusable React + CSS (liquid glass)
    ├── types/             → JSDoc type definitions
    └── utils/             → API client, auth, helpers
```

## Quick Start

### Prerequisites
- Node.js 18+
- npm 9+
- docker 
- appwrite locally running on docker 
- redis locally running on docker

### Note 
- For development ensure to run your appwrite and redis on the correct specified port. 
- application secrets are managed with dopler, 
- Guide on installing Docker https://docs.docker.com/engine/install/ubuntu/ ,
- Guide on installing appwrite https://appwrite.io/docs/advanced/self-hosting/installation and
- Guide on installing redis https://redis.io/docs/latest/operate/oss_and_stack/install/install-stack/docker/ 

### Run any app locally

```bash
cd apps/landing-page 
npm install
npm run dev
```

### Build for production

```bash
cd apps/landing-page
npm run build    
npm run preview  
```

## Tech Stack

| Layer     | Technology |
|-----------|-----------|
| Frontend  | React 18 + Vite |
| Routing   | React Router v7 |
| Backend   | Appwrite (planned) |
| Payments  | Squad by GTBank |
| Realtime  | Appwrite Realtime (planned) |

## Apps Overview

### Landing Page
Marketing site with hero, features, pricing, and school signup CTA.

### Admin App
- **Dashboard**: Stats, recent activity, quick actions
- **Enrollment**: Student & staff management with add modals
- **Academics**: Class overview & subject registration
- **Grading**: Customizable grading schemes & score weights
- **Results**: Approval workflow & broadsheet generation
- **PINs**: Batch generation with time-bound access
- **Communication**: Bulk email composer

### Staff App
- **Dashboard**: Assigned classes overview
- **Results Entry**: Inline score editing with auto-computed grades
- **Attendance**: Daily marking with status toggles
- **Chat**: Real-time messaging (Appwrite Realtime integration point)

### Student/Parent App
- **Dashboard**: Announcements & academic summary
- **Results**: Full term results with grades
- **Attendance**: Weekly attendance calendar
- **PIN Access**: Secure PIN-based result viewing

### Super Admin Web
- **Dashboard**: Platform-wide statistics
- **Schools**: Multi-school management
- **Payments**: Transaction oversight (Squad)
- **Analytics**: Revenue trends, user distribution
- **System**: Platform config, Squad keys, health monitoring

## Design System

- **Primary**: Blue (#1D4ED8)
- **Typography**: Inter (headings) + Roboto (body)
- **Glass**: SVG `feTurbulence` + `feDisplacementMap` refraction
- **Responsive**: Mobile-first, 3 breakpoints (480/768/1024px)

## Backend Integration Points

All backend functions are stubbed with `TODO` comments marking Appwrite SDK integration points:

- **Auth**: `backend/functions/auth.js` → Appwrite Auth
- **Database**: `backend/database/schema.js` → Appwrite Database
- **Payments**: `backend/payment/squad.js` → Squad API (`api.squadco.com`)
- **PINs**: `backend/functions/pins.js` → Unique, time-bound codes
- **RBAC**: `backend/auth/middleware.js` → Role hierarchy

## Payment Setup (Squad)
Squadco sandbox is used for the development and staging stage, only deployment stage uses real keys
 Sandbox URL: `https://sandbox-api-d.squadco.com`
 Production URL: `https://api.squadco.com`

f9bad4d0347a2dfc91df972be35cf81ce9501715b11b866b6f99642811a8dc6f 

24a1c7bebac2e272b280e9d48a50b389fb50264b0d32e8987fa9f25d5c79fe2a


This is my secret key for my local appwrite setup. 
