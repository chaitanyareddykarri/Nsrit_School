const assert = require('node:assert/strict');
const path = require('node:path');
const XLSX = require('xlsx');
const {getAssetData} = require('metro/private/Assets');

async function main() {
  // Exercise Metro's real file-path call site, not only image-size's buffer API.
  const asset = await getAssetData(path.resolve('src/screens/assets/logo.png'),
    'logo.png', [], 'android', '/assets');
  assert(asset.width > 0 && asset.height > 0);
  const rows = [{Student: 'CI fixture', Marks: 85}];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), 'Marks');
  const encoded = XLSX.write(workbook, {type: 'base64', bookType: 'xlsx'});
  const decoded = XLSX.read(encoded, {type: 'base64'});
  assert.deepEqual(XLSX.utils.sheet_to_json(decoded.Sheets.Marks), rows);
  console.log('Metro asset loading and XLSX round-trip passed.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
