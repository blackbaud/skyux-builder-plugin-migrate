'use strict';

const findInFiles = require('find-in-files');
const logger = require('@blackbaud/skyux-logger');
const path = require('path');

const packageMap = require('./lib/package-map');

/**
 * Adds the specified package to the package list if it doesn't yet exist.
 * @param {*} packageList The existing package list.
 * @param {*} matchingPackage The package to add.
 * @param {*} match The matching string that caused the package to be included.
 */
function addPackageToList(packageList, matchingPackage, match) {
  const packageName = matchingPackage.package;

  packageList[packageName] = packageList[packageName] || [];

  if (matchingPackage.modules) {
    const modulesToImport = matchingPackage.modules.filter(
      module => module.matches.some(
        moduleMatch => match.indexOf(moduleMatch) === 0
      )
    );

    if (modulesToImport) {
      for (const moduleToImport of modulesToImport) {
        if (packageList[packageName].indexOf(moduleToImport.name) === -1) {
          packageList[packageName].push(moduleToImport.name);
        }
      }
    }
  }
}

/**
 * Searches the application's source code and determines which SKY UX NPM packages to install,
 * then returns a list of the packages along with any Angular modules that should be imported
 * into the application's Angular module.
 */
async function createPackageList() {
  const packageList = {
    '@skyux/errors': [
      'SkyErrorModule'
    ]
  };

  const results = await findInFiles.find(
    {
      term:'[Ss]ky[A-z0-9\\-]+',
      flags: 'g'
    },
    path.join('.', 'src'),
    '(\\.html$|\\.ts$)'
  );

  for (const fileName of Object.keys(results)) {
    const result = results[fileName];

    for (const match of result.matches) {
      const matchingPackages = packageMap.findMatchingPackages(match);

      for (const matchingPackage of matchingPackages) {
        logger.info(`Found matching package ${matchingPackage.package} for ${match} in ${fileName}`);
        addPackageToList(packageList, matchingPackage, match);
      }
    }
  }

  return packageList;
}

module.exports = {
  createPackageList
};
