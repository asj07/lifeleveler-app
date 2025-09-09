import { useEffect } from "react";
import { X, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TimerState } from "@/hooks/useTimer";

interface FullscreenTimerProps {
  timerState: TimerState;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  formatTimeDetailed: (seconds: number) => {
    hours: string;
    minutes: string;
    seconds: string;
  };
}

export function FullscreenTimer({
  timerState,
  onPause,
  onResume,
  onStop,
  formatTimeDetailed,
}: FullscreenTimerProps) {
  const time = formatTimeDetailed(timerState.elapsedTime);

  // Prevent scroll when fullscreen timer is active
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onStop();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onStop]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
      {/* Close button */}
      <Button
        onClick={onStop}
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 text-white hover:bg-white/10"
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Quest title */}
      <div className="text-white/60 text-xl md:text-2xl mb-8 px-4 text-center">
        {timerState.questTitle}
      </div>

      {/* Timer display */}
      <div className="flex items-center justify-center text-white">
        <span className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-mono font-bold tabular-nums">
          {time.hours}:{time.minutes}:{time.seconds}
        </span>
      </div>

      {/* Control buttons */}
      <div className="mt-12 flex gap-4">
        {timerState.isPaused ? (
          <Button
            onClick={onResume}
            size="lg"
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
          >
            <Play className="h-5 w-5 mr-2" />
            Resume
          </Button>
        ) : (
          <Button
            onClick={onPause}
            size="lg"
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
          >
            <Pause className="h-5 w-5 mr-2" />
            Pause
          </Button>
        )}
        <Button
          onClick={onStop}
          size="lg"
          variant="outline"
          className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
        >
          Stop Timer
        </Button>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-8 text-white/40 text-sm">
        Press ESC to exit
      </div>
    </div>
  );
}