
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import UserMenu from "./UserMenu";
import ThemeToggle from "./ThemeToggle";

export default function TopBar() {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-2 px-4 flex items-center justify-between">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <Input 
            type="text" 
            placeholder="Search" 
            className="pl-10 pr-4 py-2 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-gray-100 dark:bg-gray-700"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="h-5 w-5 flex items-center justify-center rounded-sm bg-gray-200 dark:bg-gray-600">
              <span className="text-xs text-gray-500 dark:text-gray-400">⌘</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <ThemeToggle />
        <button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <Bell className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </button>
        <UserMenu />
      </div>
    </div>
  );
}
