import React from "react";
import { planeraBatches } from "../utils/planner";

export default function BigScheduler({ batcher, produkter, analyser, instrument, analytiker }) {
  const plan = planeraBatches({ batcher, produkter, analyser, instrument, analytiker });

  return (
    <div style={{ margin: "auto", padding: 20 }}>
      <h2>Batchplanering - Felsökning & Allokeringsrapport</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Batch</th>
            <th>Produkt</th>
            <th>Analyser</th>
            <th>Instrumentkandidater</th>
            <th>Dag</th>
            <th>Tid</th>
            <th>Maskintid</th>
            <th>Mantimmar</th>
            <th>Status</th>
            <th>Meddelande</th>
          </tr>
        </thead>
        <tbody>
          {plan.map(row => (
            <tr key={row.batch}>
              <td>{row.batch}</td>
              <td>{row.produkt}</td>
              <td>{(row.analyser || []).join(", ")}</td>
              <td>{(row.possibleInst || []).join(", ")}</td>
              <td>{row.day || "-"}</td>
              <td>{row.start !== undefined ? `${row.start}:00` : '-'}</td>
              <td>{row.analyssum !== undefined ? row.analyssum.toFixed(2) : '-'}</td>
              <td>{row.mansum !== undefined ? row.mansum.toFixed(2) : '-'}</td>
              <td>{row.status}</td>
              <td>{row.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
