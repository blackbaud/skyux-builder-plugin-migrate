# 1.8.0 (2019-06-07)

- Added missing types from `@skyux/omnibar-interop` package. [#58](https://github.com/blackbaud/skyux-sdk-builder-plugin-migrate/pull/58)

# 1.7.2 (2019-06-04)

- Fixed a typo in warning message. [#65](https://github.com/blackbaud/skyux-sdk-builder-plugin-migrate/pull/65)

# 1.7.1 (2019-05-24)

- Fixed Stache functionality to install `@blackbaud/skyux-lib-code-block` if the `stache-markdown` component is found within HTML templates. [#60](https://github.com/blackbaud/skyux-sdk-builder-plugin-migrate/pull/60)

# 1.7.0 (2019-05-23)

- Added `@skyux-sdk/e2e` to the list of `devDependencies` to install during the `skyux migrate` and `skyux upgrade` commands. [#60](https://github.com/blackbaud/skyux-sdk-builder-plugin-migrate/pull/60)
- Fixed Stache functionality to install the latest version of `@blackbaud/skyux-builder-plugin-auth-email-whitelist`. [#61](https://github.com/blackbaud/skyux-sdk-builder-plugin-migrate/pull/61)

# 1.6.0 (2019-05-20)

- Added functionality to assist in migrating Stache SPAs. [#57](https://github.com/blackbaud/skyux-sdk-builder-plugin-migrate/pull/57)
- Added the ability for packages to install the recommended Builder plugins during `skyux migrate`. [#56](https://github.com/blackbaud/skyux-sdk-builder-plugin-migrate/pull/56)
- Fixed `skyux upgrade` to recursively look up peer dependencies. [#55](https://github.com/blackbaud/skyux-sdk-builder-plugin-migrate/pull/55)
- Fixed `skyux upgrade` to pull in the supported version of the `zone.js` dependency. [#53](https://github.com/blackbaud/skyux-sdk-builder-plugin-migrate/pull/53)
- Fixed `skyux upgrade` to support packages with pre-release versions. [#44](https://github.com/blackbaud/skyux-sdk-builder-plugin-migrate/pull/44)
- Fixed `skyux migrate` to provide the correct URL to the migration guide. [#45](https://github.com/blackbaud/skyux-sdk-builder-plugin-migrate/pull/45)

# 1.5.1 (2019-04-18)

- Fixed an issue where `NumericOptions` was not recognized when imported from SKY UX. [#48](https://github.com/blackbaud/skyux-sdk-builder-plugin-migrate/pull/48)

# 1.5.0 (2019-04-02)

- Added the `SkyPopoverMessage` and `SkySectionedForm` types to the package map and added `.` as a valid character in the import path. [#42](https://github.com/blackbaud/skyux-sdk-builder-plugin-migrate/pull/42)
- Added the `SkyAppResourcesTestingService` type to the package map and made the `sky-error` matcher more generic. [#32](https://github.com/blackbaud/skyux-sdk-builder-plugin-migrate/pull/32)
- Added `@pact-foundation/pact` as a dev dependency. [#41](https://github.com/blackbaud/skyux-sdk-builder-plugin-migrate/pull/41)

# 1.4.0 (2019-03-19)

- Added the `SkyAutocompleteSearchFunctionFilter`, `SkyEmailValidationDirective`, `SkyNavbarModule`, and `SkySectionedFormComponent` types to the package map. [#35](https://github.com/blackbaud/skyux-sdk-builder-plugin-migrate/pull/35)

# 1.3.0 (2019-03-12)

- Added a check to ensure the client is running the latest version of the plugin. [#22](https://github.com/blackbaud/skyux-sdk-builder-plugin-migrate/pull/22)
- Added the `SkyDateFormatter`, `SkyProgressIndicatorChange`, `SkyProgressIndicatorDisplayMode`, `SkyProgressIndicatorMessageType`, and `SkyUrlValidationDirective` types to the package map. [#26](https://github.com/blackbaud/skyux-sdk-builder-plugin-migrate/pull/26) [#27](https://github.com/blackbaud/skyux-sdk-builder-plugin-migrate/pull/27)

# 1.2.0 (2019-03-01)

- Add `.skypagestmp` to the `.gitignore` file during migration if it is not present. [#18] (https://github.com/blackbaud/skyux-sdk-builder-plugin-migrate/pull/18)

- Update the `.nvmrc` file to `lts/dubnium` during migration. [#18] (https://github.com/blackbaud/skyux-sdk-builder-plugin-migrate/pull/18)

# 1.1.2 (2019-02-21)

- Added logic to not add `AppSkyModule` to `AppExtrasModule` if it was added by a previous run of the migration plugin. [#13] (https://github.com/blackbaud/skyux-sdk-builder-plugin-migrate/pull/13)

# 1.1.1 (2019-02-19)

- Added missing types to the package map. [#11] (https://github.com/blackbaud/skyux-sdk-builder-plugin-migrate/pull/11)

# 1.1.0 (2019-02-11)

- Inject the SKY UX stylesheet using `skyuxconfig.json` instead of a `require()` statement in `app-sky.module.ts`. [#5] (https://github.com/blackbaud/skyux-sdk-builder-plugin-migrate/issues/5)
- Fixed a bug where a comma was not added after the `exports` section in `app-extras.module.ts` when the module already included other properties such as `imports` or `providers`. [#6] (https://github.com/blackbaud/skyux-sdk-builder-plugin-migrate/issues/6)
- Added the `skyux upgrade` command to upgrade dependencies for existing SKY UX 3 applications. [#7](https://github.com/blackbaud/skyux-sdk-builder-plugin-migrate/pull/7)

# 1.0.0 (2019-01-24)

- Initial release.
