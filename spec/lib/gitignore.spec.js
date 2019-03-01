const mock = require('mock-require');

describe('gitgnore', () => {
  let gitignore;
  let fsExtraMock;

  beforeEach(() => {
    fsExtraMock = {
      exists: jasmine.createSpy('exists'),
      readFile: jasmine.createSpy('readFile'),
      writeFile: jasmine.createSpy('writeFile')
    };

    mock('fs-extra', fsExtraMock);

    gitignore = mock.reRequire('../../lib/gitignore');
  });

  it('should add .skypagestmp to .gitignore file if it is not present', async () => {

    fsExtraMock.exists.and.returnValue(true);
    fsExtraMock.readFile.and.returnValue('.node_modules');

    await gitignore.fixGitignore();

    expect(fsExtraMock.writeFile).toHaveBeenCalledWith(
      '.gitignore',
      `.node_modules

# SKY UX temporary files
.skypagestmp
`
    );
  });

  it('should not add .skypagestmp to .gitignore file if it is present', async () => {
    fsExtraMock.exists.and.returnValue(true);
    fsExtraMock.readFile.and.returnValue('.skypagestmp');

    await gitignore.fixGitignore();

    expect(fsExtraMock.writeFile).not.toHaveBeenCalled();
  });

  it('should create a .gitignore file if it does not exist', async () => {
    fsExtraMock.exists.and.returnValue(false);

    await gitignore.fixGitignore();

    expect(fsExtraMock.writeFile).toHaveBeenCalledWith(
      '.gitignore',
      `# SKY UX temporary files
.skypagestmp
`
    );
  });
});
