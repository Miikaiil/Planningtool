import React, { useState } from 'react';

function TreeNode({ node }) {
  const [expanded, setExpanded] = useState(true);

  if (!node) return null;

  return (
    <li>
      <div onClick={() => setExpanded(!expanded)} style={{ cursor: 'pointer' }}>
        {expanded ? '[-]' : '[+]'} {node.title} {node.subtitle && <small>({node.subtitle})</small>}
      </div>
      {expanded && node.children && node.children.length > 0 && (
        <ul>
          {node.children.map((child) => (
            <TreeNode key={child.id || child.title} node={child} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function Connections({ produkter = [], analyser = [], instrument = [] }) {
  // Bygg träddata för varje produkt
  function buildTreeData() {
    return produkter.map((prod) => ({
      title: prod.namn || 'Namnlös produkt',
      subtitle: `ID: ${prod.id}`,
      children: analyser
        .filter((an) => prod.analysIds?.includes(an.id))
        .map((an) => ({
          title: an.namn || an.Analys || 'Namnlös analys',
          subtitle: `ID: ${an.id}`,
          children: instrument
            .filter((inst) => inst.analysIds?.includes(an.id))
            .map((inst) => ({
              title: inst.namn || 'Namnlöst instrument',
              subtitle: `ID: ${inst.id}`,
              children: []
            })),
        })),
    }));
  }

  const treeData = buildTreeData();

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: 'auto' }}>
      <h2>Connections - All Data</h2>

      {treeData.length === 0 ? (
        <div>Ingen data att visa.</div>
      ) : (
        <ul style={{ listStyleType: 'none', paddingLeft: 20 }}>
          {treeData.map((node) => (
            <TreeNode key={node.subtitle} node={node} />
          ))}
        </ul>
      )}
    </div>
  );
}
