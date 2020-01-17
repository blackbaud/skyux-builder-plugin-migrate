const mock = require('mock-require');

describe('Index', () => {
  let index;
  let migrateMock;
  let upgradeMock;
  let versionMock;

  beforeEach(() => {
    migrateMock = jasmine.createSpy('migrate');
    upgradeMock = jasmine.createSpy('upgrade');
    versionMock = jasmine.createSpy('version');

    mock('../cli/migrate', migrateMock);
    mock('../cli/upgrade', upgradeMock);
    mock('../cli/version', versionMock);

    index = mock.reRequire('../index');
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should process the migrate command', async () => {
    const result = await index.runCommand('migrate');

    expect(migrateMock).toHaveBeenCalled();

    expect(result).toBe(true);
  });

  it('should process the version command', async () => {
    const result = await index.runCommand('version');

    expect(versionMock).toHaveBeenCalled();

    expect(result).toBe(true);
  });

  it('should ignore unexpected commands', async () => {
    const result = await index.runCommand('foo');

    expect(result).toBe(false);
  });

});
