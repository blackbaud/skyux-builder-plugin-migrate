const sortUtils = require('./sort-utils');

/**
 * Alphabetizes dependencies, similar to the behavior of `npm install <package> --save`.
 * @param {*} dependencies Dependencies to sort.
 */
function fixDependencyOrder(dependencies) {
  if (dependencies) {
    const sortedDependencies = sortUtils.sortedKeys(dependencies);

    for (const dependency of sortedDependencies) {
      const value = dependencies[dependency];

      delete dependencies[dependency];

      dependencies[dependency] = value;
    }
  }

  return dependencies;
}

module.exports = {
  fixDependencyOrder
};
