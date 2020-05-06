function runCommand(command) {
  switch (command) {
    case 'migrate':
    case 'version':
      throw new Error('The globally-installed `@skyux-sdk/builder-plugin-migrate` package is no longer needed or maintained. Please run `npm uninstall -g @skyux-sdk/builder-plugin-migrate` to remove it from your system.');
    default:
      return false;
  }
}

module.exports = {
  runCommand
};
