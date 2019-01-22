const latestVersion = require('latest-version');
const getPackageJson = require('package-json');
const logger = require('@blackbaud/skyux-logger');

const packageMap = require('./package-map');

/**
 * Finds all dependencies with a version specified as "latest", looks up the package in the global
 * NPM registry, and replaces it with the actual version number of the latest version of the package.
 * @param {*} dependencies The dependencies with versions to resolve.
 */
async function setDependencyVersions(dependencies) {
  const packageNames = Object.keys(dependencies);

  const dependencyPromises = packageNames.map(
    packageName => dependencies[packageName] === 'latest' ?
      latestVersion(packageName) :
      // Default to the specified version.
      Promise.resolve(dependencies[packageName])
  );

  const versionNumbers = await Promise.all(dependencyPromises);

  packageNames.forEach((packageName, index) => {
    dependencies[packageName] = versionNumbers[index];
  });
}

/**
 * Looks up all SKY UX NPM packages' peer dependencies in the NPM registry and adds them to the
 * dependency list.
 * @param {*} dependencies List of top-level dependencies.
 */
async function addSkyPeerDependencies(dependencies) {
  const skyPackageNames = Object.keys(dependencies).filter(
    packageName => packageName.indexOf('@skyux/') === 0
  );

  const peerPromises = skyPackageNames.map(
    packageName => getPackageJson(packageName)
  );

  const packageJsonList = await Promise.all(peerPromises);

  for (const packageJson of packageJsonList) {
    if (packageJson.peerDependencies) {
      for (const peerDependency of Object.keys(packageJson.peerDependencies)) {
        if (!dependencies[peerDependency]) {
          logger.info(`Adding package ${peerDependency} since it is a peer dependency of ${packageJson.name}...`);
          dependencies[peerDependency] = 'latest';
        }
      }
    }
  }
}

/**
 * Creates the dependencies and peerDependencies to be listed in the application's package.json file
 * given the packages that match the SKY UX components and types used by the application.
 * @param {*} packageList The list of packages to be installed for the application.
 */
async function createPackageJsonDependencies(packageList) {
  const dependencies = {
    '@angular/animations': '7.2.1',
    '@angular/common': '7.2.1',
    '@angular/compiler': '7.2.1',
    '@angular/core': '7.2.1',
    '@angular/forms': '7.2.1',
    '@angular/http': '7.2.1',
    '@angular/platform-browser': '7.2.1',
    '@angular/platform-browser-dynamic': '7.2.1',
    '@angular/router': '7.2.1',
    '@blackbaud/auth-client': 'latest',
    '@skyux/assets': 'latest',
    '@skyux/core': 'latest',
    '@skyux/http': 'latest',
    '@skyux/i18n': 'latest',
    '@skyux/omnibar-interop': 'latest',
    '@skyux/router': 'latest',
    '@skyux/theme': 'latest',
    'rxjs': '6.3.3',
    'rxjs-compat': '6.3.3',
    'zone.js': '0.8.27'
  };

  const devDependencies = {
    '@angular/compiler-cli': '7.2.1',
    '@pact-foundation/pact-web': '7.2.0',
    '@skyux-sdk/builder': 'latest',
    '@skyux-sdk/pact': 'latest',
    '@skyux-sdk/testing': 'latest',
    '@types/core-js': '2.5.0',
    'codelyzer': '4.5.0',
    'ts-node': '7.0.1',
    'tslint': '5.12.1',
    'typescript': '3.2.2'
  };

  for (const packageName of Object.keys(packageList)) {
    if (!packageMap.getPackage(packageName).skipInstall) {
      const dependenciesToUpdate = packageName.indexOf('@skyux-sdk/') === 0 ? devDependencies : dependencies;

      dependenciesToUpdate[packageName] = 'latest';
    }
  }

  logger.info('Adding peer dependencies for SKY UX packages...');

  await addSkyPeerDependencies(dependencies);
  await addSkyPeerDependencies(devDependencies);

  logger.info('Getting latest versions for SKY UX packages...');

  await setDependencyVersions(dependencies);
  await setDependencyVersions(devDependencies);

  return {
    dependencies,
    devDependencies
  };
}

module.exports = {
  createPackageJsonDependencies
};
