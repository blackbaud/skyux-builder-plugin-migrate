const sortUtils = require('./sort-utils');

/**
 * Generates source code for an Angular module that includes all SKY UX modules that match
 * the application's source code.
 * @param {*} packageList The list of packages to be installed for the application.
 */
function createAppSkyModule(isLib, packageList) {
  let tsImports = `import {
  NgModule
} from '@angular/core';

`;

  let angularModuleExports = [];

  for (const packageName of sortUtils.sortedKeys(packageList)) {
    const modulesToImport = packageList[packageName];

    if (modulesToImport.length > 0) {
      tsImports +=
`import {
  ${modulesToImport.join(',\n  ')}
} from '${packageName}';

`;
      angularModuleExports = [
        ...angularModuleExports,
        ...modulesToImport
      ];
    }
  }

  const ts =
`${tsImports}@NgModule({
  exports: [
    ${angularModuleExports.sort(sortUtils.stringCompare).join(',\n    ')}
  ]
})
export class AppSkyModule { }
`;

  return ts;
}

module.exports = {
  createAppSkyModule
};
