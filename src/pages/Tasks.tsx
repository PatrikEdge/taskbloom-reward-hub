import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Play, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/dashboard/BottomNav";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const brands = [
  { name: "Google", color: "#4285F4" },
  { name: "AliExpress", color: "#FF4747" },
  { name: "Amazon", color: "#FF9900" },
  { name: "eBay", color: "#E53238" },
  { name: "Shopify", color: "#96BF48" },
  { name: "Alibaba", color: "#FF6A00" },
  { name: "Wish", color: "#2FB7EC" },
  { name: "Temu", color: "#FB7701" },
];

const Tasks = () => {
  const navigate = useNavigate();
  const [isWorking, setIsWorking] = useState(false);
  const [currentBrandIndex, setCurrentBrandIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [completedToday, setCompletedToday] = useState(0);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const totalTasks = 16;
  const rewardPerTask = 0.50;
  const currentLevel = 1;
  const requiredDeposit = 680;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let brandInterval: NodeJS.Timeout;

    if (isWorking) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            clearInterval(brandInterval);
            setIsWorking(false);
            setCompletedToday((c) => c + 1);
            setTodayEarnings((e) => e + rewardPerTask);
            return 0;
          }
          return prev + (100 / 12);
        });
      }, 1000);

      brandInterval = setInterval(() => {
        setCurrentBrandIndex((prev) => (prev + 1) % brands.length);
      }, 1500);
    }

    return () => {
      clearInterval(interval);
      clearInterval(brandInterval);
    };
  }, [isWorking]);

  const handleStartWork = () => {
    if (completedToday >= totalTasks) return;
    setIsWorking(true);
    setProgress(0);
  };

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
          KEZDJ EL PÉNZT KERESNI
        </motion.h1>
      </div>

      {/* Balance Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 px-4 mt-4"
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card p-4 text-center">
            <span className="text-muted-foreground text-sm">Számla vagyon</span>
            <p className="text-2xl font-bold text-foreground mt-1">{todayEarnings.toFixed(2)}</p>
            <span className="text-xs text-muted-foreground">USDT</span>
          </div>
          <div className="glass-card p-4 text-center">
            <span className="text-muted-foreground text-sm">Jutalékok</span>
            <p className="text-2xl font-bold text-primary mt-1">{rewardPerTask.toFixed(2)}</p>
            <span className="text-xs text-muted-foreground">SLV{currentLevel}(VIP)</span>
          </div>
        </div>
      </motion.div>

      {/* Level Upgrade Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 px-4 mt-4"
      >
        <div className="glass-card p-4 border-l-4 border-primary">
          <p className="text-sm text-muted-foreground">
            LV2 szintre szeretne frissíteni. "Önnek {requiredDeposit.toFixed(2)} USDT-vel kell rendelkeznie".
          </p>
        </div>
      </motion.div>

      {/* Task Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="relative z-10 px-4 mt-4"
      >
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold">kezdődik</span>
            <span className="text-primary font-bold">{completedToday}/{totalTasks}</span>
          </div>
          
          {/* Progress Bar */}
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-profit"
              initial={{ width: 0 }}
              animate={{ width: isWorking ? `${progress}%` : `${(completedToday / totalTasks) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Working Animation */}
          <AnimatePresence>
            {isWorking && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mt-6 text-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-primary border-t-transparent"
                />
                <motion.p
                  key={currentBrandIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-lg font-semibold"
                  style={{ color: brands[currentBrandIndex].color }}
                >
                  {brands[currentBrandIndex].name}
                </motion.p>
                <p className="text-sm text-muted-foreground mt-2">Feldolgozás folyamatban...</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Start Button */}
          <Button
            onClick={handleStartWork}
            disabled={isWorking || completedToday >= totalTasks}
            className="w-full mt-6 bg-gradient-to-r from-primary to-cyan-400 hover:from-primary/90 hover:to-cyan-400/90 text-primary-foreground font-bold py-6 text-lg"
          >
            {isWorking ? (
              "Dolgozik..."
            ) : completedToday >= totalTasks ? (
              <span className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Ma befejezve!
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                KEZDJ DOLGOZNI
              </span>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Task Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 px-4 mt-4"
      >
        <div className="glass-card p-4">
          <p className="text-sm text-muted-foreground text-center">
            A feladatrendelés mennyisége brit idő szerint 00:00-kor frissítve.
          </p>
        </div>
      </motion.div>

      {/* Task Description */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="relative z-10 px-4 mt-4"
      >
        <div className="glass-card p-4">
          <h3 className="font-bold text-center mb-3 text-primary">RENDELÉSI FELADAT LEÍRÁSA</h3>
          <p className="text-sm text-muted-foreground">
            (1): A feladatmegrendelések automatikus párosítása LV-szint alapján a WTQ felhőrendszerén keresztül.
          </p>
        </div>
      </motion.div>

      <BottomNav />
    </div>
  );
};

export default Tasks;
