// @ts-nocheck
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, 'src');

const SLICES = {
  auth: path.join(ROOT_DIR, 'authSlice.js'),
  wallet: path.join(ROOT_DIR, 'walletSlice.js'),
};

function getNamedExports(filePath) {
  if (!fs.existsSync(filePath)) return new Set();

  const content = fs.readFileSync(filePath, 'utf-8');
  const exports = new Set();
  let match;

  const declarationRegex = /export\s+const\s+([A-Za-z_$][\w$]*)/g;
  while ((match = declarationRegex.exec(content)) !== null) {
    exports.add(match[1]);
  }

  const functionRegex = /export\s+(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/g;
  while ((match = functionRegex.exec(content)) !== null) {
    exports.add(match[1]);
  }

  const destructuredRegex = /export\s+const\s+\{([^}]+)\}\s*=\s*\w+Slice\.actions/g;
  while ((match = destructuredRegex.exec(content)) !== null) {
    match[1]
      .split(',')
      .map((name) => name.trim())
      .filter((name) => name && !name.startsWith('//'))
      .forEach((name) => exports.add(name.split(/\s+as\s+/)[0].trim()));
  }

  return exports;
}

function getFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;

  fs.readdirSync(dir).forEach((file) => {
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, fileList);
    } else if (name.endsWith('.js') || name.endsWith('.jsx')) {
      fileList.push(name);
    }
  });

  return fileList;
}

function validate() {
  console.log('Starting Redux export validation...');

  const namedExports = {
    auth: getNamedExports(SLICES.auth),
    wallet: getNamedExports(SLICES.wallet),
  };

  const files = getFiles(ROOT_DIR);
  let errorCount = 0;

  files.forEach((file) => {
    if (Object.values(SLICES).includes(file)) return;

    const content = fs.readFileSync(file, 'utf-8');
    const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"](?:@\/|\.\/|\.\.\/)*(authSlice|walletSlice)(?:\.js)?['"]/g;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      const importedItems = match[1]
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
      const sourceSlice = match[2].toLowerCase().includes('auth') ? 'auth' : 'wallet';
      const availableExports = namedExports[sourceSlice];

      importedItems.forEach((item) => {
        const exportName = item.split(/\s+as\s+/)[0].trim();
        if (!availableExports.has(exportName)) {
          console.error(`[ERROR] In ${path.relative(ROOT_DIR, file)}:`);
          console.error(`  "${exportName}" is not exported by ${sourceSlice}Slice.js\n`);
          errorCount += 1;
        }
      });
    }
  });

  if (errorCount > 0) {
    console.error(`Validation failed with ${errorCount} error(s).`);
    process.exit(1);
  }

  console.log('All Redux imports are valid.');
}

validate();
