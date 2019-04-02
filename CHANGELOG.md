# 1.5.0 (2019-04-02)

- Added `SkyPopoverMessage` and `SkySectionedForm` types to package map and added `.` as valid character in import path. [#42](https://github.com/blackbaud/skyux-sdk-builder-plugin-migrate/pull/42)
- Added `SkyAppResourcesTestingService` types to package map and made `sky-error` matcher more generic. [#32](https://github.com/blackbaud/skyux-sdk-builder-plugin-migrate/pull/32)
- Added `@pact-foundation/pact` as dev dependency. [#41](https://github.com/blackbaud/skyux-sdk-builder-plugin-migrate/pull/41)

# 1.4.0 (2019-03-19)

- Added `SkyAutocompleteSearchFunctionFilter`, `SkyEmailValidationDirective`, `SkyNavbarModule`, and `SkySectionedFormComponent` types to package map. [#35](https://github.com/blackbaud/skyux-sdk-builder-plugin-migrate/pull/35)

# 1.3.0 (2019-03-12)

- Added check to ensure client is running latest version of plugin. [#22](https://github.com/blackbaud/skyux-sdk-builder-plugin-migrate/pull/22)
- Added `SkyDateFormatter`, `SkyProgressIndicatorChange`, `SkyProgressIndicatorDisplayMode`, `SkyProgressIndicatorMessageType`, and `SkyUrlValidationDirective` types to package map. [#26](https://github.com/blackbaud/skyux-sdk-builder-plugin-migrate/pull/26) [#27](https://github.com/blackbaud/skyux-sdk-builder-plugin-migrate/pull/27)

# 1.2.0 (2019-03-01)

- Add `.skypagestmp` to `.gitignore` file during migration if it is not present. [#18] (https://github.com/blackbaud/skyux-sdk-builder-plugin-migrate/pull/18)

- Update `.nvmrc` file to `lts/dubnium` during migration. [#18] (https://github.com/blackbaud/skyux-sdk-builder-plugin-migrate/pull/18)

# 1.1.2 (2019-02-21)

- Added logic to not add `AppSkyModule` to `AppExtrasModule` if it had been added by previous run of migration plugin. [#13] (https://github.com/blackbaud/skyux-sdk-builder-plugin-migrate/pull/13)

# 1.1.1 (2019-02-19)

- Added missing types to package map. [#11] (https://github.com/blackbaud/skyux-sdk-builder-plugin-migrate/pull/11)

# 1.1.0 (2019-02-11)

- Inject SKY UX stylesheet using `skyuxconfig.json` instead of `require()` statement in `app-sky.module.ts`. [#5] (https://github.com/blackbaud/skyux-sdk-builder-plugin-migrate/issues/5)
- Fixed bug where comma was not added after `exports` section in `app-extras.module.ts` when module already included other properties such as `imports` or `providers`. [#6] (https://github.com/blackbaud/skyux-sdk-builder-plugin-migrate/issues/6)
- Added `skyux upgrade` command for upgrading dependencies for existing SKY UX 3 applications. [#7](https://github.com/blackbaud/skyux-sdk-builder-plugin-migrate/pull/7)

# 1.0.0 (2019-01-24)

- Initial release.
