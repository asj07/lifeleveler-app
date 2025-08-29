import { GameState, Quest, QuestCategory, QuestType } from "@/types/quest";

export const STORAGE_KEY = "levelup_hwr_v1";

export function uuid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function getTodayKey(): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.toISOString().slice(0, 10);
}

export function calculateLevel(xp: number): {
  level: number;
  currentLevelXP: number;
  nextLevelXP: number;
  progress: number;
} {
  // Progressive XP requirements: each level requires more XP
  // Level 1: 100 XP, Level 2: 250 XP, Level 3: 450 XP, etc.
  // Formula: XP required for level n = 50 * n * (n + 1)
  
  let level = 1;
  let totalXPRequired = 0;
  
  // Find current level by checking cumulative XP requirements
  while (true) {
    const xpForNextLevel = 50 * level * (level + 1);
    if (xp < totalXPRequired + xpForNextLevel) {
      break;
    }
    totalXPRequired += xpForNextLevel;
    level++;
  }
  
  const currentLevelXP = totalXPRequired;
  const nextLevelXP = totalXPRequired + 50 * level * (level + 1);
  const progress = Math.min(100, Math.round(((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100));
  
  return { level, currentLevelXP, nextLevelXP, progress };
}

export function calculateCoins(xp: number): number {
  return Math.max(1, Math.round(xp / 2));
}

export function getDefaultQuests(): Quest[] {
  return [
    // Health
    { id: uuid(), title: "Move 20 minutes", category: "Health", xp: 20, type: "daily" },
    { id: uuid(), title: "8 glasses of water", category: "Health", xp: 15, type: "daily" },
    { id: uuid(), title: "Sleep 7+ hours", category: "Health", xp: 25, type: "daily" },
    // Wealth  
    { id: uuid(), title: "Track spending today", category: "Wealth", xp: 15, type: "daily" },
    { id: uuid(), title: "Learn a skill 30 min", category: "Wealth", xp: 25, type: "daily" },
    { id: uuid(), title: "Build income 30 min", category: "Wealth", xp: 25, type: "daily" },
    // Relationships
    { id: uuid(), title: "Send 1 gratitude msg", category: "Relationships", xp: 15, type: "daily" },
    { id: uuid(), title: "One deep conversation", category: "Relationships", xp: 25, type: "daily" },
    { id: uuid(), title: "Kindness: no gossip", category: "Relationships", xp: 20, type: "daily" },
  ];
}

export function getInitialState(): GameState {
  return {
    profile: {
      xp: 0,
      coins: 0,
      level: 1,
      streak: 0,
      bestStreak: 0,
      theme: "dark",
    },
    quests: getDefaultQuests(),
    log: {},
    lastActive: getTodayKey(),
  };
}

export function loadState(): GameState {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const initial = getInitialState();
    saveState(initial);
    return initial;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to parse stored state:", e);
    return getInitialState();
  }
}

export function saveState(state: GameState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function updateStreak(state: GameState): GameState {
  const today = getTodayKey();
  
  if (state.lastActive === today) {
    return state;
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().slice(0, 10);
  
  const hadYesterday = state.log[yesterdayKey]?.completed?.length > 0;
  
  let newStreak = state.profile.streak;
  let newBestStreak = state.profile.bestStreak;
  
  if (hadYesterday) {
    newStreak += 1;
    newBestStreak = Math.max(newBestStreak, newStreak);
  } else {
    newStreak = 0;
  }

  return {
    ...state,
    profile: {
      ...state.profile,
      streak: newStreak,
      bestStreak: newBestStreak,
    },
    lastActive: today,
    log: {
      ...state.log,
      [today]: state.log[today] || { completed: [], notes: "", affirmation: "" },
    },
  };
}