import * as XLSX from 'xlsx';

export async function readExcel(url) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const data = new Uint8Array(arrayBuffer);
  const workbook = XLSX.read(data, { type: 'array' });

  // OBS! Kolla det exakta namnet på ditt blad!
  const sheetName = 'Capacity Instruments QC';
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet);
  return jsonData;
}
