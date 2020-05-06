async function runCommand(command) {
  switch (command) {
    case 'migrate':
    case 'upgrade':
    case 'version':
      throw new Error('The `@skyux-sdk/builder-plugin-migrate` is no longer needed or maintained. Please run `npm uninstall -g @skyux-sdk/builder-plugin-migrate` to remove it from your system.');
    default:
      return false;
  }
}

module.exports = {
  runCommand
};
