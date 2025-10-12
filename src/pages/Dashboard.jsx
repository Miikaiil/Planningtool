import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

export default function BatchPlanner({ produkter }) {
  const [batches, setBatches] = useState([]);
  const [valdProduktId, setValdProduktId] = useState("");
  const [starttid, setStarttid] = useState(moment().format("YYYY-MM-DDTHH:mm"));

  useEffect(() => {
    // När starttid ändras och produkt är vald, lägg till en batch automatiskt om den inte redan finns
    if (valdProduktId && starttid) {
      const finns = batches.some(
        (b) =>
          b.produktId === valdProduktId &&
          moment(b.startTid).isSame(moment(starttid))
      );
      if (!finns) {
        const produkt = produkter.find((p) => p.id === valdProduktId);
        if (!produkt) return;
        const start = moment(starttid);
        // Anta din produkt har fältet 'InstrumenttidPerBatch' som minuter
        const maskintid = Number(produkt.InstrumenttidPerBatch) || 60;
        const slut = start.clone().add(maskintid, "minutes");
        const nyBatch = {
          id: `${valdProduktId}-${start.format("HHmm")}`,
          produktId: valdProduktId,
          produktNamn: produkt.namn || produkt.ProduktNamn || produkt.name,
          startTid: start.toDate(),
          slutTid: slut.toDate(),
          laborant: "Laborant 1",
        };
        setBatches((prev) => [...prev, nyBatch]);
      }
    }
  }, [valdProduktId, starttid, batches, produkter]);

  const events = batches.map((batch) => ({
    id: batch.id,
    title: `${batch.produktNamn} (${batch.id})`,
    start: batch.startTid,
    end: batch.slutTid,
  }));

  return (
    <div style={{ padding: 20 }}>
      <h2>Batch Planerare - Välj produkt och starttid</h2>
      <div style={{ marginBottom: 20, display: "flex", gap: 10, maxWidth: 500 }}>
        <select
          value={valdProduktId}
          onChange={(e) => setValdProduktId(e.target.value)}
          style={{ flexGrow: 1, padding: 8 }}
        >
          <option value="">Välj produkt</option>
          {produkter.map((p) => (
            <option key={p.id} value={p.id}>
              {p.namn || p.ProduktNamn || p.name}
            </option>
          ))}
        </select>
        <input
          type="datetime-local"
          value={starttid}
          onChange={(e) => setStarttid(e.target.value)}
          style={{ flexGrow: 1, padding: 8 }}
        />
      </div>

      <div style={{ height: 600 }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          defaultView="work_week"
          views={["work_week", "day", "agenda"]}
          step={15}
          timeslots={4}
        />
      </div>
    </div>
  );
}
