const mock = require('mock-require');
const path = require('path');

describe('Index', () => {
  let index;
  let fsExtraMock;
  let appDependenciesMock;
  let packageMapMock;
  let importPathsMock;
  let jsonUtilsMock;
  let tsConfigMock;
  let tsLintMock;
  let webpackMock;

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
      }),
      unlink: jasmine.createSpy('unlink'),
      remove: jasmine.createSpy('remove')
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
      })
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

    webpackMock = {
      fixLoaders: jasmine.createSpy('fixLoaders')
    };

    tsConfigMock = {
      fixTsConfig: jasmine.createSpy('fixTsConfig')
    };

    tsLintMock = {
      fixTsLint: jasmine.createSpy('fixTsLint')
    };

    mock('fs-extra', fsExtraMock);

    mock('../lib/app-dependencies', appDependenciesMock);
    mock('../lib/package-map', packageMapMock);
    mock('../lib/import-paths', importPathsMock);
    mock('../lib/json-utils', jsonUtilsMock);
    mock('../lib/tsconfig', tsConfigMock);
    mock('../lib/tslint', tsLintMock);
    mock('../lib/webpack', webpackMock);

    index = mock.reRequire('../index');
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should migrate an application', async () => {
    const result = await index.runCommand('migrate');

    expect(result).toBe(true);

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
  });

  it('should add dependencies and devDependencies if none are specified', async () => {
    jsonUtilsMock.readJson.and.returnValue({
      name: '@blackbaud/skyux-spa-migrate-unit-test'
    });

    await index.runCommand('migrate');

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

    await index.runCommand('migrate');

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

    await index.runCommand('migrate');

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

    await index.runCommand('migrate');

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

    await index.runCommand('migrate');

    expect(fsExtraMock.unlink).toHaveBeenCalledWith('package-lock.json');
    expect(fsExtraMock.remove).toHaveBeenCalledWith('node_modules');
  });

  it('should handle dependencies when the SKY UX application is a library', async () => {
    jsonUtilsMock.readJson.and.returnValue({
      name: '@blackbaud/skyux-lib-migrate-unit-test',
      devDependencies: {
        '@blackbaud/skyux': '2.30.0',
        '@blackbaud/skyux-builder': '1.40.0'
      }
    });

    await index.runCommand('migrate');

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

  it('should ignore unexpected commands', async () => {
    fsExtraMock.exists.and.returnValue(true);

    const result = await index.runCommand('foo');

    expect(result).toBe(false);
  });

});
