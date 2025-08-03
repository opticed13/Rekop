// Hand evaluation system for Texas Hold'em poker
export class HandEvaluator {
  // Hand rankings (higher number = better hand)
  static HAND_RANKINGS = {
    HIGH_CARD: 1,
    ONE_PAIR: 2,
    TWO_PAIR: 3,
    THREE_OF_A_KIND: 4,
    STRAIGHT: 5,
    FLUSH: 6,
    FULL_HOUSE: 7,
    FOUR_OF_A_KIND: 8,
    STRAIGHT_FLUSH: 9,
    ROYAL_FLUSH: 10
  };

  // Evaluate the best 5-card hand from 7 cards (2 hole + 5 community)
  static evaluateHand(cards) {
    const allCombinations = this.getCombinations(cards, 5);
    let bestHand = null;
    let bestRanking = 0;

    for (const combination of allCombinations) {
      const handResult = this.evaluateFiveCardHand(combination);
      if (handResult.ranking > bestRanking || 
          (handResult.ranking === bestRanking && this.compareHands(handResult, bestHand) > 0)) {
        bestHand = handResult;
        bestRanking = handResult.ranking;
      }
    }

    return bestHand;
  }

  // Get all combinations of k items from array
  static getCombinations(arr, k) {
    if (k === 1) return arr.map(x => [x]);
    if (k === arr.length) return [arr];
    
    const result = [];
    for (let i = 0; i <= arr.length - k; i++) {
      const head = arr[i];
      const tailCombinations = this.getCombinations(arr.slice(i + 1), k - 1);
      for (const tail of tailCombinations) {
        result.push([head, ...tail]);
      }
    }
    return result;
  }

  // Evaluate a 5-card hand
  static evaluateFiveCardHand(cards) {
    const sortedCards = cards.sort((a, b) => b.getValue() - a.getValue());
    const values = sortedCards.map(card => card.getValue());
    const suits = sortedCards.map(card => card.suit);
    
    const isFlush = suits.every(suit => suit === suits[0]);
    const isStraight = this.isStraight(values);
    const valueCounts = this.getValueCounts(values);
    
    // Royal Flush (A, K, Q, J, 10 of same suit)
    if (isFlush && isStraight && values[0] === 14) {
      return {
        ranking: this.HAND_RANKINGS.ROYAL_FLUSH,
        name: 'Royal Flush',
        cards: sortedCards,
        compareValues: [14]
      };
    }
    
    // Straight Flush
    if (isFlush && isStraight) {
      return {
        ranking: this.HAND_RANKINGS.STRAIGHT_FLUSH,
        name: 'Straight Flush',
        cards: sortedCards,
        compareValues: [values[0]]
      };
    }
    
    // Four of a Kind
    if (valueCounts.some(count => count === 4)) {
      const quadValue = values.find(val => values.filter(v => v === val).length === 4);
      const kicker = values.find(val => val !== quadValue);
      return {
        ranking: this.HAND_RANKINGS.FOUR_OF_A_KIND,
        name: 'Four of a Kind',
        cards: sortedCards,
        compareValues: [quadValue, kicker]
      };
    }
    
    // Full House
    if (valueCounts.includes(3) && valueCounts.includes(2)) {
      const tripValue = values.find(val => values.filter(v => v === val).length === 3);
      const pairValue = values.find(val => val !== tripValue && values.filter(v => v === val).length === 2);
      return {
        ranking: this.HAND_RANKINGS.FULL_HOUSE,
        name: 'Full House',
        cards: sortedCards,
        compareValues: [tripValue, pairValue]
      };
    }
    
    // Flush
    if (isFlush) {
      return {
        ranking: this.HAND_RANKINGS.FLUSH,
        name: 'Flush',
        cards: sortedCards,
        compareValues: values
      };
    }
    
    // Straight
    if (isStraight) {
      return {
        ranking: this.HAND_RANKINGS.STRAIGHT,
        name: 'Straight',
        cards: sortedCards,
        compareValues: [values[0]]
      };
    }
    
    // Three of a Kind
    if (valueCounts.includes(3)) {
      const tripValue = values.find(val => values.filter(v => v === val).length === 3);
      const kickers = values.filter(val => val !== tripValue).sort((a, b) => b - a);
      return {
        ranking: this.HAND_RANKINGS.THREE_OF_A_KIND,
        name: 'Three of a Kind',
        cards: sortedCards,
        compareValues: [tripValue, ...kickers]
      };
    }
    
    // Two Pair
    const uniqueValues = [...new Set(values)];
    const pairs = uniqueValues.filter(val => values.filter(v => v === val).length === 2);
    if (pairs.length === 2) {
      const sortedPairs = pairs.sort((a, b) => b - a);
      const kicker = values.find(val => !pairs.includes(val));
      return {
        ranking: this.HAND_RANKINGS.TWO_PAIR,
        name: 'Two Pair',
        cards: sortedCards,
        compareValues: [...sortedPairs, kicker]
      };
    }
    
    // One Pair
    if (pairs.length === 1) {
      const pairValue = pairs[0];
      const kickers = values.filter(val => val !== pairValue).sort((a, b) => b - a);
      return {
        ranking: this.HAND_RANKINGS.ONE_PAIR,
        name: 'One Pair',
        cards: sortedCards,
        compareValues: [pairValue, ...kickers]
      };
    }
    
    // High Card
    return {
      ranking: this.HAND_RANKINGS.HIGH_CARD,
      name: 'High Card',
      cards: sortedCards,
      compareValues: values
    };
  }

  // Check if values form a straight
  static isStraight(values) {
    // Check for A-2-3-4-5 straight (wheel)
    if (values[0] === 14 && values[1] === 5 && values[2] === 4 && values[3] === 3 && values[4] === 2) {
      return true;
    }
    
    // Check for regular straight
    for (let i = 1; i < values.length; i++) {
      if (values[i] !== values[i-1] - 1) {
        return false;
      }
    }
    return true;
  }

  // Get count of each value
  static getValueCounts(values) {
    const counts = {};
    values.forEach(val => counts[val] = (counts[val] || 0) + 1);
    return Object.values(counts);
  }

  // Compare two hands (returns > 0 if hand1 is better, < 0 if hand2 is better, 0 if tie)
  static compareHands(hand1, hand2) {
    if (hand1.ranking !== hand2.ranking) {
      return hand1.ranking - hand2.ranking;
    }
    
    // Same ranking, compare by values
    for (let i = 0; i < Math.min(hand1.compareValues.length, hand2.compareValues.length); i++) {
      if (hand1.compareValues[i] !== hand2.compareValues[i]) {
        return hand1.compareValues[i] - hand2.compareValues[i];
      }
    }
    
    return 0; // Tie
  }
}