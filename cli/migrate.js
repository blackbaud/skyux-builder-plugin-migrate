const pluginVersion = require('../lib/plugin-version');
const jsonUtils = require('../lib/json-utils');

function findDependencyVersion(packageJson, packageName) {
  function findPackageIn(dependencySection) {
    if (packageJson[dependencySection]) {
      return packageJson[dependencySection][packageName];
    }
  }

  return findPackageIn('dependencies') || findPackageIn('devDependencies');
}

/**
 * Migrates the application to the next version of SKY UX.
 */
async function migrate() {
  await pluginVersion.verifyLatestVersion();

  const packageJson = await jsonUtils.readJson('package.json');

  const skyuxBuilderVersion = findDependencyVersion(packageJson, '@blackbaud/skyux-builder');

  if (skyuxBuilderVersion) {
    return require('../lib/v2-v3/migrate')();
  }

  const skyuxSdkBuilderVersion = findDependencyVersion(packageJson, '@skyux-sdk/builder');

  if (skyuxSdkBuilderVersion) {
    return require('../lib/v3-v4/migrate')();
  }

  throw new Error('No compatible version of SKY UX was found.');
}

module.exports = migrate;
