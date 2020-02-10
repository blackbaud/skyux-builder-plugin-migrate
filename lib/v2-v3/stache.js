const logger = require('@blackbaud/skyux-logger');
const findInFiles = require('find-in-files');
const fs = require('fs-extra');

const appDependencies = require('./app-dependencies');

async function renameDeprecatedComponents() {

  const componentSelectorMap = {
    'stache-code-block': 'sky-code-block',
    'stache-code': 'sky-code',
    'stache-column': 'sky-column',
    'stache-copy-to-clipboard': 'sky-copy-to-clipboard',
    'stache-hero': 'sky-hero',
    'stache-hero-heading': 'sky-hero-heading',
    'stache-hero-subheading': 'sky-hero-subheading',
    'stache-image': 'sky-image',
    'stache-internal': 'sky-restricted-view',
    'stache-row': 'sky-row',
    'stache-video': 'sky-video'
  };

  const stacheTags = Object.keys(componentSelectorMap);

  const results = await findInFiles.find(
    {
      term: `</?(${stacheTags.join('|')})(\\s|>)`,
      flags: 'g'
    },
    'src',
    '\\.html$'
  );

  for (const fileName of Object.keys(results)) {
    const matches = results[fileName].matches;

    let fileContents = await fs.readFile(
      fileName,
      'utf8'
    );

    matches.forEach((match) => {
      const stacheTag = stacheTags.find((stacheTag) => {
        return (match.indexOf(stacheTag) > -1);
      });

      const regexp = new RegExp(stacheTag, 'g');
      const replacement = match.replace(regexp, componentSelectorMap[stacheTag]);

      logger.info(`Renaming deprecated component from \`${match}\` to \`${replacement}\` in ${fileName}.`);

      fileContents = fileContents.replace(
        match,
        replacement
      );
    });

    await fs.writeFile(fileName, fileContents);
  }
}

async function updateStacheImportPaths() {
  const results = await findInFiles.find(
    {
      term: '(\'|")(@blackbaud/stache/?[A-z0-9/\\-\\.]*)(\'|")',
      flags: 'g'
    },
    'src',
    '\\.ts$'
  );

  for (const fileName of Object.keys(results)) {
    const matches = results[fileName].matches;

    let fileContents = await fs.readFile(
      fileName,
      'utf8'
    );

    matches.forEach((match) => {
      const replacement = '\'@blackbaud/skyux-lib-stache\'';

      logger.info(`Updating import path from \`${match}\` to \`${replacement}\` in ${fileName}.`);

      fileContents = fileContents.replace(
        match,
        replacement
      );
    });

    await fs.writeFile(fileName, fileContents);
  }

}

async function updatePackageDependencies(packageJson) {
  const dependencies = {
    '@blackbaud/skyux-lib-stache': 'latest'
  };

  if (
    packageJson.dependencies &&
    packageJson.dependencies['@blackbaud/skyux-builder-plugin-auth-email-whitelist']
  ) {
    dependencies['@blackbaud/skyux-builder-plugin-auth-email-whitelist'] = 'latest';
  }

  await appDependencies.upgradeDependencies(dependencies);

  Object.assign(packageJson, {
    dependencies
  });
}

function isStacheSpa(packageJson) {
  return !!(
    packageJson.dependencies !== undefined &&
    (
      packageJson.dependencies['@blackbaud/stache'] ||
      packageJson.dependencies['@blackbaud/skyux-lib-stache']
    )
  );
}

module.exports = {
  isStacheSpa,
  renameDeprecatedComponents,
  updateStacheImportPaths,
  updatePackageDependencies
};
