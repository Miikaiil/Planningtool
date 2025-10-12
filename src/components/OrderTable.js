import React from 'react';

const OrderTable = () => {
  return (
    <table style={{
      width: '100%',
      borderCollapse: 'collapse',
      margin: '1rem 0',
      boxShadow: '0 0 5px #1976d2'
    }}>
      <thead>
        <tr style={{backgroundColor: '#1976d2', color: '#fff'}}>
          <th>Batchnummer</th>
          <th>Linje</th>
          <th>Produkt</th>
          <th>Leveranstid</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>2025001</td>
          <td>1</td>
          <td>Exempelprodukt</td>
          <td>08:30</td>
        </tr>
        <tr>
          <td>2025002</td>
          <td>2</td>
          <td>Exempelprodukt B</td>
          <td>09:45</td>
        </tr>
      </tbody>
    </table>
  );
};

export default OrderTable;
