import React from 'react';

const StockItem = ({ symbol, name, price, high, low, open, prevClose }) => {
  return (
    <div className="stock-item">
      <h2>{name} ({symbol})</h2>
      <p>Current Price: ${price}</p>
    </div>
  );
};

export default StockItem;
