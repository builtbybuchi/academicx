/**
 * Shared installer output paths for build and upload scripts.
 *
 * Layout under installers/<platform>/:
 *   academicx-admin/          — universal admin fallback
 *   academicx-staff/          — universal staff fallback
 *   academicx-student-portal/ — universal student/parent fallback
 *   <school-code>/            — per-school student app (sanitized lowercase)
 */

export function sanitizeSegment(input) {
  return String(input || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export const ACADEMICX_LOGO_URL =
  'https://res.cloudinary.com/dlvffw5wt/image/upload/v1773427661/square-image_butlfh.jpg';

export const ACADEMICX_INSTALLER_FOLDERS = [
  'academicx-admin',
  'academicx-staff',
  'academicx-student-portal',
];

export function isAcademicxCode(schoolCode) {
  return String(schoolCode || '').trim().toUpperCase() === 'ACADEMICX';
}

/**
 * Folder name under installers/<platform>/ for a build artifact.
 */
export function getInstallerOutputFolder(schoolCode, appIdSuffix = 'student') {
  if (isAcademicxCode(schoolCode)) {
    const suffix = sanitizeSegment(appIdSuffix) || 'student';
    if (suffix === 'admin') return 'academicx-admin';
    if (suffix === 'staff') return 'academicx-staff';
    return 'academicx-student-portal';
  }

  return sanitizeSegment(schoolCode);
}

export function getInstallerFoldersForUpload(schoolCode) {
  if (isAcademicxCode(schoolCode)) {
    return [...ACADEMICX_INSTALLER_FOLDERS];
  }

  return [getInstallerOutputFolder(schoolCode, 'student')];
}

/**
 * Canonical Android APK filename inside the output folder.
 */
export function getAndroidApkFilename(schoolCode, appIdSuffix = 'student') {
  return `${getInstallerOutputFolder(schoolCode, appIdSuffix)}.apk`;
}
