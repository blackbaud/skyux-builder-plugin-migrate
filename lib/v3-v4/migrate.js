const jsonUtils = require('../json-utils');
const icons = require('./icons');
const stylesheets = require('./stylesheets');

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

async function migrate() {
  const skyxuConfigJson = await getSkyuxConfigJson();

  fixOmnibar(skyxuConfigJson);

  await stylesheets.fixSassDeep();

  await icons.migrateIcons();

  await jsonUtils.writeJson(
    'skyuxconfig.json',
    skyxuConfigJson
  );
}

module.exports = migrate;
