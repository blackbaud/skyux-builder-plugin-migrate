const mock = require('mock-require');

describe('Plugin version', () => {
  let pluginVersion;
  let latestVersionMock;
  let testPackageJson;
  let jsonUtilsMock;

  beforeEach(() => {
    testPackageJson = {
      name: '@skyux-sdk/builder-plugin-migrate',
      version: '1.2.3'
    };

    latestVersionMock = jasmine.createSpy('latestVersion').and.returnValue('1.2.3');

    jsonUtilsMock = {
      readJson: jasmine.createSpy('readJson').and.returnValue(testPackageJson)
    };

    mock('latest-version', latestVersionMock);

    mock('../../lib/json-utils', jsonUtilsMock);

    pluginVersion = mock.reRequire('../../lib/plugin-version');
  });

  afterEach(() => {
    mock.stopAll();
  });

  describe('getPackageJson()', () => {
    it('should return package.json as a JSON object', async () => {
      const packageJson = await pluginVersion.getPackageJson();

      expect(packageJson).toEqual(testPackageJson);
    });
  });

  describe('verifyLatestVersion()', () => {
    it('should not throw an error when the current version matches the latest published version', async () => {
      let errMessage;

      // Jasmine's toThrowError() matcher doesn't work on async functions.
      try {
        await pluginVersion.verifyLatestVersion();
      } catch (err) {
        errMessage = err.message;
      }

      expect(errMessage).toBeUndefined();
    });

    it('should throw an error when the current version does not match the latest published version', async () => {
      testPackageJson.version = '1.2.2';

      let errMessage;

      // Jasmine's toThrowError() matcher doesn't work on async functions.
      try {
        await pluginVersion.verifyLatestVersion();
      } catch (err) {
        errMessage = err.message;
      }

      expect(errMessage).toBe(
        `You are using an outdated version of the migration utility.  Please upgrade the migration utility by running \`npm i -g @skyux-sdk/builder-plugin-migrate@latest\`,  then try running the migration again.
Current version: 1.2.2
Latest version: 1.2.3`
      );
    });
  });
});
