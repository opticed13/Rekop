import React, { useEffect, useState } from 'react';

const getAvailableActionsForPlayer = (player, gameState) => {
  const actions = [];
  
  if (!player.isActive || player.isFolded || player.isAllIn) {
    return actions;
  }
  
  // Can always fold
  actions.push('fold');
  
  // Can call if there's a bet to call and player has chips
  if (gameState.currentBet > player.currentBet && player.chips > 0) {
    const callAmount = Math.min(gameState.currentBet - player.currentBet, player.chips);
    actions.push({ action: 'call', amount: callAmount });
  }
  
  // Can check if no bet to call
  if (gameState.currentBet === player.currentBet) {
    actions.push('check');
  }
  
  // Can raise if player has enough chips
  if (player.chips > gameState.currentBet - player.currentBet) {
    const minRaiseAmount = Math.max(gameState.minRaise, gameState.currentBet - player.currentBet + gameState.minRaise);
    const maxRaiseAmount = player.chips + player.currentBet;
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

const AIPlayer = ({ game, onActionComplete }) => {
  const [isThinking, setIsThinking] = useState(true);

  useEffect(() => {
    const makeAIDecision = () => {
      setIsThinking(true);
      
      // Simple AI logic - can be enhanced
      setTimeout(() => {
        const gameState = game.getGameState();
        const currentPlayer = gameState.players[gameState.currentPlayerIndex];
        
        if (!currentPlayer || !currentPlayer.isAI || !currentPlayer.isActive || currentPlayer.isFolded || currentPlayer.isAllIn) {
          setIsThinking(false);
          return;
        }

        const availableActions = getAvailableActionsForPlayer(currentPlayer, gameState);
        
        // Simple AI strategy
        let action = 'fold';
        let amount = 0;

        // Basic decision making
        const hasHighCard = currentPlayer.holeCards.some(card => card.getValue() >= 12); // Face cards or Ace
        const isPair = currentPlayer.holeCards[0].getValue() === currentPlayer.holeCards[1].getValue();
        const isConnected = Math.abs(currentPlayer.holeCards[0].getValue() - currentPlayer.holeCards[1].getValue()) <= 3;

        if (isPair) {
          // Always play pairs
          const raiseAction = availableActions.find(a => a.action === 'raise');
          if (raiseAction) {
            action = 'raise';
            amount = raiseAction.minAmount;
          } else if (availableActions.find(a => a.action === 'call')) {
            action = 'call';
          } else if (availableActions.includes('check')) {
            action = 'check';
          }
        } else if (hasHighCard) {
          // Play high cards conservatively
          if (availableActions.includes('check')) {
            action = 'check';
          } else if (availableActions.find(a => a.action === 'call') && gameState.currentBet <= 40) {
            action = 'call';
          }
        } else if (isConnected && availableActions.includes('check')) {
          // Check with connected cards
          action = 'check';
        } else if (availableActions.find(a => a.action === 'call') && gameState.currentBet <= 20) {
          // Call small bets with any hand
          action = 'call';
        }

        // Execute the action
        game.playerAction(action, amount);
        setIsThinking(false);
        onActionComplete();
      }, 1000 + Math.random() * 2000); // Random thinking time between 1-3 seconds
    };

    if (isThinking) {
      makeAIDecision();
    }
  }, [game, onActionComplete, isThinking]);

  const gameState = game.getGameState();
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  if (!currentPlayer || !currentPlayer.isAI) {
    return null;
  }

  return (
    <div className="ai-thinking">
      <p>{currentPlayer.name} is thinking...</p>
      <div className="thinking-dots">
        <span>.</span><span>.</span><span>.</span>
      </div>
    </div>
  );
};

export default AIPlayer;