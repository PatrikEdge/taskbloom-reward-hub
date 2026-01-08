import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/dashboard/BottomNav";

interface Level {
  level: number;
  deposit: number;
  reward: number;
  tasks: number;
  dailyIncome: number;
  weekendIncome: number;
  color: string;
  gradient: string;
}

const levels: Level[] = [
  { level: 1, deposit: 200, reward: 0.5, tasks: 12, dailyIncome: 6, weekendIncome: 3, color: "from-sky-300 to-sky-500", gradient: "bg-gradient-to-br from-sky-200 via-sky-300 to-sky-400" },
  { level: 2, deposit: 680, reward: 1.0, tasks: 20, dailyIncome: 20, weekendIncome: 10, color: "from-emerald-300 to-emerald-500", gradient: "bg-gradient-to-br from-emerald-200 via-emerald-300 to-emerald-400" },
  { level: 3, deposit: 1560, reward: 2.0, tasks: 22, dailyIncome: 44, weekendIncome: 22, color: "from-amber-300 to-amber-500", gradient: "bg-gradient-to-br from-amber-200 via-amber-300 to-amber-400" },
  { level: 4, deposit: 3600, reward: 4.0, tasks: 26, dailyIncome: 104, weekendIncome: 52, color: "from-purple-300 to-purple-500", gradient: "bg-gradient-to-br from-purple-200 via-purple-300 to-purple-400" },
  { level: 5, deposit: 7600, reward: 5.0, tasks: 40, dailyIncome: 200, weekendIncome: 100, color: "from-pink-300 to-pink-500", gradient: "bg-gradient-to-br from-pink-200 via-pink-300 to-pink-400" },
];

const Levels = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative overflow-hidden pb-24">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-cyan-glow/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-40 w-80 h-80 rounded-full bg-profit/10 blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative z-10 p-4">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Vissza</span>
        </motion.button>
        
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-bold text-center mt-4 gradient-text"
        >
          Szintek
        </motion.h1>
      </div>

      {/* Levels List */}
      <div className="relative z-10 px-4 space-y-4 mt-4">
        {levels.map((level, index) => (
          <motion.div
            key={level.level}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + index * 0.1 }}
            className="glass-card p-4 flex items-center gap-4"
          >
            {/* Level Badge */}
            <div className={`relative w-20 h-20 ${level.gradient} rounded-full flex items-center justify-center shadow-lg`}>
              <div className="absolute inset-2 bg-background/20 rounded-full" />
              <div className="relative">
                <span className="text-2xl font-bold text-white drop-shadow-lg">Lv.{level.level}</span>
              </div>
              {/* Star decorations */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full opacity-80" />
              <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white rounded-full opacity-60" />
            </div>

            {/* Level Info */}
            <div className="flex-1 space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Betéti mennyiség :</span>
                <span className="text-primary font-semibold">{level.deposit.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Jutalékok :</span>
                <span className="text-primary font-semibold">{level.reward.toFixed(2)} | {level.tasks} rendelni</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Napi bevétel :</span>
                <span className="text-profit font-semibold">{level.dailyIncome.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Hétvégi bevétel :</span>
                <span className="text-profit font-semibold">{level.weekendIncome.toFixed(2)}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
};

export default Levels;
