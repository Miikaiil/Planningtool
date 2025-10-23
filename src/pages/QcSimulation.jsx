import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import {
  Paper,
  Typography,
  Button,
  TextField
} from "@mui/material";
import { runQcSimulation } from "../utils/simulation";
import QcGanttChart from "../components/QcGanttChart";

export default function QcSimulation({ produkter, analyser, instrument, analytiker }) {
  const [batcher, setBatcher] = useState([]);
  const [simResult, setSimResult] = useState([]);
  const [loading, setLoading] = useState(false);

  const [startDateTime, setStartDateTime] = useState(() => {
    const d = new Date();
    d.setHours(7, 0, 0, 0);
    return d.toISOString().slice(0,16);
  });

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      delimiter: ";",
      skipEmptyLines: true,
      complete: (result) => setBatcher(result.data),
      error: (err) => alert("Fel vid filuppladdning: " + err.message),
    });
  };

  useEffect(() => {
    if (!batcher.length || !analyser.length || !produkter.length || !instrument.length) return;
    setLoading(true);

    const startTime = new Date(startDateTime);
    const batcherWithArrival = batcher.map(b => {
      let ankomst = b.Ankomst;
      if (!ankomst || ankomst.trim() === "") {
        ankomst = startTime.toISOString();
      }
      return { ...b, Ankomst: ankomst };
    });

    const instrumentsConfig = {};
    analyser.forEach(a => {
      // Hitta instrument för denna analys
      const instObj = instrument.find(i => i.namn === (a.Analys || a.namn));
      instrumentsConfig[a.Analys || a.namn] = {
        duration: Number(a["Instrumenttid per sekvens (h)"] || a.instrumenttid || 30) * 60, // sekunder
        analysts: 1,
        maxSeq: instObj ? Number(instObj["Max sekvensstorlek"] || instObj["maxSekvensstorlek"] || 1) : 1
      };
    });

    const produktAnalyser = {};
    produkter.forEach(p => {
      produktAnalyser[p.namn] = p.analysNamnLista || [];
    });

    const totalAnalysts = analytiker.length || 2;

    const sim = runQcSimulation(batcherWithArrival, instrumentsConfig, produktAnalyser, totalAnalysts);
    setSimResult(sim);
    setLoading(false);
  }, [batcher, analyser, produkter, instrument, analytiker, startDateTime]);

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>QC FIFO Simulering</Typography>

      <TextField
        type="datetime-local"
        label="Starttid simulering"
        value={startDateTime}
        onChange={e => setStartDateTime(e.target.value)}
        sx={{ mb: 2 }}
        InputLabelProps={{ shrink: true }}
      />

      <Button variant="outlined" component="label" sx={{ mb: 2 }}>
        Välj batch-CSV
        <input type="file" accept=".csv" hidden onChange={handleImport} />
      </Button>

      {loading && <Typography>Simulerar...</Typography>}

      {simResult.length > 0 && !loading && (
        <QcGanttChart simResult={simResult} instrumentList={instrument || []} />
      )}
    </Paper>
  );
}
