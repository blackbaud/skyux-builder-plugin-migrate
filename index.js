'use strict';

const fs = require('fs-extra');
const path = require('path');
const logger = require('@blackbaud/skyux-logger');

const packageMap = require('./lib/package-map');
const importPaths = require('./lib/import-paths');
const sortUtils = require('./lib/sort-utils');
const appSkyModule = require('./lib/app-sky-module');
const appDependencies = require('./lib/app-dependencies');
const jsonUtils = require('./lib/json-utils');
const tsConfig = require('./lib/tsconfig');
const tsLint = require('./lib/tslint');
const webpack = require('./lib/webpack');

/**
 * Alphabetizes dependencies, similar to the behavior of `npm install <package> --save`.
 * @param {*} dependencies Dependencies to sort.
 */
function fixDependencyOrder(dependencies) {
  if (dependencies) {
    const sortedDependencies = sortUtils.sortedKeys(dependencies);

    for (const dependency of sortedDependencies) {
      const value = dependencies[dependency];

      delete dependencies[dependency];

      dependencies[dependency] = value;
    }
  }

  return dependencies;
}

async function getPackageJson() {
  const packageJson = await jsonUtils.readJson(path.join('.', 'package.json'));

  return packageJson;
}

function removeDependency(packageJson, packageName) {
  delete packageJson.dependencies[packageName];
  delete packageJson.devDependencies[packageName];
  delete packageJson.peerDependencies[packageName];
}

/**
 * Updates the application's package.json dependencies and writes it to disk.
 * @param {*} dependencies
 */
async function writePackageJson(packageJson, isLib, dependencies, packageList) {
  packageJson.dependencies = packageJson.dependencies || {};
  packageJson.devDependencies = packageJson.devDependencies || {};

  if (isLib) {
    packageJson.peerDependencies = packageJson.peerDependencies || {};
  }

  removeDependency(packageJson, '@blackbaud/skyux');
  removeDependency(packageJson, '@blackbaud/skyux-builder');

  for (const dependency of sortUtils.sortedKeys(dependencies.dependencies)) {
    if (isLib) {
      packageJson.devDependencies[dependency] = dependencies.dependencies[dependency];

      if (packageList[dependency]) {
        packageJson.peerDependencies[dependency] = '^' + dependencies.dependencies[dependency];
      }
    } else {
      packageJson.dependencies[dependency] = dependencies.dependencies[dependency];
    }
  }

  for (const dependency of sortUtils.sortedKeys(dependencies.devDependencies)) {
    packageJson.devDependencies[dependency] = dependencies.devDependencies[dependency];
  }

  if (isLib) {
    packageJson.peerDependencies['@skyux-sdk/builder'] = packageJson.devDependencies['@skyux-sdk/builder'];
  }

  // Alphabetize the dependencies before writing them to disk.
  fixDependencyOrder(packageJson.dependencies);
  fixDependencyOrder(packageJson.devDependencies);
  fixDependencyOrder(packageJson.peerDependencies);

  await jsonUtils.writeJson(
    path.join('.', 'package.json'),
    packageJson
  );
}

async function updateAppExtras() {
  let source = await fs.readFile(
    path.join('.', 'src', 'app', 'app-extras.module.ts'),
    'utf8'
  );

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

  await fs.writeFile(
    path.join('.', 'src', 'app', 'app-extras.module.ts'),
    source
  );
}

/**
 * Migrates the application from SKY UX 2 to SKY UX 3.
 */
async function migrate() {
  const packageJson = await getPackageJson();

  const isLib = packageJson.name.indexOf('/skyux-lib') >= 0;

  const packageList = await packageMap.createPackageList();

  // Create Angular module file.
  const moduleSource = appSkyModule.createAppSkyModule(isLib, packageList);

  await fs.writeFile(
    path.join('.', 'src', 'app', 'app-sky.module.ts'),
    moduleSource
  );

  // Update package.json dependencies and devDependencies.
  const dependencies = await appDependencies.createPackageJsonDependencies(packageList);

  await writePackageJson(packageJson, isLib, dependencies, packageList);

  await updateAppExtras();

  await importPaths.fixImportPaths();

  await webpack.fixLoaders();

  await tsConfig.fixTsConfig();

  await tsLint.fixTsLint();

  const packageLockPath = path.join('.', 'package-lock.json');

  if (await fs.exists(packageLockPath)) {
    logger.info('Deleting package-lock.json file...');
    await fs.unlink(packageLockPath);
  }

  const nodeModulesPath = path.join('.', 'node_modules');

  if (await fs.exists(nodeModulesPath)) {
    logger.info('Deleting node_modules directory...');
    await fs.remove(nodeModulesPath);
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
