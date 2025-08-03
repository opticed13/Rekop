import React from 'react';
import './Card.css';

const Card = ({ card, isHidden = false, size = 'normal' }) => {
  if (!card) return null;

  if (isHidden) {
    return (
      <div className={`card card-back ${size}`}>
        <div className="card-pattern"></div>
      </div>
    );
  }

  return (
    <div className={`card ${card.getColor()} ${size}`}>
      <div className="card-rank">{card.rank}</div>
      <div className="card-suit">{card.getDisplayName().slice(-1)}</div>
    </div>
  );
};

export default Card;