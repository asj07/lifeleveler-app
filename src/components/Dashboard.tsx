import { UserProfile } from "@/types/quest";
import { calculateLevel } from "@/utils/gameLogic";
import { Zap, Coins, Flame, Target, LogOut, Moon, Sun, Edit2, Check, X } from "lucide-react";
import { AvatarUpload } from "./AvatarUpload";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface DashboardProps {
  profile: UserProfile;
  todayCompleted: number;
  onToggleTheme: () => void;
}

export function Dashboard({ profile, todayCompleted, onToggleTheme }: DashboardProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  const { toast } = useToast();
  const levelInfo = calculateLevel(profile.xp);
  const xpInCurrentLevel = profile.xp - levelInfo.currentLevelXP;
  const xpNeededForNext = levelInfo.nextLevelXP - levelInfo.currentLevelXP;

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('avatar_url, display_name')
          .eq('user_id', user.id)
          .single();
        
        if (data) {
          if (data.avatar_url) {
            setAvatarUrl(data.avatar_url);
          }
          if (data.display_name) {
            setDisplayName(data.display_name);
          }
        }
      }
    };
    loadProfile();
  }, []);

  const handleStartEditName = () => {
    setTempName(displayName);
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({ display_name: tempName })
        .eq('user_id', user.id);

      if (error) throw error;

      setDisplayName(tempName);
      setIsEditingName(false);
      toast({
        title: "Name Updated",
        description: "Your display name has been saved",
      });
    } catch (error) {
      console.error('Error updating name:', error);
      toast({
        title: "Error",
        description: "Failed to update name",
        variant: "destructive",
      });
    }
  };

  const handleCancelEditName = () => {
    setTempName("");
    setIsEditingName(false);
  };

  const handleSignOut = async () => {
    try {
      // Clean up auth state
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Ignore errors
      }
      
      // Force page reload for clean state
      window.location.href = '/auth';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 animate-fade-in">
      <div className="flex flex-col lg:flex-row items-center gap-6">
        {/* Avatar and Profile */}
        <div className="flex flex-col items-center gap-3 animate-scale-in">
          <div className="relative hover-lift">
            <AvatarUpload 
              avatarUrl={avatarUrl}
              userId={profile.id}
              onAvatarUpdate={setAvatarUrl}
            />
            <div className="absolute -bottom-2 -right-2 px-2 py-1 rounded-full bg-gradient-to-r from-primary to-secondary text-xs font-bold text-primary-foreground animate-glow-pulse">
              Lv.{levelInfo.level}
            </div>
          </div>
          
          {/* Name Display/Edit */}
          <div className="flex items-center gap-2">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <Input
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="w-32 h-8 text-sm"
                  placeholder="Your name"
                  autoFocus
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleSaveName}
                  className="h-8 w-8 p-0"
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancelEditName}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {displayName || "Add your name"}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleStartEditName}
                  className="h-8 w-8 p-0"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Profile Actions */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onToggleTheme}
              className="gap-2"
            >
              {profile.theme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
              {profile.theme === 'dark' ? 'Light' : 'Dark'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleSignOut}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
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
          <div className="stat-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">XP</span>
            </div>
            <div className="text-xl font-bold">{profile.xp}</div>
          </div>

          <div className="stat-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-2 mb-1">
              <Coins className="w-4 h-4 text-gold" />
              <span className="text-xs text-muted-foreground">Coins</span>
            </div>
            <div className="text-xl font-bold text-gold">{profile.coins}</div>
          </div>

          <div className="stat-card animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-4 h-4 text-destructive" />
              <span className="text-xs text-muted-foreground">Streak</span>
            </div>
            <div className="text-xl font-bold">
              {profile.streak}
              <span className="text-xs text-muted-foreground ml-1">days</span>
            </div>
          </div>

          <div className="stat-card animate-slide-up" style={{ animationDelay: '0.4s' }}>
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