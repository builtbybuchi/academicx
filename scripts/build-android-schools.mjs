#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { Client, Databases, Query } from 'node-appwrite';
import {
  ACADEMICX_LOGO_URL,
  getAndroidApkFilename,
  getInstallerOutputFolder,
  isAcademicxCode,
  sanitizeSegment,
} from './build-paths.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const APPS_ROOT = path.join(ROOT, 'apps');
const INSTALLERS_ROOT = path.join(ROOT, 'installers');
const DEFAULT_LOGO = path.join(ROOT, 'apps', 'landing-page', 'public', 'logo.png');

const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || '';
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID || '';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || '';
const DATABASE_ID = 'academicx_db';
const SCHOOLS_COLLECTION_ID = 'schools';

const ROLE_DEFINITIONS = [
  { dir: 'admin-app', appName: 'AcademicX - Admin', appIdSuffix: 'admin' },
  { dir: 'staff-app', appName: 'AcademicX - Staff', appIdSuffix: 'staff' },
  { dir: 'student-parent-app', appName: 'AcademicX - Student Portal', appIdSuffix: 'student' },
];

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
    throw new Error(`Command failed: ${command} ${commandArgs.join(' ')}`);
  }
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function fileExists(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function ensureAppDependencies(appDir) {
  if (!fileExists(path.join(appDir, 'node_modules'))) {
    run('npm', ['install', '--include=dev'], appDir);
  }
}

function ensureTauriCli(appDir) {
  const pkgPath = path.join(appDir, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const hasCli =
    Boolean(pkg.devDependencies && pkg.devDependencies['@tauri-apps/cli']) ||
    Boolean(pkg.dependencies && pkg.dependencies['@tauri-apps/cli']);

  if (!hasCli) {
    run('npm', ['install', '--include=dev', '--save-dev', '@tauri-apps/cli'], appDir);
    run('npm', ['install', '--include=dev', '@tauri-apps/api'], appDir);
  }
}

function ensureTauriScript(appDir) {
  const pkgPath = path.join(appDir, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  pkg.scripts = pkg.scripts || {};
  if (pkg.scripts.tauri !== 'tauri') {
    pkg.scripts.tauri = 'tauri';
    fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');
  }
}

function ensureTauriProject(appDir, appName) {
  const tauriConf = path.join(appDir, 'src-tauri', 'tauri.conf.json');
  if (fileExists(tauriConf)) return;

  run(
    'npx',
    [
      '@tauri-apps/cli', 'init', '--ci', '--app-name', appName,
      '--window-title', appName,
      '--frontend-dist', '../dist',
      '--dev-url', 'http://localhost:5173',
      '--before-dev-command', 'npx vite',
      '--before-build-command', 'npx vite build',
    ],
    appDir,
  );
}

async function downloadLogo(logoUrl) {
  const cacheKey = sanitizeSegment(logoUrl) || 'default';
  const cachedPath = path.join(ROOT, '.tmp', `android-logo-${cacheKey}.png`);

  if (fileExists(cachedPath)) {
    return cachedPath;
  }

  const response = await fetch(logoUrl);
  if (!response.ok) {
    throw new Error(`Failed to download logo: ${logoUrl}`);
  }

  const contentType = String(response.headers.get('content-type') || '').toLowerCase();
  const ext = contentType.includes('svg') ? 'svg' : contentType.includes('png') ? 'png' : 'jpg';
  const outputPath = path.join(ROOT, '.tmp', `android-logo-${cacheKey}.${ext}`);
  ensureDir(path.dirname(outputPath));
  fs.writeFileSync(outputPath, Buffer.from(await response.arrayBuffer()));
  return outputPath;
}

function resolveLogoPath(logoUrl) {
  if (logoUrl && /^https?:\/\//i.test(logoUrl)) {
    return logoUrl;
  }
  return fileExists(DEFAULT_LOGO) ? DEFAULT_LOGO : '';
}

function writeTauriConfig(appDir, appName, identifier, logoFilePath) {
  const tauriConfigPath = path.join(appDir, 'src-tauri', 'tauri.conf.json');
  const data = JSON.parse(fs.readFileSync(tauriConfigPath, 'utf8'));

  data.productName = appName;
  data.mainBinaryName = sanitizeSegment(`${appName}-mobile`) || 'academicx-mobile';
  data.build = data.build || {};
  data.build.beforeDevCommand = 'npx vite';
  data.build.beforeBuildCommand = 'npx vite build';
  data.bundle = data.bundle || {};
  data.bundle.active = true;
  data.identifier = identifier;

  if (Object.prototype.hasOwnProperty.call(data.bundle, 'identifier')) {
    delete data.bundle.identifier;
  }

  fs.writeFileSync(tauriConfigPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');

  if (logoFilePath && fileExists(logoFilePath)) {
    const iconsDir = path.join(appDir, 'src-tauri', 'icons');
    ensureDir(iconsDir);
    try {
      run('npx', ['@tauri-apps/cli', 'icon', logoFilePath, '--output', iconsDir], appDir);
    } catch {
      // Keep existing icons if custom generation fails.
    }
  }
}

function writeAndroidSigningConfig(appDir) {
  const keystorePath = process.env.ANDROID_KEYSTORE_PATH || path.join(ROOT, 'academicx-release.jks');
  const keyAlias = process.env.ANDROID_KEY_ALIAS || '';
  const keyPassword = process.env.ANDROID_KEY_PASSWORD || '';
  const storePassword = process.env.ANDROID_STORE_PASSWORD || '';

  if (!fileExists(keystorePath)) {
    throw new Error(`Android keystore not found: ${keystorePath}`);
  }
  if (!keyAlias || !keyPassword || !storePassword) {
    throw new Error('Missing Android signing secrets. Set ANDROID_KEY_ALIAS, ANDROID_KEY_PASSWORD, and ANDROID_STORE_PASSWORD.');
  }

  const localPropertiesPath = path.join(appDir, 'src-tauri', 'gen', 'android', 'local.properties');
  ensureDir(path.dirname(localPropertiesPath));
  fs.writeFileSync(localPropertiesPath, [
    `storeFile=${keystorePath}`,
    `storePassword=${storePassword}`,
    `keyAlias=${keyAlias}`,
    `keyPassword=${keyPassword}`,
    '',
  ].join('\n'), 'utf8');
}

function cleanAndroidGen(appDir) {
  const genRoot = path.join(appDir, 'src-tauri', 'gen', 'android');
  if (fileExists(genRoot)) {
    fs.rmSync(genRoot, { recursive: true, force: true });
  }
}

function ensureAndroidProject(appDir, identifier) {
  const androidRoot = path.join(appDir, 'src-tauri', 'gen', 'android');
  const packagePath = path.join(androidRoot, 'app', 'src', 'main', 'java', ...String(identifier || '').split('.'));

  if (!fileExists(androidRoot)) {
    run('npx', ['@tauri-apps/cli', 'android', 'init'], appDir);
    return;
  }

  if (!fileExists(packagePath)) {
    fs.rmSync(androidRoot, { recursive: true, force: true });
    run('npx', ['@tauri-apps/cli', 'android', 'init'], appDir);
  }
}

function findAndroidApkFiles(androidGenRoot) {
  const apks = [];
  const stack = [androidGenRoot];

  while (stack.length > 0) {
    const current = stack.pop();
    for (const name of fs.readdirSync(current)) {
      const abs = path.join(current, name);
      const stat = fs.statSync(abs);
      if (stat.isDirectory()) {
        stack.push(abs);
        continue;
      }
      if (stat.isFile() && name.endsWith('.apk')) {
        apks.push(abs);
      }
    }
  }

  return apks;
}

function pickPreferredApk(apkPaths) {
  if (apkPaths.length === 0) return null;

  const scored = apkPaths.map((apkPath) => {
    const name = path.basename(apkPath).toLowerCase();
    let score = 0;
    if (name.includes('release')) score += 10;
    if (!name.includes('unsigned')) score += 5;
    if (name.includes('signed')) score += 5;
    if (name.includes('universal')) score += 2;
    if (name.includes('debug')) score -= 20;
    return { apkPath, score, mtime: fs.statSync(apkPath).mtimeMs };
  });

  scored.sort((a, b) => b.score - a.score || b.mtime - a.mtime);
  return scored[0].apkPath;
}

function collectAndroidInstallers(appDir, schoolCode, appIdSuffix) {
  const bundleRoot = path.join(appDir, 'src-tauri', 'gen', 'android');
  if (!fileExists(bundleRoot)) {
    console.warn(`⚠️  No Android build output in ${path.relative(ROOT, bundleRoot)}`);
    return;
  }

  const apkPaths = findAndroidApkFiles(bundleRoot);
  const selectedApk = pickPreferredApk(apkPaths);

  if (!selectedApk) {
    console.warn(`⚠️  No APK files found under ${path.relative(ROOT, bundleRoot)}`);
    return;
  }

  const outputFolder = getInstallerOutputFolder(schoolCode, appIdSuffix);
  const apkFilename = getAndroidApkFilename(schoolCode, appIdSuffix);
  const destDir = path.join(INSTALLERS_ROOT, 'android', outputFolder);
  const destFile = path.join(destDir, apkFilename);

  ensureDir(destDir);
  fs.copyFileSync(selectedApk, destFile);
  console.log(
    `  ✓ ${path.relative(ROOT, destFile)} (from ${path.basename(selectedApk)})`,
  );
}

async function fetchSchools() {
  if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID || !APPWRITE_API_KEY) {
    throw new Error('Missing APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, or APPWRITE_API_KEY.');
  }

  const client = new Client();
  client.setEndpoint(APPWRITE_ENDPOINT);
  client.setProject(APPWRITE_PROJECT_ID);
  client.setKey(APPWRITE_API_KEY);

  const databases = new Databases(client);
  const response = await databases.listDocuments(DATABASE_ID, SCHOOLS_COLLECTION_ID, [
    Query.equal('status', 'active'),
    Query.limit(1000),
  ]);

  return response.documents.filter((doc) => doc.status !== 'inactive');
}

function updateSchoolConfig(appDir, schoolCode, appName, logoPath, appIdSuffix) {
  const suffix = sanitizeSegment(appIdSuffix || 'student') || 'student';
  const appIdentifier = `com.academicx.${sanitizeSegment(schoolCode)}.${suffix}`;
  ensureAppDependencies(appDir);
  ensureTauriCli(appDir);
  ensureTauriProject(appDir, appName);
  ensureTauriScript(appDir);
  writeTauriConfig(appDir, appName, appIdentifier, logoPath);
  ensureAndroidProject(appDir, appIdentifier);
  writeAndroidSigningConfig(appDir);
}

async function buildOneApp(definition, schoolCode, logoUrl) {
  const appDir = path.join(APPS_ROOT, definition.dir);
  const appName = isAcademicxCode(schoolCode) ? definition.appName : schoolCode;
  const outputFolder = getInstallerOutputFolder(schoolCode, definition.appIdSuffix);
  const logoPath = logoUrl ? await downloadLogo(logoUrl) : resolveLogoPath('');

  console.log(`\n=== Building Android: ${appName} (${definition.dir}) → android/${outputFolder}/ ===`);

  cleanAndroidGen(appDir);
  updateSchoolConfig(appDir, schoolCode, appName, logoPath, definition.appIdSuffix);
  run('npx', ['vite', 'build'], appDir);
  run('npx', ['@tauri-apps/cli', 'android', 'build', '--apk'], appDir);
  collectAndroidInstallers(appDir, schoolCode, definition.appIdSuffix);
}

async function buildAcademicxApps() {
  console.log(`\n${'='.repeat(60)}`);
  console.log('🏢 Building universal ACADEMICX Android apps (Admin, Staff, Student Portal)');
  console.log('='.repeat(60));

  for (const definition of ROLE_DEFINITIONS) {
    await buildOneApp(definition, 'ACADEMICX', ACADEMICX_LOGO_URL);
  }
}

async function main() {
  const args = parseArgs(process.argv);
  const uploadR2 = args['upload-r2'] === 'true';
  const selectedSchoolCode = String(args['school-code'] || '').trim();

  ensureDir(INSTALLERS_ROOT);

  const schools = (await fetchSchools()).filter(
    (school) => String(school.schoolCode || '').trim().toUpperCase() !== 'ACADEMICX',
  );
  const schoolsToBuild = selectedSchoolCode
    ? schools.filter((school) => school.schoolCode === selectedSchoolCode)
    : schools;

  if (selectedSchoolCode && schoolsToBuild.length === 0) {
    throw new Error(`School not found: ${selectedSchoolCode}`);
  }

  await buildAcademicxApps();

  for (const school of schoolsToBuild) {
    const logoUrl = String(school.logo || '').trim();
    await buildOneApp(
      { dir: 'student-parent-app', appName: school.schoolCode, appIdSuffix: 'student' },
      school.schoolCode,
      logoUrl,
    );
  }

  if (uploadR2) {
    const uploadArgs = [
      'scripts/upload-to-r2.mjs',
      '--all-schools',
      '--installers-path',
      './installers',
    ];
    const environment = String(args.environment || process.env.UPLOAD_ENV || process.env.DEPLOY_ENV || '').trim();
    if (environment) {
      uploadArgs.push('--environment', environment);
    }
    run('node', uploadArgs, ROOT);
  }
}

try {
  await main();
} catch (error) {
  console.error(error.message || error);
  process.exit(1);
}
