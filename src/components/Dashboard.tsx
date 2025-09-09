import { UserProfile } from "@/types/quest";
import { calculateLevel } from "@/utils/gameLogic";
import { Progress } from "@/components/ui/progress";
import { Coins, Flame, CheckCircle } from "lucide-react";

interface DashboardProps {
  profile: UserProfile;
  todayCompleted: number;
}

export function Dashboard({ profile, todayCompleted }: DashboardProps) {
  const levelData = calculateLevel(profile.xp);
  const progressToNextLevel = (levelData.progress) * 100;

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6">
        {/* Avatar and Level Badge */}
        <div className="relative">
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.xp}`}
            alt="Avatar"
            className="w-20 h-20 sm:w-16 sm:h-16 rounded-full ring-4 ring-primary/20"
          />
          <div className="absolute -bottom-1 -right-1 w-7 h-7 sm:w-6 sm:h-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground">
            {levelData.level}
          </div>
        </div>
        
        {/* User Info */}
        <div className="text-center sm:text-left flex-1">
          <h2 className="text-xl sm:text-2xl font-bold">Adventurer</h2>
          <div className="text-sm text-muted-foreground mt-1">
            Level {levelData.level} • {profile.xp} XP
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Level {levelData.level + 1}</span>
            <span className="font-medium">{Math.round(progressToNextLevel)}%</span>
          </div>
          <Progress value={progressToNextLevel} className="h-3 sm:h-2" />
          <div className="text-xs text-muted-foreground mt-1">
            {profile.xp - levelData.currentLevelXP} / {levelData.nextLevelXP - levelData.currentLevelXP} XP
          </div>
        </div>

        <div className="text-sm text-muted-foreground text-center sm:text-left">
          Best Streak: {profile.bestStreak} days
        </div>

        {/* Stats Grid - Mobile Optimized */}
        <div className="grid grid-cols-2 gap-3 pt-4">
          <div className="stat-card text-center p-3 rounded-lg bg-background/50 border border-border/50">
            <div className="text-xl sm:text-2xl font-bold">{profile.xp}</div>
            <div className="text-xs text-muted-foreground">XP</div>
          </div>
          <div className="stat-card text-center p-3 rounded-lg bg-background/50 border border-border/50">
            <div className="text-xl sm:text-2xl font-bold flex items-center justify-center gap-1">
              <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-gold" />
              {profile.coins}
            </div>
            <div className="text-xs text-muted-foreground">Coins</div>
          </div>
          <div className="stat-card text-center p-3 rounded-lg bg-background/50 border border-border/50">
            <div className="text-xl sm:text-2xl font-bold flex items-center justify-center gap-1">
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
              {profile.bestStreak || 0}
            </div>
            <div className="text-xs text-muted-foreground">Streak</div>
          </div>
          <div className="stat-card text-center p-3 rounded-lg bg-background/50 border border-border/50">
            <div className="text-xl sm:text-2xl font-bold flex items-center justify-center gap-1">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
              {todayCompleted}
            </div>
            <div className="text-xs text-muted-foreground">Today</div>
          </div>
        </div>
      </div>
    </div>
  );
}