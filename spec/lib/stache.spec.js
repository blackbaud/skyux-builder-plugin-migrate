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

    mock('../../lib/app-dependencies', {
      upgradeDependencies(dependencies) {
        return Promise.resolve(dependencies);
      }
    });

    stacheUtils = mock.reRequire('../../lib/stache');
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should replace deprecated stache tags with `sky` equivalents', async () => {
    const htmlContents = `
<stache-code-block
  languageType="js"
></stache-code-block>
<stache-code></stache-code>
<stache-row>
  <stache-column
    screenSmall="5"
  >
  </stache-column>
</stache-row>
<stache-copy-to-clipboard [copyTarget]="copyTarget">
</stache-copy-to-clipboard>
<stache-hero>
  <stache-hero-heading></stache-hero-heading>
  <stache-hero-subheading></stache-hero-subheading>
</stache-hero>
<stache-image
></stache-image>
<stache-internal></stache-internal>
<stache-video></stache-video>
<!-- THESE SHOULD NOT CHANGE: -->
<stache></stache>
<stache-layout></stache-layout>
`;

    const expectedHtml = `
<sky-code-block
  languageType="js"
></sky-code-block>
<sky-code></sky-code>
<sky-row>
  <sky-column
    screenSmall="5"
  >
  </sky-column>
</sky-row>
<sky-copy-to-clipboard [copyTarget]="copyTarget">
</sky-copy-to-clipboard>
<sky-hero>
  <sky-hero-heading></sky-hero-heading>
  <sky-hero-subheading></sky-hero-subheading>
</sky-hero>
<sky-image
></sky-image>
<sky-restricted-view></sky-restricted-view>
<sky-video></sky-video>
<!-- THESE SHOULD NOT CHANGE: -->
<stache></stache>
<stache-layout></stache-layout>
`;

    fsExtraMock.readFile.and.callFake(() => {
      return htmlContents;
    });

    findInFilesMock.find.and.callFake((options) => {
      const regex = new RegExp(options.term, options.flags);
      const matches = htmlContents.match(regex);

      if (!matches) {
        return {};
      }

      return {
        'file1.html': {
          matches
        }
      };
    });

    await stacheUtils.renameDeprecatedComponents();

    expect(fsExtraMock.writeFile).toHaveBeenCalledWith('file1.html', expectedHtml);
  });

  it('should update stache import paths', async () => {
    const fileContents = `
import { StacheModule } from '@blackbaud/stache';
`;

    const expectedContents = `
import { StacheModule } from '@blackbaud/skyux-lib-stache';
`;

    fsExtraMock.readFile.and.callFake(() => {
      return fileContents;
    });

    findInFilesMock.find.and.callFake((options) => {
      const regex = new RegExp(options.term, options.flags);
      const matches = fileContents.match(regex);

      if (!matches) {
        return {};
      }

      return {
        'file1.ts': {
          matches
        }
      };
    });

    await stacheUtils.updateStacheImportPaths();

    expect(fsExtraMock.writeFile).toHaveBeenCalledWith('file1.ts', expectedContents);
  });

  it('should check if is stache SPA based on dependencies', () => {
    let result = stacheUtils.isStacheSpa({});

    expect(result).toEqual(false);

    result = stacheUtils.isStacheSpa({
      dependencies: {
        '@blackbaud/stache': '1.0.0'
      }
    });

    expect(result).toEqual(true);

    result = stacheUtils.isStacheSpa({
      dependencies: {
        '@blackbaud/skyux-lib-stache': '1.0.0'
      }
    });

    expect(result).toEqual(true);
  });

  it('should add the new stache library to package dependencies', async () => {
    const packageJson = {};

    await stacheUtils.updatePackageDependencies(packageJson);

    expect(packageJson).toEqual({
      dependencies: {
        '@blackbaud/skyux-lib-stache': 'latest'
      }
    });
  });

  it('should update stache plugins to the latest versions', async () => {
    const packageJson = {
      dependencies: {
        '@blackbaud/skyux-builder-plugin-auth-email-whitelist': '1.0.0'
      }
    };

    await stacheUtils.updatePackageDependencies(packageJson);

    expect(packageJson).toEqual({
      dependencies: {
        '@blackbaud/skyux-lib-stache': 'latest',
        '@blackbaud/skyux-builder-plugin-auth-email-whitelist': 'latest'
      }
    });
  });
});
