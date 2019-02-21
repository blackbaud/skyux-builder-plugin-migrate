# 1.1.2 (2019-02-21)

- Added logic to not add `AppSkyModule` to `AppExtrasModule` if it had been added by a previous run of the migration plugin. [#13] (https://github.com/blackbaud/skyux-sdk-builder-plugin-migrate/pull/13)

# 1.1.1 (2019-02-19)

- Added missing types to package map. [#11] (https://github.com/blackbaud/skyux-sdk-builder-plugin-migrate/pull/11)

# 1.1.0 (2019-02-11)

- Inject the SKY UX stylesheet using `skyuxconfig.json` instead of a `require()` statement in `app-sky.module.ts`. [#5] (https://github.com/blackbaud/skyux-sdk-builder-plugin-migrate/issues/5)
- Fixed bug where comma was not being added after the `exports` section in `app-extras.module.ts` when the module already included other properties such as `imports` or `providers`. [#6] (https://github.com/blackbaud/skyux-sdk-builder-plugin-migrate/issues/6)
- Added `skyux upgrade` command for upgrading dependencies for an existing SKY UX 3 application. [#7](https://github.com/blackbaud/skyux-sdk-builder-plugin-migrate/pull/7)

# 1.0.0 (2019-01-24)

- Initial release.
