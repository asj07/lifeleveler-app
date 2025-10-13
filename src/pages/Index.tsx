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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, History, ShoppingCart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Header onExport={exportData} onImport={importData} onReset={resetData} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-[600px] mx-auto mb-6">
            <TabsTrigger value="today" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Today's Quests
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="shop" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Shop
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2">
                <Dashboard
                  profile={profile}
                  todayCompleted={completedToday.length}
                  onToggleTheme={toggleTheme}
                />
              </div>
              <div className="lg:col-span-1">
                <AddQuest onAdd={addQuest} />
              </div>
            </div>
            
            <div className="space-y-6">
              <QuestList
                quests={quests}
                completedToday={completedToday}
                onComplete={completeQuest}
                onUncomplete={uncompleteQuest}
                onDelete={deleteQuest}
                onToggleTheme={toggleTheme}
                theme={profile.theme as "dark" | "light"}
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
        
        <footer className="text-center text-xs text-muted-foreground mt-8 pb-4">
          Your progress is automatically saved to the cloud
        </footer>
      </div>
    </div>
  );
};

export default Index;
