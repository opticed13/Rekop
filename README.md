# Rekop - Texas Hold'em Poker Game

A complete Texas Hold'em poker game implementation in React with full game logic.

## Features

### Core Poker Logic
- ✅ Complete 52-card deck with shuffling
- ✅ Texas Hold'em game flow (Pre-flop, Flop, Turn, River)
- ✅ Comprehensive hand evaluation system (all 10 poker hands)
- ✅ Betting rounds with fold, check, call, raise, and all-in
- ✅ Pot management and winner determination
- ✅ Multi-player support (2-4 players)

### Hand Rankings Supported
1. **Royal Flush** - A, K, Q, J, 10 of same suit
2. **Straight Flush** - Five consecutive cards of same suit
3. **Four of a Kind** - Four cards of same rank
4. **Full House** - Three of a kind + pair
5. **Flush** - Five cards of same suit
6. **Straight** - Five consecutive cards
7. **Three of a Kind** - Three cards of same rank
8. **Two Pair** - Two different pairs
9. **One Pair** - Two cards of same rank
10. **High Card** - Highest card wins

### Game Features
- **Blinds System**: Small blind ($10) and big blind ($20)
- **Betting Actions**: Fold, Check, Call, Raise, All-in
- **AI Players**: Basic AI logic for computer opponents
- **Hand History**: Track hand numbers and results
- **Responsive Design**: Works on desktop and mobile

### UI Components
- **Poker Table**: Green felt design with professional layout
- **Player Display**: Shows chips, cards, and betting status
- **Card Rendering**: Realistic playing cards with suit symbols
- **Betting Controls**: Interactive controls for human player
- **Game Status**: Current pot, betting round, and game phase

## Getting Started

### Prerequisites
- Node.js 14 or higher
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

### How to Play
1. Click "Start New Hand" to begin
2. Each player gets 2 hole cards
3. Betting rounds proceed clockwise
4. Community cards are revealed (Flop, Turn, River)
5. Best 5-card hand wins the pot

### Game Controls
- **Fold**: Give up your hand
- **Check**: Pass with no bet (when no one has bet)
- **Call**: Match the current bet
- **Raise**: Increase the bet amount
- **All-in**: Bet all remaining chips

## Technical Implementation

### Architecture
```
src/
├── game/
│   ├── Card.js          # Card and Deck classes
│   ├── HandEvaluator.js # Hand ranking logic
│   ├── Player.js        # Player management
│   └── PokerGame.js     # Main game logic
├── components/
│   ├── Card.js          # Card UI component
│   ├── Player.js        # Player UI component
│   ├── BettingControls.js # Betting interface
│   ├── AIPlayer.js      # AI logic component
│   └── PokerTable.js    # Main game component
└── App.js               # Root component
```

### Key Classes

#### Card & Deck
- Standard 52-card deck implementation
- Card values and suit handling
- Shuffle and deal functionality

#### HandEvaluator
- Evaluates best 5-card hand from 7 cards
- Comprehensive hand ranking system
- Tie-breaking logic for identical hands

#### Player
- Chip management and betting actions
- Hand storage and player state
- Available actions calculation

#### PokerGame
- Complete game flow management
- Betting round progression
- Pot calculation and winner determination

### AI Strategy
The AI players use a basic strategy:
- Always play pocket pairs
- Play high cards (J, Q, K, A) conservatively
- Check with connected cards
- Fold weak hands to large bets

## Customization

### Adding More Players
Modify the player initialization in `PokerTable.js`:
```javascript
const players = [
  new PlayerClass('You', 1000, false),
  new PlayerClass('Alice', 1000, true),
  new PlayerClass('Bob', 1000, true),
  new PlayerClass('Charlie', 1000, true),
  new PlayerClass('Dave', 1000, true), // Add more players
];
```

### Adjusting Blinds
Change blind amounts in the PokerGame constructor:
```javascript
const newGame = new PokerGame(players, 25, 50); // $25/$50 blinds
```

### Enhancing AI
Improve AI logic in `AIPlayer.js`:
- Add pot odds calculations
- Implement position-aware strategy
- Add bluffing and aggression factors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

Licensed under the Apache License, Version 2.0