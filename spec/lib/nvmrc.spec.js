const mock = require('mock-require');

describe('nvmrc', () => {
  let nvmrc;
  let fsExtraMock;

  beforeEach(() => {
    fsExtraMock = {
      writeFile: jasmine.createSpy('writeFile')
    };

    mock('fs-extra', fsExtraMock);

    nvmrc = mock.reRequire('../../lib/nvmrc');
  });

  it('should update the .nvmrc file', async () => {
    await nvmrc.updateNvmrc();

    expect(fsExtraMock.writeFile).toHaveBeenCalledWith(
      '.nvmrc',
      'lts/dubnium'
    );
  });

});
