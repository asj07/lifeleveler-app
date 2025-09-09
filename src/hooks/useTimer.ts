import { useState, useCallback, useEffect, useRef } from "react";

export interface TimerState {
  questId: string | null;
  questTitle: string;
  elapsedTime: number;
  isRunning: boolean;
  isPaused: boolean;
}

export function useTimer() {
  const [timerState, setTimerState] = useState<TimerState>({
    questId: null,
    questTitle: "",
    elapsedTime: 0,
    isRunning: false,
    isPaused: false,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback((questId: string, questTitle: string) => {
    setTimerState({
      questId,
      questTitle,
      elapsedTime: 0,
      isRunning: true,
      isPaused: false,
    });
  }, []);

  const pauseTimer = useCallback(() => {
    setTimerState(prev => ({
      ...prev,
      isPaused: true,
      isRunning: false,
    }));
  }, []);

  const resumeTimer = useCallback(() => {
    setTimerState(prev => ({
      ...prev,
      isPaused: false,
      isRunning: true,
    }));
  }, []);

  const stopTimer = useCallback(() => {
    setTimerState({
      questId: null,
      questTitle: "",
      elapsedTime: 0,
      isRunning: false,
      isPaused: false,
    });
  }, []);

  // Timer tick effect
  useEffect(() => {
    if (timerState.isRunning && !timerState.isPaused) {
      intervalRef.current = setInterval(() => {
        setTimerState(prev => ({
          ...prev,
          elapsedTime: prev.elapsedTime + 1,
        }));
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
  }, [timerState.isRunning, timerState.isPaused]);

  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
    parts.push(`${secs}s`);

    return parts.join(" ");
  }, []);

  const formatTimeDetailed = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return {
      hours: hours.toString().padStart(2, "0"),
      minutes: minutes.toString().padStart(2, "0"),
      seconds: secs.toString().padStart(2, "0"),
    };
  }, []);

  return {
    timerState,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    formatTime,
    formatTimeDetailed,
  };
}