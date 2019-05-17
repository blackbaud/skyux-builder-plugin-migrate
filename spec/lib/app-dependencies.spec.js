const mock = require('mock-require');

describe('App dependencies', () => {
  let appDependencies;
  let latestVersionMock;
  let getPackageJsonMock;
  let packageMapMock;

  beforeEach(() => {
    latestVersionMock = jasmine.createSpy('latestVersion').and.callFake((packageName) => {
      switch (packageName) {
        case '@foo/bar':
          return '12.2.5';
        case '@foo/baz':
          return '4.5.6';
      }

      return '9.8.7';
    });

    getPackageJsonMock = jasmine.createSpy('getPackageJson');

    packageMapMock = {
      getPackage: jasmine.createSpy('getPackage').and.callFake((name) => {
        return {
          package: name
        };
      })
    };

    mock('latest-version', latestVersionMock);
    mock('package-json', getPackageJsonMock);
    mock('../../lib/package-map', packageMapMock);

    appDependencies = mock.reRequire('../../lib/app-dependencies');
  });

  afterEach(() => {
    mock.stopAll();
  });

  describe('createPackageJsonDependencies() method', () => {

    it('should add dependencies from the dependency list', async () => {
      getPackageJsonMock.and.returnValue({
        name: '@skyux/indicators'
      });

      const result = await appDependencies.createPackageJsonDependencies(
        {
          '@skyux/indicators': { },
          '@skyux-sdk/bar': { }
        }
      );

      expect(result).toEqual(
        {
          dependencies: jasmine.objectContaining({
            '@skyux/assets': '9.8.7',
            '@skyux/indicators': '9.8.7'
          }),
          devDependencies: jasmine.objectContaining({
            '@skyux-sdk/bar': '9.8.7'
          })
        }
      );
    });

    it('should add peer dependencies of SKY UX packages', async () => {
      getPackageJsonMock.and.returnValue({
        name: '@skyux/indicators',
        peerDependencies: {
          foo: '^9.8.0'
        }
      });

      const result = await appDependencies.createPackageJsonDependencies(
        {
          '@skyux/indicators': { }
        }
      );

      expect(result.dependencies).toEqual(
        jasmine.objectContaining({
          '@skyux/assets': '9.8.7',
          '@skyux/indicators': '9.8.7',
          'foo': '9.8.7'
        })
      );
    });

    it('should skip installation of specified packages', async () => {
      getPackageJsonMock.and.returnValue({
        name: '@skyux/foo'
      });

      packageMapMock.getPackage.and.returnValue({
        package: '@skyux/foo',
        skipInstall: true
      });

      const result = await appDependencies.createPackageJsonDependencies(
        {
          '@skyux/foo': { }
        }
      );

      expect(result.dependencies).not.toEqual(
        jasmine.objectContaining({
          '@skyux/foo': jasmine.any(String)
        })
      );

    });

    it('should add builder plugins from the package map', async () => {
      getPackageJsonMock.and.returnValue({
        name: '@skyux/indicators'
      });

      packageMapMock.getPackage.and.returnValue({
        package: '@skyux/indicators',
        builderPlugins: [
          '@blackbaud/skyux-builder-plugin-foo',
          '@skyux-sdk/builder-plugin-bar'
        ]
      });

      const result = await appDependencies.createPackageJsonDependencies(
        {
          '@skyux/indicators': { }
        }
      );

      expect(result).toEqual(
        {
          dependencies: jasmine.objectContaining({
            '@skyux/indicators': '9.8.7'
          }),
          devDependencies: jasmine.objectContaining({
            '@blackbaud/skyux-builder-plugin-foo': '9.8.7',
            '@skyux-sdk/builder-plugin-bar': '9.8.7'
          })
        }
      );
    });

  });

  describe('upgradeDependencies() method', () => {

    it('should upgrade dependencies', async () => {
      const dependencies = {
        '@foo/bar': '12.2.3'
      };

      const devDependencies = {
        '@foo/baz': '4.5.6',
        'from-branch': 'foo/bar#branch'
      };

      await appDependencies.upgradeDependencies(dependencies);

      expect(dependencies).toEqual({
        '@foo/bar': '12.2.5'
      });

      await appDependencies.upgradeDependencies(devDependencies);

      expect(devDependencies).toEqual({
        '@foo/baz': '4.5.6',
        'from-branch': 'foo/bar#branch'
      });

      expect(latestVersionMock).toHaveBeenCalledWith(
        '@foo/bar',
        {
          version: '12'
        }
      );

      expect(latestVersionMock).toHaveBeenCalledWith(
        '@foo/baz',
        {
          version: '4'
        }
      );
    });

    it('should handle missing dependencies section', async () => {
      const dependencies = undefined;

      await appDependencies.upgradeDependencies(dependencies);

      expect(dependencies).toBeUndefined();
    });

  });

  describe('addSkyPeerDependencies() method', () => {

    it('should add peer dependencies for SKY UX dependencies', async () => {
      getPackageJsonMock.and.returnValue({
        name: '@skyux/indicators',
        peerDependencies: {
          foo: '^9.8.0'
        }
      });

      const dependencies = {
        '@skyux/indicators': '9.8.7'
      };

      await appDependencies.addSkyPeerDependencies(dependencies);

      expect(dependencies).toEqual(
        jasmine.objectContaining({
          '@skyux/indicators': '9.8.7',
          'foo': '9.8.7'
        })
      );
    });

    it('should handle missing dependencies section', async () => {
      const dependencies = undefined;

      await appDependencies.addSkyPeerDependencies(dependencies);

      expect(dependencies).toBeUndefined();
    });

  });

});
