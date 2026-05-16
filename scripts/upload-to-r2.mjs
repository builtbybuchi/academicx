#!/usr/bin/env node

/**
 * R2 Upload & Appwrite Integration Script
 * 
 * Uploads built installer artifacts to Cloudflare R2 and saves download URLs to Appwrite school document.
 * 
 * Usage:
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
import { S3Client, PutObjectCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import { Client, Databases, Query } from 'node-appwrite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ── Config ────────────────────────────────────────────────

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || process.env.CF_ACCOUNT_ID || '';
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || '';
const R2_ACCESS_KEY_SECRET = process.env.R2_ACCESS_KEY_SECRET || process.env.R2_SECRET_ACCESS_KEY || '';
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || process.env.R2_BUCKET || process.env.CF_R2_BUCKET || process.env.CF_BUCKET || 'academicx-apps';
const R2_REGION = 'wnam'; // Cloudflare's default region

const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || '';
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID || '';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || '';

const DATABASE_ID = 'academicx_db';
const SCHOOLS_COLLECTION_ID = 'schools';

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

// ── File Operations ───────────────────────────────────────

function fileExists(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function sanitizeSegment(input) {
  return String(input || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function getTargetAppFolders(schoolCode) {
  if (String(schoolCode || '').trim().toUpperCase() === 'ACADEMIX') {
    return [
      'academix-admin',
      'academix-staff',
      'academix-student-portal',
      'academix-admin-admin',
      'academix-staff-staff',
      'academix-student-portal-student',
    ];
  }

  return [`${sanitizeSegment(schoolCode)}-student`];
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
            installers[relPath] = absPath;
          }
        }
      }
    }
  }

  return installers;
}

// ── R2 Upload ─────────────────────────────────────────────

async function uploadToR2(s3Client, schoolCode, installers) {
  const uploadedFiles = [];

  console.log(`\n📤 Uploading ${Object.keys(installers).length} installer files to R2...`);

  for (const [relativePath, filePath] of Object.entries(installers)) {
    try {
      const fileContent = fs.readFileSync(filePath);
      const fileSize = fileContent.length;
      const r2Key = `${schoolCode}/${relativePath}`;

      await s3Client.send(
        new PutObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: r2Key,
          Body: fileContent,
          ContentType: getContentType(filePath),
        })
      );

      const r2Url = `https://${R2_BUCKET_NAME}.${R2_ACCOUNT_ID}.r2.dev/${r2Key}`;
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
  // Organize URLs by platform for easier access
  const downloads = {};
  const platformMap = {
    'win32': 'windows',
    'darwin': 'macos',
    'linux': 'linux',
    'android': 'android',
  };

  for (const file of uploadedFiles) {
    const platform = platformMap[file.platform] || file.platform;
    if (!downloads[platform]) {
      downloads[platform] = [];
    }
    downloads[platform].push({
      filename: path.basename(file.path),
      url: file.url,
      size: file.size,
    });
  }

  try {
    const school = await databases.getDocument(DATABASE_ID, SCHOOLS_COLLECTION_ID, schoolId);
    const data = school.data ? JSON.parse(school.data) : {};
    
    // Update downloads in the data field
    data.downloads = downloads;

    await databases.updateDocument(
      DATABASE_ID,
      SCHOOLS_COLLECTION_ID,
      schoolId,
      { data: JSON.stringify(data) }
    );

    console.log(`\n✅ Updated school document with ${Object.keys(downloads).length} platform download links`);
    return downloads;
  } catch (error) {
    console.error('Error updating school downloads:', error.message);
    throw error;
  }
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

  if (!schoolCode && !allSchools) {
    console.error('❌ Missing required argument: --school-code or --all-schools');
    console.log('\nUsage: node scripts/upload-to-r2.mjs --school-code SHMCE --installers-path ./installers\n');
    process.exit(1);
  }

  validateEnv();

  console.log(`\n🚀 Starting R2 upload${allSchools ? ' for all active schools' : ` for school: ${schoolCode}`}`);
  console.log(`📁 Installers path: ${installersPath}\n`);

  const s3Client = createS3Client();
  // Verify the target bucket exists before attempting uploads
  const r2Endpoint = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  const bucketOk = await checkBucketExists(s3Client, R2_BUCKET_NAME);
  if (!bucketOk) {
    console.error(`\n❌ The specified R2 bucket does not exist: ${R2_BUCKET_NAME}`);
    console.error(`  - R2_ACCOUNT_ID: ${R2_ACCOUNT_ID ? 'set' : 'MISSING'}\n  - Using endpoint: ${r2Endpoint}\n`);
    console.error('Please verify the bucket name and that the R2 credentials/Account ID correspond to the account that owns the bucket.');
    console.error('Common env names to check: R2_BUCKET_NAME, R2_BUCKET, CF_R2_BUCKET, CF_BUCKET');
    process.exit(1);
  }
  const databases = await initAppwrite();

  if (allSchools) {
    const schools = await listActiveSchools(databases);
    const roleSchool = await findSchoolByCode(databases, 'ACADEMIX');
    const schoolsToUpload = roleSchool ? [roleSchool, ...schools] : schools;
    const seen = new Set();

    for (const school of schoolsToUpload) {
      const normalizedCode = String(school.schoolCode || '').trim().toUpperCase();
      if (!normalizedCode || seen.has(normalizedCode)) continue;
      seen.add(normalizedCode);

      console.log(`\n🔍 Looking up school "${school.schoolCode}" in Appwrite...`);
      const installers = collectInstallers(installersPath, school.schoolCode);
      const installerCount = Object.keys(installers).length;

      if (installerCount === 0) {
        console.warn(`⚠️  No installer files found for ${school.schoolCode}`);
        continue;
      }

      console.log(`✓ Found ${installerCount} installer files`);
      const uploadedFiles = await uploadToR2(s3Client, school.schoolCode, installers);
      const downloads = await updateSchoolDownloads(databases, school.$id, uploadedFiles);
      printSummary(school.schoolCode, downloads);
    }
  } else {
    // Collect installer files
    const installers = collectInstallers(installersPath, schoolCode);
    const installerCount = Object.keys(installers).length;

    if (installerCount === 0) {
      console.warn(`⚠️  No installer files found in ${installersPath}`);
      console.log('Ensure builds completed before running this script.');
      process.exit(1);
    }

    console.log(`✓ Found ${installerCount} installer files`);

    console.log(`\n🔍 Looking up school "${schoolCode}" in Appwrite...`);
    const school = await findSchoolByCode(databases, schoolCode);

    if (!school) {
      console.error(`❌ School not found in Appwrite: ${schoolCode}`);
      process.exit(1);
    }

    console.log(`✓ Found school: ${school.name}`);

    const uploadedFiles = await uploadToR2(s3Client, schoolCode, installers);
    const downloads = await updateSchoolDownloads(databases, school.$id, uploadedFiles);
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
