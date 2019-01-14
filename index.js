'use strict';

const fs = require('fs-extra');
const logger = require('@blackbaud/skyux-logger');
const packageMap = require('./lib/package-map');
const importPaths = require('./lib/import-paths');
const sortUtils = require('./lib/sort-utils');
const appSkyModule = require('./lib/app-sky-module');
const appDependencies = require('./lib/app-dependencies');

/**
 * Alphabetizes dependencies, similar to the behavior of `npm install <package> --save`.
 * @param {*} dependencies Dependencies to sort.
 */
function fixDependencyOrder(dependencies) {
  const sortedDependencies = sortUtils.sortedKeys(dependencies);

  for (const dependency of sortedDependencies) {
    const value = dependencies[dependency];

    delete dependencies[dependency];

    dependencies[dependency] = value;
  }

  return dependencies;
}

/**
 * Updates the application's package.json dependencies and writes it to disk.
 * @param {*} dependencies
 */
async function writePackageJson(dependencies) {
  const packageJson = await fs.readJson('./package.json');

  delete packageJson.dependencies['@blackbaud/skyux'];
  delete packageJson.devDependencies['@blackbaud/skyux-builder'];

  for (const dependency of sortUtils.sortedKeys(dependencies.dependencies)) {
    packageJson.dependencies[dependency] = dependencies.dependencies[dependency];
  }

  for (const dependency of sortUtils.sortedKeys(dependencies.devDependencies)) {
    packageJson.devDependencies[dependency] = dependencies.devDependencies[dependency];
  }

  // Alphabetize the dependencies before writing them to disk.
  fixDependencyOrder(packageJson.dependencies);
  fixDependencyOrder(packageJson.devDependencies);

  await fs.writeJson(
    './package.json',
    packageJson, {
      spaces: 2
    }
  );
}

async function updateAppExtras() {
  let source = await fs.readFile('./src/app/app-extras.module.ts', 'utf8');

  // Get the NgModule decorator source.
  const ngModuleMatches = source.match(/@NgModule\s*\([\s\S]+\)/g);

  let ngModuleSource = ngModuleMatches[0];

  // Ensure the NgModel decorator has an `exports` section.
  const exportsMatches = ngModuleSource.match(/(exports\s*:\s*\[[\s\S]*\])/g);

  let exportsSource;

  if (exportsMatches) {
    exportsSource = exportsMatches[0];
  } else {
    const ngModuleSourceStart = ngModuleSource.substr(0, ngModuleSource.indexOf('{') + 1);

    exportsSource = `
  exports: [
  ],`;

    ngModuleSource = ngModuleSource.replace(ngModuleSourceStart, ngModuleSourceStart + exportsSource);
  }

  // Add the `AppSkyModule` to exports.
  const exportsSourceStart = exportsSource.substr(0, exportsSource.indexOf('[') + 1);

  ngModuleSource = `import {
  AppSkyModule
} from './app-sky.module';

` +
  ngModuleSource.replace(
    exportsSourceStart,
    exportsSourceStart + `
    AppSkyModule,`
  );

  source = source.replace(ngModuleMatches[0], ngModuleSource);

  await fs.writeFile('./src/app/app-extras.module.ts', source);
}

/**
 * Migrates the application from SKY UX 2 to SKY UX 3.
 */
async function migrate() {
  const packageList = await packageMap.createPackageList();

  // Create Angular module file.
  const moduleSource = appSkyModule.createAppSkyModule(packageList);

  await fs.writeFile('./src/app/app-sky.module.ts', moduleSource);

  // Update package.json dependencies and devDependencies.
  const dependencies = await appDependencies.createPackageJsonDependencies(packageList);

  await writePackageJson(dependencies);

  await updateAppExtras();

  await importPaths.fixImportPaths();

  if (await fs.exists('./package-lock.json')) {
    logger.info('Deleting package-lock.json file...');
    await fs.unlink('./package-lock.json');
  }

  if (await fs.exists('./node_modules')) {
    logger.info('Deleting node_modules directory...');
    await fs.remove('./node_modules');
  }

  logger.info('Done. For next steps, see the SKY UX migration guide at https://developer.blackbaud.com/skyux/migration-guide');
}

function runCommand(command) {
  switch (command) {
    case 'migrate':
      migrate();
      break;
    default:
      return false;
  }

  return true;
}

module.exports = {
  runCommand
};
