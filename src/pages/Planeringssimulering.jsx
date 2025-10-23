import React, { useState } from "react";
import Papa from "papaparse";
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, LabelList,
} from "recharts";

// Lägg till instrument={instrument} nedan där du anropar komponenten

export default function Planeringsimulering({ produkter = [], analyser = [], instrument = [] }) {
  const [batches, setBatches] = useState([]);

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      delimiter: ";",
      skipEmptyLines: true,
      complete: (res) => setBatches(res.data),
    });
    e.target.value = null;
  };

  if (!produkter.length || !analyser.length || !instrument.length) {
    return <div>Laddar produkt-, analys- eller instrumentdata...</div>;
  }

  // Dynamisk koppling: Analys → tillgängliga instrument (alla instrument där analys finns i analysNamnLista)
  function hittaInstrumentForAnalys(analysnamn) {
    return instrument.filter((i) =>
      (i.analysNamnLista || []).includes(analysnamn)
    );
  }

  // Summera instrumentbeläggning per instrument
  const instrumentUsage = {};
  batches.forEach((batch) => {
    const produkt = (batch["Produkt"] || "").trim();
    const batchnummer = (batch["Batchnummer"] || "").trim();
    const prodObj = produkter.find((p) => (p.namn || "").trim() === produkt);
    const analyserLista = prodObj?.analysNamnLista || [];
    analyserLista.forEach((analysNamn) => {
      const analObj = analyser.find((an) => (an.Analys || an.namn) === analysNamn);
      const tid = Number(analObj?.["Instrumenttid per sekvens (h)"] || analObj?.instrumenttid || 0);
      const valbaraInstrument = hittaInstrumentForAnalys(analysNamn);

      // LÄGG PÅ SAMMA INSTRUMENT (simulera round-robin/första lediga)
      if (valbaraInstrument.length > 0) {
        const valt = valbaraInstrument[0].namn; // Här kan du vidareutveckla för round-robin etc.
        if (!instrumentUsage[valt]) instrumentUsage[valt] = 0;
        instrumentUsage[valt] += tid;
      }
    });
  });

  // Data för Recharts (kapacitet + beläggning)
  const ganttChartData = instrument.map(inst => ({
    instrument: inst.namn,
    "Beläggning (h)": instrumentUsage[inst.namn] || 0,
    "Tillgänglig kapacitet (h)": inst.timmarPerVecka || 0,
  }));

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Batch-översikt med kopplade analyser och tider
      </Typography>
      <Button variant="outlined" component="label" sx={{ mb: 2 }}>
        Importera batch.csv
        <input type="file" accept=".csv" hidden onChange={handleImport} />
      </Button>

      <TableContainer sx={{ maxHeight: 300, overflowY: "auto" }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>Batchnummer</TableCell>
              <TableCell>Produkt</TableCell>
              <TableCell>Analys</TableCell>
              <TableCell>Instrument (alla möjliga)</TableCell>
              <TableCell>Instrumenttid (h)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {batches.flatMap((batch, i) => {
              const produkt = (batch["Produkt"] || "").trim();
              const batchnummer = (batch["Batchnummer"] || "").trim();
              const prodObj = produkter.find((p) => (p.namn || "").trim() === produkt);
              const analyserLista = prodObj?.analysNamnLista || [];
              return analyserLista.map((analysNamn, ai) => {
                const analObj = analyser.find((an) => (an.Analys || an.namn) === analysNamn);
                const tid = analObj?.["Instrumenttid per sekvens (h)"] || analObj?.instrumenttid || "";
                const valbaraInstrument = hittaInstrumentForAnalys(analysNamn).map(i => i.namn).join(", ");
                return (
                  <TableRow key={batchnummer + analysNamn + ai}>
                    <TableCell>{batchnummer}</TableCell>
                    <TableCell>{produkt}</TableCell>
                    <TableCell>{analysNamn}</TableCell>
                    <TableCell>{valbaraInstrument || "Ingen instrumentkoppling"}</TableCell>
                    <TableCell>{tid}</TableCell>
                  </TableRow>
                );
              });
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h6" sx={{ mt: 4 }}>
        Instrumentens planerade totala beläggning vs kapacitet
      </Typography>
      <BarChart
        width={650}
        height={340}
        data={ganttChartData}
        layout="vertical"
        margin={{ top: 30, right: 60, left: 40, bottom: 20 }}
        style={{ marginTop: 20, marginBottom: 30 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" label={{ value: "h/vecka", position: "insideBottomRight", offset: 0 }} />
        <YAxis dataKey="instrument" type="category" width={180} />
        <Tooltip />
        <Legend />
        <Bar dataKey="Tillgänglig kapacitet (h)" fill="#94d82d">
          <LabelList dataKey="Tillgänglig kapacitet (h)" position="right" />
        </Bar>
        <Bar dataKey="Beläggning (h)" fill="#3b82f6">
          <LabelList dataKey="Beläggning (h)" position="right" />
        </Bar>
      </BarChart>
    </Paper>
  );
}
