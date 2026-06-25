const splitCsvLine = line => {
  const cells = [];
  let current = '';
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) {
      cells.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  cells.push(current.trim());
  return cells;
};

export const parseCsv = csvText => {
  const lines = String(csvText || '')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return [];
  }

  const headers = splitCsvLine(lines[0]).map(header => header.trim());

  return lines.slice(1).map((line, index) => {
    const values = splitCsvLine(line);
    return headers.reduce(
      (row, header, columnIndex) => ({
        ...row,
        [header]: values[columnIndex] || '',
      }),
      {rowNumber: index + 2},
    );
  });
};

export const STUDENT_CSV_TEMPLATE =
  'Full Name,Gender,DOB,Father Name,Father Mobile,Mother Name,Mother Mobile,Guardian Name,Guardian Mobile,Class,Section,Admission Date\n';
