import { useState, useEffect, useCallback } from "react";
import { Quest, GameState, QuestCategory, QuestType } from "@/types/quest";
import {
  loadState,
  saveState,
  getTodayKey,
  updateStreak,
  calculateCoins,
  calculateLevel,
  uuid,
  getInitialState,
} from "@/utils/gameLogic";
import { useToast } from "@/hooks/use-toast";

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(loadState);
  const { toast } = useToast();

  useEffect(() => {
    const updated = updateStreak(gameState);
    if (updated !== gameState) {
      setGameState(updated);
      saveState(updated);
    }
  }, []);

  const completeQuest = useCallback(
    (questId: string) => {
      const today = getTodayKey();
      const quest = gameState.quests.find((q) => q.id === questId);
      if (!quest) return;

      const todayLog = gameState.log[today] || { completed: [], notes: "", affirmation: "" };
      
      if (todayLog.completed.includes(questId)) return;

      const coins = calculateCoins(quest.xp);
      const isFirstToday = todayLog.completed.length === 0;
      const newXP = gameState.profile.xp + quest.xp;
      const levelInfo = calculateLevel(newXP);

      const newState: GameState = {
        ...gameState,
        profile: {
          ...gameState.profile,
          xp: newXP,
          coins: gameState.profile.coins + coins,
          level: levelInfo.level,
          streak: isFirstToday ? gameState.profile.streak + 1 : gameState.profile.streak,
          bestStreak: isFirstToday
            ? Math.max(gameState.profile.bestStreak, gameState.profile.streak + 1)
            : gameState.profile.bestStreak,
        },
        log: {
          ...gameState.log,
          [today]: {
            ...todayLog,
            completed: [...todayLog.completed, questId],
          },
        },
      };

      setGameState(newState);
      saveState(newState);

      toast({
        title: "Quest Complete! 🎉",
        description: `+${quest.xp} XP, +${coins} coins`,
      });
    },
    [gameState, toast]
  );

  const uncompleteQuest = useCallback(
    (questId: string) => {
      const today = getTodayKey();
      const quest = gameState.quests.find((q) => q.id === questId);
      if (!quest) return;

      const todayLog = gameState.log[today];
      if (!todayLog || !todayLog.completed.includes(questId)) return;

      const coins = calculateCoins(quest.xp);
      const newXP = Math.max(0, gameState.profile.xp - quest.xp);
      const levelInfo = calculateLevel(newXP);

      const newState: GameState = {
        ...gameState,
        profile: {
          ...gameState.profile,
          xp: newXP,
          coins: Math.max(0, gameState.profile.coins - coins),
          level: levelInfo.level,
        },
        log: {
          ...gameState.log,
          [today]: {
            ...todayLog,
            completed: todayLog.completed.filter((id) => id !== questId),
          },
        },
      };

      setGameState(newState);
      saveState(newState);
    },
    [gameState]
  );

  const addQuest = useCallback(
    (title: string, category: QuestCategory, xp: number, type: QuestType) => {
      const newQuest: Quest = {
        id: uuid(),
        title,
        category,
        xp,
        type,
      };

      const newState: GameState = {
        ...gameState,
        quests: [newQuest, ...gameState.quests],
      };

      setGameState(newState);
      saveState(newState);

      toast({
        title: "Quest Added!",
        description: `${title} has been added to your quests`,
      });
    },
    [gameState, toast]
  );

  const deleteQuest = useCallback(
    (questId: string) => {
      const newState: GameState = {
        ...gameState,
        quests: gameState.quests.filter((q) => q.id !== questId),
        log: Object.fromEntries(
          Object.entries(gameState.log).map(([date, log]) => [
            date,
            {
              ...log,
              completed: log.completed.filter((id) => id !== questId),
            },
          ])
        ),
      };

      setGameState(newState);
      saveState(newState);
    },
    [gameState]
  );

  const toggleTheme = useCallback(() => {
    const newTheme = gameState.profile.theme === "dark" ? "light" : "dark";
    const newState: GameState = {
      ...gameState,
      profile: {
        ...gameState.profile,
        theme: newTheme,
      },
    };

    setGameState(newState);
    saveState(newState);
    
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  }, [gameState]);

  const updateNotes = useCallback(
    (notes: string, affirmation: string) => {
      const today = getTodayKey();
      const todayLog = gameState.log[today] || { completed: [], notes: "", affirmation: "" };

      const newState: GameState = {
        ...gameState,
        log: {
          ...gameState.log,
          [today]: {
            ...todayLog,
            notes,
            affirmation,
          },
        },
      };

      setGameState(newState);
      saveState(newState);

      toast({
        title: "Notes Saved ✓",
        description: "Your journal entry has been saved",
      });
    },
    [gameState, toast]
  );

  const exportData = useCallback(() => {
    const dataStr = JSON.stringify(gameState, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "levelup_data.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [gameState]);

  const importData = useCallback(
    (data: GameState) => {
      setGameState(data);
      saveState(data);
      toast({
        title: "Import Successful!",
        description: "Your data has been imported",
      });
    },
    [toast]
  );

  const resetData = useCallback(() => {
    const initial = getInitialState();
    setGameState(initial);
    saveState(initial);
    window.location.reload();
  }, []);

  const updateCoins = (newCoins: number) => {
    setGameState((prev) => {
      const updated = {
        ...prev,
        profile: {
          ...prev.profile,
          coins: newCoins,
        },
      };
      saveState(updated);
      return updated;
    });
  };

  const updateVitality = (newVitality: number) => {
    setGameState((prev) => {
      const updated = {
        ...prev,
        profile: {
          ...prev.profile,
          vitality: newVitality,
        },
      };
      saveState(updated);
      return updated;
    });
  };

  const updateMana = (newMana: number) => {
    setGameState((prev) => {
      const updated = {
        ...prev,
        profile: {
          ...prev.profile,
          mana: newMana,
        },
      };
      saveState(updated);
      return updated;
    });
  };

  return {
    gameState,
    completeQuest,
    uncompleteQuest,
    addQuest,
    deleteQuest,
    toggleTheme,
    updateNotes,
    exportData,
    importData,
    resetData,
    updateCoins,
    updateVitality,
    updateMana,
  };
}