# AcademicX Platform


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

### Run any app locally

```bash
# 1. Navigate to an app
cd apps/landing-page   # or admin-app, staff-app, etc.

# 2. Install dependencies
npm install

# 3. Start dev server
npm run dev
```

Each app runs independently on its own port (3000-3004).

### Build for production

```bash
cd apps/landing-page
npm run build    # Output in dist/
npm run preview  # Preview production build
```

## Tech Stack

| Layer     | Technology |
|-----------|-----------|
| Frontend  | React 18 + Vite |
| Routing   | React Router v7 |
| Styling   | Liquid Glass CSS (custom) |
| Backend   | Appwrite (planned) |
| Payments  | Squad by GTBank |
| Realtime  | Appwrite Realtime (planned) |

## Apps Overview

### Landing Page
Marketing site with hero, features, pricing, and school signup CTA. Full liquid glass design with animated background orbs and SVG refraction effects.

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

1. Create a Squad account at [squadco.com](https://squadco.com)
2. Get your API keys from the Squad dashboard
3. Set keys in Super Admin > System > Squad Payment Config
4. Sandbox URL: `https://sandbox-api-d.squadco.com`
5. Production URL: `https://api.squadco.com`

## License

Proprietary. All rights reserved.
