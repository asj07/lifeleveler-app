import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";

interface HudProps {
  vitality: number;
  mana: number;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export function Hud({ vitality, mana, theme, onToggleTheme }: HudProps) {
  return (
    <div className="fixed top-4 right-4 flex flex-col gap-2 w-48 z-50">
      <div>
        <div className="flex justify-between mb-1 text-xs">
          <span>Vitality</span>
          <span>{vitality}</span>
        </div>
        <Progress value={vitality} />
      </div>
      <div>
        <div className="flex justify-between mb-1 text-xs">
          <span>Mana</span>
          <span>{mana}</span>
        </div>
        <Progress value={mana} />
      </div>
      <Button
        variant="outline"
        size="icon"
        onClick={onToggleTheme}
        className="self-end mt-2"
      >
        {theme === "dark" ? (
          <Sun className="w-4 h-4" />
        ) : (
          <Moon className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
}
