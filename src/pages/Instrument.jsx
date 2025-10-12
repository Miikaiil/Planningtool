import React, { useState, useEffect } from "react";
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
import { v4 as uuidv4 } from "uuid";

// Hjälpfunktion: exportera instrument och deras kopplingar till CSV
function exportToCSV(instrument, analyser) {
  const header = ["Instrument", ...analyser.map(a => a.Analys || a.namn)].join(";");
  const rows = instrument.map(inst => [
    inst.namn,
    ...analyser.map(a => inst.analysIds?.includes(a.id) ? "1" : "")
  ].join(";"));
  return [header, ...rows].join("\n");
}

// Hjälpfunktion: importera från CSV och skapa instrument med kopplingar
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

export default function Instrument({ instrument, setInstrument, analyser }) {
  const [locked, setLocked] = useState(true);
  const [editingIdx, setEditingIdx] = useState(-1);

  const handleLockToggle = () => {
    if (locked) {
      const pw = prompt("Ange låskod:");
      if (pw === "0000") setLocked(false);
      else alert("Fel kod");
    } else setLocked(true);
  };

  const handleAdd = () => {
    setInstrument(list => [...list, { id: uuidv4(), namn: "", analysIds: [] }]);
    setEditingIdx(instrument.length);
  };

  const handleChangeName = (e, idx) => {
    setInstrument(list => {
      const copy = [...list];
      copy[idx].namn = e.target.value;
      return copy;
    });
  };

  const handleChangeAnalys = (instId, nyaAnalyser) => {
    setInstrument(list =>
      list.map(inst =>
        inst.id === instId
          ? { ...inst, analysIds: nyaAnalyser.map(a => a.id) }
          : inst
      )
    );
  };

  const handleSave = () => setEditingIdx(-1);

  const handleEdit = (idx) => setEditingIdx(idx);

  // EXPORT till CSV
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

  // IMPORT från CSV
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

  return (
    <Box sx={{ maxWidth: 900, margin: "0 auto", p: 3 }}>
      <Typography variant="h4" mb={2}>Instrument & analyser</Typography>
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
      {instrument.length === 0 && (
        <Paper sx={{ p: 3, color: "#666" }}>Inga instrument har lagts till än.</Paper>
      )}
      {instrument.map((inst, idx) => (
        <Paper key={inst.id} sx={{ mt: 3, p: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {editingIdx === idx && !locked ? (
              <TextField
                value={inst.namn}
                onChange={e => handleChangeName(e, idx)}
                variant="standard"
                fullWidth
                autoFocus
              />
            ) : (
              <b style={{ fontSize: 18 }}>{inst.namn}</b>
            )}
            {editingIdx === idx && !locked ? (
              <IconButton color="success" onClick={handleSave}>
                <CheckIcon />
              </IconButton>
            ) : (
              <IconButton disabled={locked} onClick={() => handleEdit(idx)}>
                <EditIcon />
              </IconButton>
            )}
          </div>
          {/* MultiSelect för analyser kopplade till detta instrument */}
          <Autocomplete
            multiple
            options={analyser}
            getOptionLabel={o => o.Analys || o.namn || ""}
            value={analyser.filter(a => inst.analysIds?.includes(a.id))}
            onChange={(e, newVal) => handleChangeAnalys(inst.id, newVal)}
            disabled={locked}
            renderInput={params => (
              <TextField {...params} label="Analyser" variant="standard" />
            )}
            sx={{ mt: 1, maxWidth: 900 }}
          />
        </Paper>
      ))}
    </Box>
  );
}
