const mock = require('mock-require');

describe('TS Config', () => {
  let tsConfig;
  let jsonUtilsMock;

  beforeEach(() => {
    jsonUtilsMock = {
      readJson: jasmine.createSpy('readJson').and.returnValue({}),
      writeJson: jasmine.createSpy('writeJson')
    };

    mock('../../../lib/json-utils', jsonUtilsMock);

    tsConfig = mock.reRequire('../../../lib/v2-v3/tsconfig');
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should fix the extends path', async () => {
    await tsConfig.fixTsConfig();

    expect(jsonUtilsMock.writeJson).toHaveBeenCalledWith(
      'tsconfig.json',
      {
        extends: './node_modules/@skyux-sdk/builder/tsconfig'
      }
    );
  });

  it('should handle a missing tsconfig.json file', async () => {
    jsonUtilsMock.readJson.and.returnValue(undefined);

    await tsConfig.fixTsConfig();

    expect(jsonUtilsMock.writeJson).not.toHaveBeenCalled();
  });

});
