
import { Bell, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Header = () => {
  const [date] = useState(new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }));

  return (
    <header className="w-full bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold text-helper-dark">
          <span className="text-helper">Happy Helpful</span> Helper Hub
        </h1>
        <p className="text-gray-500 text-sm">{date}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className={cn("relative")}>
          <Bell className="h-5 w-5 text-gray-500" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-helper-accent rounded-full"></span>
        </Button>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5 text-gray-500" />
        </Button>
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5 text-gray-500" />
        </Button>
      </div>
    </header>
  );
};
