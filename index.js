async function runCommand(command) {
  switch (command) {
    case 'migrate':
      await require('./cli/migrate')();
      break;
    case 'upgrade':
      await require('./cli/upgrade')();
      break;
    default:
      return false;
  }

  return true;
}

module.exports = {
  runCommand
};
