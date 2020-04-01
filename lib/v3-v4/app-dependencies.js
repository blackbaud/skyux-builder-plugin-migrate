const latestVersion = require('latest-version');
const getPackageJson = require('package-json');
const logger = require('@blackbaud/skyux-logger');

const packageMap = require('./package-map');
const dependencyUtils = require('../dependency-utils');
const sortUtils = require('../sort-utils');

/**
 * Finds all dependencies with a version specified as "latest", looks up the package in the global
 * NPM registry, and replaces it with the actual version number of the latest version of the package.
 * @param {*} dependencies The dependencies with versions to resolve.
 */
async function setDependencyVersions(dependencies) {
  const packageNames = Object.keys(dependencies);

  const dependencyPromises = packageNames.map(
    packageName => dependencies[packageName].indexOf('.') < 0 ?
      latestVersion(
        packageName,
        {
          version: dependencies[packageName]
        }
      ) :
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
  let foundNewDependency = false;

  if (dependencies) {
    const skyPackageNames = Object.keys(dependencies).filter((packageName) => {
      return (
        packageName.indexOf('@skyux/') === 0 ||
        packageName.indexOf('@blackbaud/skyux-lib-') === 0
      );
    });

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
            foundNewDependency = true;
          }
        }
      }
    }

    await setDependencyVersions(dependencies);
  }

  dependencyUtils.fixDependencyOrder(dependencies);

  if (foundNewDependency) {
    // New dependencies were added, so we need to run the peer check again.
    await addSkyPeerDependencies(dependencies);
  }
}

/**
 * Creates the dependencies and peerDependencies to be listed in the application's package.json file
 * given the packages that match the SKY UX components and types used by the application.
 * @param {*} packageList The list of packages to be installed for the application.
 */
async function createPackageJsonDependencies(packageList) {
  const dependencies = {
    '@angular/animations': '9',
    '@angular/common': '9',
    '@angular/compiler': '9',
    '@angular/core': '9',
    '@angular/forms': '9',
    '@angular/http': '9',
    '@angular/platform-browser': '9',
    '@angular/platform-browser-dynamic': '9',
    '@angular/router': '9',
    '@blackbaud/auth-client': '2',
    '@skyux/assets': '4',
    '@skyux/core': '4',
    '@skyux/http': '4',
    '@skyux/i18n': '4',
    '@skyux/modals': '4',
    '@skyux/omnibar-interop': '4',
    '@skyux/router': '4',
    '@skyux/theme': '4',
    'rxjs': '6',
    'zone.js': '0.8.28'
  };

  const devDependencies = {
    '@angular/compiler-cli': '9',
    '@pact-foundation/pact': '7.2.0',
    '@pact-foundation/pact-web': '7.2.0',
    '@skyux-sdk/builder': '4',
    '@skyux-sdk/e2e': '4',
    '@skyux-sdk/pact': '4',
    '@skyux-sdk/testing': '4',
    'codelyzer': '4.5.0',
    'ts-node': '8.0.1',
    'tslint': '5.12.1',
    'typescript': '3.2.4'
  };

  for (const packageName of Object.keys(packageList)) {
    const packageConfig = packageMap.getPackage(packageName);
    const builderPlugins = packageConfig.builderPlugins;

    // Add any Builder plugins to dev dependencies.
    if (builderPlugins) {
      builderPlugins.forEach((plugin) => {
        delete dependencies[plugin];
        devDependencies[plugin] = 'latest';
      });
    }

    if (!packageConfig.skipInstall) {
      const dependenciesToUpdate = packageName.indexOf('@skyux-sdk/') === 0 ? devDependencies : dependencies;

      dependenciesToUpdate[packageName] = 'latest';
    }
  }

  logger.info('Getting latest versions for SKY UX packages...');

  // First, upgrade the packages to make sure we get their latest peer dependency requirements.
  await upgradeDependencies(dependencies);
  await upgradeDependencies(devDependencies);

  logger.info('Adding peer dependencies for SKY UX packages...');

  // Add the required peers to this project's dependencies.
  await addSkyPeerDependencies(dependencies);
  await addSkyPeerDependencies(devDependencies);

  return {
    dependencies,
    devDependencies
  };
}

async function upgradeDependencies(dependencies) {
  if (dependencies) {
    const dependencyPromises = [];

    // Make sure any versions listed as 'latest' are converted to
    // the numeric equivalent.
    await setDependencyVersions(dependencies);

    const packageNames = Object.keys(dependencies);

    for (const packageName of packageNames) {
      const currentVersion = dependencies[packageName];

      let dependencyPromise;

      if (/^[0-9]+\./.test(currentVersion)) {
        let majorVersion = currentVersion.split('.')[0];

        // Handle prerelease versions.
        if (/-(rc|alpha|beta)\./.test(currentVersion)) {
          majorVersion = `^${currentVersion}`;
        }

        logger.info(`Getting latest ${packageName} version for major version ${majorVersion}...`);

        dependencyPromise = latestVersion(
          packageName,
          {
            version: `${majorVersion}`
          }
        );
      } else {
        dependencyPromise = Promise.resolve(currentVersion);
      }

      dependencyPromises.push(dependencyPromise);
    }

    const versionNumbers = await Promise.all(dependencyPromises);

    packageNames.forEach((packageName, index) => {
      switch (packageName) {
        case 'typescript':
          logger.info('Skipping TypeScript because it does not use semantic versioning.');
          break;
        case 'zone.js':
          logger.info('Skipping Zone.js because Angular requires a specific minor version.');
          break;
        default:
          const versionNumber = versionNumbers[index];

          if (dependencies[packageName] === versionNumber) {
            logger.info(`Package ${packageName} already on latest version (${versionNumber})`);
          } else {
            logger.info(`Updating package ${packageName} to version ${versionNumber}`);
            dependencies[packageName] = versionNumber;
          }
      }
    });
  }

  dependencyUtils.fixDependencyOrder(dependencies);
}

module.exports = {
  createPackageJsonDependencies,
  upgradeDependencies,
  addSkyPeerDependencies
};
