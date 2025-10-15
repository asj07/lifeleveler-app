import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Quest, DayLog } from "@/types/quest";
import { formatDateIST } from "@/utils/dateUtils";

interface QuestWithTime extends Quest {
  totalTimeSeconds?: number;
}

export function useHistoricalData(selectedDate: Date) {
  const [completedQuests, setCompletedQuests] = useState<QuestWithTime[]>([]);
  const [journalEntry, setJournalEntry] = useState<DayLog>({
    completed: [],
    notes: "",
    affirmation: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistoricalData = async () => {
      setLoading(true);
      const dateStr = formatDateIST(selectedDate, 'yyyy-MM-dd');
      
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
        
        // Fetch timer sessions for each quest on this date
        const questsWithTime: QuestWithTime[] = await Promise.all(
          quests.map(async (quest) => {
            const { data: sessions } = await supabase
              .from("quest_timer_sessions")
              .select("duration_seconds")
              .eq("quest_id", quest.id)
              .eq("user_id", user.id)
              .gte("started_at", `${dateStr}T00:00:00`)
              .lte("started_at", `${dateStr}T23:59:59`);

            const totalTimeSeconds = sessions?.reduce(
              (sum, session) => sum + (session.duration_seconds || 0),
              0
            ) || 0;

            return {
              ...quest,
              totalTimeSeconds,
            };
          })
        );
        
        setCompletedQuests(questsWithTime);
        
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