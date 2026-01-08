import { motion } from "framer-motion";
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
    <motion.nav
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-xl border-t border-border/50"
    >
      <div className="flex items-center justify-around py-2 px-2 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <motion.button
              key={item.label}
              onClick={() => navigate(item.path)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`relative flex flex-col items-center gap-1 p-2 rounded-xl transition-colors min-w-[64px] ${
                isActive
                  ? "text-cyan-glow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-cyan-glow/10 rounded-xl"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">
                {isActive ? item.activeIcon : item.icon}
              </span>
              <span className="relative z-10 text-[10px] font-medium">
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default BottomNav;
