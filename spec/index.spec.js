const mock = require('mock-require');

describe('Index', () => {
  const errorMessage = 'The globally-installed `@skyux-sdk/builder-plugin-migrate` package is no longer needed or maintained. Please run `npm uninstall -g @skyux-sdk/builder-plugin-migrate` to remove it from your system.';

  let index;
  let migrateMock;
  let versionMock;

  beforeEach(() => {
    migrateMock = jasmine.createSpy('migrate');
    versionMock = jasmine.createSpy('version');

    mock('../cli/migrate', migrateMock);
    mock('../cli/version', versionMock);

    index = mock.reRequire('../index');
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should process the migrate command', () => {
    expect(() => {
      index.runCommand('migrate');
    }).toThrowError(errorMessage);
  });

  it('should process the version command', () => {
    expect(() => {
      index.runCommand('version');
    }).toThrowError(errorMessage);
  });

  it('should ignore unexpected commands', () => {
    const result = index.runCommand('foo');
    expect(result).toBe(false);
  });

});
