import React, { useState } from "react";
import {
  Box, Typography, Paper, Button, IconButton,
  Tooltip, TextField
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';

// ----------- Export/Import helpers med namn-nyckel -----------

// Exportera instrumentdata till CSV
function exportToCSV(instrument, analyser = []) {
  // OBS: "namn" är ID!
  const header = [
    "InstrumentNamn", // blir unik nyckel och länkas till i analyser från nu
    "Tillgängliga timmar/vecka",
    "Max sekvensstorlek",
    "Normal sekvensstorlek",
    ...analyser.map(a => a.Analys || a.namn) // koppling till analyser görs via analysnamn
  ].join(";");

  const rows = instrument.map(inst => [
    inst.namn, // namn/ID
    inst.tillgangligTid,
    inst.maxSekvensstorlek,
    inst.normalSekvensstorlek,
    ...analyser.map(a => inst.analysNamnLista?.includes(a.Analys || a.namn) ? "1" : "")
  ].join(";"));

  return [header, ...rows].join("\n");
}

// Importera instrument från CSV
function importFromCSV(csv, analyser = []) {
  const [headerLine, ...lines] = csv.trim().split("\n");
  return lines.map(line => {
    const arr = line.split(";");
    // Läs namn som primärnyckel
    const namn = arr[0];
    const tillgangligTid = Number(arr[1]);
    const maxSekvensstorlek = Number(arr[2]);
    const normalSekvensstorlek = Number(arr[3]);
    // Koppling till analys via namn, ej id
    const analysNamnLista = arr.slice(4)
      .map((v, i) => v === "1" ? (analyser[i]?.Analys || analyser[i]?.namn) : null)
      .filter(Boolean);
    return { 
      namn, // använd alltid namn som ID/nyckel
      tillgangligTid,
      maxSekvensstorlek,
      normalSekvensstorlek,
      analysNamnLista 
    };
  });
}

// ----------- Instrumentkomponent (namn som ID/nyckel) -----------
export default function Instrument({ instrument, setInstrument, analyser = [] }) {
  const [locked, setLocked] = useState(true);
  const [editingIdx, setEditingIdx] = useState(-1);

  // Lås/öppna edit-läge
  const handleLockToggle = () => {
    if (locked) {
      const pw = prompt("Ange låskod:");
      if (pw === "0000") setLocked(false);
      else alert("Fel kod");
    } else setLocked(true);
  };

  // Lägg till nytt instrument
  const handleAdd = () => {
    setInstrument(list => [
      ...list,
      { 
        namn: "", // nyckel/ID
        analysNamnLista: [],
        tillgangligTid: 0, 
        maxSekvensstorlek: 0, 
        normalSekvensstorlek: 0
      }
    ]);
    setEditingIdx(instrument.length);
  };

  // Ändra namn (ID) för instrument
  const handleChangeName = (e, idx) => {
    setInstrument(list => {
      const copy = [...list];
      copy[idx].namn = e.target.value;
      return copy;
    });
  };

  // Generisk fältändring (nummer/text)
  const handleChangeField = (e, idx, field) => {
    const value = e.target.value;
    setInstrument(list => {
      const copy = [...list];
      copy[idx][field] = value;
      return copy;
    });
  };

  // Koppla analyser till instrument (via analysnamn)
  const handleChangeAnalys = (instNamn, nyaAnalyser) => {
    setInstrument(list =>
      list.map(inst =>
        inst.namn === instNamn
          ? { ...inst, analysNamnLista: nyaAnalyser.map(a => a.Analys || a.namn) }
          : inst
      )
    );
  };

  const handleSave = () => setEditingIdx(-1);
  const handleEdit = (idx) => setEditingIdx(idx);

  // Exportera till CSV
  const handleExport = () => {
    const csv = exportToCSV(instrument, analyser);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "instrument.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Importera från CSV
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const imported = importFromCSV(ev.target.result, analyser);
        setInstrument(imported);
      } catch (ex) {
        alert("Fel vid import!");
        console.error(ex);
      }
      e.target.value = null;
    };
    reader.readAsText(file, "utf-8");
  };

  // ----------- UI-rendering -----------
  return (
    <Box sx={{  margin: "0 auto", p: 3 }}>
      <Typography variant="h4" mb={2}>Instrument & analyser</Typography>
      {/* Menyrad med lås/export/import/add */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <Tooltip title={locked ? "Lås upp" : "Lås"}>
          <IconButton onClick={handleLockToggle}>
            {locked ? <LockIcon color="primary" /> : <LockOpenIcon color="success" />}
          </IconButton>
        </Tooltip>
        {!locked && (
          <>
            <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleAdd}>
              Lägg till instrument
            </Button>
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExport} sx={{ ml: 2 }}>
              Exportera
            </Button>
            <Button variant="outlined" component="label" startIcon={<UploadIcon />} sx={{ ml: 1 }}>
              Importera
              <input type="file" accept=".csv" hidden onChange={handleImport} />
            </Button>
          </>
        )}
      </div>
      {/* Tom-meddelande om inga instrument */}
      {instrument.length === 0 && (
        <Paper sx={{ p: 3, color: "#666" }}>Inga instrument har lagts till än.</Paper>
      )}
      {/* Lista varje instrument */}
      {instrument.map((inst, idx) => (
        <Paper key={inst.namn || idx} sx={{ mt: 3, p: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {/* Edittläge eller visningsläge för varje fält */}
            {editingIdx === idx && !locked ? (
              <>
                <TextField
                  label="Namn (unik)"
                  value={inst.namn}
                  onChange={e => handleChangeName(e, idx)}
                  variant="standard"
                  fullWidth
                  autoFocus
                  sx={{ mb: 1 }}
                />
                <TextField
                  label="Tillgängliga timmar/vecka"
                  type="number"
                  value={inst.tillgangligTid}
                  onChange={e => handleChangeField(e, idx, "tillgangligTid")}
                  variant="standard"
                  sx={{ ml: 1, mb: 1 }}
                />
                <TextField
                  label="Max sekvensstorlek"
                  type="number"
                  value={inst.maxSekvensstorlek}
                  onChange={e => handleChangeField(e, idx, "maxSekvensstorlek")}
                  variant="standard"
                  sx={{ ml: 1, mb: 1 }}
                />
                <TextField
                  label="Normal sekvensstorlek"
                  type="number"
                  value={inst.normalSekvensstorlek}
                  onChange={e => handleChangeField(e, idx, "normalSekvensstorlek")}
                  variant="standard"
                  sx={{ ml: 1 }}
                />
              </>
            ) : (
              <>
                <b style={{ fontSize: 18 }}>{inst.namn}</b>
                <span style={{ marginLeft: 18 }}>Tillgängliga timmar/vecka: {inst.tillgangligTid}</span>
                <span style={{ marginLeft: 18 }}>Max sekvensstorlek: {inst.maxSekvensstorlek}</span>
                <span style={{ marginLeft: 18 }}>Normal sekvensstorlek: {inst.normalSekvensstorlek}</span>
              </>
            )}
            {editingIdx === idx && !locked ? (
              <IconButton color="success" onClick={() => handleSave()}>
                <CheckIcon />
              </IconButton>
            ) : (
              <IconButton disabled={locked} onClick={() => handleEdit(idx)}>
                <EditIcon />
              </IconButton>
            )}
          </div>
          {/* MultiSelect för analyser kopplade till instrumentet, via namn */}
          <Autocomplete
            multiple
            options={analyser}
            getOptionLabel={o => o.Analys || o.namn || ""}
            value={analyser.filter(a => inst.analysNamnLista?.includes(a.Analys || a.namn))}
            onChange={(e, newVal) => handleChangeAnalys(inst.namn, newVal)}
            disabled={locked}
            renderInput={params => (
              <TextField {...params} label="Analyser" variant="standard" />
            )}
            sx={{ mt: 1, }}
          />
        </Paper>
      ))}
    </Box>
  );
}
