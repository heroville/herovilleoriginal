import { spawn } from 'node:child_process';
import { readdir, mkdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

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

// Build args with coverage + reporters (spec -> file, junit -> file)
const args = [
  '--test',
  '--experimental-test-coverage',
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

if (exitCode !== 0) {
  process.exit(exitCode);
}

// Parse coverage summary (printed by --experimental-test-coverage)
const coverageLine = capturedStdout.split('\n').find((line) => line.includes('all files'));

if (!coverageLine) {
  console.error('Unable to locate coverage summary in the test output.');
  process.exit(1);
}

// NOTE: This regex assumes "all files | <stmts> | <branches> | <funcs> | <lines>"
// We'll pull branches/funcs/lines in order.
const match = coverageLine.match(/all files\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)/);

if (!match) {
  console.error('Unable to parse coverage summary line:', coverageLine);
  process.exit(1);
}

const [, /*stmts*/, branchPctRaw, funcPctRaw, linePctRaw] = match;
const linePct = Number(linePctRaw);
const branchPct = Number(branchPctRaw);
const funcPct = Number(funcPctRaw);

const failures = [];

if (linePct < thresholds.lines) {
  failures.push(`line coverage ${linePct.toFixed(2)}% fell below the required ${thresholds.lines}%`);
}

if (branchPct < thresholds.branches) {
  failures.push(`branch coverage ${branchPct.toFixed(2)}% fell below the required ${thresholds.branches}%`);
}

if (funcPct < thresholds.functions) {
  failures.push(`function coverage ${funcPct.toFixed(2)}% fell below the required ${thresholds.functions}%`);
}

if (failures.length > 0) {
  console.error('Coverage threshold check failed:');
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log('Coverage thresholds satisfied.');
