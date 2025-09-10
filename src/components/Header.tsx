import { Button } from "@/components/ui/button";
import { Star, Upload, Download, RotateCcw } from "lucide-react";
import { useRef } from "react";

interface HeaderProps {
  onExport: () => void;
  onImport: () => void;
  onReset: () => void;
}

export function Header({ onExport, onImport, onReset }: HeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Reading the file ensures the browser clears the file input value
      await file.text();
      onImport();
    } catch (error) {
      console.error("Failed to import data:", error);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleReset = () => {
    if (window.confirm("Hard reset will erase all your data. Continue?")) {
      onReset();
    }
  };

  return (
    <header className="glass-card rounded-2xl p-4 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-primary via-primary-glow to-secondary flex items-center justify-center shadow-glow">
            <Star className="w-7 h-7 sm:w-8 sm:h-8 text-primary-foreground" fill="currentColor" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Level‑Up — Health • Wealth • Relationships
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Turn life into an RPG. Complete daily quests, earn XP & coins.
            </p>
          </div>
        </div>
        <div className="flex gap-2 ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
          <label>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={handleImport}
            />
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4" />
              Import
            </Button>
          </label>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleReset}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>
      </div>
    </header>
  );
}