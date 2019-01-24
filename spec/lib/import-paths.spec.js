const mock = require('mock-require');

describe('Import paths', () => {
  let importPaths;
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

    importPaths = mock.reRequire('../../lib/import-paths');
  });

  afterEach(() => {
    mock.stop('fs-extra');
  });

  it('should update import paths', async () => {
    fsExtraMock.readFile.and.returnValue(
      `import { Component } from '@angular/core';

import { SkyWindowRef, SkyDatepickerModule, ListSearchModel, SkyListModule } from '@blackbaud/skyux/dist/core';

import { SkyAppTestModule } from '@blackbaud/skyux-builder/runtime/testing/browser';

export class SomeClass { }
`
    );

    findInFilesMock.find.and.returnValue({
      'file1.ts': {
        matches: [`
import { SkyWindowRef, SkyDatepickerModule, ListSearchModel, SkyListModule } from '@blackbaud/skyux/dist/core';
`, `
import { SkyAppTestModule } from '@blackbaud/skyux-builder/runtime/testing/browser';
`

        ]
      }
    });

    await importPaths.fixImportPaths();

    expect(fsExtraMock.writeFile).toHaveBeenCalledWith(
      'file1.ts',
      `import { Component } from '@angular/core';

import {
  SkyAppTestModule
} from '@skyux-sdk/builder/runtime/testing/browser';

import {
  SkyWindowRef
} from '@skyux/core';

import {
  SkyDatepickerModule
} from '@skyux/datetime';

import {
  SkyListModule
} from '@skyux/list-builder';

import {
  ListSearchModel
} from '@skyux/list-builder/modules/list/state';

export class SomeClass { }
`
    );

  });

  it('should error when no matching module is found', async () => {
    fsExtraMock.readFile.and.returnValue(
      `import { Component } from '@angular/core';

import { Foo } from '@blackbaud/skyux/dist/core';

export class SomeClass { }
`
    );

    findInFilesMock.find.and.returnValue({
      'file1.ts': {
        matches: [`
import { Foo } from '@blackbaud/skyux/dist/core';
`]
      }
    });

    let errMessage;

    // Jasmine's toThrowError() matcher doesn't work on async functions.
    try {
      await importPaths.fixImportPaths();
    } catch (err) {
      errMessage = err.message;
    }

    expect(errMessage).toBe('No package found for Foo!');
  });

});
