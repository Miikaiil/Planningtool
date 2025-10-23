import React, { useState } from 'react';
import { Button, Tooltip } from '@mui/material';

// Badge/färg-komponent för visualisering
function Badge({ type, children }) {
  const colorMap = {
    product: '#1976d2',
    analysis: '#ab47bc',
    instrument: '#388e3c',
    error: '#e53935',
    ok: '#43a047'
  };
  return (
    <span style={{
      display: 'inline-block',
      backgroundColor: colorMap[type] || '#ccc',
      color: 'white',
      borderRadius: 8,
      padding: '2.5px 11px',
      marginRight: 7,
      fontSize: 13,
      fontWeight: 600,
      boxShadow: "0 1px 3px #0001"
    }}>{children}</span>
  );
}

// Gruppfärg för analyser, färger enligt svensk lab-standard
const groupColor = (grp) => {
  if (!grp) return "#90caf9";
  switch (grp.toLowerCase().trim()) {
    case "blå":   return "#2196f3";
    case "grön":  return "#43a047";
    case "gul":   return "#fbc02d";
    case "rosa":  return "#ec407a";
    default:      return "#90caf9";
  }
};

const Icon = ({ expanded, color = "#aaa" }) => (
  <span style={{
    marginRight: 9, fontWeight: 'bold', fontSize: 16, color,
    transition: 'transform 0.2s', display: 'inline-block',
    transform: expanded ? "rotate(90deg)" : "none"
  }}>
    ▶
  </span>
);

function TreeNode({ node, level, expandedLevels, toggleLevel }) {
  const expanded = expandedLevels[level];

  if (!node) return null;
  const badgeType = level === 0 ? 'product' : (level === 1 ? 'analysis' : 'instrument');
  let status = null;
  if (level === 1 && node.children) {
    status = (
      <Badge type={node.children.length > 0 ? 'ok' : 'error'}>
        {node.children.length > 0 ? "✓" : "!"}
      </Badge>
    );
  }
  return (
    <li style={{
      margin: '7px 0', 
      paddingLeft: level > 0 ? 18 : 0,
      borderLeft: level > 0 ? '1.5px dashed #dde' : undefined,
      background: expanded && level === 2 ? 'linear-gradient(90deg,#f9fafc 40%,#eef3fa 100%)' : undefined
    }}>
      <div
        style={{
          cursor: node.children?.length ? "pointer" : "default",
          userSelect: 'none',
          display: 'flex',
          alignItems: 'center',
          fontWeight: level === 0 ? 650 : 500,
          fontSize: 15,
          letterSpacing: 0.1,
          transition: "background .15s",
          borderRadius: 5,
          padding: level === 0 ? "4px 0" : "2px 0"
        }}
        onClick={() => node.children?.length && toggleLevel(level)}
        tabIndex={0}
        aria-label={node.title}
      >
        {node.children?.length > 0 &&
          <Icon
            expanded={expanded}
            color={
              badgeType === 'product' ? "#1976d2" :
              badgeType === 'analysis' ? "#ab47bc" : "#388e3c"
            }
          />}
        <Badge type={badgeType}>{node.title}</Badge>
        {status}
        {/* Gruppfärg-cirkel på analysnivå */}
        {level === 1 && node.group &&
          <Tooltip title={"Gruppfärg: " + node.group}>
            <span style={{
              display: 'inline-block',
              width: 16, height: 16, borderRadius: '50%',
              backgroundColor: groupColor(node.group),
              marginLeft: 7, border: '1.5px solid #bbb', verticalAlign: 'middle'
            }}></span>
          </Tooltip>
        }
        {node.subtitle && <span style={{ marginLeft: 12, color: '#888', fontSize: 13, fontWeight: 400 }}>{node.subtitle}</span>}
      </div>
      {expanded && node.children && node.children.length > 0 && (
        <ul style={{ listStyleType: 'none', paddingLeft: 0, marginTop: 2 }}>
          {node.children.map(child =>
            <TreeNode
              key={child.id || child.title}
              node={child}
              level={level + 1}
              expandedLevels={expandedLevels}
              toggleLevel={toggleLevel}
            />
          )}
        </ul>
      )}
    </li>
  );
}

// Export all tree-data till CSV: Produkt; Analys; Grupp; Instrument
function treeToCSV(treeData) {
  const header = 'Produkt;Analys;Grupp;Instrument';
  const rows = [];
  treeData.forEach(productNode => {
    const prod = productNode.title;
    if (!productNode.children || productNode.children.length === 0) {
      rows.push([prod, '', '', ''].join(';'));
    } else {
      productNode.children.forEach(analysisNode => {
        const an = analysisNode.title;
        const grp = analysisNode.group || '';
        if (!analysisNode.children || analysisNode.children.length === 0) {
          rows.push([prod, an, grp, ''].join(';'));
        } else {
          analysisNode.children.forEach(instNode => {
            const inst = instNode.title;
            rows.push([prod, an, grp, inst].join(';'));
          });
        }
      });
    }
  });
  return [header, ...rows].join('\n');
}

export default function Connections({ produkter = [], analyser = [], instrument = [] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedLevels, setExpandedLevels] = useState({ 0: true, 1: true, 2: false });

  const toggleLevel = (level) => setExpandedLevels(prev => ({ ...prev, [level]: !prev[level] }));
  const setAllLevels = (level, value) =>
    setExpandedLevels(prev => ({ ...prev, [level]: value }));

  function buildTreeData() {
    let filteredProducts = produkter;
    if (searchTerm.trim()) {
      filteredProducts = produkter.filter(prod =>
        prod.namn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (prod.analysNamnLista || []).some(an =>
          an.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    return filteredProducts.map((prod) => {
      const prodAnalyser = analyser.filter(an =>
        prod.analysNamnLista?.includes(an.Analys || an.namn)
      );
      const analyserWithInstr = prodAnalyser.map(an => {
        const anNamn = an.Analys || an.namn;
        const anGrupp = an.Grupp || an.grupp || ""; // Fält med analys-grupp
        const instrumentsForAnalys = instrument.filter(inst =>
          inst.analysNamnLista?.includes(anNamn)
        );
        return {
          title: an.namn || an.Analys || 'Namnlös analys',
          children: instrumentsForAnalys.map(inst => ({
            title: inst.namn || 'Namnlöst instrument',
            id: inst.namn,
            subtitle: `${inst.tillgangligTid || '?'} tim/vecka`,
            children: []
          })),
          id: anNamn,
          subtitle: `${instrumentsForAnalys.length} instrument`,
          group: anGrupp
        };
      });
      return {
        title: prod.namn || 'Namnlös produkt',
        id: prod.namn,
        children: analyserWithInstr,
        subtitle: `${prodAnalyser.length} analyser`
      };
    });
  }

  const treeData = buildTreeData();

  // EXPORT-knapp funktion
  const handleExportCSV = () => {
    const csvText = treeToCSV(treeData);
    const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "connections_export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{
        padding: 25,
        maxWidth: 900,
        margin: 'auto',
        fontFamily: 'Inter, Arial, "Segoe UI", sans-serif',
        background: "linear-gradient(90deg,#f5f8ff 60%,#e0e5ef 100%)",
        borderRadius: 18,
        marginTop: 18
      }}>
      <h2 style={{marginBottom: 16}}>Connections – All Data</h2>
      <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Sök produkt eller analys..."
          onChange={e => setSearchTerm(e.target.value)}
          value={searchTerm}
          style={{
            padding: 9,
            fontSize: 16,
            borderRadius: 6,
            border: '1.5px solid #bbe',
            flex: 1,
            boxShadow: "0 1px 8px #0001"
          }}
        />
        <Button
          variant="contained"
          color="primary"
          style={{ 
            minWidth: 145,
            background: "linear-gradient(90deg,#3068ab,#1976d2 90%)",
            textTransform: "none",
            fontWeight: 700, fontSize: 16, letterSpacing: 1
          }}
          onClick={handleExportCSV}
        >
          Exportera CSV
        </Button>
      </div>
      <div style={{marginBottom: 14, display:'flex', gap:8, flexWrap:'wrap'}}>
        <Button variant="outlined" size="small" color="primary"
          onClick={() => setAllLevels(0, true)} style={{ borderRadius: 16 }}>Expandera produkter</Button>
        <Button variant="outlined" size="small" color="primary"
          onClick={() => setAllLevels(0, false)} style={{ borderRadius: 16 }}>Kollapsa produkter</Button>
        <Button variant="outlined" size="small" color="secondary"
          onClick={() => setAllLevels(1, true)} style={{ borderRadius: 16 }}>Expandera analyser</Button>
        <Button variant="outlined" size="small" color="secondary"
          onClick={() => setAllLevels(1, false)} style={{ borderRadius: 16 }}>Kollapsa analyser</Button>
      </div>
      {treeData.length === 0 ? (
        <div style={{ color: '#999', textAlign: 'center', padding: 32, fontSize: 16 }}>
          Ingen data att visa. Kontrollera stavning/filter!
        </div>
      ) : (
        <ul style={{ listStyleType: 'none', paddingLeft: 0, marginTop: 12 }}>
          {treeData.map(prod => (
            <TreeNode key={prod.id} node={prod} level={0} expandedLevels={expandedLevels} toggleLevel={toggleLevel} />
          ))}
        </ul>
      )}
    </div>
  );
}
