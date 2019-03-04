const mock = require('mock-require');
const path = require('path');

describe('Version', () => {
  let version;
  let loggerMock;
  let jsonUtilsMock;

  beforeEach(() => {
    loggerMock = {
      info: jasmine.createSpy('info')
    };

    jsonUtilsMock = {
      readJson: jasmine.createSpy('readJson').and.returnValue(
        {
          name: '@skyux-sdk/builder-plugin-migrate',
          version: '1.2.3'
        }
      )
    };

    mock('@blackbaud/skyux-logger', loggerMock);

    mock('../../lib/json-utils', jsonUtilsMock);

    version = mock.reRequire('../../cli/version');
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
