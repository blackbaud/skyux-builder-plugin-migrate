const mock = require('mock-require');

describe('stache', () => {
  let fsExtraMock;
  let findInFilesMock;
  let stacheUtils;

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
    mock('@blackbaud/skyux-logger', {
      info() {}
    });

    stacheUtils = mock.reRequire('../../lib/stache');
  });

  afterEach(() => {
    mock.stopAll();
  });

  fit('should replace deprecated stache tags with `sky` equivalents', async () => {
    // const html = 'asdf';
    // const regex = new RegExp(options.term, options.flags);

    // findInFilesMock.find.and.returnValue({
    //   'file1.ts': {
    //     matches: html.match(regex)
    //   }
    // });

    // fsExtraMock.readFile.and.callFake((fileName) => {
    //   switch (fileName) {
    //     case 'file1.html':
    //       return html;
    //   }
    // });

    // await stacheUtils.renameDeprecatedComponents();

    // expect(fsExtraMock.writeFile).toHaveBeenCalledWith();

  });
});
