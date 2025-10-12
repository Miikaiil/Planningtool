import * as XLSX from 'xlsx';

function handleFileImport(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (evt) => {
    const data = new Uint8Array(evt.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const firstSheet = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheet];
    
    // Omvandla arket till JSON-array med SheetJS
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

    console.log("Importerad data:", jsonData);
    // Här kan du göra mappning till intern modell och uppdatera state
  };
  reader.readAsArrayBuffer(file);
}
