# AcademicX — Deployment Guide

Complete guide for deploying backend functions to Appwrite Cloud, frontend apps to Vercel, and building desktop/mobile apps with Tauri v2.

---

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | ≥ 18 | [nodejs.org](https://nodejs.org) |
| Appwrite CLI | latest | `npm install -g appwrite-cli` |
| Vercel CLI | latest | `npm install -g vercel` |
| Rust | stable | [rustup.rs](https://rustup.rs) |
| Tauri CLI | v2 | `cargo install tauri-cli` or `npm install -D @tauri-apps/cli` |

---

## Part 1: Appwrite Cloud (Backend)

### 1.1 Project Setup

1. Create an Appwrite project at [cloud.appwrite.io](https://cloud.appwrite.io)
2. Go to **Settings → API Keys** and create a key with **all scopes**
3. Note your **Project ID** and **API Endpoint**

### 1.2 Provision the Database

```bash
cd backend
cp .env.example .env

# Fill in your credentials in .env:
# APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
# APPWRITE_PROJECT_ID=your_project_id
# APPWRITE_API_KEY=your_api_key

node setup-appwrite.js
```

> **TIP:** Run this script again after schema changes — it's idempotent and will only create missing resources.

### 1.3 Deploy Appwrite Functions

Appwrite Functions are deployed via the Appwrite CLI. Each backend module becomes a separate function.

#### Initialize the CLI

```bash
appwrite login
appwrite init project
# Select your project when prompted
```

#### Deploy All Functions

Assuming `appwrite.json` is configured in the root:

```bash
appwrite deploy function

# Or deploy individually:
appwrite deploy function --function-id auth
```

#### Set Environment Variables

For each function, set the necessary internal variables in the Appwrite Console or via CLI:

```bash
appwrite functions createVariable \
  --function-id YOUR_FUNCTION_ID \
  --key SMTP_HOST \
  --value smtpdm.aliyun.com

# Repeat for all necessary vars: SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, SQUAD_SECRET_KEY, etc.
```

---

## Part 2: Vercel (Frontend)

### 2.1 Prepare Each App

Create `.env.production` in each app directory:

```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
```

### 2.2 SPA Routing Fix

Tauri and React Router applications need SPA catch-all rewrites on Vercel. Create a `vercel.json` in each target app directory:

```json
{
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### 2.3 Deploy via Git (Recommended)

1. Push the monorepo to GitHub.
2. In the Vercel dashboard, click **Add New → Project**.
3. Import your repository, but change the **Root Directory** for each deployment:
    - `apps/landing-page` (domain: academicx.com)
    - `apps/admin-app` (domain: admin.academicx.com)
    - `apps/staff-app` (domain: staff.academicx.com)
    - `apps/student-parent-app` (domain: app.academicx.com)
    - `apps/super-admin-web` (domain: platform.academicx.com)
4. Select `Vite` as the framework preset and add your Environment Variables.
5. Vercel will now auto-deploy on every push.

---

## Part 3: Tauri Desktop & Mobile Apps (v2)

Tauri v2 translates your web apps directly into native apps for macOS, Windows, Linux, iOS, and Android.

### 3.1 Install Platform-Specific Prerequisites

You need different toolchains depending on which platform you want to build for.

#### For iOS (Requires a Mac):

1. Install Xcode from the Mac App Store
2. Add Rust iOS targets:
   ```bash
   rustup target add aarch64-apple-ios x86_64-apple-ios aarch64-apple-ios-sim
   ```

#### For Android (Windows, Mac, Linux):

1. Install Android Studio
2. Open SDK Manager in Android Studio, install the latest Android SDK Platform and Android SDK Build-Tools.
3. Install NDK (Side by side) via SDK tools.
4. Set your environment variables (`ANDROID_HOME`, `NDK_HOME`).
5. Add Rust Android targets:
   ```bash
   rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android
   ```

#### For macOS (Desktop):

```bash
xcode-select --install
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

#### For Linux (Desktop):

```bash
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file libssl-dev libayatana-appindicator3-dev librsvg2-dev
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

#### For Windows (Desktop):
Install the C++ build tools if you don't already have them, and WebView2 is pre-installed on modern Windows.

### 3.2 Initialize Tauri for an App

For whichever app you want to package (e.g., the Staff or Student app), navigate to its folder:

```bash
cd apps/student-parent-app
npm install @tauri-apps/cli @tauri-apps/api
npx tauri init
```

Answer the prompts:

- **App name**: AcademicX
- **Window title**: AcademicX Student
- **Web assets directory**: `../dist`
- **Dev server URL**: `http://localhost:5173`
- **Dev command**: `npm run dev`
- **Build command**: `npm run build`

Update `src-tauri/tauri.conf.json` and ensure the bundle identifier is unique (e.g., `com.academicx.student`).

### 3.3 Building Desktop Apps (Windows, Mac, Linux)

To run the app locally on your desktop development machine:

```bash
npx tauri dev
```

To build final desktop installer packages (dmg, deb, appimage, exe, msi):

```bash
npx tauri build
```

- **Mac Output**: `src-tauri/target/release/bundle/dmg/AcademicX_x.x.x_x64.dmg`
- **Linux Output**: `src-tauri/target/release/bundle/deb/academicx_x.x.x_amd64.deb`
- **Windows Output**: `src-tauri/target/release/bundle/nsis/AcademicX_x.x.x_x64-setup.exe`

### 3.4 Building Mobile Apps (iOS & Android)

Tauri v2 requires you to initialize the specific mobile targets first.

#### Initialize Mobile Environments

```bash
npx tauri android init
npx tauri ios init
```

This generates the native `gen/android` and `gen/apple` Xcode/Gradle project folders inside `src-tauri`.

#### Develop & See on Mobile Simulator

To run the app on a connected phone or simulator:

```bash
# For iOS Simulator (Mac only)
npx tauri ios dev

# For Android Emulator or connected physical device
npx tauri android dev
```

#### Build Final Mobile Packages

To build the `.apk`, `.aab`, or `.ipa` files for app store distribution:

**Android:**

```bash
npx tauri android build
```

*(Outputs `.apk` and `.aab` Android App Bundle to `src-tauri/gen/android/app/build/outputs/`)*

**iOS:**

```bash
npx tauri ios build
```

*(Outputs Xcode archive and `.ipa` package for App Store Connect)*

> **CAUTION:** To submit to the Apple App Store, you must have an active Apple Developer portal account, configure your provisioning profiles in Xcode by opening `src-tauri/gen/apple`, and handle signing. Same for Android Play Store keys.

### 3.5 Auto-Updates (Desktop Only)

Tauri natively handles auto-updates for desktop targets. You can turn this on in `tauri.conf.json`:

```json
{
    "plugins": {
        "updater": {
            "active": true,
            "endpoints": ["https://api.academicx.com/updates/{{target}}/{{current_version}}"],
            "pubkey": "YOUR_PUBLIC_KEY"
        }
    }
}
```

You build the signatures using `npx tauri signer generate -w ~/.tauri/academicx.key`. Mobile app updates are naturally handled through the respective Google Play / Apple App Stores rather than Tauri’s internal updater.