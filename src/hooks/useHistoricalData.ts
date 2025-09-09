import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Quest, DayLog } from "@/types/quest";
import { format } from "date-fns";

export function useHistoricalData(selectedDate: Date) {
  const [completedQuests, setCompletedQuests] = useState<Quest[]>([]);
  const [journalEntry, setJournalEntry] = useState<DayLog>({
    completed: [],
    notes: "",
    affirmation: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistoricalData = async () => {
      setLoading(true);
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch completed quests for the selected date
      const { data: completions } = await supabase
        .from("quest_completions")
        .select("quest_id, quests(id, title, category, xp, type)")
        .eq("completed_at", dateStr)
        .eq("user_id", user.id);

      if (completions) {
        const quests = completions
          .map(c => c.quests)
          .filter(q => q !== null) as Quest[];
        setCompletedQuests(quests);
        
        const completedIds = quests.map(q => q.id);
        setJournalEntry(prev => ({ ...prev, completed: completedIds }));
      }

      // Fetch journal entry for the selected date
      const { data: journal } = await supabase
        .from("journal_entries")
        .select("notes, affirmation")
        .eq("date", dateStr)
        .eq("user_id", user.id)
        .maybeSingle();

      if (journal) {
        setJournalEntry(prev => ({
          ...prev,
          notes: journal.notes || "",
          affirmation: journal.affirmation || "",
        }));
      }

      setLoading(false);
    };

    fetchHistoricalData();
  }, [selectedDate]);

  return { completedQuests, journalEntry, loading };
}