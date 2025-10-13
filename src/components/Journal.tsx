import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";

interface JournalProps {
  notes: string;
  affirmation: string;
  onSave: (notes: string, affirmation: string) => void;
}

export function Journal({ notes: initialNotes, affirmation: initialAffirmation, onSave }: JournalProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [affirmation, setAffirmation] = useState(initialAffirmation);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setNotes(initialNotes);
    setAffirmation(initialAffirmation);
  }, [initialNotes, initialAffirmation]);

  const handleSave = () => {
    onSave(notes, affirmation);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="glass-card rounded-2xl p-6">
      <h2 className="text-lg font-bold mb-4">Journal & Reflection</h2>
      
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="journal">Today's reflection (what went well / what to improve?)</Label>
          <Textarea
            id="journal"
            placeholder="Take a moment to reflect on your day..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="affirmation">Daily Affirmation</Label>
          <Input
            id="affirmation"
            placeholder="I improve 1% daily. I play long-term games."
            value={affirmation}
            onChange={(e) => setAffirmation(e.target.value)}
          />
        </div>
        
        <Button
          onClick={handleSave}
          className="w-full sm:w-auto"
          variant={isSaved ? "outline" : "default"}
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaved ? "Saved ✓" : "Save Notes"}
        </Button>
      </div>
    </div>
  );
}