import {
  Home,
  Award,
  ClipboardList,
  Users,
  User,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

interface NavItem {
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  {
    icon: <Home className="w-6 h-6" />,
    activeIcon: <Home className="w-6 h-6" />,
    label: "Kezdőlap",
    path: "/",
  },
  {
    icon: <Award className="w-6 h-6" />,
    activeIcon: <Award className="w-6 h-6 fill-current" />,
    label: "Szintek",
    path: "/levels",
  },
  {
    icon: <ClipboardList className="w-6 h-6" />,
    activeIcon: <ClipboardList className="w-6 h-6" />,
    label: "Taskok",
    path: "/tasks",
  },
  {
    icon: <Users className="w-6 h-6" />,
    activeIcon: <Users className="w-6 h-6 fill-current" />,
    label: "Csapatom",
    path: "/team",
  },
  {
    icon: <User className="w-6 h-6" />,
    activeIcon: <User className="w-6 h-6 fill-current" />,
    label: "Profil",
    path: "/profile",
  },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-xl border-t border-border/50 z-50">
      <div className="flex items-center justify-around py-2 px-2 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`relative flex flex-col items-center gap-1 p-2 rounded-xl transition-colors min-w-[64px] ${
                isActive
                  ? "text-cyan-glow bg-cyan-glow/10"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>
                {isActive ? item.activeIcon : item.icon}
              </span>
              <span className="text-[10px] font-medium">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
