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

## Contribution guide 
The environment vairables are managed with doppler for the all stages. 

You are required to create your own database, and test all you production steps locally. before pushing the code to dev. 

That is to say that evey code changes should be made on a seperate branch and PR should be madde to dev, never to stag or main


After your changes is accepted and commited to staging, you can view it in one of the links below. 

You can login with the logins in the projecttarge.md


{
  "deployments": [
    {
      "app": "admin-app-stg",
      "bucket": "academicx-admin-app-stg-215587",
      "url": "https://academicx-admin-app-stg.ocbuchi.workers.dev"
    },
    {
      "app": "landing-page-stg",
      "bucket": "academicx-landing-page-stg-604102",
      "url": "https://academicx-landing-page-stg.ocbuchi.workers.dev"
    },
    {
      "app": "school-website-stg",
      "bucket": "academicx-school-website-stg-594721",
      "url": "https://academicx-school-website-stg.ocbuchi.workers.dev"
    },
    {
      "app": "staff-app-stg",
      "bucket": "academicx-staff-app-stg-542366",
      "url": "https://academicx-staff-app-stg.ocbuchi.workers.dev"
    },
    {
      "app": "student-parent-app-stg",
      "bucket": "academicx-student-parent-app-stg-424948",
      "url": "https://academicx-student-parent-app-stg.ocbuchi.workers.dev"
    },
    {
      "app": "super-admin-web-stg",
      "bucket": "academicx-super-admin-web-stg-701938",
      "url": "https://academicx-super-admin-web-stg.ocbuchi.workers.dev"
    }
  ],
  "timestamp": "2026-05-13T18:43:43.923889Z"
}


The links below are for the production buy t you can just refer to the official urls.  



"https://academicx-admin-app-prd.ocbuchi.workers.dev"
"https://academicx-landing-page-prd.ocbuchi.workers.dev"
"https://academicx-school-website-prd.ocbuchi.workers.dev"
"https://academicx-staff-app-prd.ocbuchi.workers.dev"
"https://academicx-student-parent-app-prd.ocbuchi.workers.dev"
"https://academicx-super-admin-web-prd.ocbuchi.workers.dev"


["superadmin","role:superadmin"]