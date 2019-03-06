const logger = require('@blackbaud/skyux-logger');

const pluginVersion = require('../lib/plugin-version');
const appDependencies = require('../lib/app-dependencies');
const jsonUtils = require('../lib/json-utils');
const cleanup = require('../lib/cleanup');

async function upgrade() {
  await pluginVersion.verifyLatestVersion();

  const packageJson = await jsonUtils.readJson('package.json');

  await appDependencies.upgradeDependencies(packageJson.dependencies);
  await appDependencies.upgradeDependencies(packageJson.devDependencies);

  await appDependencies.addSkyPeerDependencies(packageJson.dependencies);
  await appDependencies.addSkyPeerDependencies(packageJson.devDependencies);

  await jsonUtils.writeJson('package.json', packageJson);

  await cleanup.deleteDependencies();

  let doneMsg = 'Done.';

  if (packageJson.devDependencies && packageJson.devDependencies['typescript']) {
    doneMsg += '  This project includes a reference to TypeScript, but its version ' +
    'was not updated automatically because TypeScript does not follow semantic versioning. ' +
    'If running `npm install` results in a peer dependency warning for TypeScript, you may ' +
    'need to update the version of TypeScript manually.';
  }

  logger.info(doneMsg);
}

module.exports = upgrade;
