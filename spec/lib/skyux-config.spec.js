const mock = require('mock-require');

describe('SKY UX config', () => {
  let jsonUtilsMock;
  let skyuxConfig;

  beforeEach(() => {
    jsonUtilsMock = {
      readJson: jasmine.createSpy('readJson'),
      writeJson: jasmine.createSpy('writeJson')
    };

    mock('../../lib/json-utils', jsonUtilsMock);

    skyuxConfig = mock.reRequire('../../lib/skyux-config');
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should add the SKY UX stylesheet if it is not present', async () => {
    jsonUtilsMock.readJson.and.returnValue({});

    await skyuxConfig.updateSkyuxConfig();

    expect(jsonUtilsMock.writeJson).toHaveBeenCalledWith(
      'skyuxconfig.json',
      {
        app: {
          styles: [
            '@skyux/theme/css/sky.css'
          ]
        }
      }
    );
  });

  it('should not add the SKY UX stylesheet if it is already present', async () => {
    jsonUtilsMock.readJson.and.returnValue({
      app: {
        styles: [
          '@skyux/theme/css/sky.css'
        ]
      }
    });

    await skyuxConfig.updateSkyuxConfig();

    expect(jsonUtilsMock.writeJson).toHaveBeenCalledWith(
      'skyuxconfig.json',
      {
        app: {
          styles: [
            '@skyux/theme/css/sky.css'
          ]
        }
      }
    );
  });

  it('should handle a missing skyuxconfig.json file', async () => {
    jsonUtilsMock.readJson.and.returnValue(undefined);

    await skyuxConfig.updateSkyuxConfig();

    expect(jsonUtilsMock.writeJson).toHaveBeenCalledWith(
      'skyuxconfig.json',
      {
        app: {
          styles: [
            '@skyux/theme/css/sky.css'
          ]
        }
      }
    );
  });
});
