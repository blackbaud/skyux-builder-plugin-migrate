const mock = require('mock-require');

describe('Version', () => {
  let version;
  let loggerMock;
  let pluginVersionMock;

  beforeEach(() => {
    loggerMock = {
      info: jasmine.createSpy('info')
    };

    pluginVersionMock = {
      getPackageJson: jasmine.createSpy('getPackageJson').and.returnValue(
        {
          name: '@skyux-sdk/builder-plugin-migrate',
          version: '1.2.3'
        }
      )
    };

    mock('@blackbaud/skyux-logger', loggerMock);

    mock('../../lib/plugin-version', pluginVersionMock);

    version = mock.reRequire('../../cli/version');
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should log the current version', async () => {
    await version();

    expect(loggerMock.info).toHaveBeenCalledWith(
      '%s: %s',
      '@skyux-sdk/builder-plugin-migrate',
      '1.2.3'
    );
  });
});
