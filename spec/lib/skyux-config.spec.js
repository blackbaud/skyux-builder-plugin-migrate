const mock = require('mock-require');

describe('SKY UX config', () => {
  let jsonUtilsMock;
  let skyuxConfig;

  let packageJsonMock;
  let skyuxconfigMock;

  beforeEach(() => {
    packageJsonMock = {};

    skyuxconfigMock = {
      app: {
        styles: [
          '@skyux/theme/css/sky.css'
        ]
      }
    };

    jsonUtilsMock = {
      readJson: jasmine.createSpy('readJson'),
      writeJson: jasmine.createSpy('writeJson')
    };

    mock('../../lib/json-utils', jsonUtilsMock);

    skyuxConfig = mock.reRequire('../../lib/skyux-config');

    jsonUtilsMock.readJson.and.callFake((fileName) => {
      switch (fileName) {
        case 'skyuxconfig.json':
          return skyuxconfigMock;

        case 'package.json':
          return packageJsonMock;
      }
    });
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should set the $schema property as the first property', async () => {
    skyuxconfigMock = {
      auth: true
    };

    await skyuxConfig.updateSkyuxConfig();

    const newConfig = jsonUtilsMock.writeJson.calls.mostRecent().args[1];

    expect(Object.keys(newConfig)[0]).toBe('$schema');

    expect(newConfig.$schema).toBe('./node_modules/@skyux/config/skyuxconfig-schema.json');
  });

  it('should add the SKY UX stylesheet if it is not present', async () => {
    skyuxconfigMock = {};

    await skyuxConfig.updateSkyuxConfig();

    expect(jsonUtilsMock.writeJson).toHaveBeenCalledWith(
      'skyuxconfig.json',
      jasmine.objectContaining({
        app: {
          styles: [
            '@skyux/theme/css/sky.css'
          ]
        }
      })
    );
  });

  it('should not add the SKY UX stylesheet if it is already present', async () => {
    skyuxconfigMock =  {
      app: {
        styles: [
          '@skyux/theme/css/sky.css'
        ]
      }
    };

    await skyuxConfig.updateSkyuxConfig();

    expect(jsonUtilsMock.writeJson).toHaveBeenCalledWith(
      'skyuxconfig.json',
      jasmine.objectContaining({
        app: {
          styles: [
            '@skyux/theme/css/sky.css'
          ]
        }
      })
    );
  });

  it('should handle a missing skyuxconfig.json file', async () => {
    skyuxconfigMock = undefined;

    await skyuxConfig.updateSkyuxConfig();

    expect(jsonUtilsMock.writeJson).toHaveBeenCalledWith(
      'skyuxconfig.json',
      jasmine.objectContaining({
        app: {
          styles: [
            '@skyux/theme/css/sky.css'
          ]
        }
      })
    );
  });
});
