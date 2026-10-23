# GitHub Actions setup

## Workflows

- **Project CI** runs on every pull request, pushes to `master`/`main`, and manual requests. It installs locked dependencies (including native patches), parses source, runs Jest, audits both dependency trees, and bundles Android/iOS JavaScript. Bundles use an empty, compile-only Firebase config; they do not connect to Firebase or prove native runtime behavior.
- **Build Android Debug APK** is manually dispatched from `master`/`main`, reruns CI for that commit, then builds an APK on Linux with JDK 17 and the repository SDK/NDK versions. The seven-day artifact is debug-signed and requires Metro; it is not a Play Store release or standalone production app.
- **Deploy Firebase Functions** is manually dispatched from `master`/`main`, reruns CI for that commit, then deploys only `functions:setUserClaims`. It does not deploy database schema, Storage/Firestore rules, or mobile binaries. Those services have unresolved setup/access issues documented in `SETUP_CHECKLIST.md` and are intentionally outside this deployment target.

GitHub-hosted runners are required by these action versions. Workflows use read-only repository access, no persisted checkout credentials, and no pull-request access to deployment credentials. Dependabot checks GitHub Action updates weekly.

## Configure GitHub Environments

Create both environments in repository **Settings > Environments**. Restrict their deployment branches to `master`/`main`. Add required reviewers to `firebase-production` before using it. Workflow YAML alone does not create approval protection.

### android-build

Add environment secrets:

| Secret | Value |
| --- | --- |
| `GOOGLE_SERVICES_JSON` | Complete JSON from `android/app/google-services.json`; plain JSON, not base64. |
| `APP_ENV_JS` | Complete configured `src/config/env.js` source. Do not put server private keys here: mobile config is bundled into apps. |

The workflow validates the native application ID. Ensure both configs target the same intended Firebase project. They are only written inside the ephemeral runner; only the debug APK is uploaded.

### firebase-production

Add environment variables:

| Variable | Value |
| --- | --- |
| `FIREBASE_PROJECT_ID` | `nsrit-school-2b749` (the source currently hardcodes this project). |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | Full Google workload identity provider resource name. |
| `GCP_DEPLOY_SERVICE_ACCOUNT` | Deployment service-account email. |

Configure Google Workload Identity Federation for this specific GitHub repository and trusted deployment branches/environment. Grant the GitHub principal permission to impersonate the deployment service account, and grant that account only the permissions required to deploy the existing Gen 2 function and act as its runtime service account. Required API enablement, billing, Artifact Registry/Cloud Build and runtime IAM must be configured in Google Cloud. The pipeline does not create projects, IAM grants or billing resources. Authentication uses short-lived OIDC credentials, not a stored service-account key or FIREBASE_TOKEN.

Firebase CLI is pinned to the locally checked 15.34.1 release for deployment reproducibility. Upgrade deliberately. Functions install/deploy uses Node 20 to match `functions/package.json`; mobile checks use Node 24.19.0.

## Check policy and limits

Protect `master`/`main` with required `Mobile checks` and `Functions checks` statuses after the first successful GitHub run. Root audit fails on moderate or worse. Functions audit fails on high/critical while still displaying existing moderate uuid-chain findings (eight in the latest installed-tree audit); this is an explicit current limitation, not a clean backend audit.

Source parsing is not ESLint or typechecking. Existing repository-wide style/lint debt is not silently converted to a passing lint job. CI has unit tests and bundle checks but no device/emulator integration tests or backend behavior tests. iOS native build/signing and Android release signing remain separate setup tasks. Review `SETUP_CHECKLIST.md` for App Check, Storage paths/rules, iOS Firebase initialization, notification delivery and deployment prerequisites.

## Local commands

```powershell
npm ci
node scripts/check-source.cjs
node scripts/check-dependencies.cjs
npm test -- --ci --runInBand
node scripts/ci-bundle.cjs
npm audit --audit-level=moderate
npm ci --prefix functions
node --check functions/index.js
npm audit --prefix functions --audit-level=high
```

`ci-bundle.cjs` refuses to overwrite an existing `env.js`. To compile with your existing local config, use `node scripts/ci-bundle.cjs --local-config`; this still only bundles code, without validating Firebase connectivity. Outputs are ignored under `build/ci/`.

If the supplied Android Firebase JSON is in `android/` rather than `android/app/`, run `node scripts/configure-android.cjs`. It validates project/package IDs, copies to Gradle's expected location, and creates a missing `env.js` from the actual supplied values. It does not overwrite existing config or print API keys. The derived app ID is Android-specific; use a separately registered web app config if you later activate the currently unused web-auth initialization module.

References: [Firebase CLI authentication](https://firebase.google.com/docs/cli), [Google GitHub OIDC authentication](https://github.com/google-github-actions/auth).

## Local validation on 2026-10-23

- actionlint 1.7.12 passed all workflow checks (external shellcheck/pyflakes disabled); workflow YAML also parsed successfully.
- All 13 Jest tests passed. Source parsing and all nine dependency patches passed.
- Both Android and iOS production-mode JavaScript bundles completed with the supplied local config; outputs remain ignored under `build/ci/`.
- Metro file-path image loading and SheetJS Excel round-trip regression checks passed.
- Root audit: zero findings. Functions installed-tree audit: eight moderate, no high/critical. Backend dependencies were installed locally with lifecycle scripts disabled under Node 24; function syntax and callable-export loading passed. CI will use the declared Node 20 runtime and normal `npm ci`.
- Android Firebase project/package values match the repository; both JSON locations and local env.js are ignored and untracked.
- GitHub workflows have not run remotely. APK/device testing is unavailable here: no Android SDK/adb was found in the checked local paths/environment, and Java is 27 rather than the workflow's JDK 17. iOS native builds require a Mac. No Firebase deployment or authenticated end-to-end service test was performed.
