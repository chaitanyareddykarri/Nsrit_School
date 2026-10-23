// Compile-only fixture: no Firebase credentials and no live service calls.
const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const configPath = 'src/config/env.js';
const useLocalConfig = process.argv.includes('--local-config');
if (!useLocalConfig && fs.existsSync(configPath)) throw new Error('Refusing to overwrite local env.js');
if (useLocalConfig && !fs.existsSync(configPath)) throw new Error('Local env.js is missing');
if (!useLocalConfig) fs.copyFileSync('src/config/env.example.js', configPath);
try {
  for (const platform of ['android', 'ios']) {
    const output = path.join('build', 'ci', platform);
    fs.mkdirSync(output, {recursive: true});
    const result = spawnSync(process.execPath, [
      'node_modules/react-native/cli.js', 'bundle',
      '--platform', platform, '--dev', 'false', '--entry-file', 'index.js',
      '--bundle-output', path.join(output, 'index.bundle'),
      '--assets-dest', output, '--max-workers', '2',
    ], {stdio: 'inherit'});
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`${platform} bundling failed`);
  }
} finally {
  if (!useLocalConfig) fs.unlinkSync(configPath);
}
