
import { useState } from "react";
import { 
  CheckSquare, 
  Clock, 
  FileText, 
  Home, 
  Calendar, 
  Settings, 
  HelpCircle 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 px-4 py-3 w-full rounded-lg transition-all",
      active 
        ? "bg-helper text-white" 
        : "text-gray-600 hover:bg-gray-100"
    )}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </button>
);

export const Sidebar = () => {
  const [activeItem, setActiveItem] = useState("Dashboard");

  const navItems = [
    { icon: <Home size={18} />, label: "Dashboard" },
    { icon: <CheckSquare size={18} />, label: "Tasks" },
    { icon: <Clock size={18} />, label: "Timer" },
    { icon: <FileText size={18} />, label: "Notes" },
    { icon: <Calendar size={18} />, label: "Calendar" }
  ];

  const bottomNavItems = [
    { icon: <Settings size={18} />, label: "Settings" },
    { icon: <HelpCircle size={18} />, label: "Help" },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-100 p-4 hidden md:flex flex-col">
      <div className="flex flex-col gap-2 flex-1">
        {navItems.map((item) => (
          <NavItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            active={activeItem === item.label}
            onClick={() => setActiveItem(item.label)}
          />
        ))}
      </div>

      <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
        {bottomNavItems.map((item) => (
          <NavItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            active={activeItem === item.label}
            onClick={() => setActiveItem(item.label)}
          />
        ))}
      </div>
    </aside>
  );
};
