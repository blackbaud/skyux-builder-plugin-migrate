'use strict';

const findInFiles = require('find-in-files');
const fs = require('fs-extra');
const logger = require('@blackbaud/skyux-logger');
const path = require('path');

const packageMap = require('./package-map');
const sortUtils = require('./sort-utils');

function getTypeList(typeImport) {
  const typeList = typeImport
    .substring(typeImport.indexOf('{') + 1, typeImport.indexOf('}'))
    .split(',')
    .map(typeName => typeName.trim());

  return typeList;
}

function createImportList(matches) {
  // Create a flat list of types across all SKY UX imports.
  const typeList = [];

  for (const match of matches) {
    typeList.push(...getTypeList(match));
  }

  const importList = {};

  // Find the corresponding package for each SKY UX type and group them.
  for (const typeName of typeList) {
    const matchingPackage = packageMap.findMatchingPackages(typeName)[0];

    if (matchingPackage) {
      const packageName = matchingPackage.package;

      let importPath;

      if (matchingPackage.importPaths) {
        const importPathForType = matchingPackage.importPaths
          .find(item => item.typeName === typeName);

        if (importPathForType) {
          importPath = importPathForType.path;
        }
      }

      importPath = importPath || packageName;

      importList[importPath] = importList[importPath] || [];
      importList[importPath].push(typeName);
    } else {
      throw new Error(`No package found for ${typeName}!`);
    }
  }

  return importList;
}

function buildImportSource(packageList) {
  let tsImports = '';

  Object.keys(packageList).sort(sortUtils.stringCompare)
    .filter(packageName => packageList[packageName].length > 0)
    .forEach((packageName, index, items) => {
      const packageTypes = packageList[packageName]
        .sort(sortUtils.stringCompare);

      tsImports +=
`

import {
  ${packageTypes.join(',\n  ')}
} from '${packageName}';`;

      if (index === items.length - 1) {
        tsImports += '\n\n';
      }
    });

  return tsImports;
}

async function writeFileChanges(fileName, matches, tsImports) {
  let fileContents = await fs.readFile(
    path.join('.', fileName),
    'utf8'
  );

  // Put the new imports where the first SKY UX import statement was found, then
  // remove all the other SKY UX import statements.
  matches.forEach((match, index) => {
    fileContents = fileContents.replace(
      match,
      index === 0 ? tsImports : ''
    );
  });

  fileContents = fileContents
    // Ensure any import paths that end up on the same line as a result of the replacements
    // above get put back onto separate lines.
    .replace(/;import/g, ';\nimport')
    // Ensure there is at most one blank line between each import.
    .replace(/\n{3,}import/g, '\n\nimport')
    // Get rid of any extra lines that may have been added to the top of the file.
    .trimLeft();

  await fs.writeFile(fileName, fileContents);
}

async function fixScssImportPaths() {
  const results = await findInFiles.find(
    {
      term:'@blackbaud/skyux/dist/scss',
      flags: 'g'
    },
    './src',
    '\\.scss$'
  );

  for (const fileName of Object.keys(results)) {
    logger.info(`Updating SKY UX Sass imports in ${fileName}...`);

    const matches = results[fileName].matches;

    let fileContents = await fs.readFile(
      path.join('.', + fileName),
      'utf8'
    );

    // Put the new imports where the first SKY UX import statement was found, then
    // remove all the other SKY UX import statements.
    matches.forEach((match) => {
      fileContents = fileContents.replace(
        match,
        '@skyux/theme/scss'
      );
    });

    await fs.writeFile(fileName, fileContents);
  }
}

async function fixImportPaths() {
  logger.info('Searching source code for SKY UX imports...');

  const results = await findInFiles.find(
    {
      term:'\\s*import\\s+\\{\\s[A-z0-9\\s,]+\\}\\s+from\\s+(\'|")' +
      '(@blackbaud/skyux/[A-z0-9/]*|@blackbaud/skyux-builder/[A-z0-9/]*)' +
      '(\'|")\\s*;\\s*',
      flags: 'g'
    },
    path.join('.', 'src'),
    '\\.ts$'
  );

  for (const fileName of Object.keys(results)) {
    logger.info(`Updating SKY UX imports in ${fileName}...`);

    const matches = results[fileName].matches;

    const packageList = createImportList(matches);

    const tsImports = buildImportSource(packageList);

    await writeFileChanges(fileName, matches, tsImports);
  }

  await fixScssImportPaths();

  logger.info('SKY UX imports updated successfully.');
}

module.exports = {
  fixImportPaths
};
