import React, { useState, useEffect } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TextField, Button, Checkbox, Tooltip, Typography
} from "@mui/material";

const roleTypes = ["KabiTrack", "SAP", "Loggboksgranskare"];

function exportMatrixToCSV(analytiker, analyser) {
  const header = [
    "Analytiker",
    ...analyser.map(a => a.Analys || a.namn),
    ...roleTypes
  ].join(";");
  const rows = analytiker.map(anal => {
    const row = [anal.namn];
    analyser.forEach(an => {
      const key = an.Analys || an.namn;
      const roles = roleTypes.filter(role => anal.kompetens?.[key]?.includes(role));
      row.push(roles.length ? "X" : "");
    });
    roleTypes.forEach(role => {
      const hasRoleSomewhere = analyser.some(an => {
        const key = an.Analys || an.namn;
        return anal.kompetens?.[key]?.includes(role);
      });
      row.push(hasRoleSomewhere ? "X" : "");
    });
    return row.join(";");
  });
  return [header, ...rows].join("\n");
}

function importMatrixFromCSV(csv, analyser) {
  const [headerLine, ...lines] = csv.trim().split("\n");
  const headers = headerLine.split(";").map(h => h.trim());
  const analyserKeys = headers.slice(1, 1 + analyser.length);

  return lines.map(line => {
    const arr = line.split(";");
    const namn = arr[0];
    let kompetens = {};
    analyserKeys.forEach((key, i) => {
      const cell = arr[i + 1];
      kompetens[key] = cell ? ["ALL"] : [];
    });
    return { namn, kompetens };
  });
}

export default function AnalytikerMatris({ analytiker = [], setAnalytiker, analyser = [] }) {
  const [matrix, setMatrix] = useState(analytiker);
  const [locked, setLocked] = useState(true);

  useEffect(() => {
    setMatrix(analytiker);
  }, [analytiker]);

  const toggleLock = () => {
    if (locked) {
      const pw = prompt("Ange låskod för redigering:");
      if (pw === "0000") setLocked(false);
      else alert("Fel kod");
    } else setLocked(true);
    };
    const stickyStyle = {
    position: 'sticky',
    left: 0,
    background: 'white',
    zIndex: 10,
    boxShadow: '2px 0 5px -2px rgba(0,0,0,0.2)'
    };


  // Klick på kryssruta för analys-behörighet
  const handleCheckboxChange = (analIdx, key) => {
    if (locked) return;
    setMatrix(mat => {
      const copy = [...mat];
      const kompetens = copy[analIdx].kompetens || {};
      if (kompetens[key]?.length) {
        kompetens[key] = [];
      } else {
        kompetens[key] = ["ALL"];
      }
      copy[analIdx] = { ...copy[analIdx], kompetens };
      return copy;
    });
  };

  // Klick på roll-kryss (markerar/suddar från alla analyser)
  const handleRoleCheckboxChange = (analIdx, role) => {
    if (locked) return;
    setMatrix(mat => {
      const copy = [...mat];
      const kompetens = copy[analIdx].kompetens || {};

      const hasRole = Object.values(kompetens).some(roles => roles.includes(role));

      if (hasRole) {
        Object.keys(kompetens).forEach(key => {
          kompetens[key] = kompetens[key].filter(r => r !== role);
          if (!kompetens[key].length) delete kompetens[key];
        });
      } else {
        analyser.forEach(an => {
          const key = an.Analys || an.namn;
          kompetens[key] = Array.from(new Set([...(kompetens[key] || []), role]));
        });
      }
      copy[analIdx] = { ...copy[analIdx], kompetens };
      return copy;
    });
  };

  const handleExport = () => {
    const csv = exportMatrixToCSV(matrix, analyser);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "analytiker_kompetens.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    if (locked) {
      alert("Lås upp redigering först!");
      e.target.value = null;
      return;
    }
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = importMatrixFromCSV(ev.target.result, analyser);
        setMatrix(imported);
        setAnalytiker(imported);
      } catch {
        alert("Fel vid import av fil");
      }
      e.target.value = null;
    };
    reader.readAsText(file, "utf-8");
  };

  return (
    <Paper sx={{ padding: 3, maxWidth: '100vw', overflowX: 'auto' }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Analytiker-kompetensmatris</Typography>
      <Button variant="contained" onClick={toggleLock} sx={{ mb: 2 }}>
        {locked ? "Lås upp redigering" : "Lås redigering"}
      </Button>
      <div style={{ marginBottom: 12, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Button variant="contained" onClick={handleExport}>Exportera CSV</Button>
        <Button variant="outlined" component="label">
          Importera CSV
          <input type="file" accept=".csv" hidden onChange={handleImport} />
        </Button>
      </div>
      <TableContainer sx={{maxHeight: 800, overflowY: 'auto'}}>
        <Table size="small" sx={{ minWidth: analyser.length * 140 + roleTypes.length * 70 + 160 }}>
            <TableHead>
            <TableRow>
                <TableCell sx={{ ...stickyStyle, fontWeight: 'bold', zIndex: 11 }}>Analytiker</TableCell>
                {analyser.map(an => (
                <TableCell key={an.Analys || an.namn} align="center" sx={{ minWidth: 140, whiteSpace: 'nowrap', fontWeight: 'bold' }}>
                    {an.Analys || an.namn}
                </TableCell>
                ))}
                {/* roller-kolumner */}
                {roleTypes.map(role => (
                <TableCell key={role} sx={{ minWidth: 70, fontWeight: 'bold' }} align="center">{role}</TableCell>
                ))}
            </TableRow>
            </TableHead>
            <TableBody>
            {matrix.map((anal, ai) => (
                <TableRow key={anal.namn || ai}>
                <TableCell sx={{ ...stickyStyle, fontWeight: 'bold', minWidth: 160 }}>
                    {anal.namn}
                </TableCell>
                {analyser.map(an => {
                  const key = an.Analys || an.namn;
                  const hasAccess = (anal.kompetens?.[key]?.length || 0) > 0;
                  return (
                    <TableCell key={key} align="center" sx={{ whiteSpace: "nowrap" }}>
                      <Checkbox
                        disabled={locked}
                        checked={hasAccess}
                        onChange={() => handleCheckboxChange(ai, key)}
                        sx={{ padding: '0 2px', marginRight: '-5px' }}
                      />
                    </TableCell>
                  );
                })}
                {roleTypes.map(role => {
                  const hasRole = analyser.some(an => {
                    const key = an.Analys || an.namn;
                    return anal.kompetens?.[key]?.includes(role);
                  });
                  return (
                    <TableCell key={role} align="center" sx={{ whiteSpace: 'nowrap' }}>
                      <Checkbox
                        disabled={locked}
                        checked={hasRole}
                        onChange={() => handleRoleCheckboxChange(ai, role)}
                        sx={{ padding: '0 5px' }}
                      />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
