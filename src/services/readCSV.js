import Papa from "papaparse";

export function parseCSV(file, callback) {
  Papa.parse(file, {
    header: true,
    delimiter: ";",
    skipEmptyLines: true,
    complete: function(results) {
      callback(results.data);
    },
  });
}
