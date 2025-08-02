import { Deck } from './Card.js';
import { HandEvaluator } from './HandEvaluator.js';

// Main poker game class that manages Texas Hold'em game flow
export class PokerGame {
  constructor(players, smallBlind = 10, bigBlind = 20) {
    this.players = players;
    this.smallBlind = smallBlind;
    this.bigBlind = bigBlind;
    this.deck = new Deck();
    this.communityCards = [];
    this.pot = 0;
    this.sidePots = [];
    this.currentBet = 0;
    this.minRaise = bigBlind;
    this.dealerPosition = 0;
    this.currentPlayerIndex = 0;
    this.bettingRound = 'preflop'; // preflop, flop, turn, river
    this.gamePhase = 'waiting'; // waiting, dealing, betting, showdown, finished
    this.winners = [];
    this.handNumber = 0;
    
    this.setupPositions();
  }

  // Setup player positions
  setupPositions() {
    this.players.forEach((player, index) => {
      player.position = index;
    });
  }

  // Start a new hand
  startNewHand() {
    this.handNumber++;
    this.deck.reset();
    this.communityCards = [];
    this.pot = 0;
    this.sidePots = [];
    this.currentBet = 0;
    this.minRaise = this.bigBlind;
    this.bettingRound = 'preflop';
    this.gamePhase = 'dealing';
    this.winners = [];
    
    // Reset all players for new hand
    this.players.forEach(player => player.resetForNewHand());
    
    // Move dealer button
    this.dealerPosition = (this.dealerPosition + 1) % this.players.length;
    
    // Deal hole cards
    this.dealHoleCards();
    
    // Post blinds
    this.postBlinds();
    
    // Start betting with player after big blind
    this.currentPlayerIndex = this.getNextActivePlayer((this.dealerPosition + 3) % this.players.length);
    this.gamePhase = 'betting';
  }

  // Deal 2 hole cards to each player
  dealHoleCards() {
    for (let i = 0; i < 2; i++) {
      for (const player of this.players) {
        if (player.isActive) {
          if (i === 0) {
            player.holeCards = [this.deck.deal()];
          } else {
            player.holeCards.push(this.deck.deal());
          }
        }
      }
    }
  }

  // Post small and big blinds
  postBlinds() {
    const smallBlindIndex = (this.dealerPosition + 1) % this.players.length;
    const bigBlindIndex = (this.dealerPosition + 2) % this.players.length;
    
    // Post small blind
    const smallBlindPlayer = this.players[smallBlindIndex];
    const smallBlindAmount = smallBlindPlayer.call(this.smallBlind);
    this.pot += smallBlindAmount;
    
    // Post big blind
    const bigBlindPlayer = this.players[bigBlindIndex];
    const bigBlindAmount = bigBlindPlayer.call(this.bigBlind);
    this.pot += bigBlindAmount;
    this.currentBet = this.bigBlind;
  }

  // Player action
  playerAction(action, amount = 0) {
    const player = this.players[this.currentPlayerIndex];
    
    if (!player.canAct()) {
      return false;
    }
    
    let betAmount = 0;
    
    switch (action) {
      case 'fold':
        player.fold();
        break;
        
      case 'check':
        if (this.currentBet !== player.currentBet) {
          return false; // Can't check if there's a bet
        }
        break;
        
      case 'call':
        betAmount = player.call(this.currentBet);
        this.pot += betAmount;
        break;
        
      case 'raise':
        if (amount < this.currentBet + this.minRaise) {
          return false; // Invalid raise amount
        }
        betAmount = player.raise(amount);
        this.pot += betAmount;
        this.currentBet = amount;
        this.minRaise = amount - this.currentBet + this.minRaise;
        break;
        
      default:
        return false;
    }
    
    // Move to next player or next phase
    if (this.isBettingRoundComplete()) {
      this.nextBettingRound();
    } else {
      this.currentPlayerIndex = this.getNextActivePlayer(this.currentPlayerIndex + 1);
    }
    
    return true;
  }

  // Check if betting round is complete
  isBettingRoundComplete() {
    const activePlayers = this.players.filter(p => p.canAct() || (!p.isFolded && p.isAllIn));
    
    if (activePlayers.length <= 1) {
      return true;
    }
    
    // Check if all active players have matched the current bet
    const playersWhoCanBet = activePlayers.filter(p => p.canAct());
    if (playersWhoCanBet.length === 0) {
      return true;
    }
    
    return playersWhoCanBet.every(p => p.currentBet === this.currentBet);
  }

  // Move to next betting round
  nextBettingRound() {
    // Reset current bets for next round
    this.players.forEach(player => {
      player.currentBet = 0;
    });
    this.currentBet = 0;
    
    switch (this.bettingRound) {
      case 'preflop':
        this.dealFlop();
        this.bettingRound = 'flop';
        break;
      case 'flop':
        this.dealTurn();
        this.bettingRound = 'turn';
        break;
      case 'turn':
        this.dealRiver();
        this.bettingRound = 'river';
        break;
      case 'river':
        this.showdown();
        return;
    }
    
    // Start betting with first active player after dealer
    this.currentPlayerIndex = this.getNextActivePlayer(this.dealerPosition + 1);
  }

  // Deal the flop (3 community cards)
  dealFlop() {
    this.deck.deal(); // Burn card
    for (let i = 0; i < 3; i++) {
      this.communityCards.push(this.deck.deal());
    }
  }

  // Deal the turn (4th community card)
  dealTurn() {
    this.deck.deal(); // Burn card
    this.communityCards.push(this.deck.deal());
  }

  // Deal the river (5th community card)
  dealRiver() {
    this.deck.deal(); // Burn card
    this.communityCards.push(this.deck.deal());
  }

  // Showdown - determine winners
  showdown() {
    this.gamePhase = 'showdown';
    
    const activePlayers = this.players.filter(p => !p.isFolded);
    
    if (activePlayers.length === 1) {
      // Only one player left - they win
      this.winners = [activePlayers[0]];
      activePlayers[0].chips += this.pot;
    } else {
      // Evaluate hands and determine winners
      const playerHands = activePlayers.map(player => ({
        player: player,
        hand: HandEvaluator.evaluateHand([...player.holeCards, ...this.communityCards])
      }));
      
      // Sort by hand strength
      playerHands.sort((a, b) => HandEvaluator.compareHands(b.hand, a.hand));
      
      // Find all players with the best hand (ties)
      const bestHand = playerHands[0].hand;
      this.winners = playerHands
        .filter(ph => HandEvaluator.compareHands(ph.hand, bestHand) === 0)
        .map(ph => ph.player);
      
      // Distribute pot among winners
      const winnerShare = Math.floor(this.pot / this.winners.length);
      this.winners.forEach(winner => {
        winner.chips += winnerShare;
      });
    }
    
    this.gamePhase = 'finished';
  }

  // Get next active player index
  getNextActivePlayer(startIndex) {
    for (let i = 0; i < this.players.length; i++) {
      const index = (startIndex + i) % this.players.length;
      if (this.players[index].canAct()) {
        return index;
      }
    }
    return -1; // No active players
  }

  // Get current player
  getCurrentPlayer() {
    return this.currentPlayerIndex >= 0 ? this.players[this.currentPlayerIndex] : null;
  }

  // Get game state for UI
  getGameState() {
    return {
      players: this.players.map(player => ({
        ...player,
        holeCards: player.holeCards // In real game, might hide other players' cards
      })),
      communityCards: this.communityCards,
      pot: this.pot,
      currentBet: this.currentBet,
      minRaise: this.minRaise,
      currentPlayerIndex: this.currentPlayerIndex,
      bettingRound: this.bettingRound,
      gamePhase: this.gamePhase,
      winners: this.winners,
      dealerPosition: this.dealerPosition,
      handNumber: this.handNumber
    };
  }

  // Check if game can start
  canStartGame() {
    return this.players.filter(p => p.isActive && p.chips > 0).length >= 2;
  }
}