// This file is used to delete the objekt-detail directory
const fs = require('fs');
const path = require('path');

const dirPath = path.join(__dirname, 'src', 'app', 'objekt-detail');

try {
  fs.rmSync(dirPath, { recursive: true, force: true });
  console.log('Successfully removed objekt-detail directory');
} catch (error) {
  console.log('Directory may not exist or already removed');
}