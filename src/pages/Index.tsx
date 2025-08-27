import { useEffect } from "react";
import { useGameState } from "@/hooks/useGameState";
import { getTodayKey } from "@/utils/gameLogic";
import { Header } from "@/components/Header";
import { Dashboard } from "@/components/Dashboard";
import { AddQuest } from "@/components/AddQuest";
import { QuestList } from "@/components/QuestList";
import { Journal } from "@/components/Journal";

const Index = () => {
  const {
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
  } = useGameState();

  const today = getTodayKey();
  const todayLog = gameState.log[today] || { completed: [], notes: "", affirmation: "" };

  // Set theme on mount
  useEffect(() => {
    if (gameState.profile.theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  }, [gameState.profile.theme]);

  // Keyboard shortcut for quick complete
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const incompleteQuests = gameState.quests.filter(
          (q) => !todayLog.completed.includes(q.id)
        );
        if (incompleteQuests.length > 0) {
          completeQuest(incompleteQuests[0].id);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [gameState.quests, todayLog.completed, completeQuest]);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Header onExport={exportData} onImport={importData} onReset={resetData} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <Dashboard
              profile={gameState.profile}
              todayCompleted={todayLog.completed.length}
            />
          </div>
          <div className="lg:col-span-1">
            <AddQuest onAdd={addQuest} />
          </div>
        </div>
        
        <div className="space-y-6">
          <QuestList
            quests={gameState.quests}
            completedToday={todayLog.completed}
            onComplete={completeQuest}
            onUncomplete={uncompleteQuest}
            onDelete={deleteQuest}
            onToggleTheme={toggleTheme}
            theme={gameState.profile.theme}
          />
          
          <Journal
            notes={todayLog.notes}
            affirmation={todayLog.affirmation}
            onSave={updateNotes}
          />
        </div>
        
        <footer className="text-center text-xs text-muted-foreground mt-8 pb-4">
          Made for you • Runs 100% offline in your browser • Data stored in localStorage
        </footer>
      </div>
    </div>
  );
};

export default Index;
