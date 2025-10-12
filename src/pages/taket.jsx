import React, { useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "@mui/material";

export default function BatchImport({ produkter }) {
  const [batches, setBatches] = useState([]);

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const imported = [];

      // Hoppa över första raden (header)
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        const batchNummer = row[0];
        const produktNamn = row[1];

        if (!batchNummer || !produktNamn) continue;

        const produkt = produkter.find(p => p.namn === produktNamn);
        if (!produkt) continue;

        // Beräkna sluttid (maskintid i timmar * 3600000 = ms)
        const maskintid = Number(produkt.InstrumenttidPerBatch) || 1;
        const start = new Date();
        const end = new Date(start.getTime() + maskintid * 3600000);

        imported.push({
          id: batchNummer,
          produktId: produkt.id,
          produktNamn: produkt.namn,
          startTid: start,
          slutTid: end,
          laborant: "Ej tilldelad",
        });
      }

      setBatches(imported);
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div style={{ padding: 20 }}>
      <Button variant="contained" component="label">
        Importera CSV
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleImport}
          hidden
        />
      </Button>

      {batches.length > 0 && (
        <>
          <h3>Importerade batcher</h3>
          <table style={{ borderCollapse: "collapse", width: "100%", marginTop: 10 }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid black", padding: 5 }}>Batchnummer</th>
                <th style={{ border: "1px solid black", padding: 5 }}>Produkt</th>
                <th style={{ border: "1px solid black", padding: 5 }}>Starttid</th>
                <th style={{ border: "1px solid black", padding: 5 }}>Sluttid</th>
                <th style={{ border: "1px solid black", padding: 5 }}>Laborant</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((batch, idx) => (
                <tr key={`${batch.id}-${idx}`}>
                  <td style={{ border: "1px solid black", padding: 5 }}>{batch.id}</td>
                  <td style={{ border: "1px solid black", padding: 5 }}>{batch.produktNamn}</td>
                  <td style={{ border: "1px solid black", padding: 5 }}>{batch.startTid.toLocaleString()}</td>
                  <td style={{ border: "1px solid black", padding: 5 }}>{batch.slutTid.toLocaleString()}</td>
                  <td style={{ border: "1px solid black", padding: 5 }}>{batch.laborant}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
