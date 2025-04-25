
import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

type TimerMode = "focus" | "break";

export const PomodoroTimer = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<TimerMode>("focus");
  const { toast } = useToast();

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      if (mode === "focus") {
        setMode("break");
        setTimeLeft(5 * 60); // 5 minute break
        toast({
          title: "Focus session completed!",
          description: "Time for a short break.",
        });
      } else {
        setMode("focus");
        setTimeLeft(25 * 60); // Back to 25 minutes
        toast({
          title: "Break finished!",
          description: "Ready for another focused session?",
        });
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, mode, toast]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === "focus" ? 25 * 60 : 5 * 60);
  };

  const switchMode = () => {
    setIsActive(false);
    if (mode === "focus") {
      setMode("break");
      setTimeLeft(5 * 60);
    } else {
      setMode("focus");
      setTimeLeft(25 * 60);
    }
  };

  // Format time as MM:SS
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  const calculateProgress = () => {
    const totalTime = mode === "focus" ? 25 * 60 : 5 * 60;
    const elapsed = totalTime - timeLeft;
    return (elapsed / totalTime) * 100;
  };

  return (
    <Card className={cn(
      "w-full shadow-sm border-gray-100 relative overflow-hidden transition-colors",
      mode === "focus" ? "bg-white" : "bg-blue-50"
    )}>
      <div 
        className="absolute bottom-0 left-0 h-1 bg-helper transition-all" 
        style={{ width: `${calculateProgress()}%` }} 
      />
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium">Pomodoro Timer</CardTitle>
        <Badge 
          variant={mode === "focus" ? "default" : "secondary"}
          className={cn(
            mode === "focus" ? "bg-helper text-white" : "bg-blue-100 text-blue-800"
          )}
        >
          {mode === "focus" ? (
            <span className="flex items-center gap-1">
              <Play size={12} /> Focus Mode
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Coffee size={12} /> Break Time
            </span>
          )}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="text-5xl font-bold my-6 tabular-nums">
          {formattedTime}
        </div>
        <div className="flex gap-3 mb-4">
          <Button 
            onClick={toggleTimer} 
            className={cn(
              isActive ? "bg-red-500 hover:bg-red-600" : "bg-helper hover:bg-helper-dark"
            )}
          >
            {isActive ? <Pause className="mr-2" size={18} /> : <Play className="mr-2" size={18} />}
            {isActive ? "Pause" : "Start"}
          </Button>
          <Button variant="outline" onClick={resetTimer}>
            <RotateCcw size={18} className="mr-2" />
            Reset
          </Button>
        </div>
        <Button variant="ghost" onClick={switchMode} className="text-gray-500">
          Switch to {mode === "focus" ? "break" : "focus"} mode
        </Button>
      </CardContent>
    </Card>
  );
};
