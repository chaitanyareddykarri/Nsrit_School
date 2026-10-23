# Local setup and configuration review

Reviewed 2026-10-23. This is a source/local-environment review, not confirmation of deployed Firebase resources. Older FIREBASE_SETUP.md and FCM_SETUP.md contain outdated architecture/status descriptions; use this inventory for current checkout requirements.

## Architecture and existing identifiers

The app uses native Firebase Authentication (phone OTP), Storage, Messaging and callable Functions. School records, including notices and timetables, use Firebase Data Connect backed by PostgreSQL. The `firebase` JavaScript package is also installed; its presence does not mean the app's school records use Firestore. Firestore rule/index files remain in the deployment configuration.

Existing repository references (verify against the intended Firebase project before fetching configs or deploying):

- Project: `nsrit-school-2b749`
- Android application ID: `com.nsritschoolapp`
- Data Connect region: `asia-south1`
- Service: `nsrit-school-2b749-service`
- Connector: `nsrit`
- SQL instance: `nsrit-school-2b749-2-instance`
- Database: `nsrit-school-2b749-2-database`
- iOS bundle identifier is still a React Native template expression; confirm the real registered identifier.

## Files needed locally

| File | Local status at review | Purpose/action |
| --- | --- | --- |
| `src/config/env.js` | Created locally, Git-ignored | Derived from the supplied Android Firebase config; includes the repository Data Connect service identifier. Live connectivity is unverified. |
| `android/app/google-services.json` | Present, Git-ignored | Validated project/package IDs and copied from user-supplied `android/google-services.json` to Gradle's required location. |
| `ios/NSRITSchoolApp/GoogleService-Info.plist` | Missing, Git-ignored | Native iOS Firebase config; must also be included in the application target in Xcode. |
| `android/local.properties` | Missing, Git-ignored | Set `sdk.dir` to the actual Android SDK path, or configure `ANDROID_HOME`. Neither Android SDK environment variable was set in this shell. |
| Android release keystore and signing properties | Release wiring incomplete | Release currently uses the debug signing configuration. Configure a real release key before distributing builds. |
| Apple signing/provisioning and push capabilities | Not verified/configured in reviewed sources | Requires macOS/Xcode, registered bundle ID, signing team and APNs setup. |

`env.js` must export `firebaseConfig`, `dataConnectConfig`, `USE_EMULATOR`, `USE_AUTH_EMULATOR`, and `authConfig` (all now present in the example). Firebase values are `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, and `appId`. Obtain actual values from the registered Firebase app; do not guess the bucket suffix or app ID. `apiConfig` is present in the example but has no current consumers found in source.

Native config alone does not satisfy the JavaScript `env.js` imports. A root `.env` file is not loaded by the current configuration.

After authenticating and confirming the existing project/app IDs, fetch native configs with:

```powershell
npx -y firebase-tools@latest apps:list --project nsrit-school-2b749
npx -y firebase-tools@latest apps:sdkconfig ANDROID <ANDROID_APP_ID> --project nsrit-school-2b749
npx -y firebase-tools@latest apps:sdkconfig IOS <IOS_APP_ID> --project nsrit-school-2b749
npx -y firebase-tools@latest apps:sdkconfig WEB <WEB_APP_ID> --project nsrit-school-2b749
```

Save only the returned config content to the appropriate files. The web config supplies the JavaScript Firebase options. Do not place service-account private keys, database passwords, signing-key passwords, or APNs private keys in mobile source/config files.

## Existing checked-in configuration

| Files | Responsibility |
| --- | --- |
| `.firebaserc`, `firebase.json` | Project alias, deploy sources, emulator ports. |
| `dataconnect/dataconnect.yaml` | PostgreSQL instance/database and Data Connect service/region. |
| `dataconnect/connectors/nsrit/connector.yaml` | Active connector and generated SDK output. |
| `dataconnect/schema/schema.gql`, connector `queries.gql` and `mutations.gql` | Database schema and server-side operation authorization. |
| `src/dataconnect-generated/` | Generated SDK; regenerate when connector definitions change, not merely when npm dependencies update. |
| `functions/index.js`, `functions/package.json`, `functions/package-lock.json` | Separate backend package and `setUserClaims` function. Root npm install does not install this package. |
| `storage.rules` | Storage access paths, roles, file types and limits. |
| `firestore.rules`, `firestore.indexes.json` | Retained Firestore deployment configuration; current notices/timetables services use Data Connect. |
| `babel.config.js`, `metro.config.js`, `patches/` | Worklets plugin, bundler settings and eight native dependency patches. |
| `android/build.gradle`, `android/app/build.gradle`, `android/gradle.properties` | SDK/NDK versions, Firebase plugin, native architecture and signing. |
| `ios/Podfile`, AppDelegate and Xcode project | iOS native dependencies, initialization and target settings. |

## External setup and unresolved integration issues

1. Enable/verify Firebase Phone Authentication, SMS region policy/quota and Android signing SHA-1/SHA-256 fingerprints. Existing staff/parent profiles and roles must be provisioned in Data Connect for login to resolve an account.
2. Verify the Data Connect schema/connector deployment and SQL resources. Local YAML files do not prove these are deployed.
3. Install backend dependencies separately (`npm ci --prefix functions`) before local backend work. The functions package declares Node 20 while this shell runs Node 24; use a matching runtime for backend validation. Verify service-account permissions for the function's Data Connect role lookup. Client `functions()` and the function's default region must agree with the actual deployment.
4. `setUserClaims` enforces App Check, but no client App Check dependency/initialization was found. Provider registration and client initialization are needed; do not disable enforcement as a workaround. Failed claims stamping can prevent Storage authorization.
5. Student upload code writes `students/{studentId}/documents/...`, while checked-in Storage rules permit staff uploads under `studentDocs/{branchId}/{studentId}/...`. These require coordinated code/rules/access review before uploads can work. Current document read rules also allow any authenticated user; Data Connect authorization does not protect direct Storage reads.
6. iOS AppDelegate lacks Firebase initialization; the Podfile does not default to the static-framework configuration needed by installed RNFirebase 25.1.0. Complete native integration alongside the real plist, bundle ID and Xcode target setup, then validate on macOS.
7. FCM registration/listening exists, but this backend contains no push-send function. Background handler registration is currently inside the React component rather than the entry point. Android creates channel `nsrit_alerts`; the old FCM guide describes a different channel. iOS needs APNs credentials and Push Notifications/Remote Notifications capabilities.
8. Emulator configuration is partial: Auth and Data Connect have client switches, but callable Functions and Storage are not redirected. Do not assume `USE_EMULATOR` isolates all operations from hosted services.
9. `initSecureStorage()` exists but has no application call site. Encrypted local storage is not yet established by startup wiring.

## Package update follow-up

- CLI packages are aligned at 20.2.0 for React Native 0.85.3.
- SheetJS uses its official 0.20.3 tarball; spreadsheet read/write round-trip passed.
- Scoped overrides select gRPC 1.13.7 for Firestore and image-size 2.0.4 for Metro. Metro's default image parser export and buffer parsing were checked. Retest/remove these overrides when upstream dependencies adopt patched versions.
- The original eight patches applied after installation. A ninth patch, `metro+0.84.4.patch`, adapts Metro's file-path image parsing to image-size 2's byte input; the full bundle check exposed this compatibility requirement. Preserve patched versions until patches are reviewed for upgrades.
- Three dependency install scripts were reviewed and approved by exact version in `allowScripts`; future version changes need another review.
- Node engine now matches installed React Native's supported range. Local Node was 24.19.0. Java was 27; use JDK 17 for this Android setup rather than assuming Java 27 works with the checked-in Gradle toolchain.
- Deprecated document-picker, vector-icons and ESLint packages still need separate API/native/config migrations. A zero audit count does not remove deprecation warnings on a fresh install.
- Fixed a missing `authConfig` example export and a stray backtick that made the CSV upload service invalid JavaScript. These were existing issues, not caused by the dependency upgrades.

## Verification boundary

The root lockfile audit still reports zero vulnerabilities; all 13 unit tests pass and 308 source files parse. Prior CLI configuration, image parsing, spreadsheet round-trip and patch application checks passed. Firebase CLI version 15.34.1 was verified; cloud authentication/project access was not checked.

The separate functions lockfile initially reported 16 vulnerabilities (1 critical, 3 high, 12 moderate). Compatible lockfile fixes removed all critical/high findings. The initial follow-up reported 9 moderate findings; the latest installed-tree audit reports 8 moderate findings inherited from older uuid dependencies. npm proposes a major firebase-admin upgrade to resolve that tree; this was not applied without reviewing backend compatibility. Dependencies were subsequently installed with lifecycle scripts disabled; syntax and callable-export loading passed locally under Node 24, but backend service behavior was not tested. The backend must not be described as audit-clean.

Both Android and iOS production-mode JavaScript bundles now pass after the Metro compatibility patch. GitHub workflow validation also passes. See `.github/CI_CD.md` for the complete CI/CD setup and current validation evidence.

Native Android/iOS builds and live Firebase login, claims, uploads and notifications remain unverified. Missing real configs are not replaced with fabricated credentials.

References: [React Native environment setup](https://reactnative.dev/docs/set-up-your-environment), [React Native Firebase setup](https://rnfirebase.io/), [SheetJS installation](https://docs.sheetjs.com/docs/getting-started/installation/nodejs/).
