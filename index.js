async function runCommand(command) {
  switch (command) {
    case 'migrate':
      await require('./cli/migrate')();
      break;
    case 'version':
      await require('./cli/version')();
      break;
    default:
      return false;
  }

  return true;
}

module.exports = {
  runCommand
};
