const logger = require('@blackbaud/skyux-logger');
const path = require('path');

const jsonUtils = require('./json-utils');

async function fixTsConfig() {

  const tsConfig = await jsonUtils.readJson(
    path.join('.', 'tsconfig.json')
  );

  if (tsConfig) {
    logger.info('Fixing tsconfig.json extends path...');
    tsConfig.extends = './node_modules/@skyux-sdk/builder/tsconfig';
  }

  await jsonUtils.writeJson(
    path.join('.', 'tsconfig.json'),
    tsConfig
  );
}

module.exports = {
  fixTsConfig
};
