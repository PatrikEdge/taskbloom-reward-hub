import { motion } from "framer-motion";
import { ChevronLeft, Users, Wallet, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/dashboard/BottomNav";
import { useState } from "react";

interface TeamMember {
  id: number;
  name: string;
  level: number;
  commission: number;
  joinDate: string;
}

const mockMembers: TeamMember[] = [
  { id: 1, name: "user***123", level: 2, commission: 45.5, joinDate: "2024-01-15" },
  { id: 2, name: "john***doe", level: 1, commission: 12.3, joinDate: "2024-02-20" },
  { id: 3, name: "alex***456", level: 3, commission: 89.0, joinDate: "2024-01-28" },
];

const Team = () => {
  const navigate = useNavigate();
  const [activeLevel, setActiveLevel] = useState(1);

  const teamBalance = 696.93;
  const totalRecharge = 634;
  const subordinate = 31;
  const teamSize = 68;
  const allDataCommission = 95.68;
  const teamCommission = 666.4;

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative overflow-hidden pb-24">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-40 w-80 h-80 rounded-full bg-pink-500/10 blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative z-10 p-4">
        <div className="flex items-center justify-between">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
          
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl font-bold"
          >
            Team Report
          </motion.h1>

          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 px-4 mt-4"
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Wallet className="w-5 h-5 text-purple-400" />
              <span className="text-xs text-muted-foreground">Team Balance USDT</span>
            </div>
            <span className="text-xl font-bold text-foreground">{teamBalance}</span>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-pink-400" />
              <span className="text-xs text-muted-foreground">Total Recharge USDT</span>
            </div>
            <span className="text-xl font-bold text-foreground">{totalRecharge}</span>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="w-5 h-5 text-cyan-400" />
              <span className="text-xs text-muted-foreground">Subordinate (people)</span>
            </div>
            <span className="text-xl font-bold text-foreground">{subordinate}</span>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="w-5 h-5 text-emerald-400" />
              <span className="text-xs text-muted-foreground">Team size (people)</span>
            </div>
            <span className="text-xl font-bold text-foreground">{teamSize}</span>
          </div>
        </div>
      </motion.div>

      {/* All Data Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 px-4 mt-4"
      >
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-primary rounded-full" />
              <span className="font-semibold">All Data</span>
            </div>
            <span className="text-primary font-bold">{allDataCommission} USDT</span>
          </div>
          <div className="flex justify-between text-sm">
            <div>
              <span className="text-muted-foreground">Number of teams</span>
              <p className="font-semibold">{teamSize} (people)</p>
            </div>
            <div className="text-right">
              <span className="text-muted-foreground">Team commission</span>
              <p className="font-semibold">{teamCommission} USDT</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Level Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="relative z-10 px-4 mt-4"
      >
        <div className="flex gap-2">
          {[1, 2, 3].map((level) => (
            <button
              key={level}
              onClick={() => setActiveLevel(level)}
              className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                activeLevel === level
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              LEVEL {level}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Level Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 px-4 mt-4"
      >
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-purple-400 rounded-full" />
              <span className="font-semibold">Level {activeLevel}</span>
              <span className="text-muted-foreground text-sm">Proportion 3%</span>
            </div>
            <span className="text-purple-400 font-bold">10.08 USDT</span>
          </div>
          <div className="flex justify-between text-sm">
            <div>
              <span className="text-muted-foreground">Number of teams</span>
              <p className="font-semibold">{subordinate} (people)</p>
            </div>
            <div className="text-right">
              <span className="text-muted-foreground">Team commission</span>
              <p className="font-semibold">288 USDT</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Team Members List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="relative z-10 px-4 mt-4"
      >
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">Meghívottak</h3>
        <div className="space-y-2">
          {mockMembers.map((member) => (
            <div key={member.id} className="glass-card p-3 flex items-center justify-between">
              <div>
                <p className="font-semibold">{member.name}</p>
                <p className="text-xs text-muted-foreground">{member.joinDate}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-primary">Lv.{member.level}</p>
                <p className="text-xs text-profit">+{member.commission} USDT</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <BottomNav />
    </div>
  );
};

export default Team;
