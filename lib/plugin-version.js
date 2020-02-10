const path = require('path');
const getLatestVersion = require('latest-version');

const jsonUtils = require('./json-utils');

async function getPackageJson() {
  const packageJson = await jsonUtils.readJson(
    path.resolve(__dirname, '..', 'package.json')
  );

  return packageJson;
}

async function verifyLatestVersion() {
  const packageJson = await getPackageJson();

  const latestVersion = await getLatestVersion(packageJson.name);

  if (latestVersion !== packageJson.version) {
    throw new Error(
      'You are using an outdated version of the migration utility.  Please upgrade ' +
      'the migration utility by running `npm i -g ' +
      packageJson.name +
      '@latest`,  then try running the migration again.\nCurrent version: ' +
      packageJson.version +
      '\nLatest version: ' +
      latestVersion
    );
  }
}

module.exports = {
  getPackageJson,
  verifyLatestVersion
};
