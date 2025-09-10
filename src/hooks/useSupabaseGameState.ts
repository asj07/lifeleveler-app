import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { QuestCategory, QuestType } from '@/types/quest';
import { calculateLevel, getDefaultQuests } from '@/utils/gameLogic';
import { useToast } from '@/hooks/use-toast';

interface ProfileData {
  user_id: string;
  display_name: string | null;
  theme: string;
}

interface UserStats {
  xp: number;
  coins: number;
  level: number;
  current_streak: number;
  best_streak: number;
  vitality: number;
  mana: number;
  last_active: string | null;
}

interface Quest {
  id: string;
  title: string;
  category: string;
  xp: number;
  type: string;
  created_at: string;
  updated_at: string;
}

interface QuestCompletion {
  quest_id: string;
  completed_at: string;
}

export function useSupabaseGameState() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [quests, setQuests] = useState<Quest[]>([]);
  const [completions, setCompletions] = useState<QuestCompletion[]>([]);
  const { toast } = useToast();

  // Load all user data
  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load profile or create if missing
      let { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!profileData) {
        const { data: newProfile } = await supabase
          .from('profiles')
          .insert({ user_id: user.id, theme: 'dark' })
          .select()
          .single();
        profileData = newProfile;
      }

      // Save profile data
      if (profileData) {
        setProfile(profileData);
        document.documentElement.classList.toggle('dark', profileData.theme === 'dark');
      }
      setUserId(user.id);

      // Load stats or create if missing
      let { data: statsData } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!statsData) {
        const { data: newStats } = await supabase
          .from('user_stats')
          .insert({
            user_id: user.id,
            xp: 0,
            coins: 0,
            level: 1,
            current_streak: 0,
            best_streak: 0,
            vitality: 100,
            mana: 100,
          })
          .select()
          .single();
        statsData = newStats;
      }

      if (statsData) {
        setStats(statsData);
        await updateStreak(statsData);
      }

      // Load quests or insert defaults for new user
      const { data: questsData } = await supabase
        .from('quests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (!questsData || questsData.length === 0) {
        const defaultQuests = getDefaultQuests();
        const { data: inserted } = await supabase
          .from('quests')
          .insert(
            defaultQuests.map(q => ({
              user_id: user.id,
              title: q.title,
              category: q.category,
              xp: q.xp,
              type: q.type,
            })),
          )
          .select();
        if (inserted) {
          setQuests(inserted);
        }
      } else {
        setQuests(questsData);
      }

      // Load today's completions
      const today = new Date().toISOString().split('T')[0];
      const { data: completionsData } = await supabase
        .from('quest_completions')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed_at', today);
      
      if (completionsData) {
        setCompletions(completionsData);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Update streak
  const updateStreak = async (currentStats: UserStats) => {
    const today = new Date().toISOString().split('T')[0];
    const lastActive = currentStats.last_active;
    
    if (lastActive === today) return; // Already updated today

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let newStreak = currentStats.current_streak;
    let bestStreak = currentStats.best_streak;

    if (lastActive) {
      const lastDate = new Date(lastActive);
      const todayDate = new Date(today);
      const daysDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        // Consecutive day
        newStreak += 1;
      } else if (daysDiff > 1) {
        // Streak broken
        newStreak = 0;
      }
    }

    bestStreak = Math.max(bestStreak, newStreak);

    await supabase
      .from('user_stats')
      .update({
        current_streak: newStreak,
        best_streak: bestStreak,
        last_active: today,
      })
      .eq('user_id', user.id);

    setStats(prev => prev ? { ...prev, current_streak: newStreak, best_streak: bestStreak, last_active: today } : null);
  };

  // Complete quest
  const completeQuest = async (questId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const quest = quests.find(q => q.id === questId);
      if (!quest) return;

      // Add completion
      const today = new Date().toISOString().split('T')[0];
      const { error: completionError } = await supabase
        .from('quest_completions')
        .insert({
          user_id: user.id,
          quest_id: questId,
          completed_at: today,
        });

      if (completionError) throw completionError;

      // Update stats
      const newXP = (stats?.xp || 0) + quest.xp;
      const levelInfo = calculateLevel(newXP);
      const coinsEarned = Math.floor(quest.xp / 10);
      const newCoins = (stats?.coins || 0) + coinsEarned;

      const { error: statsError } = await supabase
        .from('user_stats')
        .update({
          xp: newXP,
          level: levelInfo.level,
          coins: newCoins,
          last_active: today,
        })
        .eq('user_id', user.id);

      if (statsError) throw statsError;

      // Update local state
      setCompletions(prev => [...prev, { quest_id: questId, completed_at: today }]);
      setStats(prev => prev ? { ...prev, xp: newXP, level: levelInfo.level, coins: newCoins } : null);

      toast({
        title: "Quest Completed!",
        description: `+${quest.xp} XP, +${coinsEarned} coins`,
      });
    } catch (error) {
      console.error('Error completing quest:', error);
      toast({
        title: "Error",
        description: "Failed to complete quest",
        variant: "destructive",
      });
    }
  };

  // Uncomplete quest
  const uncompleteQuest = async (questId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const quest = quests.find(q => q.id === questId);
      if (!quest) return;

      // Remove completion
      const today = new Date().toISOString().split('T')[0];
      const { error: completionError } = await supabase
        .from('quest_completions')
        .delete()
        .eq('user_id', user.id)
        .eq('quest_id', questId)
        .eq('completed_at', today);

      if (completionError) throw completionError;

      // Update stats
      const newXP = Math.max(0, (stats?.xp || 0) - quest.xp);
      const levelInfo = calculateLevel(newXP);
      const coinsLost = Math.floor(quest.xp / 10);
      const newCoins = Math.max(0, (stats?.coins || 0) - coinsLost);

      const { error: statsError } = await supabase
        .from('user_stats')
        .update({
          xp: newXP,
          level: levelInfo.level,
          coins: newCoins,
        })
        .eq('user_id', user.id);

      if (statsError) throw statsError;

      // Update local state
      setCompletions(prev => prev.filter(c => c.quest_id !== questId));
      setStats(prev => prev ? { ...prev, xp: newXP, level: levelInfo.level, coins: newCoins } : null);

      toast({
        title: "Quest Uncompleted",
        description: `-${quest.xp} XP, -${coinsLost} coins`,
      });
    } catch (error) {
      console.error('Error uncompleting quest:', error);
      toast({
        title: "Error",
        description: "Failed to uncomplete quest",
        variant: "destructive",
      });
    }
  };

  // Add quest
  const addQuest = async (title: string, category: QuestCategory, xp: number, type: QuestType) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('quests')
        .insert({
          user_id: user.id,
          title,
          category,
          xp,
          type,
        })
        .select()
        .single();

      if (error) throw error;

      setQuests(prev => [...prev, data]);

      toast({
        title: "Quest Added",
        description: `"${title}" has been added to your quests`,
      });
    } catch (error) {
      console.error('Error adding quest:', error);
      toast({
        title: "Error",
        description: "Failed to add quest",
        variant: "destructive",
      });
    }
  };

  // Delete quest
  const deleteQuest = async (questId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('quests')
        .delete()
        .eq('id', questId)
        .eq('user_id', user.id);

      if (error) throw error;

      setQuests(prev => prev.filter(q => q.id !== questId));

      toast({
        title: "Quest Deleted",
        description: "Quest has been removed",
      });
    } catch (error) {
      console.error('Error deleting quest:', error);
      toast({
        title: "Error",
        description: "Failed to delete quest",
        variant: "destructive",
      });
    }
  };

  // Toggle theme
  const toggleTheme = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newTheme = profile?.theme === 'dark' ? 'light' : 'dark';

      const { error } = await supabase
        .from('profiles')
        .update({ theme: newTheme })
        .eq('user_id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, theme: newTheme } : null);
    } catch (error) {
      console.error('Error toggling theme:', error);
    }
  };

  // Update notes
  const updateNotes = async (notes: string, affirmation: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];

      // Check if entry exists
      const { data: existing } = await supabase
        .from('journal_entries')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (existing) {
        // Update existing entry
        await supabase
          .from('journal_entries')
          .update({ notes, affirmation })
          .eq('id', existing.id);
      } else {
        // Create new entry
        await supabase
          .from('journal_entries')
          .insert({
            user_id: user.id,
            date: today,
            notes,
            affirmation,
          });
      }

      toast({
        title: "Journal Saved",
        description: "Your notes have been saved",
      });
    } catch (error) {
      console.error('Error saving notes:', error);
      toast({
        title: "Error",
        description: "Failed to save notes",
        variant: "destructive",
      });
    }
  };

  // Update coins
  const updateCoins = async (newCoins: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_stats')
        .update({ coins: newCoins })
        .eq('user_id', user.id);

      if (error) throw error;

      setStats(prev => prev ? { ...prev, coins: newCoins } : null);
    } catch (error) {
      console.error('Error updating coins:', error);
      toast({
        title: "Error",
        description: "Failed to update coins",
        variant: "destructive",
      });
    }
  };

  const updateVitality = async (newVitality: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_stats')
        .update({ vitality: newVitality })
        .eq('user_id', user.id);

      if (error) throw error;

      setStats(prev => prev ? { ...prev, vitality: newVitality } : null);
    } catch (error) {
      console.error('Error updating vitality:', error);
      toast({
        title: "Error",
        description: "Failed to update vitality",
        variant: "destructive",
      });
    }
  };

  const updateMana = async (newMana: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_stats')
        .update({ mana: newMana })
        .eq('user_id', user.id);

      if (error) throw error;

      setStats(prev => prev ? { ...prev, mana: newMana } : null);
    } catch (error) {
      console.error('Error updating mana:', error);
      toast({
        title: "Error",
        description: "Failed to update mana",
        variant: "destructive",
      });
    }
  };

  // Load data on mount
  useEffect(() => {
    loadUserData();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        setTimeout(() => {
          loadUserData();
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    loading,
    profile: {
      id: userId,
      xp: stats?.xp || 0,
      coins: stats?.coins || 0,
      level: stats?.level || 1,
      streak: stats?.current_streak || 0,
      bestStreak: stats?.best_streak || 0,
      theme: (profile?.theme || 'dark') as "dark" | "light",
    },
    quests: quests.map(q => ({
      ...q,
      category: q.category as QuestCategory,
      type: q.type as QuestType,
    })),
    completedToday: completions.map(c => c.quest_id),
    completeQuest,
    uncompleteQuest,
    addQuest,
    deleteQuest,
    toggleTheme,
    updateNotes,
    updateCoins,
    updateVitality,
    updateMana,
    exportData: async () => {
      // Export functionality can be implemented if needed
      toast({
        title: "Export",
        description: "Data is now stored in the cloud",
      });
    },
    importData: async () => {
      // Import functionality can be implemented if needed
      toast({
        title: "Import",
        description: "Data is now stored in the cloud",
      });
    },
    resetData: async () => {
      // Reset functionality would delete all user data
      toast({
        title: "Reset",
        description: "Please delete your account to reset all data",
      });
    },
  };
}