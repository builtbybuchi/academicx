#!/usr/bin/env node

/**
 * Per-School App Build Orchestrator
 *
 * 1. Builds universal ACADEMICX admin, staff, and student portal apps (all roles, all OS).
 * 2. Builds one student app per active school (output folder = school code).
 *
 * Usage:
 *   node scripts/build-all-schools.mjs [--upload-r2] [--environment stg|prd] [--school-code CODE]
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { Client, Databases, Query } from 'node-appwrite';
import { ACADEMICX_LOGO_URL, getInstallerOutputFolder } from './build-paths.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || '';
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID || '';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || '';

const DATABASE_ID = 'academicx_db';
const SCHOOLS_COLLECTION_ID = 'schools';

const INSTALLERS_ROOT = path.join(ROOT, 'installers');

const ACADEMICX_ROLES = ['admin', 'staff', 'student'];

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

function run(command, commandArgs, cwd = ROOT) {
  console.log(`  $ ${command} ${commandArgs.join(' ')}`);
  const result = spawnSync(command, commandArgs, {
    cwd,
    stdio: 'inherit',
    shell: true,
  });

  if (result.status !== 0) {
    throw new Error(`Command failed with exit code ${result.status}`);
  }
}

async function fetchAllSchools() {
  if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID || !APPWRITE_API_KEY) {
    console.error('❌ Missing Appwrite environment variables: APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY');
    process.exit(1);
  }

  const client = new Client();
  client.setEndpoint(APPWRITE_ENDPOINT);
  client.setProject(APPWRITE_PROJECT_ID);
  client.setKey(APPWRITE_API_KEY);

  const databases = new Databases(client);

  try {
    const response = await databases.listDocuments(DATABASE_ID, SCHOOLS_COLLECTION_ID, [
      Query.equal('status', 'active'),
      Query.limit(1000),
    ]);
    return response.documents.filter((doc) => doc.status !== 'inactive');
  } catch (error) {
    console.error('❌ Failed to fetch schools from Appwrite:', error.message);
    throw error;
  }
}

function selectSchools(allSchools, filterCode) {
  const withoutAcademicx = allSchools.filter(
    (school) => String(school.schoolCode || '').trim().toUpperCase() !== 'ACADEMICX',
  );

  if (filterCode) {
    const normalized = String(filterCode).trim().toUpperCase();
    if (normalized === 'ACADEMICX') {
      console.error('❌ ACADEMICX is the universal fallback app code and is not built from the schools collection.');
      process.exit(1);
    }
    const school = withoutAcademicx.find((s) => s.schoolCode === filterCode);
    if (!school) {
      console.error(`❌ School not found: ${filterCode}`);
      process.exit(1);
    }
    return [school];
  }

  if (process.stdout.isTTY) {
    console.log('\n📋 Available Schools:\n');
    withoutAcademicx.forEach((school, idx) => {
      console.log(`  ${idx + 1}. ${school.schoolCode} — ${school.name}`);
    });
    console.log('\n⚠️  To build a specific school: --school-code SCHOOLCODE');
    console.log('    To build all active schools, omit --school-code\n');
  }

  return withoutAcademicx;
}

function buildAcademicxRoleApp(role) {
  const roleLabel = role === 'student' ? 'Student Portal' : role.charAt(0).toUpperCase() + role.slice(1);
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🏢 Building universal ACADEMICX ${roleLabel} app`);
  console.log('='.repeat(60));

  run(
    'node',
    [
      'scripts/build-tauri-apps.mjs',
      '--school-code',
      'ACADEMICX',
      '--role',
      role,
      '--logo-url',
      ACADEMICX_LOGO_URL,
    ],
    ROOT,
  );
}

function buildAcademicxApps() {
  console.log(`\n${'='.repeat(60)}`);
  console.log('🏢 Building universal ACADEMICX apps (Admin, Staff, Student Portal)');
  console.log('='.repeat(60));

  for (const role of ACADEMICX_ROLES) {
    buildAcademicxRoleApp(role);
  }

  console.log('\n✅ Successfully built all universal ACADEMICX apps');
}

function buildSchoolStudentApp(school) {
  const schoolCode = school.schoolCode;
  const logoUrl = String(school.logo || '').trim();

  console.log(`\n${'='.repeat(60)}`);
  console.log(`📱 Building student app for: ${schoolCode} → installers/<platform>/${getInstallerOutputFolder(schoolCode)}/`);
  console.log('='.repeat(60));

  const commandArgs = ['scripts/build-tauri-apps.mjs', '--school-code', schoolCode];
  if (logoUrl) {
    commandArgs.push('--logo-url', logoUrl);
  }

  run('node', commandArgs, ROOT);
  console.log(`✅ Successfully built student app for ${schoolCode}`);
}

async function main() {
  const args = parseArgs(process.argv);
  const shouldUploadR2 = args['upload-r2'] === 'true';
  const filterSchoolCode = args['school-code'];
  const environment = String(args.environment || process.env.UPLOAD_ENV || process.env.DEPLOY_ENV || '').trim();

  console.log('\n🎯 Per-School App Build Orchestrator\n');

  console.log('📡 Fetching schools from Appwrite...');
  const allSchools = await fetchAllSchools();
  const schoolsToBuild = selectSchools(allSchools, filterSchoolCode);
  console.log(`✓ Found ${schoolsToBuild.length} school(s) to build\n`);

  buildAcademicxApps();

  for (const school of schoolsToBuild) {
    buildSchoolStudentApp(school);
  }

  if (shouldUploadR2) {
    console.log('\n' + '='.repeat(60));
    console.log('☁️  Uploading installers to R2 and Appwrite');
    console.log('='.repeat(60));

    const uploadArgs = [
      'scripts/upload-to-r2.mjs',
      '--all-schools',
      '--installers-path',
      INSTALLERS_ROOT,
    ];
    if (environment) {
      uploadArgs.push('--environment', environment);
    }

    run('node', uploadArgs, ROOT);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Build Complete!');
  console.log('='.repeat(60));
  console.log(`\n📦 Installers are in: ${path.relative(ROOT, INSTALLERS_ROOT)}\n`);

  if (!shouldUploadR2) {
    console.log('💡 To upload after build: node scripts/upload-to-r2.mjs --all-schools --installers-path ./installers\n');
  }
}

try {
  await main();
} catch (error) {
  console.error('\n❌ Error:', error.message || error);
  process.exit(1);
}
