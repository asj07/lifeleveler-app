export type QuestCategory = "Health" | "Wealth" | "Relationships";
export type QuestType = "daily" | "weekly" | "oneoff";

export interface Quest {
  id: string;
  title: string;
  category: QuestCategory;
  xp: number;
  type: QuestType;
  createdAt?: string;
}

export interface UserProfile {
  xp: number;
  coins: number;
  level: number;
  streak: number;
  bestStreak: number;
  vitality: number;
  mana: number;
  theme: "light" | "dark";
}

export interface DayLog {
  completed: string[];
  notes: string;
  affirmation: string;
}

export interface GameState {
  profile: UserProfile;
  quests: Quest[];
  log: Record<string, DayLog>;
  lastActive: string;
}