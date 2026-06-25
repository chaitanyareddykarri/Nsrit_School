Firebase Data Connect SDK generation was validated with:

`firebase dataconnect:sdk:generate --service nsrit-school-2b749-service --location asia-south1`

The official JavaScript generator emits `.d.ts` files. This project has a strict
JavaScript/JSX-only rule, so generated declaration files are not checked in.
Runtime integration is handled by `src/services/dataconnect/dataConnectClient.js`
and the JS-only operation facade in `src/dataconnect-generated/index.js`.
