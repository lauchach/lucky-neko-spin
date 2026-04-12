export const SYMBOLS = ['🐱', '🐈', '🔔', '🐟', '💰', '🎋', '🏮', '🍀'] as const;
export const SCATTER_SYMBOL = '🎆';

export type Symbol = typeof SYMBOLS[number] | typeof SCATTER_SYMBOL;

export interface SlotResult {
  reels: Symbol[][];
  winAmount: number;
  winningLines: number[];
  isJackpot: boolean;
  scatterCount: number;
  freeSpinsAwarded: number;
}

// ========== RTP CONFIGURATION ==========
const TARGET_RTP = 0.96;

const SYMBOL_VALUES: Record<string, number> = {
  '🐱': 28,
  '🐈': 17,
  '💰': 14,
  '🔔': 11,
  '🐟': 8,
  '🏮': 7,
  '🎋': 5,
  '🍀': 5,
  '🎆': 0, // scatter doesn't pay on lines
};

function getSymbolWeights(): { symbol: Symbol; weight: number }[] {
  return [
    { symbol: '🐱', weight: 1 },
    { symbol: '🐈', weight: 2 },
    { symbol: '💰', weight: 3 },
    { symbol: '🔔', weight: 5 },
    { symbol: '🐟', weight: 8 },
    { symbol: '🏮', weight: 10 },
    { symbol: '🎋', weight: 14 },
    { symbol: '🍀', weight: 18 },
    { symbol: '🎆', weight: 3 }, // scatter — somewhat rare
  ];
}

const REEL_SIZE = 3;
const NUM_REELS = 5;

function getWeightedRandomSymbol(): Symbol {
  const weights = getSymbolWeights();
  const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
  let rand = Math.random() * totalWeight;
  for (const { symbol, weight } of weights) {
    rand -= weight;
    if (rand <= 0) return symbol;
  }
  return weights[weights.length - 1].symbol;
}

function getRandomSymbol(): Symbol {
  const allSymbols: Symbol[] = [...SYMBOLS, SCATTER_SYMBOL];
  return allSymbols[Math.floor(Math.random() * allSymbols.length)];
}

export function generateReelStrip(size: number = 20): Symbol[] {
  return Array.from({ length: size }, () => getRandomSymbol());
}

export type ForceMode = 'none' | 'freespin' | 'jackpot' | 'bigwin' | 'smallwin' | '1line' | '2line' | '3line';

export function spin(bet: number, forceMode: ForceMode = 'none'): SlotResult {
  let reels: Symbol[][];

  if (forceMode === 'freespin') {
    // Force 3 scatters in different reels
    reels = Array.from({ length: NUM_REELS }, () =>
      Array.from({ length: REEL_SIZE }, () => getWeightedRandomSymbol())
    );
    // Place scatter on reels 0, 2, 4 middle row
    reels[0][1] = SCATTER_SYMBOL;
    reels[2][0] = SCATTER_SYMBOL;
    reels[4][1] = SCATTER_SYMBOL;
  } else if (forceMode === 'jackpot') {
    reels = Array.from({ length: NUM_REELS }, () => ['🍀' as Symbol, '🐱' as Symbol, '🎋' as Symbol]);
  } else if (forceMode === 'bigwin') {
    // 5x cat on middle row
    reels = Array.from({ length: NUM_REELS }, () =>
      Array.from({ length: REEL_SIZE }, () => getWeightedRandomSymbol())
    );
    for (let i = 0; i < NUM_REELS; i++) reels[i][1] = '🐈';
  } else if (forceMode === 'smallwin') {
    reels = Array.from({ length: NUM_REELS }, () =>
      Array.from({ length: REEL_SIZE }, () => getWeightedRandomSymbol())
    );
    reels[0][0] = '🍀'; reels[1][0] = '🍀'; reels[2][0] = '🍀';
  } else if (forceMode === '1line') {
    reels = Array.from({ length: NUM_REELS }, () =>
      Array.from({ length: REEL_SIZE }, () => getWeightedRandomSymbol())
    );
    for (let i = 0; i < 4; i++) reels[i][1] = '🔔';
  } else if (forceMode === '2line') {
    reels = Array.from({ length: NUM_REELS }, () =>
      Array.from({ length: REEL_SIZE }, () => getWeightedRandomSymbol())
    );
    for (let i = 0; i < 3; i++) { reels[i][0] = '🐟'; reels[i][1] = '🏮'; }
  } else if (forceMode === '3line') {
    reels = Array.from({ length: NUM_REELS }, () =>
      Array.from({ length: REEL_SIZE }, () => getWeightedRandomSymbol())
    );
    for (let i = 0; i < 3; i++) { reels[i][0] = '🐟'; reels[i][1] = '🏮'; reels[i][2] = '🎋'; }
  } else {
    reels = [];
    for (let i = 0; i < NUM_REELS; i++) {
      const reel: Symbol[] = [];
      for (let j = 0; j < REEL_SIZE; j++) {
        reel.push(getWeightedRandomSymbol());
      }
      reels.push(reel);
    }
  }

  let winAmount = 0;
  const winningLines: number[] = [];

  // Count scatters across all reels
  let scatterCount = 0;
  for (const reel of reels) {
    for (const s of reel) {
      if (s === SCATTER_SYMBOL) scatterCount++;
    }
  }

  // Free spins: 3=10, 4=15, 5+=20
  let freeSpinsAwarded = 0;
  if (scatterCount >= 3) {
    freeSpinsAwarded = scatterCount === 3 ? 10 : scatterCount === 4 ? 15 : 20;
  }

  // Check each row for consecutive matches from left (excluding scatter from line wins)
  for (let row = 0; row < REEL_SIZE; row++) {
    const rowSymbols = reels.map(r => r[row]);
    const first = rowSymbols[0];
    if (first === SCATTER_SYMBOL) continue;
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

  const middleRow = reels.map(r => r[1]);
  const isJackpot = middleRow.every(s => s === '🐱');
  if (isJackpot) {
    winAmount = bet * 500;
  }

  return { reels, winAmount, winningLines, isJackpot, scatterCount, freeSpinsAwarded };
}

// ========== RTP VERIFICATION (dev only) ==========
export function simulateRTP(iterations: number = 100000): number {
  const bet = 10;
  let totalBet = 0;
  let totalWin = 0;
  for (let i = 0; i < iterations; i++) {
    totalBet += bet;
    totalWin += spin(bet).winAmount;
  }
  const rtp = totalWin / totalBet;
  console.log(`RTP after ${iterations.toLocaleString()} spins: ${(rtp * 100).toFixed(2)}% (target: ${(TARGET_RTP * 100).toFixed(1)}%)`);
  return rtp;
}
