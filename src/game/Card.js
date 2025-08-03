// Card class represents a single playing card
export class Card {
  constructor(suit, rank) {
    this.suit = suit;
    this.rank = rank;
  }

  // Get numeric value for hand comparison
  getValue() {
    if (this.rank === 'A') return 14;
    if (this.rank === 'K') return 13;
    if (this.rank === 'Q') return 12;
    if (this.rank === 'J') return 11;
    return parseInt(this.rank);
  }

  // String representation
  toString() {
    return `${this.rank}${this.suit}`;
  }

  // Get display name
  getDisplayName() {
    const suitSymbols = { 'H': '♥', 'D': '♦', 'C': '♣', 'S': '♠' };
    return `${this.rank}${suitSymbols[this.suit]}`;
  }

  // Get color for styling
  getColor() {
    return (this.suit === 'H' || this.suit === 'D') ? 'red' : 'black';
  }
}

// Deck class manages a standard 52-card deck
export class Deck {
  constructor() {
    this.reset();
  }

  reset() {
    this.cards = [];
    const suits = ['H', 'D', 'C', 'S'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    
    for (const suit of suits) {
      for (const rank of ranks) {
        this.cards.push(new Card(suit, rank));
      }
    }
    this.shuffle();
  }

  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  deal() {
    return this.cards.pop();
  }

  isEmpty() {
    return this.cards.length === 0;
  }

  remainingCards() {
    return this.cards.length;
  }
}