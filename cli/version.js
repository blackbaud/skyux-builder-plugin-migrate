const logger = require('@blackbaud/skyux-logger');

const pluginVersion = require('../lib/plugin-version');

/**
 * Returns the version from package.json.
 * @name version
 */
async function version() {
  const packageJson = await pluginVersion.getPackageJson();

  logger.info('%s: %s', packageJson.name, packageJson.version);
}

module.exports = version;
