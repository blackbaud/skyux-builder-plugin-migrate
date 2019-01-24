const mock = require('mock-require');

describe('TS Lint', () => {
  let tsLint;
  let jsonUtilsMock;

  beforeEach(() => {
    jsonUtilsMock = {
      readJson: jasmine.createSpy('readJson').and.returnValue({}),
      writeJson: jasmine.createSpy('writeJson')
    };

    mock('../../lib/json-utils', jsonUtilsMock);

    tsLint = mock.reRequire('../../lib/tslint');
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should fix the extends path', async () => {
    jsonUtilsMock.readJson.and.returnValue({
      extends: '@blackbaud/skyux-builder/tslint'
    });

    await tsLint.fixTsLint();

    expect(jsonUtilsMock.writeJson).toHaveBeenCalledWith(
      'tslint.json',
      {
        extends: '@skyux-sdk/builder/tslint'
      }
    );
  });

  it('should handle a missing tslint.json file', async () => {
    jsonUtilsMock.readJson.and.returnValue(undefined);

    await tsLint.fixTsLint();

    expect(jsonUtilsMock.writeJson).not.toHaveBeenCalled();
  });

  it('should handle a tslint.json file that does not extend the SKY UX tslint.json file', async () => {
    jsonUtilsMock.readJson.and.returnValue({});

    await tsLint.fixTsLint();

    expect(jsonUtilsMock.writeJson).not.toHaveBeenCalled();
  });

});
