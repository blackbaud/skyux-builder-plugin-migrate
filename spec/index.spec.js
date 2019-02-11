const mock = require('mock-require');

describe('Index', () => {
  let index;
  let migrateMock;
  let upgradeMock;

  beforeEach(() => {
    migrateMock = jasmine.createSpy('migrate');
    upgradeMock = jasmine.createSpy('upgrade');

    mock('../cli/migrate', migrateMock);
    mock('../cli/upgrade', upgradeMock);

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

  it('should process the upgrade command', async () => {
    const result = await index.runCommand('upgrade');

    expect(upgradeMock).toHaveBeenCalled();

    expect(result).toBe(true);
  });

  it('should ignore unexpected commands', async () => {
    const result = await index.runCommand('foo');

    expect(result).toBe(false);
  });

});
