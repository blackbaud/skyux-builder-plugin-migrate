const mock = require('mock-require');

describe('Package map', () => {
  let packageMap;
  let findInFilesMock;

  beforeEach(() => {
    findInFilesMock = {
      find: jasmine.createSpy('find')
    };

    mock('find-in-files', findInFilesMock);

    packageMap = mock.reRequire('../../lib/package-map');
  });

  afterEach(() => {
    mock.stop('fs-extra');
  });

  describe('getPackage() method', () => {

    it('should retrieve a package by its name', () => {
      const result = packageMap.getPackage('@skyux-sdk/builder');

      expect(result).toEqual({
        package: '@skyux-sdk/builder',
        skipInstall: true,
        nonModuleMatches: [
          'SkyAppTestModule'
        ],
        importPaths: [
          {
            typeName: 'SkyAppTestModule',
            path: '@skyux-sdk/builder/runtime/testing/browser'
          }
        ]
      });
    });

  });

  describe('createPackageList() method', () => {

    it('should find packages', async () => {
      findInFilesMock.find.and.returnValue({
        'file1.ts': {
          matches: [
            'sky-alert',
            'SkyAvatarModule'
          ]
        },
        'file2.ts': {
          matches: [
            'sky-alert',
            'sky-colorpicker',
            'skyAnimation'
          ]
        }
      });

      const result = await packageMap.createPackageList();

      expect(result).toEqual({
        '@skyux/indicators': ['SkyAlertModule'],
        '@skyux/avatar': [],
        '@skyux/colorpicker': ['SkyColorpickerModule'],
        '@skyux/animations': []
      });
    });

  });

  describe('findMatchingPackages() method', () => {

    it('should find a package by one of its non-module matches', () => {
      const result = packageMap.findMatchingPackages('skyAnimation');

      expect(result[0]).toEqual(
        jasmine.objectContaining({
          package: '@skyux/animations'
        })
      );
    });

    it('should find a package by one of its module matches', () => {
      const result = packageMap.findMatchingPackages('sky-avatar');

      expect(result[0]).toEqual(
        jasmine.objectContaining({
          package: '@skyux/avatar'
        })
      );
    });

    it('should find a package by the name of one of its modules', () => {
      const result = packageMap.findMatchingPackages('SkyAlertModule');

      expect(result[0]).toEqual(
        jasmine.objectContaining({
          package: '@skyux/indicators'
        })
      );
    });

  });

});
