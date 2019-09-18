const exportToCsv = (data: any[], columns?: string[]) => {
  let csv = '';

  if (data && data.length > 0) {
    const replacer = (key: any, value: any) => (value === null ? '' : value);
    const header = columns || Object.keys(data[0]);
    const csvData = data.map((row: any) =>
      header.map(fieldName => (row[fieldName] ? JSON.stringify(row[fieldName], replacer) : '')).join(',')
    );
    csvData.unshift(header.join(','));
    csv = csvData.join('\r\n');
  }
  return csv;
};

export default {
  exportToCsv
};
