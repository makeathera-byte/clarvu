/**
 * Block-based time utilities
 * Converts timestamps to 30-minute blocks for consistent logging
 */

/**
 * Round a date to the nearest 30-minute block
 * Examples:
 *   10:05 → 10:00
 *   10:15 → 10:00
 *   10:20 → 10:30
 *   10:45 → 10:30
 */
export function roundTo30MinBlock(date: Date): Date {
  const rounded = new Date(date);
  const minutes = rounded.getMinutes();
  const roundedMinutes = minutes < 30 ? 0 : 30;
  
  rounded.setMinutes(roundedMinutes, 0, 0);
  return rounded;
}

/**
 * Get the start of the current 30-minute block
 */
export function getCurrentBlockStart(): Date {
  return roundTo30MinBlock(new Date());
}

/**
 * Get the end of the current 30-minute block
 */
export function getCurrentBlockEnd(): Date {
  const start = getCurrentBlockStart();
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + 30);
  return end;
}

/**
 * Get the next block start time
 */
export function getNextBlockStart(date?: Date): Date {
  const base = date || new Date();
  const currentBlock = roundTo30MinBlock(base);
  const nextBlock = new Date(currentBlock);
  nextBlock.setMinutes(nextBlock.getMinutes() + 30);
  return nextBlock;
}

/**
 * Check if a date is within a specific block
 */
export function isInBlock(date: Date, blockStart: Date): boolean {
  const blockEnd = new Date(blockStart);
  blockEnd.setMinutes(blockEnd.getMinutes() + 30);
  
  return date >= blockStart && date < blockEnd;
}

/**
 * Format block time for display
 */
export function formatBlockTime(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

/**
 * Get all blocks for a given day
 */
export function getDayBlocks(date: Date = new Date()): Date[] {
  const blocks: Date[] = [];
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < 48; i++) { // 48 blocks = 24 hours
    const block = new Date(dayStart);
    block.setMinutes(i * 30);
    blocks.push(block);
  }
  
  return blocks;
}
