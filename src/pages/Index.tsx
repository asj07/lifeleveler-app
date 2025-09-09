import { useEffect, useState } from "react";
import { useSupabaseGameState } from "@/hooks/useSupabaseGameState";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Dashboard } from "@/components/Dashboard";
import { AddQuest } from "@/components/AddQuest";
import { QuestList } from "@/components/QuestList";
import { Journal } from "@/components/Journal";
import { HistoryView } from "@/components/HistoryView";
import { Shop } from "@/components/Shop";
import { FullscreenTimer } from "@/components/FullscreenTimer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, History, ShoppingCart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Hud } from "@/components/Hud";
import { useTimer } from "@/hooks/useTimer";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const {
    loading,
    profile,
    quests,
    completedToday,
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
  } = useSupabaseGameState();

  const [activeTab, setActiveTab] = useState("today");
  const [journalNotes, setJournalNotes] = useState("");
  const [journalAffirmation, setJournalAffirmation] = useState("");
  const isMobile = useIsMobile();
  
  const {
    timerState,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    formatTimeDetailed,
  } = useTimer();

  // Load journal data for today
  useEffect(() => {
    const loadTodayJournal = async () => {
      const { data } = await supabase
        .from('journal_entries')
        .select('notes, affirmation')
        .eq('date', new Date().toISOString().split('T')[0])
        .maybeSingle();
      
      if (data) {
        setJournalNotes(data.notes || "");
        setJournalAffirmation(data.affirmation || "");
      }
    };
    loadTodayJournal();
  }, []);

  // Keyboard shortcut for quick complete
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const incompleteQuests = quests.filter(
          (q) => !completedToday.includes(q.id)
        );
        if (incompleteQuests.length > 0) {
          completeQuest(incompleteQuests[0].id);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [quests, completedToday, completeQuest]);

  if (loading) {
    return (
      <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Fullscreen Timer Overlay */}
      {timerState.isRunning && (
        <FullscreenTimer
          timerState={timerState}
          onPause={pauseTimer}
          onResume={resumeTimer}
          onStop={stopTimer}
          formatTimeDetailed={formatTimeDetailed}
        />
      )}
      
      <div className="min-h-screen p-3 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <Header onExport={exportData} onImport={importData} onReset={resetData} />

          {/* Hide HUD on mobile */}
          {!isMobile && (
            <Hud
              vitality={profile.vitality}
              mana={profile.mana}
              theme={profile.theme as "dark" | "light"}
              onToggleTheme={toggleTheme}
            />
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-[600px] mx-auto mb-4 sm:mb-6">
              <TabsTrigger value="today" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <Home className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Today's Quests</span>
                <span className="sm:hidden">Today</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <History className="h-3 w-3 sm:h-4 sm:w-4" />
                History
              </TabsTrigger>
              <TabsTrigger value="shop" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
                Shop
              </TabsTrigger>
            </TabsList>

            <TabsContent value="today">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                <div className="lg:col-span-2 order-1 lg:order-1">
                  <Dashboard
                    profile={profile}
                    todayCompleted={completedToday.length}
                  />
                </div>
                <div className="lg:col-span-1 order-3 lg:order-2">
                  <AddQuest onAdd={addQuest} />
                </div>
              </div>
              
              <div className="space-y-4 sm:space-y-6">
                <QuestList
                  quests={quests}
                  completedToday={completedToday}
                  onComplete={completeQuest}
                  onUncomplete={uncompleteQuest}
                  onDelete={deleteQuest}
                  onToggleTheme={toggleTheme}
                  theme={profile.theme as "dark" | "light"}
                  onStartTimer={startTimer}
                  activeTimerQuestId={timerState.questId}
                />
                
                <Journal
                  notes={journalNotes}
                  affirmation={journalAffirmation}
                  onSave={updateNotes}
                />
              </div>
            </TabsContent>

          <TabsContent value="history">
            <HistoryView />
          </TabsContent>

          <TabsContent value="shop">
            <Shop 
              coins={profile.coins} 
              onCoinsUpdate={updateCoins}
            />
          </TabsContent>
        </Tabs>
        
          <footer className="text-center text-xs text-muted-foreground mt-6 sm:mt-8 pb-4">
            Your progress is automatically saved to the cloud
          </footer>
        </div>
      </div>
    </>
  );
};

export default Index;
