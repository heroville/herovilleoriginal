import { spawn } from 'node:child_process';
import { readdir, mkdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import { createRequire } from 'node:module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function collectTestFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectTestFiles(absolutePath));
    } else if (/\.(spec|test)\.js$/u.test(entry.name)) {
      files.push(absolutePath);
    }
  }

  return files;
}

const thresholds = {
  lines: 80,
  branches: 70,
  functions: 70
};

async function main() {
  const require = createRequire(import.meta.url);

  const testFiles = await collectTestFiles(resolve(__dirname));

  if (testFiles.length === 0) {
    console.error('No test files were found.');
    process.exit(1);
  }

  // Ensure output dir for JUnit exists
  const resultsDir = resolve(process.cwd(), 'test-results');
  await mkdir(resultsDir, { recursive: true });
  const junitPath = resolve(resultsDir, 'junit.xml');
  const specPath = resolve(resultsDir, 'spec.txt');

  // Build args to run tests under c8 (coverage) and emit junit + spec reporters
  // c8 CLI entry can be resolved via require.resolve to be cross-platform
  const c8Bin = require.resolve('c8/bin/c8.js');

  const args = [
    c8Bin,
    '-r', 'lcov',
    '-r', 'text-summary',
    '--check-coverage',
    '--lines', String(thresholds.lines),
    '--branches', String(thresholds.branches),
    '--functions', String(thresholds.functions),
    '--',
    process.execPath,
    '--test',
    '--test-reporter', 'spec',
    '--test-reporter', 'junit',
    '--test-reporter-destination', specPath,
    '--test-reporter-destination', junitPath,
    ...testFiles
  ];

  const testProcess = spawn(process.execPath, args, {
    stdio: ['inherit', 'pipe', 'pipe']
  });

  let capturedStdout = '';

  testProcess.stdout.on('data', (chunk) => {
    capturedStdout += chunk;
    process.stdout.write(chunk);
  });

  testProcess.stderr.on('data', (chunk) => {
    process.stderr.write(chunk);
  });

  const exitCode = await new Promise((resolve) => {
    testProcess.on('exit', resolve);
  });

  // Echo spec output so it appears in CI logs
  try {
    const specOut = await readFile(specPath, 'utf8');
    if (specOut?.trim()) {
      console.log('\n==== Test Report (spec) ====\n');
      process.stdout.write(specOut);
      console.log('\n==== End Test Report (spec) ====\n');
    }
  } catch { /* ignore */ }

  // Exit with c8/node status: c8 --check-coverage makes this fail when thresholds are not met
  process.exit(exitCode);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
