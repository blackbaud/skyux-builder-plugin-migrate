const fs = require('fs-extra');
const logger = require('@blackbaud/skyux-logger');

async function updateNvmrc() {
  const version = 'lts/dubnium';

  logger.log(`Updating .nvmrc file to ${version}...`);

  await fs.writeFile('.nvmrc', version);
}

module.exports = {

  updateNvmrc

};
