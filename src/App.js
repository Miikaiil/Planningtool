import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import Navbar from "./components/Navbar";
import KapacitetRapport from "./pages/KapacitetRapport";
import Dashboard from "./pages/Dashboard";
import Analysis from "./pages/Analysis";
import BatchPlanBase from "./pages/Planeringssimulering";
import Legotavlan from "./pages/Legotavlan";
import QcSimulation from "./pages/QcSimulation";
import TestDnDSimple from "./pages/TestDnDSimple";
import BigScheduler from "./pages/BigScheduler";
import Analytiker from "./pages/AnalytikerMatris";
import Taket from "./pages/taket";
import ProdukterMedAnalyser from "./pages/ProdukterMedAnalyser";
import Instrument from "./pages/Instrument";
import Connections from "./pages/connections";

function App() {
  // Alla states för CSV-data
  const [batcher, setBatcher] = useState(null);
  const [produkter, setProdukter] = useState(null);
  const [analyspaket, setAnalyspaket] = useState(null);
  const [analyser, setAnalyser] = useState(null);
  const [instrument, setInstrument] = useState(null);
  const [analytiker, setAnalytiker] = useState(null);
  const [taket, setTaket] = useState(null);

  // Page/menyval
  const [page, setPage] = useState("Dashboard");

  // Funktion att ladda CSV med fetch+PapaParse
  const fetchCSV = (url, setter) => {
    fetch(url)
      .then((res) => res.text())
      .then((text) => {
        const result = Papa.parse(text, { header: true, skipEmptyLines: true });
        setter(result.data);
      });
  };

  // Läser in CSV-filer när appen mountas
  useEffect(() => {
    fetchCSV("/batcher.csv", setBatcher);
    fetchCSV("/produkter.csv", setProdukter);
    fetchCSV("/analyspaket.csv", setAnalyspaket);
    fetchCSV("/analyser.csv", setAnalyser);
    fetchCSV("/instrument.csv", setInstrument);
    fetchCSV("/analytiker.csv", setAnalytiker);
    fetchCSV("/taket.csv", setTaket);
  }, []);

  // Väntar tills alla viktiga filer är laddade för att inte krascha
  if (!batcher || !produkter || !analyspaket || !analyser) {
    return <div>Data laddas fortfarande...</div>;
  }

  // Rendera sidkomponent baserat på menyval
  return (
    <div>
      <Navbar onNavigate={setPage} />
      <div style={{ padding: 16 }}>
        {page === "Dashboard" && (
          <Dashboard produkter={produkter} analyser={analyser} instrument={instrument} />
        )}

        {page === "KapacitetRapport" && (
          <KapacitetRapport
            batcher={batcher}
            produkter={produkter}
            analyspaket={analyspaket}
            analyser={analyser}
            instrument={instrument}
            analytiker={analytiker}
          />
        )}

        {page === "Analysis" && <Analysis rows={analyser} setRows={setAnalyser} />}

        {page === "Planering" && (
          <BatchPlanBase produkter={produkter} analyser={analyser} instrument={instrument} />
        )}

        {page === "Legotavlan" && (
          <Legotavlan produkter={produkter} analyser={analyser} instrument={instrument} />
        )}

        {page === "QcSimulation" && (
          <QcSimulation
            produkter={produkter}
            analyser={analyser}
            instrument={instrument}
            analytiker={analytiker}
            batcher={batcher}
            setBatcher={setBatcher}
          />
        )}

        {page === "TestDnDSimple" && <TestDnDSimple />}

        {page === "BigScheduler" && (
          <BigScheduler
            batcher={batcher}
            produkter={produkter}
            analyser={analyser}
            instrument={instrument}
            analytiker={analytiker}
          />
        )}

        {page === "Analytiker" && (
          <Analytiker analytiker={analytiker} setAnalytiker={setAnalytiker} analyser={analyser} />
        )}

        {page === "Taket" && (
          <Taket produkter={produkter} analyser={analyser} instrument={instrument} />
        )}

        {page === "Produkter" && (
          <ProdukterMedAnalyser
            produkter={produkter}
            setProdukter={setProdukter}
            analyser={analyser}
            instrument={instrument}
          />
        )}

        {page === "Instrument" && (
          <Instrument instrument={instrument} setInstrument={setInstrument} analyser={analyser} />
        )}

        {page === "Connections" && (
          <Connections produkter={produkter} analyser={analyser} instrument={instrument} />
        )}
      </div>
    </div>
  );
}

export default App;
