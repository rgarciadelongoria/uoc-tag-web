const fs = require('fs');
const path = require('path');

const dir = './dist/lookttery-app';

fs.readdir(dir, (err, files) => {
  if (err) {
    console.error('Error reading dir:', err);
    return;
  }

  files.forEach(file => {
    const filePath = path.join(dir, file);

    if (file.startsWith('_')) {
      const newName = file.slice(1);
      const newPath = path.join(dir, newName);

      fs.rename(filePath, newPath, err => {
        if (err) {
          console.error('Error renaming file:', err);
        } else {
          console.log(`File renamed: ${file} -> ${newName}`);
        }
      });
    }
  });
});