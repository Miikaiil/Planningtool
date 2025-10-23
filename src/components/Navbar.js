import React, { useState } from 'react';
import { Button } from '@mui/material';
import './Navbar.css';

const Navbar = ({ onNavigate, handleFileImport }) => {
  const [dataOpen, setDataOpen] = useState(false);
  const [anslutningarOpen, setAnslutningarOpen] = useState(false);

  return (
    <nav className="navbar" style={{ display: 'flex', alignItems: 'center', padding: '0 20px' }}>
      <span className="navbar-title" style={{ cursor: 'pointer' }} onClick={() => onNavigate('Dashboard')}>
        Planning Tool
      </span>

      <div className="navbar-menu" style={{ display: 'flex', alignItems: 'center', marginLeft: '20px', gap: '20px' }}>
        
        {/* Dropdown Data */}
        <div
          className="navbar-item dropdown"
          onMouseEnter={() => setDataOpen(true)}
          onMouseLeave={() => setDataOpen(false)}
          style={{ position: 'relative', cursor: 'pointer' }}
        >
          <span>Data</span>
          {dataOpen && (
            <div
              className="dropdown-content"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                backgroundColor: 'white',
                boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                zIndex: 1000,
                minWidth: 160,
              }}
            >
              <div style={{ padding: 12 }} onClick={() => onNavigate('Instrument')}>Instrument</div>
              <div style={{ padding: 12 }} onClick={() => onNavigate('Analysis')}>Analyser</div>
              <div style={{ padding: 12 }} onClick={() => onNavigate('Produkter')}>Produkter</div>
              <div style={{ padding: 12 }} onClick={() => onNavigate('Analytiker')}>Analytiker</div>
              <div style={{ padding: 12 }} onClick={() => onNavigate('BigScheduler')}>scheduler</div>
              <div style={{ padding: 12 }} onClick={() => onNavigate('KapacitetRapport')}>KapacitetRapport</div>
            </div>
          )}
        </div>

        {/* Dropdown Anslutningar */}
        <div
          className="navbar-item dropdown"
          onMouseEnter={() => setAnslutningarOpen(true)}
          onMouseLeave={() => setAnslutningarOpen(false)}
          style={{ position: 'relative', cursor: 'pointer' }}
        >
          <span>Anslutningar</span>
          {anslutningarOpen && (
            <div
              className="dropdown-content"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                backgroundColor: 'white',
                boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                zIndex: 1000,
                minWidth: 160,
              }}
            >
              <div style={{ padding: 12 }} onClick={() => onNavigate('Connections')}>Connections</div>
              <div style={{ padding: 12 }} onClick={() => onNavigate('Taket')}>Taket</div>
              <div style={{ padding: 12 }} onClick={() => onNavigate('Planering')}>Simulering</div>
              <div style={{ padding: 12 }} onClick={() => onNavigate('Legotavlan')}>Legotavlan</div>
              <div style={{ padding: 12 }} onClick={() => onNavigate('QcSimulation')}>Johan</div>
              {/* Lägg till fler anslutningslänkar här om behövs */}
            </div>
          )}
        </div>

        {/* Importknapp */}
        <Button
          variant="outlined"
          component="label"
          style={{ marginLeft: 'auto' }}
        >
          Importera Excel
          <input type="file" hidden accept=".xlsx, .xls" onChange={handleFileImport} />
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
