const fs = require('node:fs');
const path = require('node:path');
const {parseSync} = require('@babel/core');

let count = 0;
function check(file) {
  parseSync(fs.readFileSync(file, 'utf8'), {
    filename: file,
    babelrc: false,
    configFile: false,
    sourceType: 'unambiguous',
    parserOpts: {plugins: ['jsx', /\.tsx?$/.test(file) ? 'typescript' : 'flow']},
  });
  count++;
}
function walk(dir) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'dataconnect-generated') walk(file);
    } else if (/\.[jt]sx?$/.test(file)) check(file);
  }
}
walk('src');
walk('__tests__');
check('App.jsx');
check('index.js');
check('functions/index.js');
console.log(`Parsed ${count} source files successfully.`);
