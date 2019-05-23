const mock = require('mock-require');
const path = require('path');

describe('Migrate', () => {
  let migrate;
  let fsExtraMock;
  let appDependenciesMock;
  let appSkyModuleMock;
  let packageMapMock;
  let importPathsMock;
  let jsonUtilsMock;
  let skyuxConfigMock;
  let tsConfigMock;
  let tsLintMock;
  let webpackMock;
  let nvmrcMock;
  let gitignoreMock;
  let pluginVersionMock;
  let cleanupMock;
  let stacheUtilsMock;

  beforeEach(() => {
    fsExtraMock = {
      readFile: jasmine.createSpy('readFile').and.returnValue(
        `import {
  NgModule
} from '@angular/core';

@NgModule({
  exports: []
})
export class AppExtrasModule { }
`
      ),
      writeFile: jasmine.createSpy('writeFile'),
      exists: jasmine.createSpy('exists').and.callFake(async (filePath) => {
        if (filePath === path.join('src', 'app', 'app-extras.module.ts') ) {
          return Promise.resolve(true);
        }

        return Promise.resolve(false);
      })
    };

    cleanupMock = {
      deleteDependencies: jasmine.createSpy('deleteDependencies')
    };

    appDependenciesMock = {
      createPackageJsonDependencies: jasmine.createSpy('createPackageJsonDependencies').and.returnValue({
        dependencies: {
          '@skyux/core': '3.0.5',
          '@skyux/flyout': '3.0.1'
        },
        devDependencies: {
          '@skyux-sdk/builder': '3.0.0'
        }
      }),
      fixDependencyOrder: jasmine.createSpy('fixDependencyOrder')
    };

    jsonUtilsMock = {
      readJson: jasmine.createSpy('readJson').and.returnValue({
        name: '@blackbaud/skyux-spa-migrate-unit-test',
        dependencies: {
          '@blackbaud/skyux': '2.30.0'
        },
        devDependencies: {
          '@blackbaud/skyux-builder': '1.40.0'
        }
      }),
      writeJson: jasmine.createSpy('writeJson')
    };

    packageMapMock = {
      createPackageList: jasmine.createSpy('createPackageList').and.returnValue({
        '@skyux/flyout': [
          'SkyFlyoutModule'
        ]
      }),
      getPackage: jasmine.createSpy('getPackage').and.returnValue({
        package: '@skyux/flyout',
        modules: [
          {
            name: 'SkyFlyoutModule',
            matches: [
              'sky-flyout',
              'SkyFlyout'
            ]
          }
        ]
      })
    };

    importPathsMock = {
      fixImportPaths: jasmine.createSpy('fixImportPaths')
    };

    skyuxConfigMock = {
      updateSkyuxConfig: jasmine.createSpy('updateSkyuxConfig')
    };

    webpackMock = {
      fixLoaders: jasmine.createSpy('fixLoaders')
    };

    tsConfigMock = {
      fixTsConfig: jasmine.createSpy('fixTsConfig')
    };

    tsLintMock = {
      fixTsLint: jasmine.createSpy('fixTsLint')
    };

    nvmrcMock = {
      updateNvmrc: jasmine.createSpy('updateNvmrc')
    };

    gitignoreMock = {
      fixGitignore: jasmine.createSpy('fixGitignore')
    };

    pluginVersionMock = {
      verifyLatestVersion: jasmine.createSpy('verifyLatestVersion')
    };

    stacheUtilsMock = {
      isStacheSpa: jasmine.createSpy('isStacheSpa').and.returnValue(false),
      renameDeprecatedComponents: jasmine.createSpy('renameDeprecatedComponents'),
      updateStacheImportPaths: jasmine.createSpy('updateStacheImportPaths'),
      updatePackageDependencies: jasmine.createSpy('updatePackageDependencies')
    };

    appSkyModuleMock = {
      createAppSkyModule: jasmine.createSpy('createAppSkyModule').and.callFake((isLib, packageList) => {
        return Object.keys(packageList).map((packageName) => {
          return `import { ${packageList[packageName]} } from '${packageName}';`;
        }).join('\n');
      })
    };

    mock('fs-extra', fsExtraMock);

    mock('../../lib/app-dependencies', appDependenciesMock);
    mock('../../lib/app-sky-module', appSkyModuleMock);
    mock('../../lib/package-map', packageMapMock);
    mock('../../lib/import-paths', importPathsMock);
    mock('../../lib/json-utils', jsonUtilsMock);
    mock('../../lib/skyux-config', skyuxConfigMock);
    mock('../../lib/tsconfig', tsConfigMock);
    mock('../../lib/tslint', tsLintMock);
    mock('../../lib/webpack', webpackMock);
    mock('../../lib/nvmrc', nvmrcMock);
    mock('../../lib/gitignore', gitignoreMock);
    mock('../../lib/plugin-version', pluginVersionMock);
    mock('../../lib/cleanup', cleanupMock);
    mock('../../lib/stache', stacheUtilsMock);

    migrate = mock.reRequire('../../cli/migrate');
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should migrate an application', async () => {
    await migrate();

    expect(jsonUtilsMock.writeJson).toHaveBeenCalledWith(
      'package.json',
      {
        name: '@blackbaud/skyux-spa-migrate-unit-test',
        dependencies: {
          '@skyux/core': '3.0.5',
          '@skyux/flyout': '3.0.1'
        },
        devDependencies: {
          '@skyux-sdk/builder': '3.0.0'
        }
      }
    );

    expect(fsExtraMock.writeFile).toHaveBeenCalledWith(
      path.join('src', 'app', 'app-extras.module.ts'),
      `import {
  NgModule
} from '@angular/core';

import {
  AppSkyModule
} from './app-sky.module';

@NgModule({
  exports: [
    AppSkyModule
  ]
})
export class AppExtrasModule { }
`
    );

    expect(pluginVersionMock.verifyLatestVersion).toHaveBeenCalled();
    expect(skyuxConfigMock.updateSkyuxConfig).toHaveBeenCalled();
    expect(nvmrcMock.updateNvmrc).toHaveBeenCalled();
    expect(gitignoreMock.fixGitignore).toHaveBeenCalled();
  });

  it('should add dependencies and devDependencies if none are specified', async () => {
    jsonUtilsMock.readJson.and.returnValue({
      name: '@blackbaud/skyux-spa-migrate-unit-test'
    });

    await migrate();

    expect(jsonUtilsMock.writeJson).toHaveBeenCalledWith(
      'package.json',
      {
        name: '@blackbaud/skyux-spa-migrate-unit-test',
        dependencies: {
          '@skyux/core': '3.0.5',
          '@skyux/flyout': '3.0.1'
        },
        devDependencies: {
          '@skyux-sdk/builder': '3.0.0'
        }
      }
    );
  });

  it('should add an exports section to app extras if one is not present', async () => {
    fsExtraMock.readFile.and.returnValue(
      `import {
  NgModule
} from '@angular/core';

@NgModule({})
export class AppExtrasModule { }
`
    );

    await migrate();

    expect(fsExtraMock.writeFile).toHaveBeenCalledWith(
      path.join('src', 'app', 'app-extras.module.ts'),
      `import {
  NgModule
} from '@angular/core';

import {
  AppSkyModule
} from './app-sky.module';

@NgModule({
  exports: [
    AppSkyModule
  ]
})
export class AppExtrasModule { }
`
    );
  });

  it('should add an exports section to app extras with a comma if other properties are present', async () => {
    fsExtraMock.readFile.and.returnValue(
      `import {
  NgModule
} from '@angular/core';

@NgModule({
  providers: [
    FooService
  ]
})
export class AppExtrasModule { }
`
    );

    await migrate();

    expect(fsExtraMock.writeFile).toHaveBeenCalledWith(
      path.join('src', 'app', 'app-extras.module.ts'),
      `import {
  NgModule
} from '@angular/core';

import {
  AppSkyModule
} from './app-sky.module';

@NgModule({
  exports: [
    AppSkyModule
  ],
  providers: [
    FooService
  ]
})
export class AppExtrasModule { }
`
    );
  });

  it('should preserve existing app extras exports', async () => {
    fsExtraMock.readFile.and.returnValue(
      `import {
  NgModule
} from '@angular/core';

import {
  FooModule
} from 'foo';

@NgModule({
  exports: [
    FooModule
  ]
})
export class AppExtrasModule { }
`
    );

    await migrate();

    expect(fsExtraMock.writeFile).toHaveBeenCalledWith(
      path.join('src', 'app', 'app-extras.module.ts'),
      `import {
  NgModule
} from '@angular/core';

import {
  FooModule
} from 'foo';

import {
  AppSkyModule
} from './app-sky.module';

@NgModule({
  exports: [
    AppSkyModule,
    FooModule
  ]
})
export class AppExtrasModule { }
`
    );
  });

  it('should create an app extras module if one does not exist', async () => {
    fsExtraMock.exists.and.returnValue(false);

    await migrate();

    expect(fsExtraMock.writeFile).toHaveBeenCalledWith(
      path.join('src', 'app', 'app-extras.module.ts'),
      `import {
  NgModule
} from '@angular/core';

import {
  AppSkyModule
} from './app-sky.module';

@NgModule({
  exports: [
    AppSkyModule
  ]
})
export class AppExtrasModule { }
`
    );
  });

  it('should delete the package-lock.json file and node_modules folder', async () => {
    fsExtraMock.exists.and.returnValue(true);

    await migrate();

    expect(cleanupMock.deleteDependencies).toHaveBeenCalled();
  });

  it('should handle dependencies when the SKY UX application is a library', async () => {
    jsonUtilsMock.readJson.and.returnValue({
      name: '@blackbaud/skyux-lib-migrate-unit-test',
      devDependencies: {
        '@blackbaud/skyux': '2.30.0',
        '@blackbaud/skyux-builder': '1.40.0'
      }
    });

    await migrate();

    expect(jsonUtilsMock.writeJson).toHaveBeenCalledWith(
      'package.json',
      {
        name: '@blackbaud/skyux-lib-migrate-unit-test',
        dependencies: {
        },
        devDependencies: {
          '@skyux/flyout': '3.0.1',
          '@skyux/core': '3.0.5',
          '@skyux-sdk/builder': '3.0.0'
        },
        peerDependencies: {
          '@skyux/flyout': '^3.0.1',
          '@skyux-sdk/builder': '^3.0.0'
        }
      }
    );
  });

  it('should not add AppSkyModule to app extras if it already exists', async () => {
    fsExtraMock.readFile.and.returnValue(
      `import {
  NgModule
} from '@angular/core';

import {
  AppSkyModule
} from './app-sky.module';

@NgModule({
  exports: [
    AppSkyModule
  ]
  providers: [
    FooService
  ]
})
export class AppExtrasModule { }
`
    );

    await migrate();

    expect(fsExtraMock.writeFile).not.toHaveBeenCalledWith(
      path.join('src', 'app', 'app-extras.module.ts'),
      jasmine.any(String)
    );
  });

  it('should remove deprecated dependencies', async () => {
    jsonUtilsMock.readJson.and.returnValue({
      name: '@blackbaud/skyux-spa-migrate-unit-test',
      dependencies: {
        '@blackbaud/skyux-builder': '1.0.0',
        '@blackbaud/skyux': '1.0.0',
        '@blackbaud/stache': '1.0.0'
      },
      devDependencies: {
        '@blackbaud/skyux-builder': '1.0.0',
        '@blackbaud/skyux': '1.0.0',
        '@blackbaud/stache': '1.0.0'
      },
      peerDependencies: {
        '@blackbaud/skyux-builder': '1.0.0',
        '@blackbaud/skyux': '1.0.0',
        '@blackbaud/stache': '1.0.0'
      }
    });

    await migrate();

    expect(jsonUtilsMock.writeJson).toHaveBeenCalledWith(
      'package.json',
      {
        name: '@blackbaud/skyux-spa-migrate-unit-test',
        dependencies: {
          '@skyux/core': '3.0.5',
          '@skyux/flyout': '3.0.1'
        },
        devDependencies: {
          '@skyux-sdk/builder': '3.0.0'
        },
        peerDependencies: { }
      }
    );
  });

  it('should rename deprecated stache tags and imports if stache SPA', async () => {
    stacheUtilsMock.isStacheSpa.and.returnValue(true);

    await migrate();

    expect(stacheUtilsMock.renameDeprecatedComponents).toHaveBeenCalled();
    expect(stacheUtilsMock.updateStacheImportPaths).toHaveBeenCalled();
  });

  it('should not include StacheModule in AppSkyModule', async () => {
    packageMapMock.createPackageList.and.returnValue({
      '@skyux/flyout': [
        'SkyFlyoutModule'
      ],
      '@blackbaud/skyux-lib-stache': [
        'StacheModule'
      ]
    });

    stacheUtilsMock.isStacheSpa.and.returnValue(true);

    await migrate();

    expect(appSkyModuleMock.createAppSkyModule).toHaveBeenCalledWith(false, {
      '@skyux/flyout': [ 'SkyFlyoutModule' ]
    });

    expect(fsExtraMock.writeFile.calls.argsFor(0)[1]).not.toContain('StacheModule');
  });
});
