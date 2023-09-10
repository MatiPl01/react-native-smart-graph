const fs = require('fs');
const path = require('path');

// Assuming tsconfig.json is in the root folder
const tsconfig = JSON.parse(fs.readFileSync('./tsconfig.json', 'utf8'));

// Delete paths key
delete tsconfig.compilerOptions.paths;

// Configuring output path
const targetDir = path.resolve('./dist');
const targetFile = path.join(targetDir, 'tsconfig.json');

// Ensure the target directory exists before writing
fs.mkdirSync(targetDir, { recursive: true });

// Writing new tsconfig.json to target location
fs.writeFileSync(targetFile, JSON.stringify(tsconfig, null, 2), 'utf8');
