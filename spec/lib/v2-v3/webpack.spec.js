const mock = require('mock-require');

describe('Webpack', () => {
  let webpack;
  let fsExtraMock;
  let findInFilesMock;

  beforeEach(() => {
    fsExtraMock = {
      readFile: jasmine.createSpy('readFile'),
      writeFile: jasmine.createSpy('writeFile')
    };

    findInFilesMock = {
      find: jasmine.createSpy('find')
    };

    mock('fs-extra', fsExtraMock);
    mock('find-in-files', findInFilesMock);

    webpack = mock.reRequire('../../../lib/v2-v3/webpack');
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should remove json-loader prefixes from require statements', async () => {
    fsExtraMock.readFile.and.returnValue(
      `
require('json-loader!../../somefile.json');
`
    );

    findInFilesMock.find.and.returnValue({
      'file1.ts': {
        matches: [
          'json-loader!'
        ]
      }
    });

    await webpack.fixLoaders();

    expect(fsExtraMock.writeFile).toHaveBeenCalledWith(
      'file1.ts',
      `
require('../../somefile.json');
`
    );

  });

});
