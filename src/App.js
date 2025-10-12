import React, { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import Instrument from './pages/Instrument';
import Analysis from './pages/Analysis';
import ProdukterMedAnalyser from './pages/ProdukterMedAnalyser';
import Connections from './pages/connections';
import Navbar from './components/Navbar';
import Taket from './pages/taket';

function App() {
  const [page, setPage] = useState('Dashboard');
  const [analyser, setAnalyser] = useState([]);
  const [produkter, setProdukter] = useState([]);
  const [instrument, setInstrument] = useState([]);
  const [taket, setTaket] = useState([]);


  // Ladda data från localStorage en gång vid appstart
  useEffect(() => {
    const anaLS = localStorage.getItem('qc_analysisdata');
    setAnalyser(anaLS ? JSON.parse(anaLS) : []);
    const prodLS = localStorage.getItem('qc_prod_analys_produkt');
    setProdukter(prodLS ? JSON.parse(prodLS) : []);
    const instrLS = localStorage.getItem('qc_instruments');
    setInstrument(instrLS ? JSON.parse(instrLS) : []);
  }, []);

  // Spara automatiskt när data ändras
  useEffect(() => {
    localStorage.setItem('qc_analysisdata', JSON.stringify(analyser));
  }, [analyser]);
  useEffect(() => {
    localStorage.setItem('qc_prod_analys_produkt', JSON.stringify(produkter));
  }, [produkter]);
  useEffect(() => {
    localStorage.setItem('qc_instruments', JSON.stringify(instrument));
  }, [instrument]);

  return (
    <div>
      <Navbar onNavigate={setPage} />

      {page === 'Dashboard' && (
        <Dashboard
          produkter={produkter}
          analyser={analyser}
          instrument={instrument}
        />
      )}
      {page === 'Analysis' && (
        <Analysis rows={analyser} setRows={setAnalyser} />
      )}
        {page === 'Taket' && (
          <Taket
            produkter={produkter}
            analyser={analyser}
            instrument={instrument}
          />
        )}
      {page === 'Produkter' && (
        <ProdukterMedAnalyser
          produkter={produkter}
          setProdukter={setProdukter}
          analyser={analyser}
        />
      )}
      {page === 'Instrument' && (
        <Instrument
          instrument={instrument}
          setInstrument={setInstrument}
          analyser={analyser}
        />
      )}
      {page === 'Connections' && (
        <Connections
          produkter={produkter}
          analyser={analyser}
          instrument={instrument}
        />
      )}
      
    </div>
  );
}

export default App;
