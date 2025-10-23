import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from "@mui/material";

// Anta: Du hämtar analyspaket och analyser från din "databas"/state/context
// Här är exempel-API inuti komponenten för pedagogik, byt till rätt import!
const analyspaket = {/* "Produktnamn": ["Analys1", "Analys2", ...] */};
const analyser = {/* "Analysnamn": { analystid: 4, instrumenttid: 22, ... } */};

export default function BatchPlanBase() {
  const [batches, setBatches] = useState([]);

  // Import batcher från .csv
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      delimiter: ";",
      complete: res => setBatches(res.data),
      skipEmptyLines: true
    });
    e.target.value = null;
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Batch-översikt med kopplade analyser och tider</Typography>
      <Button variant="outlined" component="label" sx={{ mb: 2 }}>
        Importera batch.csv
        <input type="file" accept=".csv" hidden onChange={handleImport} />
      </Button>

      <TableContainer sx={{ maxHeight: 560, overflowY: 'auto' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>Batchnummer</TableCell>
              <TableCell>Produkt</TableCell>
              <TableCell>Analys</TableCell>
              <TableCell>Analystid (h)</TableCell>
              <TableCell>Instrumenttid (h)</TableCell>
              <TableCell>Summa tid (h)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {batches.flatMap(batch => {
              const produkt = batch.Produkt; // ex "KV C USA"
              const batchnummer = batch.Batchnummer;
              const analyserLista = analyspaket[produkt] || [];
              return analyserLista.map(analysNamn => {
                const tider = analyser[analysNamn] || {};
                const analystid = tider["Analystid (mantimmar)"] || tider.analystid || "";
                const instrumenttid = tider["Instrumenttid per sekvens (h)"] || tider.instrumenttid || "";
                const summa = (Number(analystid) + Number(instrumenttid)) || "";
                return (
                  <TableRow key={batchnummer + analysNamn}>
                    <TableCell>{batchnummer}</TableCell>
                    <TableCell>{produkt}</TableCell>
                    <TableCell>{analysNamn}</TableCell>
                    <TableCell>{analystid}</TableCell>
                    <TableCell>{instrumenttid}</TableCell>
                    <TableCell>{summa}</TableCell>
                  </TableRow>
                );
              });
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
