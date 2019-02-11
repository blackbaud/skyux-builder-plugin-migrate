const jsonUtils = require('./json-utils');

async function updateSkyuxConfig() {
  const config = await jsonUtils.readJson('skyuxconfig.json') || {};

  // Add the $schema property to a new object, then copy properties from the current
  // config.  This will ensure the $schema property is the first property.
  const newConfig = {
    $schema: './node_modules/@skyux/config/skyuxconfig-schema.json'
  };

  Object.assign(newConfig, config);

  newConfig.$schema = './node_modules/@skyux/config/skyuxconfig-schema.json';

  newConfig.app = newConfig.app || {};
  newConfig.app.styles = newConfig.app.styles || [];

  const skyCssPath = '@skyux/theme/css/sky.css';

  if (newConfig.app.styles.indexOf(skyCssPath) < 0) {
    newConfig.app.styles.push(skyCssPath);
  }

  await jsonUtils.writeJson('skyuxconfig.json', newConfig);
}

module.exports = {
  updateSkyuxConfig
};
