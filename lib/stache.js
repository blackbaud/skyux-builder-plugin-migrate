const logger = require('@blackbaud/skyux-logger');
const findInFiles = require('find-in-files');
const fs = require('fs-extra');

async function renameDeprecatedComponents() {

  const componentSelectors = [
    'code',
    'code-block',
    'copy-to-clipboard',
    'hero',
    'hero-heading',
    'hero-subheading',
    'image',
    'video'
  ].join('|');

  const results = await findInFiles.find(
    {
      term: `</?stache-(${componentSelectors})(\\s|>)`,
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
      const replacement = match.replace(/stache/g, 'sky');

      logger.info(`Renaming deprecated component from \`${match}\` to \`${replacement}\` in ${fileName}.`);

      fileContents = fileContents.replace(
        match,
        replacement
      );
    });

    await fs.writeFile(fileName, fileContents);
  }
}

module.exports = {
  renameDeprecatedComponents
};
