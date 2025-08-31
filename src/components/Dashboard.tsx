import { UserProfile } from "@/types/quest";
import { calculateLevel } from "@/utils/gameLogic";
import { User, Zap, Coins, Flame, Target } from "lucide-react";

interface DashboardProps {
  profile: UserProfile;
  todayCompleted: number;
}

export function Dashboard({ profile, todayCompleted }: DashboardProps) {
  const levelInfo = calculateLevel(profile.xp);
  const xpInCurrentLevel = profile.xp - levelInfo.currentLevelXP;
  const xpNeededForNext = levelInfo.nextLevelXP - levelInfo.currentLevelXP;
  // alias to prevent runtime errors from stale references
  const level = levelInfo.level;
  const progress = levelInfo.progress;

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex flex-col lg:flex-row items-center gap-6">
        {/* Avatar */}
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/20 border-2 border-primary/30 flex items-center justify-center">
            <User className="w-10 h-10 text-primary" />
          </div>
          <div className="absolute -bottom-2 -right-2 px-2 py-1 rounded-full bg-gradient-to-r from-primary to-secondary text-xs font-bold text-primary-foreground">
            Lv.{levelInfo.level}
          </div>
        </div>

        {/* XP Progress */}
        <div className="flex-1 w-full lg:w-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Level {levelInfo.level}</span>
            <span className="text-sm font-bold">{xpInCurrentLevel} / {xpNeededForNext} XP</span>
          </div>
          <div className="xp-bar">
            <div className="xp-bar-fill" style={{ width: `${levelInfo.progress}%` }} />
          </div>
          <div className="flex items-center gap-2 mt-2">
            {profile.bestStreak > 0 && (
              <span className="text-xs px-2 py-1 rounded-full bg-gold/20 text-gold border border-gold/30">
                🔥 {profile.bestStreak} best streak
              </span>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">XP</span>
            </div>
            <div className="text-xl font-bold">{profile.xp}</div>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-2 mb-1">
              <Coins className="w-4 h-4 text-gold" />
              <span className="text-xs text-muted-foreground">Coins</span>
            </div>
            <div className="text-xl font-bold text-gold">{profile.coins}</div>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-4 h-4 text-destructive" />
              <span className="text-xs text-muted-foreground">Streak</span>
            </div>
            <div className="text-xl font-bold">
              {profile.streak}
              <span className="text-xs text-muted-foreground ml-1">days</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-secondary" />
              <span className="text-xs text-muted-foreground">Today</span>
            </div>
            <div className="text-xl font-bold">
              {todayCompleted}
              <span className="text-xs text-muted-foreground ml-1">done</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}