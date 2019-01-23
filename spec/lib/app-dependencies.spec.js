const mock = require('mock-require');

describe('App dependencies', () => {
  let appDependencies;
  let latestVersionMock;
  let getPackageJsonMock;
  let packageMapMock;

  beforeEach(() => {
    latestVersionMock = jasmine.createSpy('latestVersion').and.returnValue('9.8.7');
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

  it('should skip installation of specified pacakges', async () => {
    getPackageJsonMock.and.returnValue({
      name: '@skyux/foo'
    });

    packageMapMock.getPackage.and.returnValue({
      pacakge: '@skyux/foo',
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

});
