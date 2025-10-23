import React from "react";

// Skapar en "tidsaxel"/dag-för-dag-schema för en eller flera batcher
function getBatchTimeline(batch, startDag, startTimme, förmatimmar, maskintid, eftermatimmar) {
  const arbetsdagStart = 8, arbetsdagSlut = 17, dagar = ["Mån", "Tis", "Ons", "Tor", "Fre"];
  let events = [];
  let currDag = startDag, currTimme = startTimme;

  // Förberedelse (mantimmar)
  for (let i = 0; i < förmatimmar;) {
    if (currTimme >= arbetsdagSlut) { currDag++; currTimme = arbetsdagStart; }
    if (currDag >= dagar.length) break;
    events.push({ typ: "Förbereda", dag: dagar[currDag], timme: currTimme, batch });
    currTimme++; i++;
  }
  // Instrument (maskintid)
  for (let i = 0; i < maskintid;) {
    if (currTimme >= arbetsdagSlut) { currDag++; currTimme = arbetsdagStart; }
    if (currDag >= dagar.length) break;
    events.push({ typ: "Maskin", dag: dagar[currDag], timme: currTimme, batch });
    currTimme++; i++;
  }
  // Utvärdering (mantimmar)
  for (let i = 0; i < eftermatimmar;) {
    if (currTimme >= arbetsdagSlut) { currDag++; currTimme = arbetsdagStart; }
    if (currDag >= dagar.length) break;
    events.push({ typ: "Slutarbete", dag: dagar[currDag], timme: currTimme, batch });
    currTimme++; i++;
  }
  return events;
}

export default function BatchTimelineDemo() {
  // Exempeldata: för batch A och B
  // (Här kan du ändra tider för test)
  const batch1 = getBatchTimeline("10AB1234", 0, 8, 1, 10, 1);
  const batch2 = getBatchTimeline("10AB1235", 0, 8, 1, 10, 1);

  // Slå ihop och sortera (om du vill jämföra i en vy)
  const all = [...batch1, ...batch2].sort((a, b) =>
    a.dag.localeCompare(b.dag) || a.timme - b.timme || a.batch.localeCompare(b.batch)
  );

  return (
    <div style={{ maxWidth: 800, margin: "auto", padding: 16 }}>
      <h2>Tidsschema, batch för batch</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Dag</th>
            <th>Tid</th>
            <th>Batch</th>
            <th>Typ av arbete</th>
          </tr>
        </thead>
        <tbody>
          {all.map((e, ix) => (
            <tr key={ix}>
              <td>{e.dag}</td>
              <td>{e.timme}:00</td>
              <td>{e.batch}</td>
              <td>{e.typ}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>Testa att ändra på mantimmar/maskintid i koden för att simulera olika schemas!</p>
      <p>Vill du lägga in fler batcher? Kopiera bara {`batch3 = getBatchTimeline("batchnr", ...)`}</p>
    </div>
  );
}
