const findInFiles = require('find-in-files');
const fs = require('fs-extra');
const path = require('path');
const logger = require('@blackbaud/skyux-logger');

const jsonUtils = require('../json-utils');

// async function getPackageJson() {
//   const packageJson = await jsonUtils.readJson('package.json');

//   return packageJson;
// }

async function getSkyuxConfigJson() {
  const skyxuConfigJson = await jsonUtils.readJson('skyuxconfig.json');

  return skyxuConfigJson;
}

function fixOmnibar(packageJson) {
  if (packageJson.omnibar && packageJson.omnibar.experimental) {
    delete packageJson.omnibar.experimental;
  }
}

async function fixSassDeep() {
  const results = await findInFiles.find(
    {
      term: '(/deep/|>>>)',
      flags: 'g'
    },
    'src',
    '\\.scss$'
  );

  for (const fileName of Object.keys(results)) {
    logger.info(`Updating /deep/ selectors in ${fileName}...`);

    let fileContents = await fs.readFile(fileName, 'utf8');

    fileContents = fileContents.replace(/(\/deep\/|>>>)/g, '::ng-deep');

    fs.writeFile(fileName, fileContents);
  }
}

async function migrate() {
  const skyxuConfigJson = await getSkyuxConfigJson();

  fixOmnibar(skyxuConfigJson);

  await fixSassDeep();

  await jsonUtils.writeJson(
    'skyuxconfig.json',
    skyxuConfigJson
  );
}

module.exports = migrate;
