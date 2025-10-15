import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Square, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getNowIST } from "@/utils/dateUtils";

interface QuestTimerProps {
  questId: string;
  questTitle: string;
  onClose: () => void;
}

export function QuestTimer({ questId, questTitle, onClose }: QuestTimerProps) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = async () => {
    if (!isRunning) {
      // Start timer - create session
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('quest_timer_sessions')
        .insert({
          user_id: user.id,
          quest_id: questId,
        })
        .select()
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to start timer session",
          variant: "destructive",
        });
        return;
      }

      sessionIdRef.current = data.id;
      startTimeRef.current = getNowIST();
    } else {
      // Pause timer - update session
      if (sessionIdRef.current) {
        await supabase
          .from('quest_timer_sessions')
          .update({
            ended_at: getNowIST().toISOString(),
            duration_seconds: seconds,
          })
          .eq('id', sessionIdRef.current);
      }
    }
    
    setIsRunning(!isRunning);
  };

  const handleStop = async () => {
    if (sessionIdRef.current && seconds > 0) {
      await supabase
        .from('quest_timer_sessions')
        .update({
          ended_at: getNowIST().toISOString(),
          duration_seconds: seconds,
        })
        .eq('id', sessionIdRef.current);
      
      toast({
        title: "Session saved",
        description: `${formatTime(seconds)} tracked for this quest`,
      });
    }
    
    setIsRunning(false);
    setSeconds(0);
    sessionIdRef.current = null;
    startTimeRef.current = null;
  };

  const handleClose = async () => {
    // Save session if timer was running
    if (sessionIdRef.current && isRunning) {
      await supabase
        .from('quest_timer_sessions')
        .update({
          ended_at: getNowIST().toISOString(),
          duration_seconds: seconds,
        })
        .eq('id', sessionIdRef.current);
    }
    
    setIsRunning(false);
    onClose();
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      <div className="text-center text-white">
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="absolute top-4 right-4 text-white hover:bg-white/10"
        >
          <X className="w-6 h-6" />
        </Button>

        {/* Quest title */}
        <h1 className="text-2xl md:text-3xl font-bold mb-8 max-w-2xl mx-auto px-4">
          {questTitle}
        </h1>

        {/* Timer display */}
        <div className="text-8xl md:text-9xl font-mono font-bold mb-12 tracking-wider">
          {formatTime(seconds)}
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-center gap-6">
          <Button
            onClick={handlePlayPause}
            size="lg"
            className="bg-white text-black hover:bg-gray-200 w-16 h-16 rounded-full"
          >
            {isRunning ? (
              <Pause className="w-8 h-8" />
            ) : (
              <Play className="w-8 h-8 ml-1" />
            )}
          </Button>

          <Button
            onClick={handleStop}
            size="lg"
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-black w-16 h-16 rounded-full"
          >
            <Square className="w-6 h-6" />
          </Button>
        </div>

        {/* Instructions */}
        <p className="text-gray-400 mt-8 text-sm">
          Press <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">ESC</kbd> to close
        </p>
      </div>
    </div>
  );
}