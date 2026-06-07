// src/lib/gamification.ts

/**
 * GAMIFICATION ENGINE: Leveling Curves & XP Utilities
 * 
 * We use an exponential curve where early levels require very little XP
 * (constant dopamine) and later levels require significant mastery.
 */

const BASE_XP_REQUIREMENT = 100;
const EXPONENT_MULTIPLIER = 1.25;

/**
 * Calculates the total XP required to reach a specific level.
 * Formula: BaseXP * (Level ^ Exponent)
 */
export function getXpRequiredForLevel(level: number): number {
  if (level <= 1) return 0;
  // Make early levels slightly easier than the strict exponential curve
  const adjustedExponent = level < 10 ? 1.15 : EXPONENT_MULTIPLIER;
  return Math.floor(BASE_XP_REQUIREMENT * Math.pow(level, adjustedExponent));
}

/**
 * Calculates a user's current level based on their total XP.
 */
export function calculateLevelFromXp(totalXp: number): number {
  let level = 1;
  while (totalXp >= getXpRequiredForLevel(level + 1)) {
    level++;
  }
  return level;
}

/**
 * Calculates progress percentage to the next level.
 */
export function getLevelProgress(totalXp: number): {
  currentLevel: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  xpIntoCurrentLevel: number;
  xpNeededForNextLevel: number;
  progressPercentage: number;
} {
  const currentLevel = calculateLevelFromXp(totalXp);
  const xpForCurrentLevel = getXpRequiredForLevel(currentLevel);
  const xpForNextLevel = getXpRequiredForLevel(currentLevel + 1);
  
  const xpIntoCurrentLevel = totalXp - xpForCurrentLevel;
  const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel;
  
  const progressPercentage = Math.min(100, Math.max(0, (xpIntoCurrentLevel / xpNeededForNextLevel) * 100));

  return {
    currentLevel,
    xpForCurrentLevel,
    xpForNextLevel,
    xpIntoCurrentLevel,
    xpNeededForNextLevel,
    progressPercentage
  };
}

/**
 * XP Categories mapping
 */
export const XPCategories = {
  PRODUCTIVITY: 'PRODUCTIVITY',
  HEALTH: 'HEALTH',
  LEARNING: 'LEARNING',
  SOCIAL: 'SOCIAL',
  COMBAT: 'COMBAT', // Boss Battles
} as const;

export type XPCategory = keyof typeof XPCategories;
