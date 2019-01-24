const logger = require('@blackbaud/skyux-logger');

const jsonUtils = require('./json-utils');

async function fixTsConfig() {

  const tsConfig = await jsonUtils.readJson('tsconfig.json');

  if (tsConfig) {
    logger.info('Fixing tsconfig.json extends path...');
    tsConfig.extends = './node_modules/@skyux-sdk/builder/tsconfig';

    await jsonUtils.writeJson(
      'tsconfig.json',
      tsConfig
    );
  }
}

module.exports = {
  fixTsConfig
};
