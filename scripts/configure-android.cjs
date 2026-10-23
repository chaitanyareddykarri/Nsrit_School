const fs = require('node:fs');
const project = JSON.parse(fs.readFileSync('.firebaserc', 'utf8')).projects.default;
const target = 'android/app/google-services.json';
const source = fs.existsSync(target) ? target : 'android/google-services.json';
const config = JSON.parse(fs.readFileSync(source, 'utf8').replace(/^\uFEFF/, ''));
const client = config.client?.find(item =>
  item.client_info?.android_client_info?.package_name === 'com.nsritschoolapp');
if (config.project_info?.project_id !== project || !client) {
  throw new Error('Firebase project or Android application ID does not match this repository');
}
if (!client.api_key?.[0]?.current_key || !client.client_info?.mobilesdk_app_id) {
  throw new Error('Firebase config is missing an API key or app ID');
}
if (source !== target) fs.copyFileSync(source, target, fs.constants.COPYFILE_EXCL);
if (!fs.existsSync('src/config/env.js')) {
  const options = {
    apiKey: client.api_key[0].current_key,
    authDomain: `${project}.firebaseapp.com`,
    projectId: project,
    storageBucket: config.project_info.storage_bucket || '',
    messagingSenderId: config.project_info.project_number,
    appId: client.client_info.mobilesdk_app_id,
  };
  const template = fs.readFileSync('src/config/env.example.js', 'utf8')
    .replace(/export const firebaseConfig = \{[\s\S]*?\};/,
      `export const firebaseConfig = ${JSON.stringify(options, null, 2)};`)
    .replace("serviceId: ''", "serviceId: 'nsrit-school-2b749-service'");
  fs.writeFileSync('src/config/env.js', template, {flag: 'wx'});
  console.log('Created local env.js from supplied Android config; existing configs are never overwritten.');
}
console.log('Firebase project and Android application ID validated. No config values printed.');
