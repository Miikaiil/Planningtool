import React from "react";

// Kommentera: Här tas instrument och analyser in som props
export default function InstrumentKapacitet({ instrument = [], analyser = [] }) {

  // Funktion för att beräkna teoretisk maxkapacitet per instrument
  function beraknaMaxKapacitet(inst) {
    // Hämta analyser som hör till detta instrument
    const instAnalyser = analyser.filter(a => inst.analysIds && inst.analysIds.includes(a.id));
    // Summera standardtider för varje relevant analys (ex: instrumenttid + utvärdering + kontroll + rengöring)
    let kapacitet = 0;
    instAnalyser.forEach(ana => {
      const tidPerSekvens = 
        Number(ana["Instrumenttid per sekvens (h)"] || 0) +
        Number(ana["Utvärdering (mantimmar)"] || 0) +
        Number(ana["Kontroll (mantimmar)"] || 0) +
        Number(ana["Rengöring (mantimmar)"] || 0);

      // Undvik division med 0
      if (tidPerSekvens > 0) {
        kapacitet += (
          (Number(inst.tillgangligTid || 0) / tidPerSekvens) *
          Number(ana["Max sekvensstorlek (#satser)"] || 1)
        );
      }
    });
    // Summera (om flera analyser går på instrumentet)
    return kapacitet.toFixed(1);
  }

  return (
    <div style={{ padding: 30, maxWidth: 900, margin: "0 auto" }}>
      <h2>Instrumentens teoretiska maxkapacitet (batch/vecka)</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#e7eaff" }}>
            <th style={{ padding: 8, border: "1px solid #aaa" }}>Instrument</th>
            <th style={{ padding: 8, border: "1px solid #aaa" }}>Tillgängliga timmar/vecka</th>
            <th style={{ padding: 8, border: "1px solid #aaa" }}>Analyser</th>
            <th style={{ padding: 8, border: "1px solid #aaa" }}>Maxkapacitet batch/vecka</th>
          </tr>
        </thead>
        <tbody>
          {instrument.map(inst => (
            <tr key={inst.id}>
              <td style={{ padding: 8, border: "1px solid #aaa" }}>{inst.namn}</td>
              <td style={{ padding: 8, border: "1px solid #aaa" }}>{inst.tillgangligTid || "-"}</td>
              <td style={{ padding: 8, border: "1px solid #aaa" }}>
                {/* Lista analyser kopplade till instrumentet */}
                {analyser
                  .filter(a => inst.analysIds && inst.analysIds.includes(a.id))
                  .map(a => a.namn || a.Analys)
                  .join(", ")}
              </td>
              <td style={{ padding: 8, border: "1px solid #aaa" }}>{beraknaMaxKapacitet(inst)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
