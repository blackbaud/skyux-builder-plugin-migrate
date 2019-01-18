const logger = require('@blackbaud/skyux-logger');
const path = require('path');

const jsonUtils = require('./json-utils');

async function fixTsLint() {
  const tsLint = await jsonUtils.readJson(
    path.join('.', 'tslint.json')
  );

  if (tsLint && tsLint.extends === '@blackbaud/skyux-builder/tslint') {
    logger.info('Fixing tslint.json extends path...');

    tsLint.extends = '@skyux-sdk/builder/tslint';

    await jsonUtils.writeJson(
      path.join('.', 'tslint.json'),
      tsLint
    );
  }
}

module.exports = {
  fixTsLint
};
