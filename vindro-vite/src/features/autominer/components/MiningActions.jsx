// /features/autominer/components/MiningActions.jsx
import React, { useState } from 'react';

const MiningActions = ({ 
  title, 
  resourceCount, 
  resourceName,
  onAction, 
  actionLabel,
  workerCount, 
  unitPrice, 
  onBuy,
  autoBuyValue,
  onAutoBuyToggle
}) => {
  const [qty, setQty] = useState(1);
  const totalCost = unitPrice * qty;
  const canAfford = resourceCount >= totalCost;

  return (
    <div className="card mb-4" style={{ backgroundColor: '#36393f', color: '#fff' }}>
      <div className="card-content">
        <h3 className="title is-5 has-text-white">{title}</h3>
        
        {onAction && (
          <button className="button is-info is-fullwidth mb-3" onClick={onAction}>
            {actionLabel}
          </button>
        )}

        <div className="field">
          <label className="label has-text-grey-light">Buy Amount</label>
          <div className="field has-addons">
            <div className="control is-expanded">
              <input 
                className="input" 
                type="number" 
                value={qty} 
                onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))} 
              />
            </div>
            <div className="control">
              <button 
                className={`button ${canAfford ? 'is-success' : 'is-danger'}`}
                disabled={!canAfford}
                onClick={() => onBuy(qty)}
              >
                Buy {qty}
              </button>
            </div>
          </div>
          <p className="help">Cost: {totalCost} {resourceName} | Owned: {workerCount || 0}</p>
        </div>

        {onAutoBuyToggle && (
          <label className="checkbox mt-2">
            <input 
              type="checkbox" 
              className="mr-2"
              checked={autoBuyValue} 
              onChange={(e) => onAutoBuyToggle(e.target.checked)} 
            />
            Auto-buy {title}
          </label>
        )}
      </div>
    </div>
  );
};

export default MiningActions;