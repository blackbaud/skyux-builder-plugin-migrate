const jsonUtils = require('./json-utils');

async function updateSkyuxConfig() {
  const config = await jsonUtils.readJson('skyuxconfig.json') || {};

  config.app = config.app || {};
  config.app.styles = config.app.styles || [];

  const skyCssPath = '@skyux/theme/css/sky.css';

  if (config.app.styles.indexOf(skyCssPath) < 0) {
    config.app.styles.push(skyCssPath);
  }

  await jsonUtils.writeJson('skyuxconfig.json', config);
}

module.exports = {
  updateSkyuxConfig
};
