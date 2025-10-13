import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QuestCategory, QuestType } from "@/types/quest";
import { Plus } from "lucide-react";

interface AddQuestProps {
  onAdd: (title: string, category: QuestCategory, xp: number, type: QuestType) => void;
}

export function AddQuest({ onAdd }: AddQuestProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<QuestCategory>("Health");
  const [xp, setXp] = useState(20);
  const [type, setType] = useState<QuestType>("daily");

  const handleSubmit = () => {
    if (!title.trim()) return;
    
    onAdd(title.trim(), category, xp, type);
    setTitle("");
    setXp(20);
    setCategory("Health");
    setType("daily");
  };

  return (
    <div className="glass-card rounded-2xl p-6">
      <h2 className="text-lg font-bold mb-4">Add Custom Quest</h2>
      
      <div className="grid gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="quest-title">Quest name</Label>
            <Input
              id="quest-title"
              placeholder="e.g., 50 push‑ups"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="quest-category">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as QuestCategory)}>
              <SelectTrigger id="quest-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Health">Health</SelectItem>
                <SelectItem value="Wealth">Wealth</SelectItem>
                <SelectItem value="Relationships">Relationships</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="quest-xp">XP Value</Label>
            <Input
              id="quest-xp"
              type="number"
              min="5"
              max="200"
              step="5"
              value={xp}
              onChange={(e) => setXp(Number(e.target.value))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="quest-type">Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as QuestType)}>
              <SelectTrigger id="quest-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="oneoff">One-off</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          onClick={handleSubmit}
          disabled={!title.trim()}
          className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary-glow hover:to-secondary-glow"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Quest
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Tip: Use <kbd className="px-2 py-1 rounded bg-muted text-xs">Ctrl/⌘ + K</kbd> to quick-complete the first quest
        </p>
      </div>
    </div>
  );
}