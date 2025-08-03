import React from 'react';
import Card from './Card';
import './Player.css';

const Player = ({ 
  player, 
  isCurrentPlayer, 
  isDealer, 
  showCards = false,
  position = 'bottom'
}) => {
  const getPlayerStatus = () => {
    if (player.isFolded) return 'folded';
    if (player.isAllIn) return 'all-in';
    if (isCurrentPlayer) return 'active';
    return 'waiting';
  };

  return (
    <div className={`player player-${position} player-${getPlayerStatus()}`}>
      <div className="player-info">
        <div className="player-name">
          {player.name}
          {isDealer && <span className="dealer-button">D</span>}
        </div>
        <div className="player-chips">${player.chips}</div>
        {player.currentBet > 0 && (
          <div className="player-bet">${player.currentBet}</div>
        )}
      </div>
      
      <div className="player-cards">
        {player.holeCards.map((card, index) => (
          <Card 
            key={index} 
            card={card} 
            isHidden={!showCards && !player.isFolded}
            size="small"
          />
        ))}
      </div>
      
      {player.isFolded && <div className="fold-overlay">FOLDED</div>}
      {player.isAllIn && <div className="all-in-overlay">ALL IN</div>}
    </div>
  );
};

export default Player;