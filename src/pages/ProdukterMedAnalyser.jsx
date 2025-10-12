import React, { useState } from "react";
import { TextField, Button, Paper, IconButton, Tooltip } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import { v4 as uuidv4 } from "uuid";

// --- Export/Import helpers ---
function exportToCSV(produkter, analyser) {
  const header = ["Produkt", ...analyser.map(a => a.Analys || a.namn)].join(";");
  const rows = produkter.map(prod => [
    prod.namn,
    ...analyser.map(a => prod.analysIds.includes(a.id) ? "1" : "")
  ].join(";"));
  return [header, ...rows].join("\n");
}
function importFromCSV(csv, analyser) {
  const [headerLine, ...lines] = csv.trim().split("\n");
  return lines.map(line => {
    const arr = line.split(";");
    const namn = arr[0];
    const analysIds = arr
      .slice(1)
      .map((v, i) => v === "1" ? analyser[i]?.id : null)
      .filter(Boolean);
    return { id: uuidv4(), namn, analysIds };
  });
}

export default function ProdukterMedAnalyser({ produkter, setProdukter, analyser }) {
  // Låsfunktion inuti komponenten, påverkar endast redigering i UI
  const [locked, setLocked] = useState(true);

  // Lås/upp-lås funktion (lösen "0000")
  const handleLockToggle = () => {
    if (locked) {
      const pw = prompt("Ange låskod:");
      if (pw === "0000") setLocked(false);
      else alert("Fel kod");
    } else setLocked(true);
  };

  // Exportera till CSV
  const handleExport = () => {
    const csv = exportToCSV(produkter, analyser);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "produktanalyser.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Importera från CSV
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      try {
        const nyaProdukter = importFromCSV(event.target.result, analyser);
        setProdukter(nyaProdukter);
      } catch {
        alert("Fel vid import!");
      }
      e.target.value = null;
    };
    reader.readAsText(file, "utf-8");
  };

  // Lägg till ny produkt med unikt ID
  const handleAddProdukt = () => {
    if (locked) return;
    const namn = prompt("Namn på ny produkt:");
    if (namn) setProdukter(p => [...p, { id: uuidv4(), namn, analysIds: [] }]);
  };

  // Hantera ändring av analysskoppling per produkt via ID
  const handleChangeAnalys = (prodId, nyaAnalyser) => {
    setProdukter(p =>
      p.map(prod =>
        prod.id === prodId
          ? { ...prod, analysIds: nyaAnalyser.map(a => a.id) }
          : prod
      )
    );
  };

  // Rendera UI
  return (
    <div style={{ padding: "32px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>Produkter och deras analyser</h2>
        <Tooltip title={locked ? "Lås upp" : "Lås"}>
          <IconButton onClick={handleLockToggle}>
            {locked ? <LockIcon color="primary" /> : <LockOpenIcon color="success" />}
          </IconButton>
        </Tooltip>
        {!locked && (
          <>
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExport}>Exportera CSV</Button>
            <Button variant="outlined" component="label" startIcon={<UploadIcon />}>
              Importera CSV
              <input type="file" accept=".csv" hidden onChange={handleImport} />
            </Button>
            <Button variant="contained" color="primary" sx={{ ml: 2 }} onClick={handleAddProdukt}>Lägg till produkt</Button>
          </>
        )}
      </div>
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        {produkter.map(prod => (
          <div key={prod.id} style={{ marginBottom: 30 }}>
            <b style={{ fontSize: 18 }}>{prod.namn}</b>
            <Autocomplete
              multiple
              options={analyser}
              getOptionLabel={option => option.Analys || option.namn || ""}
              value={analyser.filter(a => prod.analysIds?.includes(a.id))}
              onChange={(e, newValue) => handleChangeAnalys(prod.id, newValue)}
              disabled={locked}
              renderInput={params => (
                <TextField {...params} variant="standard" label="Analyser" placeholder="Sök analys..." />
              )}
              sx={{ mt: 1, maxWidth: 900 }}
            />
          </div>
        ))}
        {produkter.length === 0 && (
          <div style={{ color: "#666", padding: "16px" }}>Inga produkter har lagts till än.</div>
        )}
      </Paper>
    </div>
  );
}
