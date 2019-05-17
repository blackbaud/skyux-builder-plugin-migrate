const findInFiles = require('find-in-files');
const logger = require('@blackbaud/skyux-logger');

const packageMap = [
  {
    package: '@blackbaud/skyux-lib-clipboard',
    modules: [
      {
        name: 'SkyCopyToClipboardModule',
        matches: [
          'SkyCopyToClipboard',
          'sky-copy-to-clipboard'
        ]
      }
    ]
  },
  {
    package: '@blackbaud/skyux-lib-code-block',
    modules: [
      {
        name: 'SkyCodeBlockModule',
        matches: [
          'SkyCodeBlockModule',
          'sky-code-block'
        ]
      },
      {
        name: 'SkyCodeModule',
        matches: [
          'SkyCodeModule',
          'sky-code'
        ]
      }
    ],
    builderPlugins: [
      '@blackbaud/skyux-builder-plugin-code-block'
    ]
  },
  {
    package: '@blackbaud/skyux-lib-media',
    modules: [
      {
        name: 'SkyHeroModule',
        matches: [
          'SkyHeroModule',
          'sky-hero'
        ]
      },
      {
        name: 'SkyImageModule',
        matches: [
          'SkyImageModule',
          'sky-image'
        ]
      },
      {
        name: 'SkyVideoModule',
        matches: [
          'SkyVideoModule',
          'sky-video'
        ]
      }
    ]
  },
  {
    package: '@blackbaud/skyux-lib-stache',
    modules: [
      {
        name: 'StacheModule',
        matches: [
          'StacheModule'
        ]
      }
    ],
    builderPlugins: [
      '@blackbaud/skyux-builder-plugin-stache'
    ]
  },
  {
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
  },
  {
    package: '@skyux/a11y',
    modules: [
      {
        name: 'SkySkipLinkModule',
        matches: [
          'SkySkipLink'
        ]
      }
    ]
  },
  {
    package: '@skyux/animations',
    nonModuleMatches: [
      'skyAnimation'
    ]
  },
  {
    package: '@skyux/avatar',
    modules: [
      {
        name: 'SkyAvatarModule',
        matches: [
          'sky-avatar'
        ]
      }
    ]
  },
  {
    package: '@skyux/assets',
    nonModuleMatches: [
      'SkyAppAssetsService'
    ]
  },
  {
    package: '@skyux/colorpicker',
    modules: [
      {
        name: 'SkyColorpickerModule',
        matches: [
          'sky-colorpicker',
          'skyColorpicker',
          'SkyColorpicker'
        ]
      }
    ]
  },
  {
    package: '@skyux/config',
    nonModuleMatches: [
      'SkyAppConfig',
      'SkyAppRuntimeConfig',
      'SkyuxConfig',
      'RuntimeConfig',
      'RuntimeConfigApp',
      'SkyuxPactConfig',
      'SkyuxConfigE2ETestSettings',
      'SkyuxConfigUnitTestSettings',
      'SkyuxConfigTestSettings',
      'SkyuxConfigA11y',
      'SkyuxConfigApp',
      'SkyuxConfigHost'
    ]
  },
  {
    package: '@skyux/core',
    nonModuleMatches: [
      'SkyAppFormat',
      'SkyFormat',
      'SkyUIConfig',
      'SkyWindowRef',
      'SkyAppWindowRef',
      'NumericOptions'
    ],
    modules: [
      {
        name: 'SkyNumericModule',
        matches: [
          'skyNumeric',
          'SkyNumeric'
        ]
      },
      {
        name: 'SkyMediaQueryModule',
        matches: [
          'SkyMedia'
        ]
      }
    ]
  },
  {
    package: '@skyux/datetime',
    nonModuleMatches: [
      'SkyDateFormatter'
    ],
    modules: [
      {
        name: 'SkyDatepickerModule',
        matches: [
          'skyDatepickerInput',
          'sky-datepicker',
          'sky-daypicker',
          'sky-monthpicker',
          'sky-yearpicker'
        ]
      },
      {
        name: 'SkyTimepickerModule',
        matches: [
          'sky-timepicker'
        ]
      }
    ]
  },
  {
    package: '@skyux/errors',
    nonModuleMatches: [
      'ErrorModalConfig'
    ],
    modules: [
      {
        name: 'SkyErrorModule',
        matches: [
          'sky-error',
          'SkyErrorModal'
        ]
      }
    ]
  },
  {
    package: '@skyux/flyout',
    modules: [
      {
        name: 'SkyFlyoutModule',
        matches: [
          'sky-flyout',
          'SkyFlyout'
        ]
      }
    ]
  },
  {
    package: '@skyux/forms',
    modules: [
      {
        name: 'SkyCheckboxModule',
        matches: [
          'sky-checkbox'
        ]
      },
      {
        name: 'SkyFileAttachmentsModule',
        matches: [
          'sky-file',
          'SkyFile',
          'skyFile'
        ]
      },
      {
        name: 'SkyRadioModule',
        matches: [
          'sky-radio'
        ]
      }
    ]
  },
  {
    package: '@skyux/grids',
    modules: [
      {
        name: 'SkyGridModule',
        matches: [
          'sky-grid'
        ]
      }
    ]
  },
  {
    package: '@skyux/http',
    nonModuleMatches: [
      'SkyAuthTokenProvider'
    ],
    modules: [
      {
        name: 'SkyAuthHttpModule',
        matches: [
          'SkyAuthHttp'
        ]
      },
      {
        name: 'SkyAuthHttpClientModule',
        matches: [
          'skyAuthHttpOptions',
          'SkyAuthInterceptor'
        ]
      }
    ]
  },
  {
    package: '@skyux/i18n',
    modules: [
      {
        name: 'SkyI18nModule',
        matches: [
          'skyAppResources',
          'SkyAppResources',
          'skyLibResources',
          'SkyLibResources',
          'SkyAppLocaleInfo',
          'SkyAppLocaleProvider'
        ]
      }
    ],
    nonModuleMatches: [
      'SkyAppResourcesTestingService'
    ],
    importPaths: [
      {
        typeName: 'SkyAppResourcesTestingService',
        path: '@skyux/i18n/testing'
      }
    ]
  },
  {
    package: '@skyux/indicators',
    modules: [
      {
        name: 'SkyAlertModule',
        matches: [
          'sky-alert'
        ]
      },
      {
        name: 'SkyChevronModule',
        matches: [
          'sky-chevron'
        ]
      },
      {
        name: 'SkyHelpInlineModule',
        matches: [
          'sky-help'
        ]
      },
      {
        name: 'SkyIconModule',
        matches: [
          'sky-icon'
        ]
      },
      {
        name: 'SkyKeyInfoModule',
        matches: [
          'sky-key-info'
        ]
      },
      {
        name: 'SkyTextHighlightModule',
        matches: [
          'skyHighlight'
        ]
      },
      {
        name: 'SkyHelpInlineModule',
        matches: [
          'sky-help'
        ]
      },
      {
        name: 'SkyLabelModule',
        matches: [
          'sky-label'
        ]
      },
      {
        name: 'SkyTokensModule',
        matches: [
          'sky-token'
        ]
      },
      {
        name: 'SkyWaitModule',
        matches: [
          'sky-wait',
          'SkyWait'
        ]
      }
    ]
  },
  {
    package: '@skyux/layout',
    modules: [
      {
        name: 'SkyActionButtonModule',
        matches: [
          'sky-action-button',
          'SkyActionButton'
        ]
      },
      {
        name: 'SkyCardModule',
        matches: [
          'sky-card'
        ]
      },
      {
        name: 'SkyDefinitionListModule',
        matches: [
          'sky-definition-list'
        ]
      },
      {
        name: 'SkyFluidGridModule',
        matches: [
          'sky-row',
          'sky-column',
          'sky-fluid-grid'
        ]
      },
      {
        name: 'SkyPageSummaryModule',
        matches: [
          'sky-page-summary'
        ]
      },
      {
        name: 'SkyTextExpandModule',
        matches: [
          'sky-text-expand'
        ]
      },
      {
        name: 'SkyTextExpandRepeaterModule',
        matches: [
          'sky-text-expand-repeater'
        ]
      },
      {
        name: 'SkyToolbarModule',
        matches: [
          'sky-toolbar'
        ]
      }
    ]
  },
  {
    package: '@skyux/list-builder',
    nonModuleMatches: [
      'ListData',
      'ListFilter',
      'ListSearch',
      'ListSortModel'
    ],
    modules: [
      {
        name: 'SkyListFiltersModule',
        matches: [
          'sky-list-filter'
        ]
      },
      {
        name: 'SkyListPagingModule',
        matches: [
          'sky-list-paging'
        ]
      },
      {
        name: 'SkyListSecondaryActionsModule',
        matches: [
          'sky-list-secondary-action'
        ]
      },
      {
        name: 'SkyListToolbarModule',
        matches: [
          'sky-list-toolbar'
        ]
      },
      {
        name: 'SkyListModule',
        matches: [
          'sky-list',
          'SkyListComponent'
        ]
      }
    ],
    importPaths: [
      {
        typeName: 'ListSearchModel',
        path: '@skyux/list-builder/modules/list/state'
      },
      {
        typeName: 'ListSortModel',
        path: '@skyux/list-builder/modules/list/state'
      }
    ]
  },
  {
    package: '@skyux/list-builder-common',
    nonModuleMatches: [
      'ListItemModel',
      'ListSortFieldSelectorModel'
    ],
    importPaths: [
      {
        typeName: 'ListItemModel',
        path: '@skyux/list-builder-common/state/items/item.model'
      }
    ]
  },
  {
    package: '@skyux/list-builder-view-checklist',
    modules: [
      {
        name: 'SkyListViewChecklistModule',
        matches: [
          'sky-list-view-checklist'
        ]
      }
    ]
  },
  {
    package: '@skyux/list-builder-view-grids',
    modules: [
      {
        name: 'SkyListViewGridModule',
        matches: [
          'sky-list-view-grid'
        ]
      },
      {
        name: 'SkyColumnSelectorModule',
        matches: [
          'sky-column-selector'
        ]
      }
    ]
  },
  {
    package: '@skyux/lists',
    modules: [
      {
        name: 'SkyFilterModule',
        matches: [
          'sky-filter'
        ]
      },
      {
        name: 'SkyInfiniteScrollModule',
        matches: [
          'sky-infinite-scroll'
        ]
      },
      {
        name: 'SkyPagingModule',
        matches: [
          'sky-paging'
        ]
      },
      {
        name: 'SkyRepeaterModule',
        matches: [
          'sky-repeater',
          'SkyRepeater'
        ]
      },
      {
        name: 'SkySortModule',
        matches: [
          'sky-sort'
        ]
      }
    ]
  },
  {
    package: '@skyux/lookup',
    nonModuleMatches: [
      'SkyAutocompleteSearchFunctionFilter'
    ],
    modules: [
      {
        name: 'SkyAutocompleteModule',
        matches: [
          'sky-autocomplete',
          'skyAutocomplete'
        ]
      },
      {
        name: 'SkyLookupModule',
        matches: [
          'sky-lookup'
        ]
      },
      {
        name: 'SkySearchModule',
        matches: [
          'sky-search'
        ]
      }
    ]
  },
  {
    package: '@skyux/modals',
    modules: [
      {
        name: 'SkyConfirmModule',
        matches: [
          'sky-confirm',
          'SkyConfirm'
        ]
      },
      {
        name: 'SkyModalModule',
        matches: [
          'sky-modal',
          'SkyModal'
        ]
      }
    ]
  },
  {
    package: '@skyux/navbar',
    modules: [
      {
        name: 'SkyNavbarModule',
        matches: [
          'sky-navbar',
          'SkyNavbar'
        ]
      }
    ]
  },
  {
    package: '@skyux/popovers',
    modules: [
      {
        name: 'SkyDropdownModule',
        matches: [
          'sky-dropdown',
          'SkyDropdown'
        ]
      },
      {
        name: 'SkyPopoverModule',
        matches: [
          'sky-popover',
          'SkyPopoverMessage'
        ]
      }
    ]
  },
  {
    package: '@skyux/progress-indicator',
    nonModuleMatches: [
      'SkyProgressIndicatorChange',
      'SkyProgressIndicatorDisplayMode',
      'SkyProgressIndicatorMessageType'
    ],
    modules: [
      {
        name: 'SkyProgressIndicatorModule',
        matches: [
          'sky-progress-indicator'
        ]
      }
    ]
  },
  {
    package: '@skyux/router',
    modules: [
      {
        name: 'SkyAppLinkModule',
        matches: [
          'skyAppLink',
          'SkyAppLink'
        ]
      }
    ]
  },
  {
    package: '@skyux/select-field',
    modules: [
      {
        name: 'SkySelectFieldModule',
        matches: [
          'SkySelectField',
          'sky-select-field'
        ]
      }
    ],
    importPaths: [
      {
        typeName: 'SkySelectField',
        path: '@skyux/select-field/modules/select-field/types'
      }
    ]
  },
  {
    package: '@skyux/tabs',
    nonModuleMatches: [
      'SkySectionedFormComponent'
    ],
    modules: [
      {
        name: 'SkySectionedFormModule',
        matches: [
          'sky-sectioned-form',
          'SkySectionedForm'
        ]
      },
      {
        name: 'SkyTabsModule',
        matches: [
          'SkyTab',
          'sky-tab'
        ]
      },
      {
        name: 'SkyVerticalTabsetModule',
        matches: [
          'sky-vertical-tab'
        ]
      }
    ]
  },
  {
    package: '@skyux/theme',
    nonModuleMatches: [
      'SkyAppViewportService'
    ]
  },
  {
    package: '@skyux/tiles',
    modules: [
      {
        name: 'SkyTilesModule',
        matches: [
          'sky-tile',
          'SkyTile'
        ]
      }
    ]
  },
  {
    package: '@skyux/toast',
    modules: [
      {
        name: 'SkyToastModule',
        matches: [
          'sky-toast',
          'SkyToast'
        ]
      }
    ]
  },
  {
    package: '@skyux/validation',
    nonModuleMatches: [
      'SkyEmailValidationDirective',
      'SkyUrlValidationDirective'
    ],
    modules: [
      {
        name: 'SkyEmailValidationModule',
        matches: [
          'skyEmailValidation'
        ]
      },
      {
        name: 'SkyUrlValidationModule',
        matches: [
          'skyUrlValidation'
        ]
      }
    ]
  },
  {
    package: '@skyux-sdk/testing',
    nonModuleMatches: [
      'expect',
      'SkyAppTestUtility'
    ]
  },
  {
    package: '@skyux-sdk/e2e',
    nonModuleMatches: [
      'SkyHostBrowser'
    ]
  },
  {
    package: '@skyux-sdk/pact',
    nonModuleMatches: [
      'SkyPact'
    ]
  }
];

/**
 * Adds the specified package to the package list if it doesn't yet exist.
 * @param {*} packageList The existing package list.
 * @param {*} matchingPackage The package to add.
 * @param {*} match The matching string that caused the package to be included.
 */
function addPackageToList(packageList, matchingPackage, match) {
  const packageName = matchingPackage.package;

  packageList[packageName] = packageList[packageName] || [];

  if (matchingPackage.modules) {
    const modulesToImport = matchingPackage.modules.filter(
      module => module.matches.some(
        moduleMatch => match.indexOf(moduleMatch) === 0
      )
    );

    for (const moduleToImport of modulesToImport) {
      if (packageList[packageName].indexOf(moduleToImport.name) === -1) {
        packageList[packageName].push(moduleToImport.name);
      }
    }
  }
}

/**
 * Searches the application's source code and determines which SKY UX NPM packages to install,
 * then returns a list of the packages along with any Angular modules that should be imported
 * into the application's Angular module.
 */
async function createPackageList() {
  const packageList = { };

  const results = await findInFiles.find(
    {
      term:'[Ss](ky|tache)[A-z0-9\\-]+',
      flags: 'g'
    },
    'src',
    '(\\.html$|\\.ts$)'
  );

  for (const fileName of Object.keys(results)) {
    const result = results[fileName];

    for (const match of result.matches) {
      const matchingPackages = findMatchingPackages(match);

      for (const matchingPackage of matchingPackages) {
        logger.info(`Found matching package ${matchingPackage.package} for ${match} in ${fileName}`);
        addPackageToList(packageList, matchingPackage, match);
      }
    }
  }

  return packageList;
}

/**
 * Finds the package that contains the specified match.
 * @param {*} match The match for the corresponding package.
 */
function findMatchingPackages(match) {
  const matchingPackages = packageMap.filter(
    item => (
      item.nonModuleMatches && item.nonModuleMatches.some(
        (
          itemMatch => match.indexOf(itemMatch) === 0
        )
      )
    )
    ||
    (
      item.modules && item.modules.some(
        module => module.name === match || module.matches.some(
          moduleMatch => match.indexOf(moduleMatch) === 0
        )
      )
    )
  );

  return matchingPackages;
}

function getPackage(packageName) {
  return packageMap.find(item => item.package === packageName);
}

module.exports = {
  getPackage,
  createPackageList,
  findMatchingPackages
};
