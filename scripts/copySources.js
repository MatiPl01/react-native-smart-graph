const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Assuming tsconfig.json is in the root folder
const tsconfig = JSON.parse(fs.readFileSync('./tsconfig.json'));
const basePath = path.resolve(tsconfig.compilerOptions.baseUrl);

const aliases = Object.entries(tsconfig.compilerOptions.paths).reduce(
  (acc, [alias, values]) => {
    acc[alias] = path.resolve(basePath, values[0].replace('*', '')); // Remove wildcard
    return acc;
  },
  {}
);

const allFiles = glob.sync('./src/**/*.*');

allFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  const target = `./dist/${file}`;

  // Replace aliases only for .ts and .tsx files
  if (file.endsWith('.ts') || file.endsWith('.tsx')) {
    Object.entries(aliases).forEach(([alias, value]) => {
      const regex = new RegExp(`(['"])${alias}/`, 'g');
      let relativePath = path.relative(path.dirname(file), value);
      relativePath = relativePath.startsWith('.')
        ? relativePath
        : `./${relativePath}`;

      content = content.replace(regex, `$1${relativePath}/`);
    });
  }

  fs.mkdirSync(path.dirname(target), { recursive: true }); // Ensure the target directory exists before writing
  fs.writeFileSync(target, content, 'utf8');
});
