import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  CheckSquare, 
  Settings, 
  Plug, 
  FileText, 
  Terminal,
  SearchCode
} from "lucide-react";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "audit-tests", label: "Audit Tests", icon: CheckSquare },
  { id: "environment", label: "Environment", icon: Settings },
  { id: "api-testing", label: "API Testing", icon: Plug },
  { id: "reports", label: "Reports", icon: FileText },
  { id: "logs", label: "Live Logs", icon: Terminal },
];

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <SearchCode className="text-white" size={16} />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Code Auditor</h1>
            <p className="text-sm text-gray-500">AstroMarket Project</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              className={`w-full justify-start ${
                isActive
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => onSectionChange(item.id)}
            >
              <Icon className="mr-3" size={16} />
              {item.label}
            </Button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">System Ready</span>
        </div>
      </div>
    </aside>
  );
}
