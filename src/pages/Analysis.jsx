import React, { useState } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Button, Select, MenuItem, TextField, Tooltip
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import AddIcon from '@mui/icons-material/Add';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { v4 as uuidv4 } from "uuid";

const columns = [
  "Analys",
  "Grupp",
  "Tillgängliga timmar (h/vecka)",
  "Max sekvensstorlek (#satser)",
  "Normal sekvensstorlek (#satser)",
  "Förberedelse (mantimmar)",
  "Analystid (mantimmar)",
  "Instrumenttid per sekvens (h)",
  "Utvärdering (mantimmar)",
  "Kontroll (mantimmar)",
  "Rengöring (mantimmar)",
  "Summa standardtid (h/sekvens)",
  "Allokerad tid på instrument (h/vecka)",
  "Behov antal sekvenser (st/vecka)",
  "Planerat antal batcher (vecka)",
  "Teoretisk max kapacitet (batch/vecka)",
  "Andel rätt direkt (%)",
  "Förväntad faktisk kapacitet (batch/vecka)",
  "Nödvändiga analytiker (FTE)",
];
const editableCols = [
  "Analys", "Grupp",
  "Tillgängliga timmar (h/vecka)",
  "Max sekvensstorlek (#satser)",
  "Normal sekvensstorlek (#satser)",
  "Förberedelse (mantimmar)",
  "Analystid (mantimmar)",
  "Instrumenttid per sekvens (h)",
  "Utvärdering (mantimmar)",
  "Kontroll (mantimmar)",
  "Rengöring (mantimmar)",
  "Planerat antal batcher (vecka)",
  "Andel rätt direkt (%)",

];

// CSV-hantering
function arrayToCSV(data) {
  const header = columns.join(";"); 
  const csvRows = data.map(row => columns.map(col => `"${row[col] || ""}"`).join(";"));
  return [header, ...csvRows].join("\n");
}
function csvToArray(csv) {
  const [headerLine, ...lines] = csv.trim().split("\n");
  const headers = headerLine.split(";").map(h => h.replace(/"/g, "").trim());
  return lines.map(line => {
    const values = line.split(";");
    const obj = {};
    headers.forEach((h, i) => { obj[h] = values[i] ? values[i].replace(/"/g, "").trim() : ""; });
    if (!obj.id) obj.id = uuidv4();
    return obj;
  });
}

// Uträkningarna på svenska
function calc(row, key) {
  const num = v => Number(String(v||"0").replace(",", "."));
  switch (key) {
    case "Summa standardtid (h/sekvens)":
      return (
        num(row["Analystid (mantimmar)"]) +
        num(row["Instrumenttid per sekvens (h)"]) +
        num(row["Utvärdering (mantimmar)"]) +
        num(row["Kontroll (mantimmar)"]) +
        num(row["Rengöring (mantimmar)"])
      ) || "";

case "Behov antal sekvenser (st/vecka)": {
  const batches = num(row["Planerat antal batcher (vecka)"]);
  const normalSize = num(row["Normal sekvensstorlek (#satser)"]);
  return batches && normalSize ? Math.ceil(batches / normalSize) : "";
}


    case "Teoretisk max kapacitet (batch/vecka)": {
      const denom = num(row["Instrumenttid per sekvens (h)"])
                  + num(row["Utvärdering (mantimmar)"])
                  + num(row["Kontroll (mantimmar)"])
                  + num(row["Rengöring (mantimmar)"]);
      return denom > 0 && num(row["Tillgängliga timmar (h/vecka)"]) && num(row["Max sekvensstorlek (#satser)"])
        ? ((num(row["Tillgängliga timmar (h/vecka)"]) / denom) * num(row["Max sekvensstorlek (#satser)"])).toFixed(2)
        : "";
    }

    case "Förväntad faktisk kapacitet (batch/vecka)": {
      const theo = calc(row, "Teoretisk max kapacitet (batch/vecka)");
      return theo && num(row["Andel rätt direkt (%)"])
        ? (num(theo) * (num(row["Andel rätt direkt (%)"]) / 100)).toFixed(2) : "";
    }
    case "Nödvändiga analytiker (FTE)": {
      const stdTime = calc(row, "Summa standardtid (h/sekvens)");
      const normSeq = num(row["Normal sekvensstorlek (#satser)"]);
      const theoCap = calc(row, "Teoretisk max kapacitet (batch/vecka)");
      return stdTime && theoCap && normSeq
        ? ((num(stdTime) * (num(theoCap) / normSeq) / 38.33).toFixed(2)) : "";
    }
case "Allokerad tid på instrument (h/vecka)": {
  // Instrument + Eval + Kontroll + Rengöring
  const sum = num(row["Instrumenttid per sekvens (h)"])
           + num(row["Utvärdering (mantimmar)"])
           + num(row["Kontroll (mantimmar)"])
           + num(row["Rengöring (mantimmar)"]);
  const seqs = calc(row, "Behov antal sekvenser (st/vecka)");
  return seqs ? (sum * num(seqs)).toFixed(2) : "";
}



    default: return row[key] || "";
  }
}

export default function Analysis({ rows, setRows }) {
  const [editingIdx, setEditingIdx] = useState(-1);
  const [locked, setLocked] = useState(true);

  const handleNumChange = (e, idx, col) => {
    let val = e.target.value.replace(",", ".");
    if (val === "" || /^[0-9.]+$/.test(val)) {
      setRows(r => {
        const updated = [...r];
        updated[idx][col] = val;
        return updated;
      });
    }
  };
  const handleChange = (e, idx, col) => {
    setRows(r => {
      const updated = [...r];
      updated[idx][col] = e.target.value;
      return updated;
    });
  };
  const handleEdit = idx => setEditingIdx(idx);
  const handleSave = idx => setEditingIdx(-1);

  const handleAdd = () => {
    setRows(r => [...r, Object.fromEntries(columns.map(k => [k, ""])). Object.assign({ id: uuidv4() }) ]);
    setEditingIdx(rows.length);
  };
  const handleLockToggle = () => {
    if (locked) {
      const pw = prompt("Ange låskod:");
      if (pw === "0000") setLocked(false); else alert("Fel kod");
    } else setLocked(true);
  };
  const handleExport = () => {
    const csv = arrayToCSV(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "analysdata.csv";
    a.click();
    URL.revokeObjectURL(url);
  };
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      try { setRows(csvToArray(event.target.result)); }
      catch (ex) { alert("Fel vid import av fil"); }
      e.target.value = null;
    };
    reader.readAsText(file, 'utf-8');
  };

  return (
    <div style={{ padding: 32, maxWidth: '100vw', margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 24, gap: 16 }}>
        <h2 style={{ margin: 0, color: "#343A40" }}>Analyser</h2>
        <Tooltip title={locked ? "Lås upp" : "Lås"}>
          <IconButton onClick={handleLockToggle}>
            {locked ? <LockIcon color="primary" /> : <LockOpenIcon color="success" />}
          </IconButton>
        </Tooltip>
        {!locked && (
          <>
            <Button variant="outlined" onClick={handleExport} sx={{ ml: 2 }}>Exportera CSV</Button>
            <Button variant="outlined" component="label" sx={{ ml: 1 }}>
              Importera CSV
              <input type="file" accept=".csv" hidden onChange={handleImport} />
            </Button>
          </>
        )}
      </div>
      <Button
        onClick={handleAdd}
        color="primary"
        variant="contained"
        startIcon={<AddIcon />}
        sx={{
          mb: 2,
          background: "#007BFF",
          ":hover": { background: "#0056B3" },
          fontWeight: 600
        }}
        disabled={locked}
      >
        Lägg till analys
      </Button>
      <TableContainer component={Paper} sx={{
        borderRadius: "14px",
        boxShadow: "0 4px 24px #0001",
        maxWidth: '100vw',
        overflowX: 'auto',
        maxHeight: 420,
        overflowY: 'auto'
      }}>
        <Table stickyHeader size="small" sx={{ minWidth: 2300 }}>
          <TableHead sx={{ background: "#E9ECEF" }}>
            <TableRow>
              {columns.map(col => (
                <TableCell key={col} sx={{ color: "#343A40", fontWeight: "bold", padding: "10px 6px", minWidth: 120 }}>
                  {col}
                </TableCell>
              ))}
              <TableCell sx={{ background: "#E9ECEF" }}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, idx) => (
              <TableRow
                key={row.id}
                sx={{
                  background: idx % 2 === 0 ? "#FFFFFF" : "#F8F9FA",
                  ":hover": { background: "#E2E6EA" }
                }}
              >
                {columns.map(col =>
                  editingIdx === idx && !locked && editableCols.includes(col) ? (
                    <TableCell key={col}>
                      <TextField
                        value={row[col] || ''}
                        onChange={e => handleNumChange(e, idx, col)}
                        variant="outlined"
                        size="small"
                        sx={{ width: "110px" }}
                        inputProps={{ inputMode: "decimal", pattern: "[0-9.]*" }}
                      />
                    </TableCell>
                  ) : (
                    <TableCell
                      key={col}
                      sx={{
                        color: "#343A40",
                        fontWeight: 400,
                        fontSize: 14,
                        padding: "10px 6px"
                      }}
                    >
                      {calc(row, col)}
                    </TableCell>
                  )
                )}
                <TableCell align="right">
                  {editingIdx === idx && !locked ? (
                    <IconButton color="success" onClick={() => handleSave(idx)}>
                      <CheckIcon />
                    </IconButton>
                  ) : (
                    <IconButton color="primary" onClick={() => !locked && handleEdit(idx)} disabled={locked}>
                      <EditIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
