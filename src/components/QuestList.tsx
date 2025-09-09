import { useState, useEffect } from "react";
import { Quest, QuestCategory } from "@/types/quest";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Coins, Calendar, Sun, Moon, Timer, Play } from "lucide-react";
import { calculateCoins } from "@/utils/gameLogic";

interface QuestListProps {
  quests: Quest[];
  completedToday: string[];
  onComplete: (questId: string) => void;
  onUncomplete: (questId: string) => void;
  onDelete: (questId: string) => void;
  onToggleTheme: () => void;
  theme: "light" | "dark";
  onStartTimer: (questId: string, questTitle: string) => void;
  activeTimerQuestId: string | null;
}

type TabFilter = "All" | QuestCategory | "Completed";

export function QuestList({
  quests,
  completedToday,
  onComplete,
  onUncomplete,
  onDelete,
  onToggleTheme,
  theme,
  onStartTimer,
  activeTimerQuestId,
}: QuestListProps) {
  const [activeTab, setActiveTab] = useState<TabFilter>("All");
  const [filteredQuests, setFilteredQuests] = useState<Quest[]>(quests);

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

  const tabs: TabFilter[] = ["All", "Health", "Wealth", "Relationships", "Completed"];

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-6">
      {/* Tabs and Theme Toggle - Mobile Optimized */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`tab-button px-3 py-1.5 text-sm ${activeTab === tab ? "active" : ""}`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="flex items-center justify-between sm:justify-end gap-2">
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
            onClick={onToggleTheme}
            className="gap-2"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
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
                className={`quest-item ${isCompleted ? "completed" : ""} p-3 sm:p-4 rounded-lg border border-border/50 bg-background/30`}
              >
                <div className="flex items-start sm:items-center gap-3">
                  <Checkbox
                    checked={isCompleted}
                    onCheckedChange={(checked) =>
                      handleToggle(quest.id, checked as boolean)
                    }
                    className="mt-1 sm:mt-0"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium ${isCompleted ? "line-through opacity-60" : ""} break-words`}>
                      {quest.title}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span>{quest.category}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>{quest.xp} XP</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {quest.type}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Action buttons - Mobile optimized */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gold/20 text-gold border border-gold/30">
                      <Coins className="w-3 h-3" />
                      +{coins}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {/* Timer button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onStartTimer(quest.id, quest.title)}
                      disabled={isCompleted || activeTimerQuestId === quest.id}
                      className="touch-manipulation"
                    >
                      {activeTimerQuestId === quest.id ? (
                        <Timer className="w-4 h-4 text-primary animate-pulse" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                    
                    {/* Delete button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(quest.id)}
                      className="text-destructive hover:text-destructive/80 touch-manipulation"
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
    </div>
  );
}