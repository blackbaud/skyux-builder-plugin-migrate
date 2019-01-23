const logger = require('@blackbaud/skyux-logger');

const jsonUtils = require('./json-utils');

async function fixTsLint() {
  const tsLint = await jsonUtils.readJson('tslint.json');

  if (tsLint && tsLint.extends === '@blackbaud/skyux-builder/tslint') {
    logger.info('Fixing tslint.json extends path...');

    tsLint.extends = '@skyux-sdk/builder/tslint';

    await jsonUtils.writeJson(
      'tslint.json',
      tsLint
    );
  }
}

module.exports = {
  fixTsLint
};
