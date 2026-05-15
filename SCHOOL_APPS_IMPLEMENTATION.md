# School-Branded Downloadable Apps Implementation Guide

## Overview

This implementation enables per-school branded downloadable applications with centralized management through Appwrite. Users can download school-specific student apps, while staff and admins download the same branded academicX role-based apps.

## Architecture

### Components

1. **Build System** (`scripts/build-tauri-apps.mjs`)
   - Conditional app building based on school code
   - For `ACADEMIX`: Builds admin, staff, and student portal apps
   - For other school codes: Builds only student app with school branding

2. **Orchestrator** (`scripts/build-all-schools.mjs`)
   - Fetches all active schools from Appwrite
   - Iterates through each school for per-school student app builds
   - Builds role apps once and reuses for all schools
   - Optionally uploads artifacts to R2

3. **R2 Upload & Appwrite Integration** (`scripts/upload-to-r2.mjs`)
   - Uploads built artifacts to Cloudflare R2
   - Updates Appwrite school document with download URLs
   - Stores downloads in school's `data` field as JSON

4. **GitHub Actions Workflow** (`.github/workflows/build-apps.yml`)
   - Builds apps for multiple platforms (Windows, Linux, macOS, Android)
   - Automatically uploads to R2 and updates Appwrite
   - Supports manual dispatch with optional per-school builds

5. **Landing Page** (`apps/landing-page/src/pages/DownloadsPage.jsx`)
   - Preloads schools from Appwrite in background on page load
   - Student/Parent role: Select school, download per-school app
   - Staff/Admin roles: Download role-based apps (same for all)
   - iOS fallback: Shows web link for unsupported platform

6. **School Website Components** (`apps/school-website/src/components/AppDownloadLinks.tsx`)
   - TypeScript component for staff/student download pages
   - Fetches download URLs from Appwrite
   - Displays platform-specific downloads (Windows, macOS, Linux, Android)
   - iOS fallback popup

## Workflow

### 1. Building Apps

#### Option A: Build Specific School
```bash
# Build student app for school code SHMCE
node scripts/build-tauri-apps.mjs --school-code SHMCE

# Build role apps (Admin, Staff, Student Portal)
node scripts/build-tauri-apps.mjs --school-code ACADEMIX
```

#### Option B: Build All Schools
```bash
# Fetch all active schools from Appwrite and build per-school apps
npm run build:all-schools

# Build all schools and upload to R2
npm run build:all-schools:upload-r2
```

#### Option C: GitHub Actions
- Manually trigger the workflow from **Actions** tab
- Select platforms to build (Windows, Linux, macOS, Android)
- Enable "Upload to R2" option
- Specify school code (defaults to ACADEMIX)
- Artifacts are uploaded and Appwrite is updated automatically

### 2. App Naming Convention

#### Role Apps (Built from ACADEMIX schoolCode)
- Admin: `academiX - Admin`
- Staff: `academiX - Staff`
- Student Portal: `academiX - Student Portal`

#### Per-School Apps
- Student app: `{SCHOOL_CODE}` (e.g., `SHMCE`)
- Downloaded by students/parents from landing page or school website
- Branded with school logo if provided

### 3. Download URLs Storage

URLs are stored in Appwrite school document under the `data` field:

```json
{
  "downloads": {
    "windows": [
      {
        "filename": "shmce-student_1.0.0_x64-setup.exe",
        "url": "https://academicx-apps.xxx.r2.dev/SHMCE/win32/...",
        "size": 125432000
      }
    ],
    "macos": [...],
    "linux": [...],
    "android": [...]
  }
}
```

### 4. Platform Mapping

| Landing Page | Appwrite Key | Platforms |
|---|---|---|
| Windows | `windows` | .exe, .msi |
| Mac | `macos` | .dmg |
| Linux | `linux` | .deb, .appimage |
| Android | `android` | .apk |
| iOS | (disabled) | Web fallback |

## Environment Variables

### GitHub Secrets (Required for R2 Upload)
```
R2_ACCOUNT_ID              # Cloudflare R2 Account ID
R2_ACCESS_KEY_ID           # R2 Access Key
R2_ACCESS_KEY_SECRET       # R2 Secret Key
R2_BUCKET_NAME             # R2 Bucket (default: academicx-apps)
APPWRITE_ENDPOINT          # Appwrite API endpoint
APPWRITE_PROJECT_ID        # Appwrite project ID
APPWRITE_API_KEY           # Appwrite API key
```

### Frontend Environment Variables (Vite)
```
VITE_APPWRITE_ENDPOINT     # Appwrite endpoint
VITE_APPWRITE_PROJECT_ID   # Appwrite project ID
```

## Integration Steps

### 1. Landing Page

The landing page automatically preloads schools:
- On page load, fetches all active schools from Appwrite
- Displays school list for student/parent role selection
- Shows actual download URLs from Appwrite
- iOS users see fallback to web version

### 2. School Website

Add the download component to staff/student pages:

```tsx
import { AppDownloadLinks, IosUnavailableBanner } from '@/components/AppDownloadLinks';
import { useSchoolContext } from '@/context/SchoolContext';

export function DownloadPage() {
  const { school, schoolId } = useSchoolContext();

  return (
    <div>
      <IosUnavailableBanner />
      <AppDownloadLinks 
        schoolCode={school.schoolCode} 
        schoolId={schoolId} 
      />
    </div>
  );
}
```

### 3. R2 Upload Bucket Structure

```
academicx-apps/
├── SHMCE/
│   ├── win32/
│   │   ├── shmce-student_1.0.0_x64-setup.exe
│   │   └── shmce-student_1.0.0_x64-setup.msi
│   ├── darwin/
│   │   └── shmce-student_1.0.0_aarch64.dmg
│   ├── linux/
│   │   ├── shmce-student_1.0.0_amd64.deb
│   │   └── shmce-student_1.0.0_amd64.AppImage
│   └── android/
│       └── shmce-student_1.0.0_universal.apk
├── ACADEMIX/
│   ├── win32/
│   │   ├── academix-admin_...
│   │   ├── academix-staff_...
│   │   └── academix-student-portal_...
│   └── ... (other platforms)
```

## Testing

### 1. Build Apps Locally
```bash
# Windows/macOS/Linux - builds will be platform-specific
npm run tauri:build:apps:default

# For specific school
npm run tauri:build:apps -- --school-code SHMCE
```

### 2. Test R2 Upload
```bash
# After building, test upload to R2
npm run upload:r2 -- --school-code SHMCE
```

### 3. Test Landing Page
- Navigate to downloads page
- Verify schools load in background
- Test school selection
- Verify download URLs are correct from Appwrite
- Test iOS fallback (should show web version option)

### 4. Test School Website
- Add download component to staff/student pages
- Verify downloads load from Appwrite
- Test downloads for different platforms
- Test iOS banner display

## Troubleshooting

### Schools Not Loading on Landing Page
- Check `VITE_APPWRITE_ENDPOINT` and `VITE_APPWRITE_PROJECT_ID`
- Verify Appwrite CORS settings allow your frontend origin
- Check browser console for network errors
- Verify schools exist in Appwrite with `status: "active"`

### R2 Upload Fails
- Verify R2 credentials in GitHub secrets
- Check bucket name is correct
- Ensure R2_ACCOUNT_ID doesn't include domain
- Verify Appwrite API key has write permissions
- Check that school exists in Appwrite

### Downloads Not Available
- Verify build completed successfully
- Check R2 upload logs in GitHub Actions
- Verify school document has `downloads` field populated
- Check R2 bucket contains files
- Verify download URLs are publicly accessible

### Build Fails for Specific School
- Ensure school code matches Appwrite record
- Check school has required fields (name, schoolCode, status)
- Verify logo URL is accessible (if provided)
- Try building ACADEMICX role apps first

## Security Considerations

1. **R2 Bucket**: Set to public read (apps should be downloadable)
2. **Appwrite**: Restrict API key to database read/write on schools collection
3. **GitHub Secrets**: Never log or expose credentials
4. **URL Signing**: Consider implementing time-limited R2 signed URLs for sensitive builds
5. **API Limits**: Monitor Appwrite API usage with large school counts

## Future Enhancements

1. **Automated Builds on School Creation**
   - Webhook trigger on new school creation
   - Auto-build student app variant
   - Update downloads automatically

2. **Version Management**
   - Track app versions per school
   - Rollback to previous builds
   - Compare versions between schools

3. **Download Analytics**
   - Track which schools' apps are most downloaded
   - Monitor platform preferences
   - Identify obsolete builds for cleanup

4. **iOS Support**
   - Complete TestFlight integration when Apple account ready
   - Enterprise profile distribution
   - Automated signing and provisioning

5. **Update Notifications**
   - Built-in update checker in apps
   - Prompt users when new versions available
   - Auto-download in background

## File Structure

```
academicx/
├── scripts/
│   ├── build-tauri-apps.mjs          # Core build script (enhanced)
│   ├── build-all-schools.mjs         # NEW: Orchestrator for all schools
│   └── upload-to-r2.mjs              # NEW: R2 upload & Appwrite integration
├── .github/workflows/
│   └── build-apps.yml                # Enhanced with R2 upload step
├── apps/
│   ├── landing-page/src/pages/
│   │   └── DownloadsPage.jsx         # Enhanced with Appwrite preload
│   └── school-website/src/components/
│       ├── AppDownloadLinks.tsx       # NEW: TypeScript download component
│       └── AppDownloadLinks.css       # NEW: Download component styles
└── package.json                       # Updated with AWS SDK + npm scripts
```

## Support

For issues or questions:
1. Check GitHub Actions logs for build errors
2. Verify Appwrite database integrity
3. Review R2 bucket configuration
4. Check download component integration
5. Test with browser dev tools network tab
