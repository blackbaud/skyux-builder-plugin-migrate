'use strict';

const appSkyModule = require('../../lib/app-sky-module');

describe('App SKY module', () => {

  it('should create an Angular module that includes the specified SKY UX packages', () => {
    const result = appSkyModule.createAppSkyModule(false, {
      '@skyux/indicators': [
        'SkyAlertModule',
        'SkyChevronModule'
      ],
      '@skyux/core': [],
      '@skyux/errors': [
        'SkyErrorModule'
      ]
    });

    expect(result).toEqual(`import {
  NgModule
} from '@angular/core';

import {
  SkyErrorModule
} from '@skyux/errors';

import {
  SkyAlertModule,
  SkyChevronModule
} from '@skyux/indicators';

require('style-loader!@skyux/theme/css/sky.css');

@NgModule({
  exports: [
    SkyAlertModule,
    SkyChevronModule,
    SkyErrorModule
  ]
})
export class AppSkyModule { }
`
    );
  });

  it('should not include the SKY UX stylesheet if the application is a library', () => {
    const result = appSkyModule.createAppSkyModule(true, {
      '@skyux/errors': [
        'SkyErrorModule'
      ]
    });

    expect(result).toEqual(`import {
  NgModule
} from '@angular/core';

import {
  SkyErrorModule
} from '@skyux/errors';

@NgModule({
  exports: [
    SkyErrorModule
  ]
})
export class AppSkyModule { }
`
    );
  });

});
