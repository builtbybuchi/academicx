# School-Branded Apps - Quick Start Guide

## What's Been Implemented

### ✅ Complete Build Pipeline
- **Smart build script** (`scripts/build-tauri-apps.mjs`) - Conditionally builds role apps or per-school student apps
- **School orchestrator** (`scripts/build-all-schools.mjs`) - Fetches schools from Appwrite and builds variants
- **R2 uploader** (`scripts/upload-to-r2.mjs`) - Uploads to Cloudflare R2 and updates Appwrite with download URLs
- **Enhanced GitHub Actions** - Full CI/CD with R2 integration and Appwrite updates

### ✅ Landing Page Download Experience
- **Dynamic school preload** - Fetches all schools in background on page load
- **Role-based downloads** - Students get per-school apps, staff/admins get role-based apps
- **iOS fallback** - Automatically shows web version link for iOS users
- **Status messaging** - Clear feedback during loading and selection

### ✅ School Website Integration
- **TypeScript download component** (`AppDownloadLinks.tsx`) - Ready to integrate
- **Platform-specific downloads** - Windows, macOS, Linux, Android
- **iOS unavailable banner** - Explains fallback to web version
- **Styled and responsive** - CSS included with mobile support

### ✅ Appwrite Integration
- **Stores download URLs** in school's `data` field as JSON
- **Organizes by platform** - windows, macos, linux, android
- **Includes file metadata** - filename, URL, file size

## Next Steps

### Step 1: Install Dependencies
```bash
npm install
```
This installs the AWS SDK for R2 uploads (added to package.json).

### Step 2: Configure GitHub Secrets (For R2 Uploads)
Add these to your GitHub repository settings:

```
R2_ACCOUNT_ID              # Your Cloudflare R2 Account ID
R2_ACCESS_KEY_ID           # R2 Access Key ID
R2_ACCESS_KEY_SECRET       # R2 Secret Access Key  
R2_BUCKET_NAME             # Your R2 bucket name (e.g., academicx-apps)
APPWRITE_ENDPOINT          # Your Appwrite endpoint
APPWRITE_PROJECT_ID        # Your Appwrite project ID
APPWRITE_API_KEY           # Your Appwrite API key
```

### Step 3: Build Apps Locally (Optional Testing)
```bash
# Build role apps (Admin, Staff, Student Portal)
npm run tauri:build:apps:default

# Build specific school student app
npm run tauri:build:apps -- --school-code SHMCE
```

### Step 4: GitHub Actions - First Build
1. Go to **Actions** tab in GitHub
2. Click **Build Desktop and Mobile Apps**
3. Click **Run workflow**
4. Configure:
   - ✅ Build Windows/Linux/macOS/Android (default: all)
   - ✅ Upload to R2 (default: enabled)
   - School code: `ACADEMIX` (for role apps) or `SHMCE` (for per-school)
5. Run and monitor build logs

### Step 5: Integrate School Website Downloads
Add to your staff/student pages:

```tsx
import { AppDownloadLinks, IosUnavailableBanner } from '@/components/AppDownloadLinks';
import { useSchoolContext } from '@/context/SchoolContext'; // or however you get school data

export function StaffDownloadPage() {
  const { school, schoolId } = useSchoolContext();

  return (
    <div>
      <h1>Download Staff App</h1>
      <IosUnavailableBanner />
      <AppDownloadLinks 
        schoolCode={school.schoolCode} 
        schoolId={schoolId} 
      />
    </div>
  );
}
```

### Step 6: Verify Frontend Environment Variables
Ensure your `.env` files have:
```
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
```

## Quick Reference: App Naming

| School Code | Built Apps | Named As |
|---|---|---|
| `ACADEMIX` | Admin, Staff, Student Portal | `academiX - Admin`, `academiX - Staff`, `academiX - Student Portal` |
| `SHMCE` | Student App Only | `SHMCE` |
| `EVERGN` | Student App Only | `EVERGN` |

## Quick Reference: NPM Scripts

```bash
# Build role apps locally
npm run tauri:build:apps:default

# Build specific school locally  
npm run tauri:build:apps -- --school-code SHMCE

# Fetch all schools and build
npm run build:all-schools

# Build all schools AND upload to R2
npm run build:all-schools:upload-r2

# Upload existing builds to R2
npm run upload:r2 -- --school-code SHMCE
```

## Download URL Format

After a successful build and R2 upload, URLs are stored as:
```
https://academicx-apps.your-account.r2.dev/{schoolCode}/{platform}/{installer-file}
```

Example:
```
https://academicx-apps.xxx.r2.dev/SHMCE/win32/shmce-student_1.0.0_x64-setup.exe
https://academicx-apps.xxx.r2.dev/ACADEMIX/darwin/academix-staff_1.0.0_aarch64.dmg
```

## Testing Checklist

- [ ] Run `npm install` successfully
- [ ] Set GitHub secrets for R2 and Appwrite
- [ ] Trigger one workflow build from GitHub Actions
- [ ] Verify builds complete (check artifact downloads)
- [ ] Check R2 bucket has files uploaded
- [ ] Check Appwrite school document has `downloads` field
- [ ] Landing page loads and shows schools
- [ ] School website download component displays links
- [ ] Test a download link (should work)
- [ ] iOS fallback shows web version option

## Common Tasks

### Build New Version for All Schools
```bash
npm run build:all-schools:upload-r2
```
(Watches GitHub Actions logs to see progress)

### Build Single School Variant
```bash
npm run tauri:build:apps -- --school-code SHMCE
npm run upload:r2 -- --school-code SHMCE
```

### Rebuild Without Rebuilding Previous
The build scripts skip already-built apps. To force rebuild:
```bash
rm -rf installers/  # Delete all built artifacts
npm run build:all-schools:upload-r2
```

### Update School Website Pages
1. Add `AppDownloadLinks` component to staff/student pages
2. Pass `schoolCode` and `schoolId` props
3. Component fetches and displays downloads automatically

## Troubleshooting

**Landing page shows "Loading schools..." indefinitely**
- Check VITE_APPWRITE_ENDPOINT is set
- Verify Appwrite project is accessible
- Check browser console for errors

**R2 upload fails in GitHub Actions**
- Verify all R2 secrets are set correctly
- Check R2 bucket exists and is accessible
- Review action logs for specific error

**School website downloads don't show**
- Verify school document exists in Appwrite
- Check school has `downloads` populated
- Ensure schoolCode and schoolId are passed to component

**Apps not listed on landing page**
- Verify schools exist with `status: "active"`
- Check they're visible in Appwrite console
- Clear browser cache and reload

## Documentation Files

- [`SCHOOL_APPS_IMPLEMENTATION.md`](SCHOOL_APPS_IMPLEMENTATION.md) - Complete technical documentation
- [`package.json`](package.json) - NPM scripts and dependencies
- [`scripts/build-tauri-apps.mjs`](scripts/build-tauri-apps.mjs) - Core build logic
- [`scripts/build-all-schools.mjs`](scripts/build-all-schools.mjs) - School orchestration
- [`scripts/upload-to-r2.mjs`](scripts/upload-to-r2.mjs) - R2 upload & Appwrite integration
- [`.github/workflows/build-apps.yml`](.github/workflows/build-apps.yml) - CI/CD pipeline

## Support & Help

Need help with specific features:
1. **Build errors**: Check `scripts/build-tauri-apps.mjs` usage
2. **R2 issues**: Review `scripts/upload-to-r2.mjs` error messages
3. **Landing page**: Check `apps/landing-page/src/pages/DownloadsPage.jsx`
4. **School website**: Review `apps/school-website/src/components/AppDownloadLinks.tsx`
5. **General**: See `SCHOOL_APPS_IMPLEMENTATION.md`
