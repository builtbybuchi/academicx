#!/usr/bin/env node

/**
 * Per-School App Build Orchestrator
 * 
 * Fetches all schools from Appwrite and builds per-school student app variants.
 * Staff, admin, and super-admin apps are built once as "academiX - Role" variants.
 * 
 * Usage:
 *   node scripts/build-all-schools.mjs [--upload-r2] [--platform windows|linux|macos|android]
 * 
 * Options:
 *   --upload-r2      Upload artifacts to R2 and update Appwrite after build
 *   --platform       Build for specific platform only (defaults to current platform)
 *   --school-code    Build specific school only (omit to build all)
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { Client, Databases, Query } from 'node-appwrite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ── Config ────────────────────────────────────────────────

const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || '';
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID || '';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || '';

const DATABASE_ID = 'academicx_db';
const SCHOOLS_COLLECTION_ID = 'schools';

const INSTALLERS_ROOT = path.join(ROOT, 'installers');

// Apps to build with role labels
const ROLE_APPS = [
  { code: 'admin', role: 'Admin' },
  { code: 'staff', role: 'Staff' },
  { code: 'super-admin', role: 'Super Admin' },
];

// ── Utilities ─────────────────────────────────────────────

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

function runCapture(command, commandArgs, cwd = ROOT) {
  const result = spawnSync(command, commandArgs, {
    cwd,
    stdio: 'pipe',
    encoding: 'utf8',
    shell: true,
  });

  if (result.status !== 0) {
    throw new Error(`Command failed: ${result.stderr || result.stdout}`);
  }

  return result.stdout.trim();
}

// ── Appwrite Integration ──────────────────────────────────

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
    const activeSchools = response.documents.filter(doc => doc.status !== 'inactive');
    return activeSchools;
  } catch (error) {
    console.error('❌ Failed to fetch schools from Appwrite:', error.message);
    throw error;
  }
}

// ── Conditional Build Selection ───────────────────────────

async function selectSchools(allSchools, filterCode) {
  if (filterCode) {
    const school = allSchools.find(s => s.schoolCode === filterCode);
    if (!school) {
      console.error(`❌ School not found: ${filterCode}`);
      process.exit(1);
    }
    return [school];
  }

  // Interactive selection: show all schools and let user choose
  if (process.stdout.isTTY) {
    console.log('\n📋 Available Schools:\n');
    allSchools.forEach((school, idx) => {
      console.log(`  ${idx + 1}. ${school.schoolCode} — ${school.name}`);
    });
    console.log('\n⚠️  To build specific schools, use: --school-code SCHOOLCODE');
    console.log('    To build all, omit --school-code\n');
  }

  // For CI/CD, build all; for local, prompt
  return allSchools;
}

// ── Build Orchestration ───────────────────────────────────

async function buildSchoolStudentApp(schoolCode, schoolName, logoUrl) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📱 Building Student App for: ${schoolCode} (${schoolName})`);
  console.log('='.repeat(60));

  try {
    const commandArgs = ['scripts/build-tauri-apps.mjs', '--school-code', schoolCode];
    if (logoUrl) {
      commandArgs.push('--logo-url', logoUrl);
    }
    run('node', commandArgs, ROOT);
    console.log(`✅ Successfully built student app for ${schoolCode}`);
  } catch (error) {
    console.error(`❌ Failed to build student app for ${schoolCode}:`, error.message);
    throw error;
  }
}

async function buildRoleApps() {
  console.log(`\n${'='.repeat(60)}`);
  console.log('🏢 Building Role Apps (Admin, Staff, Super Admin)');
  console.log('='.repeat(60));

  try {
    // Build all role apps with "ACADEMICX" as the school code
    run('node', ['scripts/build-tauri-apps.mjs', '--school-code', 'ACADEMICX'], ROOT);
    console.log('✅ Successfully built all role apps');
  } catch (error) {
    console.error('❌ Failed to build role apps:', error.message);
    throw error;
  }
}

// ── Cleanup & Organization ──────────────────────────────

function renameBuiltInstallers(schoolCode) {
  const platformLabel = os.platform();
  const sourceDir = path.join(INSTALLERS_ROOT, platformLabel, `academicx-${schoolCode}-student`);
  const targetDir = path.join(INSTALLERS_ROOT, platformLabel, `${schoolCode}-student`);

  if (fs.existsSync(sourceDir) && sourceDir !== targetDir) {
    fs.renameSync(sourceDir, targetDir);
    console.log(`  Renamed installer folder to: ${path.basename(targetDir)}`);
  }
}

function renameRoleApps() {
  const platformLabel = os.platform();
  
  const appMappings = [
    { from: 'academicx-admin', to: 'academicx-admin' },
    { from: 'academicx-staff', to: 'academicx-staff' },
    { from: 'academicx-super-admin', to: 'academicx-super-admin' },
  ];

  for (const mapping of appMappings) {
    const sourceDir = path.join(INSTALLERS_ROOT, platformLabel, mapping.from);
    const targetDir = path.join(INSTALLERS_ROOT, platformLabel, mapping.to);

    if (fs.existsSync(sourceDir) && sourceDir !== targetDir) {
      if (fs.existsSync(targetDir)) {
        fs.rmSync(targetDir, { recursive: true, force: true });
      }
      fs.renameSync(sourceDir, targetDir);
      console.log(`  Renamed ${mapping.from} to ${mapping.to}`);
    }
  }
}

// ── Main Orchestration ────────────────────────────────────

async function main() {
  const args = parseArgs(process.argv);
  const shouldUploadR2 = args['upload-r2'] === 'true';
  const filterSchoolCode = args['school-code'];

  console.log('\n🎯 Per-School App Build Orchestrator\n');

  // Fetch schools
  console.log('📡 Fetching schools from Appwrite...');
  const allSchools = await fetchAllSchools();
  console.log(`✓ Found ${allSchools.length} active schools\n`);

  // Select schools to build
  const schoolsToBuild = await selectSchools(allSchools, filterSchoolCode);

  // Build role apps once
  await buildRoleApps();
  renameRoleApps();

  // Build per-school student apps
  for (const school of schoolsToBuild) {
    await buildSchoolStudentApp(school.schoolCode, school.name, school.logo);
    renameBuiltInstallers(school.schoolCode);
  }

  // Upload to R2 if requested
  if (shouldUploadR2) {
    console.log('\n' + '='.repeat(60));
    console.log('☁️  Uploading to Cloudflare R2');
    console.log('='.repeat(60));

    // Upload role apps first
    try {
      run('node', [
        'scripts/upload-to-r2.mjs',
        '--school-code', 'ACADEMICX',
        '--installers-path', INSTALLERS_ROOT,
      ], ROOT);
    } catch (error) {
      console.warn(`⚠️  Failed to upload role apps to R2: ${error.message}`);
    }

    // Upload per-school apps
    for (const school of schoolsToBuild) {
      try {
        run('node', [
          'scripts/upload-to-r2.mjs',
          '--school-code', school.schoolCode,
          '--installers-path', INSTALLERS_ROOT,
        ], ROOT);
      } catch (error) {
        console.warn(`⚠️  Failed to upload ${school.schoolCode} to R2: ${error.message}`);
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Build Complete!');
  console.log('='.repeat(60));
  console.log(`\n📦 Installers are in: ${path.relative(ROOT, INSTALLERS_ROOT)}\n`);

  if (!shouldUploadR2) {
    console.log('💡 To upload to R2, run: node scripts/upload-to-r2.mjs --school-code SCHOOLCODE')
    console.log('   Or use --upload-r2 flag with this script\n');
  }
}

try {
  await main();
} catch (error) {
  console.error('\n❌ Error:', error.message || error);
  process.exit(1);
}
