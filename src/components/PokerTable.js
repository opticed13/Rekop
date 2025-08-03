import React, { useState, useEffect } from 'react';
import { PokerGame } from '../game/PokerGame';
import { Player as PlayerClass } from '../game/Player';
import Player from './Player';
import Card from './Card';
import BettingControls from './BettingControls';
import AIPlayer from './AIPlayer';
import './PokerTable.css';

const PokerTable = () => {
  const [game, setGame] = useState(null);
  const [gameState, setGameState] = useState(null);

  // Initialize game
  useEffect(() => {
    const players = [
      new PlayerClass('You', 1000, false),
      new PlayerClass('Alice', 1000, true),
      new PlayerClass('Bob', 1000, true),
      new PlayerClass('Charlie', 1000, true)
    ];
    
    const newGame = new PokerGame(players, 10, 20);
    setGame(newGame);
    setGameState(newGame.getGameState());
  }, []);

  const startNewHand = () => {
    if (game && game.canStartGame()) {
      game.startNewHand();
      setGameState(game.getGameState());
    }
  };

  const handlePlayerAction = (action, amount = 0) => {
    if (game && game.playerAction(action, amount)) {
      setGameState(game.getGameState());
    }
  };

  const getCurrentPlayer = () => {
    if (!gameState || gameState.currentPlayerIndex < 0) return null;
    return gameState.players[gameState.currentPlayerIndex];
  };

  const getAvailableActions = () => {
    const currentPlayer = getCurrentPlayer();
    if (!currentPlayer) return [];
    
    // Create available actions based on game state since we're working with plain objects
    const actions = [];
    
    if (!currentPlayer.isActive || currentPlayer.isFolded || currentPlayer.isAllIn) {
      return actions;
    }
    
    // Can always fold
    actions.push('fold');
    
    // Can call if there's a bet to call and player has chips
    if (gameState.currentBet > currentPlayer.currentBet && currentPlayer.chips > 0) {
      const callAmount = Math.min(gameState.currentBet - currentPlayer.currentBet, currentPlayer.chips);
      actions.push({ action: 'call', amount: callAmount });
    }
    
    // Can check if no bet to call
    if (gameState.currentBet === currentPlayer.currentBet) {
      actions.push('check');
    }
    
    // Can raise if player has enough chips
    if (currentPlayer.chips > gameState.currentBet - currentPlayer.currentBet) {
      const minRaiseAmount = Math.max(gameState.minRaise, gameState.currentBet - currentPlayer.currentBet + gameState.minRaise);
      const maxRaiseAmount = currentPlayer.chips + currentPlayer.currentBet;
      if (maxRaiseAmount >= minRaiseAmount) {
        actions.push({ 
          action: 'raise', 
          minAmount: minRaiseAmount, 
          maxAmount: maxRaiseAmount 
        });
      }
    }
    
    return actions;
  };

  const getHandDescription = (player) => {
    if (!gameState.communityCards.length || player.isFolded) return '';
    
    // This would use HandEvaluator in a real implementation
    // For now, just show a simple message
    return gameState.gamePhase === 'showdown' ? 'Hand evaluated' : '';
  };

  if (!gameState) {
    return <div className="loading">Loading poker table...</div>;
  }

  return (
    <div className="poker-table">
      <div className="game-info">
        <h1>Texas Hold'em Poker</h1>
        <div className="game-stats">
          <span>Hand #{gameState.handNumber}</span>
          <span>Pot: ${gameState.pot}</span>
          <span>Round: {gameState.bettingRound}</span>
          {gameState.currentBet > 0 && <span>Current Bet: ${gameState.currentBet}</span>}
        </div>
      </div>

      {gameState.gamePhase === 'waiting' && (
        <div className="game-start">
          <button className="btn btn-start" onClick={startNewHand}>
            Start New Hand
          </button>
        </div>
      )}

      {gameState.gamePhase !== 'waiting' && (
        <>
          <div className="table-layout">
            {/* Top players */}
            <div className="players-top">
              {gameState.players.slice(1, 3).map((player, index) => (
                <Player
                  key={player.name}
                  player={player}
                  isCurrentPlayer={gameState.currentPlayerIndex === index + 1}
                  isDealer={gameState.dealerPosition === index + 1}
                  showCards={gameState.gamePhase === 'showdown'}
                  position="top"
                />
              ))}
            </div>

            {/* Community cards and pot */}
            <div className="center-area">
              <div className="community-cards">
                <h3>Community Cards</h3>
                <div className="cards-display">
                  {gameState.communityCards.map((card, index) => (
                    <Card key={index} card={card} size="large" />
                  ))}
                  {/* Placeholder cards for future rounds */}
                  {Array.from({ length: 5 - gameState.communityCards.length }, (_, i) => (
                    <div key={`placeholder-${i}`} className="card-placeholder"></div>
                  ))}
                </div>
              </div>
              
              <div className="pot-display">
                <h3>Pot: ${gameState.pot}</h3>
              </div>
            </div>

            {/* Side players */}
            <div className="players-sides">
              {gameState.players.length > 3 && (
                <div className="players-left">
                  <Player
                    player={gameState.players[3]}
                    isCurrentPlayer={gameState.currentPlayerIndex === 3}
                    isDealer={gameState.dealerPosition === 3}
                    showCards={gameState.gamePhase === 'showdown'}
                    position="left"
                  />
                </div>
              )}
            </div>

            {/* Bottom player (human player) */}
            <div className="players-bottom">
              <Player
                player={gameState.players[0]}
                isCurrentPlayer={gameState.currentPlayerIndex === 0}
                isDealer={gameState.dealerPosition === 0}
                showCards={true}
                position="bottom"
              />
            </div>
          </div>

          {/* Betting controls for human player */}
          {getCurrentPlayer() && !getCurrentPlayer().isAI && (
            <BettingControls
              player={getCurrentPlayer()}
              currentBet={gameState.currentBet}
              minRaise={gameState.minRaise}
              onAction={handlePlayerAction}
              availableActions={getAvailableActions()}
            />
          )}

          {/* Game results */}
          {gameState.gamePhase === 'finished' && (
            <div className="game-results">
              <h3>Hand Complete!</h3>
              {gameState.winners.length === 1 ? (
                <p>{gameState.winners[0].name} wins the pot of ${gameState.pot}!</p>
              ) : (
                <p>Split pot between: {gameState.winners.map(w => w.name).join(', ')}</p>
              )}
              <button className="btn btn-next" onClick={startNewHand}>
                Next Hand
              </button>
            </div>
          )}

          {/* AI player indicator */}
          {getCurrentPlayer() && getCurrentPlayer().isAI && gameState.gamePhase === 'betting' && (
            <AIPlayer 
              game={game}
              onActionComplete={() => setGameState(game.getGameState())}
            />
          )}
        </>
      )}
    </div>
  );
};

export default PokerTable;