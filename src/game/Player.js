// Player class represents a poker player
export class Player {
  constructor(name, chips = 1000, isAI = false) {
    this.name = name;
    this.chips = chips;
    this.holeCards = [];
    this.currentBet = 0;
    this.totalBetInRound = 0;
    this.isActive = true;
    this.isFolded = false;
    this.isAllIn = false;
    this.isAI = isAI;
    this.position = 0;
  }

  // Betting actions
  fold() {
    this.isFolded = true;
    this.isActive = false;
  }

  call(amount) {
    const callAmount = Math.min(amount - this.currentBet, this.chips);
    this.chips -= callAmount;
    this.currentBet += callAmount;
    this.totalBetInRound += callAmount;
    
    if (this.chips === 0) {
      this.isAllIn = true;
    }
    
    return callAmount;
  }

  raise(amount) {
    const totalAmount = Math.min(amount, this.chips + this.currentBet);
    const raiseAmount = totalAmount - this.currentBet;
    this.chips -= raiseAmount;
    this.currentBet = totalAmount;
    this.totalBetInRound += raiseAmount;
    
    if (this.chips === 0) {
      this.isAllIn = true;
    }
    
    return raiseAmount;
  }

  // Deal hole cards
  dealCards(card1, card2) {
    this.holeCards = [card1, card2];
  }

  // Reset for new hand
  resetForNewHand() {
    this.holeCards = [];
    this.currentBet = 0;
    this.totalBetInRound = 0;
    this.isFolded = false;
    this.isAllIn = false;
    this.isActive = true;
  }

  // Check if player can act
  canAct() {
    return this.isActive && !this.isFolded && !this.isAllIn;
  }

  // Get available actions
  getAvailableActions(currentBet, minRaise) {
    const actions = [];
    
    if (!this.canAct()) {
      return actions;
    }
    
    // Can always fold
    actions.push('fold');
    
    // Can call if there's a bet to call and player has chips
    if (currentBet > this.currentBet && this.chips > 0) {
      const callAmount = Math.min(currentBet - this.currentBet, this.chips);
      actions.push({ action: 'call', amount: callAmount });
    }
    
    // Can check if no bet to call
    if (currentBet === this.currentBet) {
      actions.push('check');
    }
    
    // Can raise if player has enough chips
    if (this.chips > currentBet - this.currentBet) {
      const minRaiseAmount = Math.max(minRaise, currentBet - this.currentBet + minRaise);
      const maxRaiseAmount = this.chips + this.currentBet;
      if (maxRaiseAmount >= minRaiseAmount) {
        actions.push({ 
          action: 'raise', 
          minAmount: minRaiseAmount, 
          maxAmount: maxRaiseAmount 
        });
      }
    }
    
    return actions;
  }
}