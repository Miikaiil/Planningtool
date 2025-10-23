import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { MenuItem, Select, Typography } from "@mui/material";

// Bearbetar simdata till {name, start, duration}
function formatData(simData, selectedInstrument) {
  // Filtrera och gruppera batcher per sekvens
  const sorted = simData
    .filter(d => !selectedInstrument || d.analysisType === selectedInstrument)
    .sort((a, b) => a.startTime - b.startTime);

  // Grupp-nyckel = instrument + sekvensstart/minut
  const grouped = {};
  sorted.forEach(d => {
    const key = `${d.analysisType}-${d.startTime}`;
    if (!grouped[key]) {
      grouped[key] = {
        name: `Batcher: ${d.batchId} (${d.analysisType})`,
        analysisType: d.analysisType,
        startTime: d.startTime,
        duration: d.endTime - d.startTime,
        label: `${d.analysisType} kl ${d.startTime} min`,
        n: 0,
        all: []
      };
    }
    grouped[key].n += 1;
    grouped[key].all.push(d.batchId);
  });

  return Object.entries(grouped).map(([k, v]) => ({
    ...v,
    name: `${v.analysisType}: ${v.all.join(", ")}`,
  }));
}

export default function QcGanttChart({ simResult, instrumentList }) {
  const [selectedInstrument, setSelectedInstrument] = useState("");
  const data = formatData(simResult, selectedInstrument);

  return (
    <div>
      <Typography variant="h6" sx={{ mb: 2 }}>Gantt-schema – gruppvisning sekvenser</Typography>

      <Select
        value={selectedInstrument}
        onChange={e => setSelectedInstrument(e.target.value)}
        displayEmpty
        sx={{ mb: 2, minWidth: 220 }}
      >
        <MenuItem value="">Alla instrument</MenuItem>
        {instrumentList.map(inst => (
          <MenuItem key={inst.namn} value={inst.namn}>{inst.namn}</MenuItem>
        ))}
      </Select>

      <ResponsiveContainer width="100%" height={Math.max(350, 24 * data.length)}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 20, right: 40, left: 40, bottom: 20 }}
          barSize={18}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" label={{ value: "Tid (min)", position: "insideBottomRight", offset: 0 }} />
          <YAxis
            dataKey="name"
            type="category"
            interval={0}
            width={340}
            label={{ value: "Sekvens per instrument", angle: -90, position: "insideLeft" }}
          />
          <Tooltip />
          <Legend />
          <Bar dataKey="duration" fill="#8884d8" name="Körtid sekvens" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
