import React, { useState } from 'react';
import './BettingControls.css';

const BettingControls = ({ 
  player, 
  currentBet, 
  minRaise, 
  onAction, 
  availableActions 
}) => {
  const [raiseAmount, setRaiseAmount] = useState(minRaise);

  if (!player || !player.isActive || player.isFolded || player.isAllIn || !availableActions.length) {
    return null;
  }

  const handleRaise = () => {
    onAction('raise', raiseAmount);
    setRaiseAmount(minRaise);
  };

  const getRaiseAction = () => {
    return availableActions.find(action => action.action === 'raise');
  };

  const getCallAction = () => {
    return availableActions.find(action => action.action === 'call');
  };

  return (
    <div className="betting-controls">
      <div className="current-turn">
        <h3>{player.name}'s Turn</h3>
        <p>Chips: ${player.chips}</p>
        {currentBet > 0 && <p>Current Bet: ${currentBet}</p>}
      </div>

      <div className="action-buttons">
        {availableActions.includes('fold') && (
          <button 
            className="btn btn-fold"
            onClick={() => onAction('fold')}
          >
            Fold
          </button>
        )}

        {availableActions.includes('check') && (
          <button 
            className="btn btn-check"
            onClick={() => onAction('check')}
          >
            Check
          </button>
        )}

        {getCallAction() && (
          <button 
            className="btn btn-call"
            onClick={() => onAction('call')}
          >
            Call ${getCallAction().amount}
          </button>
        )}

        {getRaiseAction() && (
          <div className="raise-section">
            <div className="raise-input">
              <input
                type="range"
                min={getRaiseAction().minAmount}
                max={getRaiseAction().maxAmount}
                value={raiseAmount}
                onChange={(e) => setRaiseAmount(parseInt(e.target.value))}
                className="raise-slider"
              />
              <input
                type="number"
                min={getRaiseAction().minAmount}
                max={getRaiseAction().maxAmount}
                value={raiseAmount}
                onChange={(e) => setRaiseAmount(parseInt(e.target.value))}
                className="raise-number"
              />
            </div>
            <button 
              className="btn btn-raise"
              onClick={handleRaise}
              disabled={raiseAmount < getRaiseAction().minAmount || raiseAmount > getRaiseAction().maxAmount}
            >
              {currentBet === 0 ? 'Bet' : 'Raise'} ${raiseAmount}
            </button>
          </div>
        )}
      </div>

      <div className="quick-actions">
        {getRaiseAction() && (
          <>
            <button 
              className="btn btn-quick"
              onClick={() => setRaiseAmount(Math.min(getRaiseAction().maxAmount, getRaiseAction().minAmount))}
            >
              Min
            </button>
            <button 
              className="btn btn-quick"
              onClick={() => setRaiseAmount(Math.min(getRaiseAction().maxAmount, Math.floor(player.chips / 2) + currentBet))}
            >
              1/2 Pot
            </button>
            <button 
              className="btn btn-quick"
              onClick={() => setRaiseAmount(getRaiseAction().maxAmount)}
            >
              All In
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default BettingControls;