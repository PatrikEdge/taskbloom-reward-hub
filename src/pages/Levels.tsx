import { motion } from "framer-motion";
import { ChevronLeft, Crown, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/dashboard/BottomNav";
import { regularLevels, vipLevels, VIP_REQUIREMENTS } from "@/lib/levelConfig";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const Levels = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [showVip, setShowVip] = useState(false);
  
  const currentLevel = profile?.level ?? 0;
  const isVip = profile?.is_vip ?? false;
  const levels = showVip ? vipLevels : regularLevels;

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

      {/* Toggle VIP / Regular */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 px-4 mb-4"
      >
        <div className="flex gap-2">
          <button
            onClick={() => setShowVip(false)}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
              !showVip 
                ? "bg-gradient-to-r from-primary to-cyan-400 text-primary-foreground" 
                : "bg-secondary text-muted-foreground"
            }`}
          >
            Normál szintek
          </button>
          <button
            onClick={() => setShowVip(true)}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
              showVip 
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white" 
                : "bg-secondary text-muted-foreground"
            }`}
          >
            <Crown className="w-4 h-4" />
            VIP szintek
          </button>
        </div>
      </motion.div>

      {/* VIP info banner */}
      {!showVip && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 px-4 mb-4"
        >
          <div className="glass-card p-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-400" />
              <span className="text-sm text-amber-200">
                VIP státusz elérhető csapattagok meghívásával!
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Levels List */}
      <div className="relative z-10 px-4 space-y-4 mt-4">
        {levels.map((level, index) => {
          const isCurrentLevel = level.level === currentLevel && (showVip ? isVip : !isVip);
          const vipReq = VIP_REQUIREMENTS[level.level] ?? 0;
          
          return (
            <motion.div
              key={`${showVip ? 'vip' : 'reg'}-${level.level}`}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              className={`glass-card p-4 flex items-center gap-4 ${
                isCurrentLevel ? "border-primary border-2" : ""
              }`}
            >
              {/* Level Badge */}
              <div className={`relative w-20 h-20 ${level.gradient} rounded-full flex items-center justify-center shadow-lg`}>
                <div className="absolute inset-2 bg-background/20 rounded-full" />
                <div className="relative text-center">
                  <span className="text-xl font-bold text-white drop-shadow-lg">
                    {showVip ? "sLV" : "LV"}
                  </span>
                  <span className="text-2xl font-bold text-white drop-shadow-lg">
                    {level.level}
                  </span>
                </div>
                {showVip && (
                  <Crown className="absolute -top-1 -right-1 w-5 h-5 text-amber-400" />
                )}
                {isCurrentLevel && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-profit text-xs font-bold rounded text-background">
                    AKTÍV
                  </div>
                )}
              </div>

              {/* Level Info */}
              <div className="flex-1 space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">Letét:</span>
                  <span className="text-primary font-semibold">
                    {level.deposit > 0 ? `${level.deposit} USDT` : "Ingyenes"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">Jutalom/feladat:</span>
                  <span className="text-primary font-semibold">{level.rewardPerTask} USDT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">Hétköznap:</span>
                  <span className="text-profit font-semibold">
                    {level.weekdayTasks} feladat → {level.dailyIncome} USDT
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">Hétvége:</span>
                  <span className="text-profit font-semibold">
                    {level.weekendTasks} feladat → {level.weekendIncome} USDT
                  </span>
                </div>
                {!showVip && level.level > 0 && (
                  <div className="flex items-center justify-between pt-1 border-t border-border/50 mt-1">
                    <span className="text-xs text-amber-400 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      VIP-hez: {vipReq} csapattag
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Commission info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 px-4 mt-6"
      >
        <div className="glass-card p-4">
          <h3 className="font-semibold text-foreground mb-3">Csapat jutalék rendszer</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">1. szintű meghívottak:</span>
              <span className="text-profit font-semibold">3%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">2. szintű meghívottak:</span>
              <span className="text-profit font-semibold">2%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">3. szintű meghívottak:</span>
              <span className="text-profit font-semibold">1%</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            A csapattagjaid minden feladat jutalékából részesülsz automatikusan.
          </p>
        </div>
      </motion.div>

      <BottomNav />
    </div>
  );
};

export default Levels;
