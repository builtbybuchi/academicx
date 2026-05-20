#!/usr/bin/env node

/**
 * R2 Upload & Appwrite Integration Script
 * 
 * Uploads built installer artifacts to Cloudflare R2 and saves download URLs to Appwrite school document.
 * 
 * Usage:
 *   node scripts/upload-to-r2.mjs --all-schools --installers-path ./installers --environment stg
 *   node scripts/upload-to-r2.mjs --school-code ACADEMICX --installers-path ./installers
 *   node scripts/upload-to-r2.mjs --school-code SHMCE --installers-path ./installers
 * 
 * Environment variables required:
 *   - R2_ACCOUNT_ID: Cloudflare R2 Account ID
 *   - R2_ACCESS_KEY_ID: Cloudflare R2 Access Key ID
 *   - R2_ACCESS_KEY_SECRET: Cloudflare R2 Secret Access Key
 *   - R2_BUCKET_NAME: R2 bucket name (e.g., academicx-apps)
 *   - APPWRITE_ENDPOINT: Appwrite API endpoint
 *   - APPWRITE_PROJECT_ID: Appwrite project ID
 *   - APPWRITE_API_KEY: Appwrite API key
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { S3Client, PutObjectCommand, HeadBucketCommand, CreateBucketCommand } from '@aws-sdk/client-s3';
import { Client, Databases, Query, ID, Permission, Role } from 'node-appwrite';
import {
  ACADEMICX_INSTALLER_FOLDERS,
  getInstallerFoldersForUpload,
  sanitizeSegment,
} from './build-paths.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ── Config ────────────────────────────────────────────────

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || process.env.CF_ACCOUNT_ID || '';
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || '';
const R2_ACCESS_KEY_SECRET = process.env.R2_ACCESS_KEY_SECRET || process.env.R2_SECRET_ACCESS_KEY || '';
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || process.env.R2_BUCKET || process.env.CF_R2_BUCKET || process.env.CF_BUCKET || '';
const R2_REGION = 'wnam'; // Cloudflare's default region

const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || '';
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID || '';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || '';

const DATABASE_ID = 'academicx_db';
const SCHOOLS_COLLECTION_ID = 'schools';
const APPS_COLLECTION_ID = 'apps';

// ── Parse Arguments ───────────────────────────────────────

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;

    const [key, value] = token.slice(2).split('=');
    if (value !== undefined) {
      args[key] = value;
      continue;
    }

    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      args[key] = next;
      i += 1;
    } else {
      args[key] = 'true';
    }
  }
  return args;
}

// ── Validation ────────────────────────────────────────────

function validateEnv() {
  const missing = [];
  if (!R2_ACCOUNT_ID) missing.push('R2_ACCOUNT_ID');
  if (!R2_ACCESS_KEY_ID) missing.push('R2_ACCESS_KEY_ID');
  if (!R2_ACCESS_KEY_SECRET) missing.push('R2_ACCESS_KEY_SECRET');
  if (!APPWRITE_ENDPOINT) missing.push('APPWRITE_ENDPOINT');
  if (!APPWRITE_PROJECT_ID) missing.push('APPWRITE_PROJECT_ID');
  if (!APPWRITE_API_KEY) missing.push('APPWRITE_API_KEY');

  if (missing.length > 0) {
    console.error(`❌ Missing environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
}

// ── R2 Client ─────────────────────────────────────────────

function createS3Client() {
  const r2Endpoint = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  return new S3Client({
    region: R2_REGION,
    endpoint: r2Endpoint,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_ACCESS_KEY_SECRET,
    },
  });
}

async function checkBucketExists(s3Client, bucketName) {
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
    return true;
  } catch (err) {
    // AWS SDK for R2 may return different shapes; surface useful details
    const status = err?.$metadata?.httpStatusCode || err?.statusCode || err?.status || 'unknown';
    const name = err?.name || err?.code || 'Error';
    console.error(`
❗ R2 bucket check failed: ${bucketName}
  - error: ${name}
  - http status: ${status}
`);
    return false;
  }
}

function normalizeEnvironment(environment) {
  const env = String(environment || '').trim().toLowerCase();
  if (['stg', 'stage', 'staging'].includes(env)) return 'staging';
  if (['prd', 'prod', 'production'].includes(env)) return 'production';
  return 'production';
}

function resolveBucketName(args) {
  const explicit = String(args['bucket-name'] || '').trim();
  if (explicit) return explicit;

  if (R2_BUCKET_NAME) return R2_BUCKET_NAME;

  const normalizedEnv = normalizeEnvironment(
    args.environment || process.env.UPLOAD_ENV || process.env.DEPLOY_ENV || process.env.NODE_ENV,
  );
  const envLabel = normalizedEnv === 'staging' ? 'staging' : 'production';
  const runId = process.env.GITHUB_RUN_ID || String(Date.now());

  // One bucket per CI run (or local invocation) so every build is retained until manually deleted.
  return `academicx-apps-${envLabel}-${runId}`;
}

async function ensureBucketExists(s3Client, bucketName, autoCreate) {
  const exists = await checkBucketExists(s3Client, bucketName);
  if (exists) return true;

  if (!autoCreate) return false;

  console.log(`🪣 Creating missing R2 bucket: ${bucketName}`);
  try {
    await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
    console.log(`✅ Created R2 bucket: ${bucketName}`);
    return true;
  } catch (error) {
    const status = error?.$metadata?.httpStatusCode || error?.statusCode || error?.status || 'unknown';
    const name = error?.name || error?.code || 'Error';
    console.error(`❌ Failed to create R2 bucket: ${bucketName}`);
    console.error(`  - error: ${name}`);
    console.error(`  - http status: ${status}`);
    return false;
  }
}

// ── File Operations ───────────────────────────────────────

function fileExists(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function getTargetAppFolders(schoolCode) {
  return getInstallerFoldersForUpload(schoolCode);
}

function collectInstallers(installersPath, schoolCode) {
  const installers = {};
  const allowedFolders = new Set(getTargetAppFolders(schoolCode));
  
  if (!fileExists(installersPath)) {
    console.warn(`⚠️  Installers path does not exist: ${installersPath}`);
    return installers;
  }

  const platforms = fs.readdirSync(installersPath);
  
  for (const platform of platforms) {
    const platformPath = path.join(installersPath, platform);
    const stat = fs.statSync(platformPath);
    
    if (!stat.isDirectory()) continue;

    const appFolders = fs.readdirSync(platformPath);
    
    for (const appFolder of appFolders) {
      const appPath = path.join(platformPath, appFolder);
      const appStat = fs.statSync(appPath);
      
      if (!appStat.isDirectory() || !allowedFolders.has(appFolder)) continue;

      // Only upload canonical installer files: executables, msis, dmgs, debs, appimages, apks, zips, tar.gz
      const canonicalMatchers = [
        '.exe', '.msi', '.dmg', '.deb', '.appimage', '.apk', '.zip', '.tar.gz', '.appimage'
      ];

      function isCanonicalFile(p) {
        const lower = p.toLowerCase();
        if (lower.endsWith('.tar.gz')) return true;
        return canonicalMatchers.some((ext) => lower.endsWith(ext));
      }

      const stack = [{ abs: appPath, rel: `${platform}/${appFolder}` }];
      while (stack.length > 0) {
        const current = stack.pop();
        const entries = fs.readdirSync(current.abs);

        for (const entry of entries) {
          const absPath = path.join(current.abs, entry);
          const relPath = `${current.rel}/${entry}`;
          const entryStat = fs.statSync(absPath);

          if (entryStat.isDirectory()) {
            stack.push({ abs: absPath, rel: relPath });
            continue;
          }

          if (entryStat.isFile()) {
            if (isCanonicalFile(absPath)) {
              installers[relPath] = absPath;
            }
          }
        }
      }
    }
  }

  return installers;
}

// ── R2 Upload ─────────────────────────────────────────────

async function uploadToR2(s3Client, bucketName, schoolCode, installers, dryRun = false) {
  const uploadedFiles = [];

  console.log(`\n📤 Uploading ${Object.keys(installers).length} installer files to R2...`);

  for (const [relativePath, filePath] of Object.entries(installers)) {
    try {
      const fileContent = fs.readFileSync(filePath);
      const fileSize = fileContent.length;
      const r2Key = `${schoolCode}/${relativePath}`;

      const r2Url = `https://${bucketName}.${R2_ACCOUNT_ID}.r2.dev/${r2Key}`;
      if (!dryRun) {
        await s3Client.send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: r2Key,
            Body: fileContent,
            ContentType: getContentType(filePath),
          })
        );
      } else {
        console.log(`  (dry) would upload ${relativePath} -> ${r2Url}`);
      }

      uploadedFiles.push({
        platform: relativePath.split('/')[0],
        path: relativePath,
        url: r2Url,
        size: fileSize,
      });

      console.log(`  ✓ ${relativePath} (${(fileSize / (1024 * 1024)).toFixed(2)} MB)`);
    } catch (error) {
      console.error(`  ✗ Failed to upload ${relativePath}:`, error.message);
      throw error;
    }
  }

  return uploadedFiles;
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.exe': 'application/x-msdownload',
    '.msi': 'application/x-msi',
    '.deb': 'application/x-deb',
    '.appimage': 'application/x-appimage',
    '.dmg': 'application/x-dmg',
    '.apk': 'application/vnd.android.package-archive',
    '.zip': 'application/zip',
    '.tar': 'application/x-tar',
    '.gz': 'application/gzip',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

// ── Appwrite Integration ──────────────────────────────────

async function initAppwrite() {
  const client = new Client();
  client.setEndpoint(APPWRITE_ENDPOINT);
  client.setProject(APPWRITE_PROJECT_ID);
  client.setKey(APPWRITE_API_KEY);

  return new Databases(client);
}

function parseAppFolderName(appFolder) {
  const folder = String(appFolder || '').toLowerCase().replace(/^academix/, 'academicx');

  if (folder === 'academicx-admin') {
    return { role: 'admin', code: 'ACADEMICX', isFallback: true };
  }
  if (folder === 'academicx-staff') {
    return { role: 'staff', code: 'ACADEMICX', isFallback: true };
  }
  if (folder === 'academicx-student-portal') {
    return { role: 'student', code: 'ACADEMICX', isFallback: true };
  }

  // Per-school student apps live in a folder named after the school code.
  const code = folder.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return { role: 'student', code, isFallback: false };
}

async function upsertAppDocument(databases, app, dryRun = false) {
  // app: { code, role, platform, filename, url, size, version, isFallback }
  try {
    if (dryRun) {
      console.log(`  (dry) would upsert app document: ${app.code}/${app.role}/${app.platform}/${app.filename}`);
      return null;
    }
    const query = [
      Query.equal('role', app.role),
      Query.equal('platform', app.platform),
      Query.equal('code', app.code),
      Query.equal('filename', app.filename),
      Query.limit(1),
    ];

    const res = await databases.listDocuments(DATABASE_ID, APPS_COLLECTION_ID, query);
    const existing = (res.documents || [])[0];

    const payload = {
      code: app.code,
      role: app.role,
      platform: app.platform,
      filename: app.filename,
      url: app.url,
      size: app.size || 0,
      version: app.version || '',
      isFallback: !!app.isFallback,
      createdAt: new Date().toISOString(),
    };

    if (existing) {
      await databases.updateDocument(DATABASE_ID, APPS_COLLECTION_ID, existing.$id, payload);
      return existing.$id;
    }

    const docId = ID.unique();
    const permissions = [Permission.read(Role.any()), Permission.update(Role.users())];
    const created = await databases.createDocument(DATABASE_ID, APPS_COLLECTION_ID, docId, payload, permissions);
    return created.$id;
  } catch (err) {
    console.error('Error upserting app document:', err.message || err);
    throw err;
  }
}

async function findSchoolByCode(databases, schoolCode) {
  try {
    const response = await databases.listDocuments(DATABASE_ID, SCHOOLS_COLLECTION_ID, [
      Query.equal('schoolCode', schoolCode),
      Query.limit(1),
    ]);

    const school = response.documents[0];
    return school || null;
  } catch (error) {
    console.error('Error listing schools:', error.message);
    throw error;
  }
}

async function listActiveSchools(databases) {
  try {
    const response = await databases.listDocuments(DATABASE_ID, SCHOOLS_COLLECTION_ID, [
      Query.equal('status', 'active'),
      Query.limit(1000),
    ]);

    return response.documents.filter((document) => document.status !== 'inactive');
  } catch (error) {
    console.error('Error listing schools:', error.message);
    throw error;
  }
}

async function updateSchoolDownloads(databases, schoolId, uploadedFiles) {
  const platformMap = {
    win32: 'windows',
    darwin: 'macos',
    linux: 'linux',
    android: 'android',
  };

  try {
    const school = await databases.getDocument(DATABASE_ID, SCHOOLS_COLLECTION_ID, schoolId);
    const data = school.data ? JSON.parse(school.data) : {};
    data.downloads = data.downloads || {};

    for (const file of uploadedFiles) {
      const platform = platformMap[file.platform] || file.platform;
      data.downloads[platform] = data.downloads[platform] || [];

      const entry = {
        filename: path.basename(file.path),
        url: file.url,
        size: file.size,
      };

      const existingIndex = data.downloads[platform].findIndex(
        (item) => item.filename === entry.filename || item.url === entry.url,
      );
      if (existingIndex >= 0) {
        data.downloads[platform][existingIndex] = entry;
      } else {
        data.downloads[platform].push(entry);
      }
    }

    await databases.updateDocument(DATABASE_ID, SCHOOLS_COLLECTION_ID, schoolId, {
      data: JSON.stringify(data),
    });

    console.log(`\n✅ Updated school document (${Object.keys(data.downloads).length} platform(s))`);
    return data.downloads;
  } catch (error) {
    console.error('Error updating school downloads:', error.message);
    throw error;
  }
}

async function updateAllSchoolsWithFallbacks(databases, fallbackFiles) {
  if (!Array.isArray(fallbackFiles) || fallbackFiles.length === 0) return;
  const platformMap = {
    'win32': 'windows',
    'darwin': 'macos',
    'linux': 'linux',
    'android': 'android',
  };

  const schools = await listActiveSchools(databases);
  for (const school of schools) {
    try {
      const schoolDoc = await databases.getDocument(DATABASE_ID, SCHOOLS_COLLECTION_ID, school.$id);
      const data = schoolDoc.data ? JSON.parse(schoolDoc.data) : {};
      data.downloads = data.downloads || {};

      for (const f of fallbackFiles) {
        const platform = platformMap[f.platform] || f.platform;
        data.downloads[platform] = data.downloads[platform] || [];

        // avoid duplicate filenames/urls
        const exists = data.downloads[platform].some(d => d.filename === f.filename || d.url === f.url);
        if (!exists) {
          data.downloads[platform].push({ filename: f.filename, url: f.url, size: f.size });
        }
      }

      if (Object.keys(data.downloads).length > 0) {
        await databases.updateDocument(DATABASE_ID, SCHOOLS_COLLECTION_ID, school.$id, { data: JSON.stringify(data) });
      }
    } catch (err) {
      console.warn(`⚠️ Failed to attach fallback apps to ${school.schoolCode}:`, err.message || err);
    }
  }
}

function downloadsFromUploadedFiles(uploadedFiles) {
  const downloads = {};
  const platformMap = {
    win32: 'windows',
    darwin: 'macos',
    linux: 'linux',
    android: 'android',
  };

  for (const file of uploadedFiles) {
    const platform = platformMap[file.platform] || file.platform;
    if (!downloads[platform]) downloads[platform] = [];
    downloads[platform].push({
      filename: path.basename(file.path),
      url: file.url,
      size: file.size,
    });
  }

  return downloads;
}

async function upsertAppRecordsFromUpload(databases, uploadedFiles, dryRun) {
  for (const f of uploadedFiles) {
    try {
      const parts = f.path.split('/');
      const appFolder = parts[1] || '';
      const { role, code, isFallback } = parseAppFolderName(appFolder);
      const platform = parts[0] || 'unknown';
      const filename = path.basename(f.path);

      await upsertAppDocument(
        databases,
        {
          code,
          role,
          platform,
          filename,
          url: f.url,
          size: f.size,
          version: '',
          isFallback,
        },
        dryRun,
      );
    } catch (err) {
      console.warn('⚠️  Failed to write app record for', f.path, err.message || err);
    }
  }
}

async function uploadAcademicxUniversalApps(s3Client, bucketName, installersPath, databases, dryRun) {
  console.log('\n📦 Uploading universal ACADEMICX fallback apps (no school document required)...');
  const installers = collectInstallers(installersPath, 'ACADEMICX');
  const installerCount = Object.keys(installers).length;

  if (installerCount === 0) {
    console.warn(`⚠️  No ACADEMICX installer files found (expected ${ACADEMICX_INSTALLER_FOLDERS.join(', ')})`);
    return [];
  }

  console.log(`✓ Found ${installerCount} ACADEMICX installer file(s)`);
  const uploadedFiles = await uploadToR2(s3Client, bucketName, 'ACADEMICX', installers, dryRun);
  await upsertAppRecordsFromUpload(databases, uploadedFiles, dryRun);

  const fallbackFiles = uploadedFiles
    .map((f) => ({
      platform: f.platform,
      filename: path.basename(f.path),
      url: f.url,
      size: f.size,
    }))
    .filter((f) => !!f.url);

  if (fallbackFiles.length > 0) {
    await updateAllSchoolsWithFallbacks(databases, fallbackFiles);
    console.log('✅ Attached universal ACADEMICX app links to all active schools');
  }

  printSummary('ACADEMICX', downloadsFromUploadedFiles(uploadedFiles));
  return uploadedFiles;
}

// ── Summary ───────────────────────────────────────────────

function printSummary(schoolCode, downloads) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 UPLOAD SUMMARY');
  console.log('='.repeat(60));
  console.log(`School Code: ${schoolCode}`);
  console.log(`Platforms: ${Object.keys(downloads).join(', ')}`);
  
  for (const [platform, files] of Object.entries(downloads)) {
    console.log(`\n  ${platform.toUpperCase()}:`);
    for (const file of files) {
      console.log(`    • ${file.filename}`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
}

// ── Main ──────────────────────────────────────────────────

async function main() {
  const args = parseArgs(process.argv);
  const schoolCode = String(args['school-code'] || '').trim();
  const installersPath = String(args['installers-path'] || './installers').trim();
  const allSchools = args['all-schools'] === 'true';
  const dryRun = args['dry-run'] === 'true';
  const autoCreateBucket = args['create-bucket'] !== 'false';
  const bucketName = resolveBucketName(args);
  const targetEnvironment = normalizeEnvironment(args.environment || process.env.UPLOAD_ENV || process.env.DEPLOY_ENV || process.env.NODE_ENV);

  if (!schoolCode && !allSchools) {
    console.error('❌ Missing required argument: --school-code or --all-schools');
    console.log('\nUsage: node scripts/upload-to-r2.mjs --school-code SHMCE --installers-path ./installers\n');
    process.exit(1);
  }

  validateEnv();

  console.log(`\n🚀 Starting R2 upload${allSchools ? ' for all active schools' : ` for school: ${schoolCode}`}`);
  console.log(`🗂️  Target environment: ${targetEnvironment}`);
  console.log(`🪣 Target bucket: ${bucketName}`);
  console.log(`📁 Installers path: ${installersPath}\n`);

  const s3Client = createS3Client();
  // Verify/create the target bucket before attempting uploads
  const r2Endpoint = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  const bucketOk = await ensureBucketExists(s3Client, bucketName, autoCreateBucket);
  if (!bucketOk) {
    console.error(`\n❌ The specified R2 bucket is unavailable: ${bucketName}`);
    console.error(`  - R2_ACCOUNT_ID: ${R2_ACCOUNT_ID ? 'set' : 'MISSING'}\n  - Using endpoint: ${r2Endpoint}\n`);
    console.error('Please verify the bucket name and that the R2 credentials/Account ID can access bucket create/list permissions.');
    console.error('Common env names: R2_BUCKET_NAME, R2_BUCKET, CF_R2_BUCKET, CF_BUCKET');
    process.exit(1);
  }
  const databases = await initAppwrite();

  if (allSchools) {
    await uploadAcademicxUniversalApps(s3Client, bucketName, installersPath, databases, dryRun);

    const schools = (await listActiveSchools(databases)).filter(
      (school) => String(school.schoolCode || '').trim().toUpperCase() !== 'ACADEMICX',
    );

    for (const school of schools) {
      console.log(`\n🔍 Uploading student app for school "${school.schoolCode}"...`);
      const installers = collectInstallers(installersPath, school.schoolCode);
      const installerCount = Object.keys(installers).length;

      if (installerCount === 0) {
        console.warn(`⚠️  No installer files found for ${school.schoolCode}`);
        continue;
      }

      console.log(`✓ Found ${installerCount} installer file(s)`);
      const uploadedFiles = await uploadToR2(s3Client, bucketName, school.schoolCode, installers, dryRun);
      const downloads = await updateSchoolDownloads(databases, school.$id, uploadedFiles);
      await upsertAppRecordsFromUpload(databases, uploadedFiles, dryRun);
      printSummary(school.schoolCode, downloads);
    }
  } else if (String(schoolCode || '').trim().toUpperCase() === 'ACADEMICX') {
    await uploadAcademicxUniversalApps(s3Client, bucketName, installersPath, databases, dryRun);
  } else {
    const installers = collectInstallers(installersPath, schoolCode);
    const installerCount = Object.keys(installers).length;

    if (installerCount === 0) {
      console.warn(`⚠️  No installer files found in ${installersPath}`);
      console.log('Ensure builds completed before running this script.');
      process.exit(1);
    }

    console.log(`✓ Found ${installerCount} installer file(s)`);
    console.log(`\n🔍 Looking up school "${schoolCode}" in Appwrite...`);
    const school = await findSchoolByCode(databases, schoolCode);

    if (!school) {
      console.error(`❌ School not found in Appwrite: ${schoolCode}`);
      process.exit(1);
    }

    console.log(`✓ Found school: ${school.name}`);

    const uploadedFiles = await uploadToR2(s3Client, bucketName, schoolCode, installers, dryRun);
    const downloads = await updateSchoolDownloads(databases, school.$id, uploadedFiles);
    await upsertAppRecordsFromUpload(databases, uploadedFiles, dryRun);
    printSummary(schoolCode, downloads);
  }

  console.log('\n✅ All done!\n');
}

try {
  await main();
} catch (error) {
  console.error('\n❌ Error:', error.message || error);
  process.exit(1);
}
