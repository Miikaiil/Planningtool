import React, { useState, useRef, useEffect } from "react";
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
  IconButton,
  Box,
  Select,
  MenuItem,
} from "@mui/material";
import FullscreenIcon from "@mui/icons-material/Fullscreen";

// Modern färgskalor
const STATUS_CYCLES = ["1", "U", "P", "O", "1"];
const STATUS_COLORS = {
  "1": "#FFD200",
  "U": "#56D364",
  "P": "#FFB347",
  "O": "#FF607D",
  "": "#ececec",
};

const GRUPP_BACKGROUND = {
  "Emulsion": "#D6EBFF",
  "Aminosyror": "#FAEFBA",
  "Glukos": "#C8F6D8",
  "Vatten/Cleaning": "#FFE2EC",
  "Standard": "#eee",
};

export default function Legotavlan({ produkter = [], analyser = [] }) {
  const [batches, setBatches] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [analysFilter, setAnalysFilter] = useState("");
  const tableRef = useRef(null);

  // Dagens datum
  const today = new Date().toISOString().split("T")[0];
  const analysOrder = analyser.map(a => a.Analys || a.namn);
  const analysGrupp = {};
  analyser.forEach(a =>
    analysGrupp[a.Analys || a.namn] = a.Grupp || "Standard"
  );

  // Sätt startstatus "1" på rätt batch/analyser
  useEffect(() => {
    if (!batches.length || !analysOrder.length) return;
    const nyStatus = {};
    batches.forEach(batch => {
      const batchnummer = (batch["Batchnummer"] || "").trim();
      const prodObj = produkter.find(p => (p.namn || "").trim() === (batch["Produkt"] || "").trim());
      const analyserLista = prodObj?.analysNamnLista || [];
      analysOrder.forEach(an => {
        if (analyserLista.includes(an)) nyStatus[batchnummer + "||" + an] = "1";
      });
    });
    setStatusMap(nyStatus);
  }, [batches, produkter, analyser]); // eslint-disable-line

  function handleFullscreen() {
    if (tableRef.current?.requestFullscreen) tableRef.current.requestFullscreen();
  }

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

  // Klick för att loopa status - alltid tillbaka till 1
  function handleStatusClick(batchnummer, analys) {
    const key = batchnummer + "||" + analys;
    setStatusMap(prev => {
      if (!prev[key]) return prev;
      const idx = STATUS_CYCLES.indexOf(prev[key]);
      const next = STATUS_CYCLES[(idx + 1) % STATUS_CYCLES.length];
      return { ...prev, [key]: next };
    });
  }

  function handleReset() {
    // Återsätt alla markerade till start (1)
    const nyStatus = {};
    batches.forEach(batch => {
      const batchnummer = (batch["Batchnummer"] || "").trim();
      const prodObj = produkter.find(p => (p.namn || "").trim() === (batch["Produkt"] || "").trim());
      const analyserLista = prodObj?.analysNamnLista || [];
      analysOrder.forEach(an => {
        if (analyserLista.includes(an)) nyStatus[batchnummer + "||" + an] = "1";
      });
    });
    setStatusMap(nyStatus);
    setAnalysFilter("");
  }

  // Filtred batcher
  const filteredBatches = !analysFilter
    ? batches
    : batches.filter(batch => {
        const produkt = (batch["Produkt"] || "").trim();
        const prodObj = produkter.find(p => (p.namn || "").trim() === produkt);
        return prodObj?.analysNamnLista?.includes(analysFilter);
      });

  if (!produkter.length || !analyser.length) {
    return <div>Laddar produkt- och analysdata...</div>;
  }

  return (
    <Paper sx={{ p: 1,  bgcolor:"#FFFFFF"}}>
      <Box display="flex" alignItems="center" mb={1} gap={1}>
        <Typography variant="h6" flex={1}>Legotavlan</Typography>
        <Box>
          <Select
            value={analysFilter}
            onChange={e => setAnalysFilter(e.target.value)}
            size="small"
            sx={{ minWidth: 130, fontWeight: 700, bgcolor: "#fff" }}
            displayEmpty
          >
            <MenuItem value=""><em>Visa alla analyser</em></MenuItem>
            {analysOrder.map(an => (
              <MenuItem key={an} value={an}>{an}</MenuItem>
            ))}
          </Select>
        </Box>
        <Button onClick={handleReset} size="small" variant="contained" sx={{ ml: 1, bgcolor: "#f5f5f5", color: "#333", fontWeight: 600 }}>Återställ</Button>
        <Button variant="outlined" component="label" size="small" sx={{ mx: 1 }}>
          Importera batch.csv
          <input type="file" accept=".csv" hidden onChange={handleImport} />
        </Button>
        <IconButton onClick={handleFullscreen}><FullscreenIcon /></IconButton>
      </Box>
      <Box mb={0.5}>Dagens datum: <b>{today}</b></Box>
      <div ref={tableRef}>
        <TableContainer sx={{ maxHeight: "80vh", border: "1px solid #555", borderRadius: 1 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, minWidth: 50, border: "1px solid #111" }}>Batchnr</TableCell>
                <TableCell sx={{ fontWeight: 700, minWidth: 80, border: "1px solid #111" }}>Produkt</TableCell>
                <TableCell sx={{ fontWeight: 700, minWidth: 85, border: "1px solid #111" }}>Datum</TableCell>
                {analysOrder.map(an => (
                  <TableCell
                    key={an}
                    align="center"
                    sx={{
                      background: GRUPP_BACKGROUND[analysGrupp[an]] || "#f5f5f5",
                      fontWeight: 700,
                      border: "1px solid #bbb",
                      p: 0,
                      verticalAlign: "middle",
                      maxWidth: "1%",
                      whiteSpace: "nowrap"
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        writingMode: "vertical-rl",
                        textAlign: "center",
                        transform: "rotate(180deg)",
                        fontSize: 16,
                        fontWeight: 700,
                        height: "min-content",
                        minHeight: 52,
                        lineHeight: 1.1,
                        margin: 0,
                        px: 0.5
                      }}
                    >
                      {an}
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBatches.map((batch, bi) => {
                const produkt = (batch["Produkt"] || "").trim();
                const batchnummer = (batch["Batchnummer"] || "").trim();
                const prodObj = produkter.find(p => (p.namn || "").trim() === produkt);
                const analyserLista = prodObj?.analysNamnLista || [];
                return (
                  <TableRow key={batchnummer + bi}>
                    <TableCell sx={{ fontWeight: 600, border: "1px solid #bbb" }}>{batchnummer}</TableCell>
                    <TableCell sx={{ border: "1px solid #bbb" }}>{produkt}</TableCell>
                    <TableCell sx={{ border: "1px solid #bbb" }}>{today}</TableCell>
                    {analysOrder.map(an => {
                      const enabled = analyserLista.includes(an);
                      const statusKey = batchnummer + "||" + an;
                      const status = statusMap[statusKey];
                      return (
                        <TableCell
                          key={an}
                          align="center"
                          sx={{
                            border: "1px solid #ccc",
                            background: enabled ? STATUS_COLORS[status] : "#f8f8fa",
                            color: enabled ? "#1c1c1c" : "#a8a8a8",
                            fontWeight: 700,
                            px: 0.5,
                            minWidth: "auto", maxWidth: "auto",
                            height: 22, fontSize: 18, verticalAlign: "middle",
                            textAlign: "center", transition: "background 0.1s",
                            cursor: enabled ? "pointer" : "default"
                          }}
                          onClick={enabled ? () => handleStatusClick(batchnummer, an) : undefined}
                        >
                          {enabled ? status : ""}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
        </TableContainer>
        
      </div>
    </Paper>
  );
}
