#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const APPS_ROOT = path.join(ROOT, 'apps');
const INSTALLERS_ROOT = path.join(ROOT, 'installers');
const DEFAULT_LOGO = path.join(ROOT, 'apps', 'landing-page', 'public', 'logo.png');
const DEFAULT_LOGO_URL =
  'https://res.cloudinary.com/dlvffw5wt/image/upload/v1773427661/square-image_butlfh.jpg';
const ACADEMICX_LOGO_URL = DEFAULT_LOGO_URL;

// App definitions based on school code
// For ACADEMIX: Build all role apps (admin, staff, student) named "academiX - Role"
// For other schools: Build only student app with school code as app name
function getAppDefinitions(schoolCode) {
  if (schoolCode.toUpperCase() === 'ACADEMICX') {
    return [
      { dir: 'admin-app', appName: 'AcademicX - Admin', appIdSuffix: 'admin' },
      { dir: 'staff-app', appName: 'AcademicX - Staff', appIdSuffix: 'staff' },
      { dir: 'student-parent-app', appName: 'AcademicX - Student Portal', appIdSuffix: 'student' },
    ];
  }
  // For school-specific builds, only build student app
  return [
    { dir: 'student-parent-app', appName: schoolCode, appIdSuffix: 'student' },
  ];
}

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

function run(command, commandArgs, cwd, options = {}) {
  const result = spawnSync(toCommandLine(command, commandArgs), {
    cwd,
    stdio: 'inherit',
    shell: true,
    ...options,
  });

  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${commandArgs.join(' ')}`);
  }
}

function runCapture(command, commandArgs, cwd, options = {}) {
  return spawnSync(toCommandLine(command, commandArgs), {
    cwd,
    stdio: 'pipe',
    encoding: 'utf8',
    shell: true,
    ...options,
  });
}

function quoteShellArg(value) {
  const raw = String(value ?? '');
  if (!raw) return '""';
  if (/^[A-Za-z0-9_./:=,@+-]+$/.test(raw)) return raw;

  if (process.platform === 'win32') {
    return `"${raw.replace(/"/g, '""')}"`;
  }

  return `"${raw.replace(/(["\\$`])/g, '\\$1')}"`;
}

function toCommandLine(command, args = []) {
  return [quoteShellArg(command), ...args.map(quoteShellArg)].join(' ');
}

function sanitizeWindowsPathForRust(originalPath) {
  if (process.platform !== 'win32') return String(originalPath || '');
  const parts = String(originalPath || '').split(';').filter(Boolean);

  const filtered = parts.filter((entry) => {
    const normalized = entry.replace(/\//g, '\\').replace(/\\+$/g, '').toLowerCase();
    return (
      !/\\git\\usr\\bin$/i.test(normalized) &&
      !/\\git\\bin$/i.test(normalized) &&
      !/\\mingw64\\bin$/i.test(normalized) &&
      !/\\mingw32\\bin$/i.test(normalized)
    );
  });
  return filtered.join(';');
}

function buildEnvForRust() {
  const env = { ...process.env };
  if (process.platform === 'win32') {
    env.PATH = sanitizeWindowsPathForRust(env.PATH);
  }
  return env;
}

function sanitizeSegment(input) {
  return String(input || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
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

function copyRecursive(source, destination) {
  if (!fileExists(source)) return;

  const stat = fs.statSync(source);
  if (stat.isDirectory()) {
    ensureDir(destination);
    for (const entry of fs.readdirSync(source)) {
      copyRecursive(path.join(source, entry), path.join(destination, entry));
    }
    return;
  }

  ensureDir(path.dirname(destination));
  fs.copyFileSync(source, destination);
}

function detectPlatformBundleTargets() {
  if (process.platform === 'win32') return ['nsis', 'msi'];
  if (process.platform === 'darwin') return ['dmg', 'app'];
  if (process.platform === 'linux') return ['deb', 'appimage'];
  throw new Error(`Unsupported platform: ${process.platform}`);
}

function ensureAppDependencies(appDir) {
  if (!fileExists(path.join(appDir, 'node_modules'))) {
    console.log(`Installing npm dependencies in ${path.relative(ROOT, appDir)}...`);
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
    console.log(`Installing Tauri in ${path.relative(ROOT, appDir)}...`);
    run('npm', ['install', '--include=dev', '--save-dev', '@tauri-apps/cli'], appDir);
    run('npm', ['install', '--include=dev', '@tauri-apps/api'], appDir);
  }
}

function ensureTauriProject(appDir, appName) {
  const tauriConf = path.join(appDir, 'src-tauri', 'tauri.conf.json');
  if (fileExists(tauriConf)) return;

  console.log(`Initializing Tauri in ${path.relative(ROOT, appDir)}...`);
  run(
     'npx',
    [
       '@tauri-apps/cli',
      'init',
      '--ci',
      '--app-name',
      appName,
      '--window-title',
      appName,
      '--frontend-dist',
      '../dist',
      '--dev-url',
      'http://localhost:5173',
      '--before-dev-command',
      'npx vite',
      '--before-build-command',
      'npx vite build',
    ],
    appDir,
  );
}

function writeTauriConfig(appDir, appName, identifier, logoFilePath) {
  const tauriConfigPath = path.join(appDir, 'src-tauri', 'tauri.conf.json');
  const data = JSON.parse(fs.readFileSync(tauriConfigPath, 'utf8'));

  data.productName = appName;
  data.mainBinaryName = sanitizeSegment(`${appName}-desktop`) || 'academicx-desktop';
  data.build = data.build || {};
  data.build.beforeDevCommand = 'npx vite';
  data.build.beforeBuildCommand = 'npx vite build';

  data.bundle = data.bundle || {};
  data.bundle.active = true;
  data.identifier = identifier;
  if (Object.prototype.hasOwnProperty.call(data.bundle, 'identifier')) {
    delete data.bundle.identifier;
  }

  const iconDir = path.join('icons');
  data.bundle.icon = [
    `${iconDir}/32x32.png`,
    `${iconDir}/128x128.png`,
    `${iconDir}/128x128@2x.png`,
    `${iconDir}/icon.icns`,
    `${iconDir}/icon.ico`,
  ];

  fs.writeFileSync(tauriConfigPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');

  const iconsDir = path.join(appDir, 'src-tauri', 'icons');
  ensureDir(iconsDir);
  try {
     run('npx', ['@tauri-apps/cli', 'icon', logoFilePath, '--output', iconsDir], appDir);
  } catch (error) {
    console.warn(
      `Warning: could not generate icons from ${path.basename(logoFilePath)} for ${path.basename(appDir)}. ` +
      'Using existing Tauri icons instead. Provide a square logo image to customize installer icons.',
    );
    if (!fileExists(path.join(iconsDir, 'icon.ico')) && !fileExists(path.join(iconsDir, '32x32.png'))) {
      throw error;
    }
  }
}

function collectInstallers(appDir, outputRoot, appOutputLabel) {
  const bundleRoot = path.join(appDir, 'src-tauri', 'target', 'release', 'bundle');
  if (!fileExists(bundleRoot)) return;

  const platformLabel = os.platform();
  const destination = path.join(outputRoot, platformLabel, appOutputLabel);

  ensureDir(destination);

  for (const entry of fs.readdirSync(bundleRoot)) {
    const source = path.join(bundleRoot, entry);
    const target = path.join(destination, entry);
    copyRecursive(source, target);
  }
}

function resolveLogoPath(baseLogoPath, appDir) {
  if (baseLogoPath && fileExists(baseLogoPath)) return baseLogoPath;

  const appLogo = path.join(appDir, 'public', 'logo.png');
  if (fileExists(appLogo)) return appLogo;

  return DEFAULT_LOGO;
}

async function downloadLogo(logoUrl) {
  const cacheKey = sanitizeSegment(logoUrl) || 'default';
  const cachedPath = path.join(ROOT, '.tmp', `logo-${cacheKey}.png`);

  if (fileExists(cachedPath)) {
    console.log(`Using cached logo for ${logoUrl}...`);
    return cachedPath;
  }

  console.log(`Downloading logo from ${logoUrl}...`);
  const response = await fetch(logoUrl);
  if (!response.ok) {
    throw new Error(`Failed to download logo from URL: ${logoUrl}`);
  }

  const contentType = String(response.headers.get('content-type') || '').toLowerCase();
  const ext = contentType.includes('png') ? 'png' : contentType.includes('svg') ? 'svg' : 'jpg';
  const filePath = path.join(ROOT, '.tmp', `logo-${cacheKey}.${ext}`);
  ensureDir(path.dirname(filePath));

  const bytes = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(filePath, bytes);
  return filePath;
}

function buildSingleApp(definition, appName, appIdentifier, baseLogoPath, bundleTargets) {
  const appDir = path.join(APPS_ROOT, definition.dir);
  const appOutputLabel = `${sanitizeSegment(appName)}-${definition.appIdSuffix}`;

  console.log(`\n=== Building ${appName} (${definition.dir}) ===`);
  ensureAppDependencies(appDir);
  ensureTauriCli(appDir);
  ensureTauriProject(appDir, appName);

  const logoPath = resolveLogoPath(baseLogoPath, appDir);
  writeTauriConfig(appDir, appName, appIdentifier, logoPath);

  // Do not pass a custom env here — letting the process inherit the shell
  // environment ensures npm, node, and MSVC tools all remain on PATH.
  // Tauri's CLI handles the Rust/Cargo environment internally.
    run('npx', ['@tauri-apps/cli', 'build', '--bundles', bundleTargets.join(',')], appDir);

  collectInstallers(appDir, INSTALLERS_ROOT, appOutputLabel);
}

function showUsageAndExit() {
  console.log(`
Usage:
  node scripts/build-tauri-apps.mjs --school-code SHMCE [--logo path/to/logo.png] [--logo-url https://...]

Options:
  --school-code   Required. School code or 'ACADEMICX' for role apps
  --logo          Optional. Path to logo file.
  --logo-url      Optional. URL to download logo from.

Examples:
  # Build universal ACADEMICX apps (Admin, Staff, Student Portal)
  node scripts/build-tauri-apps.mjs --school-code ACADEMICX

  # Build school-specific student app
  node scripts/build-tauri-apps.mjs --school-code shmce --logo-url https://...

Notes:
  - ACADEMICX builds Admin, Staff, and Student Portal fallback apps
  - Other school codes build only the Student/Parent app
  - Builds are platform-specific: Windows produces .exe/.msi, Linux produces .deb/.appimage,
    macOS produces .dmg. Cross-platform builds require a CI pipeline (e.g. GitHub Actions).
`);
  process.exit(1);
}

function ensureNpm() {
  const check = runCapture('npm', ['--version'], ROOT);
  if (check.status !== 0) {
    throw new Error('npm is required but not available. Install Node.js 18+ and npm.');
  }
}

function resolveVsDevCmdPath() {
  if (process.platform !== 'win32') return null;

  let vswherePath = 'C:\\Program Files (x86)\\Microsoft Visual Studio\\Installer\\vswhere.exe';
  if (!fileExists(vswherePath)) {
    const whereVsWhere = runCapture('where.exe', ['vswhere.exe'], ROOT);
    if (whereVsWhere.status !== 0) return null;
    const discovered = String(whereVsWhere.stdout || '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find(Boolean);
    if (!discovered || !fileExists(discovered)) return null;
    vswherePath = discovered;
  }

  const result = runCapture(
    vswherePath,
    ['-latest', '-products', '*', '-requires', 'Microsoft.VisualStudio.Component.VC.Tools.x86.x64', '-property', 'productPath'],
    ROOT,
  );

  if (result.status !== 0) return null;
  const devCmd = String(result.stdout || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);

  return devCmd && fileExists(devCmd) ? devCmd : null;
}

function ensureRustToolchain() {
  const cargoCheck = runCapture('cargo', ['--version'], ROOT);
  if (cargoCheck.status !== 0) {
    throw new Error('Rust/Cargo is required for Tauri builds. Install Rust from https://rustup.rs and retry.');
  }

  if (process.platform === 'win32') {
    const clCheck = runCapture('where.exe', ['cl.exe'], ROOT);
    const linkCheck = runCapture('where.exe', ['link.exe'], ROOT);
    const clOutput = String(clCheck.stdout || '').trim();
    const linkOutput = String(linkCheck.stdout || '').trim();
    const hasGitLink = /\\Git\\usr\\bin\\link\.exe/i.test(linkOutput.replace(/\//g, '\\'));
    const devCmdPath = resolveVsDevCmdPath();
    const launchHint = devCmdPath
      ? `\nRun this once and rebuild:\n  cmd /c "\"${devCmdPath}\" -arch=x64 -host_arch=x64 && node scripts\\build-tauri-apps.mjs --school-code ACADEMICX"`
      : '';

    if (clCheck.status !== 0 || linkCheck.status !== 0) {
      throw new Error(
        'MSVC tools are installed but not active in this shell. `cl.exe` was not found on PATH and Rust requires the Visual Studio compiler environment.' +
        `\nwhere cl.exe: ${clOutput || 'not found'}` +
        `\nwhere link.exe: ${linkOutput || 'not found'}` +
        '\nOpen "x64 Native Tools Command Prompt for VS" (or Developer PowerShell for VS) and rerun.' +
        launchHint,
      );
    }

    if (hasGitLink) {
      throw new Error(
        'Detected Git Bash linker at C:/Program Files/Git/usr/bin/link.exe. Rust requires the MSVC linker from Visual Studio Build Tools.' +
        '\nRun from Developer PowerShell/Native Tools prompt or remove Git usr/bin from PATH for this command.' +
        launchHint,
      );
    }
  }
}

async function main() {
  const args = parseArgs(process.argv);
  const schoolCode = String(args['school-code'] || '').trim();
  if (!schoolCode) showUsageAndExit();

  let logoArg = args.logo ? path.resolve(ROOT, args.logo) : null;
  const isAcademicx = schoolCode.toUpperCase() === 'ACADEMICX';
  const logoUrl = String(args['logo-url'] || '').trim() || (isAcademicx ? ACADEMICX_LOGO_URL : DEFAULT_LOGO_URL);

  if (!logoArg) {
    logoArg = await downloadLogo(logoUrl);
  }

  if (logoArg && !fileExists(logoArg)) {
    throw new Error(`Logo path does not exist: ${logoArg}`);
  }

  ensureNpm();
  ensureRustToolchain();

  const bundleTargets = detectPlatformBundleTargets();
  console.log(`Detected OS: ${process.platform}`);
  console.log(`Bundle targets: ${bundleTargets.join(', ')}`);

  ensureDir(INSTALLERS_ROOT);

  // Get app definitions based on school code
  const appDefinitions = getAppDefinitions(schoolCode);

  // Build each app
  for (const appDef of appDefinitions) {
    const appName = appDef.appName;
    const appIdentifier = `com.academicx.${sanitizeSegment(schoolCode)}.${appDef.appIdSuffix}`;
    buildSingleApp(appDef, appName, appIdentifier, logoArg, bundleTargets);
  }

  console.log(`\nAll done. Installers are in: ${path.relative(ROOT, INSTALLERS_ROOT)}`);
}

try {
  await main();
} catch (error) {
  console.error(error.message || error);
  process.exit(1);
}