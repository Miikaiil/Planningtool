import React, { useState } from "react";

// Testdata enligt din datastruktur
const produkter = [
  { id: "prodA", namn: "Testprodukt", analysIds: ["AN1", "AN2"] },
  { id: "prodB", namn: "Demo-produkt", analysIds: ["AN3"] },
];

const analyser = [
  { id: "AN1", namn: "Fettanalys", maskintid: 5 },
  { id: "AN2", namn: "Sockeranalys", maskintid: 7 },
  { id: "AN3", namn: "Saltanalys", maskintid: 4 },
];

const instrument = [
  { id: "I1", namn: "Hett Mix 1000", tillgangligTid: 40, analysIds: ["AN1", "AN3"] },
  { id: "I2", namn: "GC Special", tillgangligTid: 70, analysIds: ["AN2"] },
];

export default function LeanPlaneringMedOrder() {
  const [order, setOrder] = useState({ produktId: "prodA", antalBatcher: 3 });

  const produkt = produkter.find(p => p.id === order.produktId);
  const produktNamn = produkt?.namn || "";
  const analyserIdList = produkt?.analysIds || [];
  const analyserForProdukt = analyser.filter(a => analyserIdList.includes(a.id));

  // Bygg rätt analyslista för varje instrument
  const instrumentPlan = instrument.map(inst => {
    const analyserForInst = analyserForProdukt.filter(a =>
      (inst.analysIds || []).includes(a.id)
    );
    const maskintidPerBatchSum = analyserForInst.reduce(
      (sum, a) => sum + (a.maskintid || 0),
      0
    );
    const totaltTidBehov = maskintidPerBatchSum * (order.antalBatcher || 0);
    const utnyttjandeProcent =
      inst.tillgangligTid > 0
        ? ((totaltTidBehov / inst.tillgangligTid) * 100).toFixed(1)
        : "0.0";
    return {
      instrumentId: inst.id,
      instrumentNamn: inst.namn,
      tillgangligTid: inst.tillgangligTid,
      maskintidPerBatchSum,
      totaltTidBehov,
      utnyttjandeProcent,
      overbooked: totaltTidBehov > inst.tillgangligTid,
    };
  });

  const handleChange = (key, value) => {
    setOrder(prev => ({
      ...prev,
      [key]: key === "antalBatcher" ? Number(value) : value
    }));
  };

  return (
    <div style={{ padding: 20, maxWidth: 1100, margin: "0 auto" }}>
      <h2>Lean planering - ALLT KOPPLAT</h2>
      <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
        <select
          value={order.produktId}
          onChange={e => handleChange("produktId", e.target.value)}
          style={{ flex: 1, padding: 8 }}
        >
          {produkter.map(p => (
            <option key={p.id} value={p.id}>{p.namn}</option>
          ))}
        </select>
        <input
          type="number"
          min="0"
          value={order.antalBatcher}
          onChange={e => handleChange("antalBatcher", e.target.value)}
          placeholder="Antal batcher"
          style={{ width: 120, padding: 8 }}
        />
      </div>
      <p>
        Planering för produkt: <b>{produktNamn}</b>, antal batcher: <b>{order.antalBatcher}</b>
      </p>
      <table border={1} cellPadding={6} style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead style={{ backgroundColor: "#eee" }}>
          <tr>
            <th>Instrument</th>
            <th>Tillgänglig tid (h/vecka)</th>
            <th>Maskintid per batch (sum analyser)</th>
            <th>Total maskintid behov (h)</th>
            <th>Utnyttjande %</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {instrumentPlan.map(inst => (
            <tr
              key={inst.instrumentId}
              style={{ backgroundColor: inst.overbooked ? "#fcc" : "transparent" }}
            >
              <td>{inst.instrumentNamn}</td>
              <td>{inst.tillgangligTid}</td>
              <td>{inst.maskintidPerBatchSum.toFixed(2)}</td>
              <td>{inst.totaltTidBehov.toFixed(2)}</td>
              <td>{inst.utnyttjandeProcent}</td>
              <td style={{ color: inst.overbooked ? "red" : "green", fontWeight: "bold" }}>
                {inst.overbooked ? "Kapacitet överskriden!" : "Ok"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
