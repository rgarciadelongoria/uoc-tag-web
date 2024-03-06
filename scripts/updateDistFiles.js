const fs = require('fs');

function renameUnderscoreValues(object) {
  for (let clave in object) {
    if (Array.isArray(object[clave])) {
      object[clave].forEach((element) => {
        renameUnderscoreValues(element);
      });
    } else if (typeof object[clave] === 'object' && object[clave] !== null) {
      renameUnderscoreValues(object[clave]);
    } else if (typeof object[clave] === 'string' && object[clave].startsWith('_')) {
      object[clave] = object[clave].substring(1);
    }
  }
}

function processJSON(path) {
  try {
    const content = fs.readFileSync(path, 'utf-8');
    const objectJSON = JSON.parse(content);
    renameUnderscoreValues(objectJSON);

    fs.writeFileSync(path, JSON.stringify(objectJSON, null, 2));
    console.log(`File ${path} success.`);
  } catch (error) {
    console.error(`Error processing file ${path}: ${error.message}`);
  }
}

function processFiles(pathArray) {
  pathArray.forEach((path) => {
    processJSON(path);
  });
}

const filePaths = [
  './dist/lookttery-app/importmap.json',
  './dist/lookttery-app/remoteEntry.json'
];

processFiles(filePaths);
