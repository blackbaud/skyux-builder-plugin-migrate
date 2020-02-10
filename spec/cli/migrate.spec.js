const mock = require('mock-require');

describe('Migrate CLI', () => {
  let migrate;
  let jsonUtilsMock;
  let migrateV2V3Mock;
  let migrateV3V4Mock;
  let pluginVersionMock;

  beforeEach(() => {
    pluginVersionMock = {
      verifyLatestVersion: jasmine.createSpy('verifyLatestVersion')
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

    migrateV2V3Mock = jasmine.createSpy('migrate');
    migrateV3V4Mock = jasmine.createSpy('migrate');

    mock('../../lib/json-utils', jsonUtilsMock);
    mock('../../lib/plugin-version', pluginVersionMock);
    mock('../../lib/v2-v3/migrate', migrateV2V3Mock);
    mock('../../lib/v3-v4/migrate', migrateV3V4Mock);

    migrate = mock.reRequire('../../cli/migrate');
  });

  it('should call the expected migrate library based on the SKY UX version', async () => {
    await migrate();

    expect(migrateV2V3Mock).toHaveBeenCalledWith();
    expect(migrateV3V4Mock).not.toHaveBeenCalled();

    migrateV2V3Mock.calls.reset();

    jsonUtilsMock.readJson.and.returnValue({
      name: '@blackbaud/skyux-spa-migrate-unit-test',
      dependencies: {
        '@skyux/core': '3.0.0'
      },
      devDependencies: {
        '@skyux-sdk/builder': '3.0.0'
      }
    });

    await migrate();

    expect(migrateV2V3Mock).not.toHaveBeenCalled();
    expect(migrateV3V4Mock).toHaveBeenCalledWith();

    jsonUtilsMock.readJson.and.returnValue({
      name: '@blackbaud/skyux-spa-migrate-unit-test'
    });

    await expectAsync(migrate()).toBeRejectedWithError('No compatible version of SKY UX was found.');
  });

});
