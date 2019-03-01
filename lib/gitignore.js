const fs = require('fs-extra');
const logger = require('@blackbaud/skyux-logger');

async function fixGitignore() {

  let gitignoreContents = '';

  if (await fs.exists('.gitignore')) {
    gitignoreContents = await fs.readFile('.gitignore', 'utf8');
  }

  if (gitignoreContents.indexOf('.skypagestmp') < 0) {
    logger.info('Adding .skypagestmp to .gitignore...');

    gitignoreContents = gitignoreContents.trim();

    if (gitignoreContents !== '') {
      gitignoreContents += '\n\n';
    }

    gitignoreContents += `# SKY UX temporary files
.skypagestmp
`;

    await fs.writeFile('.gitignore', gitignoreContents);
  }
}

module.exports = {
  fixGitignore
};
