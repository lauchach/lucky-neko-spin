export const SYMBOLS = ['🐱', '🐈', '🔔', '🐟', '💰', '🎋', '🏮', '🍀'] as const;

export type Symbol = typeof SYMBOLS[number];

export interface SlotResult {
  reels: Symbol[][];
  winAmount: number;
  winningLines: number[];
  isJackpot: boolean;
}

const SYMBOL_VALUES: Record<Symbol, number> = {
  '🐱': 50,  // Golden cat - highest
  '🐈': 30,  // Cat
  '🔔': 20,  // Bell
  '🐟': 15,  // Fish
  '💰': 25,  // Money
  '🎋': 10,  // Bamboo
  '🏮': 12,  // Lantern
  '🍀': 8,   // Clover
};

const REEL_SIZE = 3;
const NUM_REELS = 5;

function getRandomSymbol(): Symbol {
  return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}

export function generateReelStrip(size: number = 20): Symbol[] {
  return Array.from({ length: size }, () => getRandomSymbol());
}

export function spin(bet: number): SlotResult {
  const reels: Symbol[][] = [];
  for (let i = 0; i < NUM_REELS; i++) {
    const reel: Symbol[] = [];
    for (let j = 0; j < REEL_SIZE; j++) {
      reel.push(getRandomSymbol());
    }
    reels.push(reel);
  }

  // Check middle row for matches
  const middleRow = reels.map(r => r[1]);
  let winAmount = 0;
  const winningLines: number[] = [];

  // Check each row
  for (let row = 0; row < REEL_SIZE; row++) {
    const rowSymbols = reels.map(r => r[row]);
    const first = rowSymbols[0];
    let matchCount = 1;
    for (let i = 1; i < rowSymbols.length; i++) {
      if (rowSymbols[i] === first) matchCount++;
      else break;
    }
    if (matchCount >= 3) {
      winAmount += SYMBOL_VALUES[first] * (matchCount - 2) * bet;
      winningLines.push(row);
    }
  }

  const isJackpot = middleRow.every(s => s === '🐱');
  if (isJackpot) {
    winAmount = bet * 500;
  }

  return { reels, winAmount, winningLines, isJackpot };
}
