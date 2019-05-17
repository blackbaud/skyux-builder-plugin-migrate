const fs = require('fs-extra');
const path = require('path');
const logger = require('@blackbaud/skyux-logger');

const pluginVersion = require('../lib/plugin-version');
const packageMap = require('../lib/package-map');
const importPaths = require('../lib/import-paths');
const sortUtils = require('../lib/sort-utils');
const appSkyModule = require('../lib/app-sky-module');
const appDependencies = require('../lib/app-dependencies');
const jsonUtils = require('../lib/json-utils');
const skyuxConfig = require('../lib/skyux-config');
const tsConfig = require('../lib/tsconfig');
const tsLint = require('../lib/tslint');
const webpack = require('../lib/webpack');
const nvmrc = require('../lib/nvmrc');
const gitignore = require('../lib/gitignore');
const cleanup = require('../lib/cleanup');

async function getPackageJson() {
  const packageJson = await jsonUtils.readJson('package.json');

  return packageJson;
}

function removeDependency(packageJson, packageName) {
  function deletePackageIn(dependencySection) {
    if (packageJson[dependencySection]) {
      delete packageJson[dependencySection][packageName];
    }
  }

  deletePackageIn('dependencies');
  deletePackageIn('devDependencies');
  deletePackageIn('peerDependencies');
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
    packageJson.peerDependencies['@skyux-sdk/builder'] = '^' + packageJson.devDependencies['@skyux-sdk/builder'];
  }

  // Alphabetize the dependencies before writing them to disk.
  appDependencies.fixDependencyOrder(packageJson.dependencies);
  appDependencies.fixDependencyOrder(packageJson.devDependencies);
  appDependencies.fixDependencyOrder(packageJson.peerDependencies);

  await jsonUtils.writeJson(
    'package.json',
    packageJson
  );
}

async function updateAppExtras() {
  const appExtrasPath = path.join('src', 'app', 'app-extras.module.ts');

  let source;

  if (await fs.exists(appExtrasPath)) {
    source = await fs.readFile(
      appExtrasPath,
      'utf8'
    );

    if (source.indexOf('AppSkyModule') >= 0) {
      logger.info(
        'It appears the migration plugin has already run on this project.  Skipping adding AppSkyModule to AppExtrasModule.'
      );

      return;
    }

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
      const ngModuleSourceEnd = ngModuleSource.substr(ngModuleSourceStart.length);

      const hasOtherModuleProps = ngModuleSourceEnd.replace(/\s/g, '') !== '})';

      exportsSource = `
  exports: []${hasOtherModuleProps ? ',' : '\n'}`;

      ngModuleSource = ngModuleSource.replace(ngModuleSourceStart, ngModuleSourceStart + exportsSource);
    }

    // Add the `AppSkyModule` to exports.
    const exportsSourceStart = exportsSource.substr(0, exportsSource.indexOf('[') + 1);
    const exportsSourceEnd = exportsSource.substring(exportsSourceStart.length, exportsSource.indexOf(']') + 1);

    ngModuleSource = `import {
  AppSkyModule
} from './app-sky.module';

` +
    ngModuleSource.replace(
      exportsSourceStart,
      exportsSourceStart + `
    AppSkyModule${exportsSourceEnd === ']' ? '\n  ' : ','}`
    );

    source = source.replace(ngModuleMatches[0], ngModuleSource);
  } else {
    source = `import {
  NgModule
} from '@angular/core';

import {
  AppSkyModule
} from './app-sky.module';

@NgModule({
  exports: [
    AppSkyModule
  ]
})
export class AppExtrasModule { }
`;
  }

  await fs.writeFile(
    appExtrasPath,
    source
  );
}

/**
 * Migrates the application from SKY UX 2 to SKY UX 3.
 */
async function migrate() {
  await pluginVersion.verifyLatestVersion();

  const packageJson = await getPackageJson();

  const isLib = packageJson.name.indexOf('/skyux-lib') >= 0;

  const packageList = await packageMap.createPackageList();

  // Create Angular module file.
  const moduleSource = appSkyModule.createAppSkyModule(isLib, packageList);

  await fs.writeFile(
    path.join('src', 'app', 'app-sky.module.ts'),
    moduleSource
  );

  // Update package.json dependencies and devDependencies.
  const dependencies = await appDependencies.createPackageJsonDependencies(packageList);

  await writePackageJson(packageJson, isLib, dependencies, packageList);

  await updateAppExtras();

  await skyuxConfig.updateSkyuxConfig();

  await importPaths.fixImportPaths();

  await webpack.fixLoaders();

  await tsConfig.fixTsConfig();

  await tsLint.fixTsLint();

  await nvmrc.updateNvmrc();

  await gitignore.fixGitignore();

  await cleanup.deleteDependencies();

  logger.info('Done. For next steps, see the SKY UX migration guide at https://developer.blackbaud.com/skyux-migration-guide');
}

module.exports = migrate;
