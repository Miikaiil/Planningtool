import React from "react";
import VisTimelineDemo from "./VisTimelineDemo";

export default function KapacitetRapport({ batcher, produkter, analyspaket, analyser }) {
  // Koppla varje batch till dess analyspaket, hämta analyser listade som CSV-strängar, splitta på ',' och trimma
  const enrichedBatcher = batcher.map(b => {
    const paket = analyspaket.find(p => p.Produktnamn === b.Produkt);
    return {
      ...b,
      analyser:
        paket && typeof paket.analyser === "string"
          ? paket.analyser.split(",").map(s => s.trim())
          : []
    };
  });

  // Unika analyser som grupper
  const allAnalyser = [...new Set(enrichedBatcher.flatMap(b => b.analyser))];
  const grupper = allAnalyser.map(an => ({ id: an, title: an }));

  // Bygg items för timeline
  let baseDate = new Date("2025-11-01T08:00:00");
  const items = [];
  enrichedBatcher.forEach((b, bi) => {
    b.analyser.forEach((an, ai) => {
      const analysisObj = analyser.find(a => a.namn === an || a.Analys === an);
      const maskinTid = analysisObj
        ? Number((analysisObj["Instrumenttid per sekvens (h)"]?.replace(",", ".") || "8"))
        : 8;
      const start = new Date(baseDate);
      start.setDate(baseDate.getDate() + bi);
      start.setHours(8 + ai * 2);
      const end = new Date(start.getTime() + maskinTid * 3600 * 1000);
      items.push({
        id: b.Batchnummer + "_" + an,
        group: an,
        content: `${b.Batchnummer} (${an})`,
        start,
        end
      });
    });
  });

  const options = {
    stack: false,
    groupOrder: "title",
    start: "2025-11-01",
    end: "2025-12-01"
  };

  return (
    <div style={{ maxWidth: 1200, margin: "auto", padding: 16 }}>
      <h2>Tidslinje: batcher per analys (från inlästa CSV-filer)</h2>
      <VisTimelineDemo groups={grupper} items={items} options={options} />
    </div>
  );
}
