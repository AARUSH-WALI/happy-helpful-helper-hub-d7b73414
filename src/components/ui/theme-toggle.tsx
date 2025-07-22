import * as React from "react"
import { useState, useEffect } from "react"
import { Moon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ThemeToggleProps {
  className?: string
  onChange?: (isDark: boolean) => void
}

export const ThemeToggle = ({ className, onChange }: ThemeToggleProps) => {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Check initial theme from document
    const isDarkMode = document.documentElement.classList.contains('dark')
    setIsDark(isDarkMode)
  }, [])

  const toggleTheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    document.documentElement.classList.toggle("dark", newIsDark)
    onChange?.(newIsDark)
  }

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={toggleTheme}
        className={cn(
          "socket relative w-12 h-6 rounded-full transition-all duration-500 ease-in-out",
          "bg-gradient-to-r shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2",
          isDark 
            ? "from-slate-800 to-slate-900 shadow-slate-900/30" 
            : "from-amber-200 to-orange-300 shadow-amber-300/30"
        )}
        style={{
          boxShadow: isDark 
            ? "-0.05em 0.1em 0.2em -0.1em rgba(0, 0, 0, 0.3), inset 0.1em 0.1em 0.2em rgba(255, 255, 255, 0.1)" 
            : "-0.05em 0.1em 0.2em -0.1em rgba(255, 255, 255, 0.8), inset 0.1em 0.1em 0.2em rgba(0, 0, 0, 0.1)"
        }}
      >
        {/* Background glow effect */}
        <div 
          className={cn(
            "socket-shadow absolute inset-0 rounded-full opacity-0 transition-opacity duration-500",
            "pointer-events-none"
          )}
          style={{
            boxShadow: isDark 
              ? "0em 0.075em 0.1em 0em rgba(255, 255, 255, 0.2)" 
              : "0em 0.075em 0.1em 0em rgba(255, 255, 255, 0.8)"
          }}
        />
        
        {/* Moon/Sun toggle */}
        <div
          className={cn(
            "absolute top-1 w-4 h-4 rounded-full transition-all duration-500 ease-in-out transform",
            "flex items-center justify-center shadow-md",
            isDark 
              ? "translate-x-6 bg-slate-200 shadow-slate-800/50" 
              : "translate-x-1 bg-white shadow-amber-400/30"
          )}
        >
          <Moon 
            className={cn(
              "w-2.5 h-2.5 transition-all duration-500",
              isDark ? "text-slate-700 rotate-0" : "text-amber-600 rotate-180"
            )} 
          />
        </div>
      </button>
    </div>
  )
}