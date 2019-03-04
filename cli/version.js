const path = require('path');
const logger = require('@blackbaud/skyux-logger');

const jsonUtils = require('../lib/json-utils');

/**
 * Returns the version from package.json.
 * @name version
 */
async function version() {
  const packageJson = await jsonUtils.readJson(
    path.resolve(__dirname, '..', 'package.json')
  );

  logger.info('%s: %s', packageJson.name, packageJson.version);
}

module.exports = version;
