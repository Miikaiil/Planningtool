import React, { useState } from "react";
import { TextField, Button, Paper, IconButton, Tooltip } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';

// Exporterar produkter till CSV med analyser via namn-nyckel
function exportToCSV(produkter, analyser = []) {
  const header = ["Produkt", ...analyser.map(a => a.Analys || a.namn)].join(";");
  const rows = produkter.map(prod => [
    prod.namn,
    ...analyser.map(a => prod.analysNamnLista?.includes(a.Analys || a.namn) ? "1" : "")
  ].join(";"));
  return [header, ...rows].join("\n");
}

// Importerar produkter från CSV med analyser via namn-nyckel
function importFromCSV(csv, analyser = []) {
  const [headerLine, ...lines] = csv.trim().split("\n");
  return lines.map(line => {
    const arr = line.split(";");
    const namn = arr[0];
    const analysNamnLista = arr
      .slice(1)
      .map((v, i) => v === "1" ? (analyser[i]?.Analys || analyser[i]?.namn) : null)
      .filter(Boolean);
    return { namn, analysNamnLista };
  });
}

// Funktion för att hämta instrument via analyser för produkten
function getInstrumentsForProduct(prod, analyser, instrument) {
  if (!prod?.analysNamnLista?.length || !analyser.length || !instrument.length) return [];

  // Filtrera analyser som produkten använder
  const analyserForProd = analyser.filter(a => prod.analysNamnLista.includes(a.Analys || a.namn));
  const analyserNamnSet = new Set(analyserForProd.map(a => a.Analys || a.namn));

  // Filtrera instrument som är kopplade till analyserna
  return instrument.filter(inst =>
    inst.analysNamnLista?.some(name => analyserNamnSet.has(name))
  );
}

export default function ProdukterMedAnalyser({ produkter = [], setProdukter, analyser = [], instrument = [] }) {
  const [locked, setLocked] = useState(true);

  const handleLockToggle = () => {
    if (locked) {
      const pw = prompt("Ange låskod:");
      if (pw === "0000") setLocked(false);
      else alert("Fel kod");
    } else setLocked(true);
  };

  const handleExport = () => {
    const csv = exportToCSV(produkter, analyser);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "produkter.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

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

  const handleAddProdukt = () => {
    if (locked) return;
    const namn = prompt("Namn på ny produkt:");
    if (namn) setProdukter(p => [...p, { namn, analysNamnLista: [] }]);
  };

  const handleChangeAnalys = (prodNamn, nyaAnalyser) => {
    setProdukter(p =>
      p.map(prod =>
        prod.namn === prodNamn
          ? { ...prod, analysNamnLista: nyaAnalyser.map(a => a.Analys || a.namn) }
          : prod
      )
    );
  };

  return (
    <div style={{ padding: "32px", margin: "0 auto"}}>
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
        {produkter.length === 0 && (
          <div style={{ color: "#666", padding: "16px" }}>Inga produkter har lagts till ännu.</div>
        )}
        {produkter.map(prod => (
          <div key={prod.namn} style={{ marginBottom: 30 }}>
            <b style={{ fontSize: 18 }}>{prod.namn}</b>
            <div style={{ color: "#555", marginTop: 4, fontSize: 13 }}>
              <i>Använda instrument:</i>{" "}
              {getInstrumentsForProduct(prod, analyser, instrument).map(i => i.namn).join(", ") || "Inga instrument kopplade ännu"}
            </div>
            <Autocomplete
              multiple
              options={analyser}
              getOptionLabel={o => o.Analys || o.namn || ""}
              value={analyser.filter(a => prod.analysNamnLista?.includes(a.Analys || a.namn))}
              onChange={(e, newValue) => handleChangeAnalys(prod.namn, newValue)}
              disabled={locked}
              renderInput={params => (
                <TextField {...params} variant="standard" label="Analyser" placeholder="Sök analys..." />
              )}
              sx={{ mt: 1, maxWidth: 1200 }}
            />
          </div>
        ))}
      </Paper>
    </div>
  );
}
