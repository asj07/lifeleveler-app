import { useState, useEffect } from "react";
import { Quest, QuestCategory } from "@/types/quest";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Coins, Calendar, Sun, Moon, Timer } from "lucide-react";
import { calculateCoins } from "@/utils/gameLogic";
import { QuestTimer } from "@/components/QuestTimer";
import { useTheme } from "next-themes";

interface QuestListProps {
  quests: Quest[];
  completedToday: string[];
  onComplete: (questId: string) => void;
  onUncomplete: (questId: string) => void;
  onDelete: (questId: string) => void;
}

type TabFilter = "All" | QuestCategory | "Completed";

export function QuestList({
  quests,
  completedToday,
  onComplete,
  onUncomplete,
  onDelete,
}: QuestListProps) {
  const [activeTab, setActiveTab] = useState<TabFilter>("All");
  const [filteredQuests, setFilteredQuests] = useState<Quest[]>(quests);
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    let filtered = quests;
    
    if (activeTab === "Completed") {
      filtered = quests.filter((q) => completedToday.includes(q.id));
    } else if (activeTab !== "All") {
      filtered = quests.filter((q) => q.category === activeTab);
    }
    
    setFilteredQuests(filtered);
  }, [activeTab, quests, completedToday]);

  const handleToggle = (questId: string, checked: boolean) => {
    if (checked) {
      onComplete(questId);
    } else {
      onUncomplete(questId);
    }
  };

  const handleDelete = (questId: string) => {
    if (window.confirm("Delete this quest?")) {
      onDelete(questId);
    }
  };
  const handleToggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const tabs: TabFilter[] = ["All", "Health", "Wealth", "Relationships", "Completed"];

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`tab-button text-xs sm:text-sm ${activeTab === tab ? "active" : ""}`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-xs px-3 py-1 rounded-full bg-muted/30 border border-border/50">
            {new Date().toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleTheme}
            className="gap-2"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">
              {theme === "dark" ? "Light" : "Dark"}
            </span>
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {filteredQuests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No quests here yet. Add one to get started!
          </div>
        ) : (
          filteredQuests.map((quest) => {
            const isCompleted = completedToday.includes(quest.id);
            const coins = calculateCoins(quest.xp);
            
            return (
              <div
                key={quest.id}
                className={`quest-item ${isCompleted ? "completed" : ""} flex items-start sm:items-center gap-3 p-3 sm:p-4`}
              >
                <div className="flex-shrink-0 mt-1 sm:mt-0">
                  <Checkbox
                    checked={isCompleted}
                    onCheckedChange={(checked) =>
                      handleToggle(quest.id, checked as boolean)
                    }
                  />
                </div>
                
                <div className="flex-1">
                  <div className={`font-medium ${isCompleted ? "line-through" : ""}`}>
                    {quest.title}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-1">
                    <span>{quest.category}</span>
                    <span>•</span>
                    <span>{quest.xp} XP</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {quest.type}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                  <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gold/20 text-gold border border-gold/30">
                    <Coins className="w-3 h-3" />
                    +{coins}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTimer(quest.id)}
                      className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
                      title="Start timer"
                    >
                      <Timer className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(quest.id)}
                      className="text-destructive hover:text-destructive/80 h-8 w-8 p-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Timer Modal */}
      {activeTimer && (
        <QuestTimer
          questTitle={quests.find(q => q.id === activeTimer)?.title || "Quest"}
          onClose={() => setActiveTimer(null)}
        />
      )}
    </div>
  );
}