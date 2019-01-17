const logger = require('@blackbaud/skyux-logger');
const fs = require('fs-extra');
const findInFiles = require('find-in-files');

async function fixLoaders() {
  const results = await findInFiles.find(
    {
      term:'json-loader!',
      flags: 'g'
    },
    './src',
    '\\.ts$'
  );

  for (const fileName of Object.keys(results)) {
    logger.info(`Removing json-loader prefix in ${fileName}...`);

    const matches = results[fileName].matches;

    let fileContents = await fs.readFile('./' + fileName, 'utf8');

    // Rem
    matches.forEach((match) => {
      fileContents = fileContents.replace(
        match,
        ''
      );
    });

    await fs.writeFile(fileName, fileContents);
  }
}

module.exports = {
  fixLoaders
};
