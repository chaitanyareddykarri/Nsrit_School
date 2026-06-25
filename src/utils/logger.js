// Dev-only logger — all calls compile to no-ops in production builds.
// Use a Babel plugin (babel-plugin-transform-remove-console) to strip these
// at build time, or rely on the __DEV__ guard below.

const noop = () => {};

const logger = __DEV__
  ? {
      log:   (...args) => console.log(...args),
      warn:  (...args) => console.warn(...args),
      error: (...args) => console.error(...args),
    }
  : {log: noop, warn: noop, error: noop};

export default logger;
