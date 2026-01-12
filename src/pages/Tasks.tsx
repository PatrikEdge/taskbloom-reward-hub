import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Play, CheckCircle, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/dashboard/BottomNav";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getLevelConfig, getMaxTasks, getRewardPerTask, isWeekend } from "@/lib/levelConfig";

const brands = [
  { name: "TikTok", color: "#000000" },
  { name: "Facebook", color: "#1877F2" },
  { name: "WhatsApp", color: "#25D366" },
  { name: "Instagram", color: "#E4405F" },
  { name: "Snapchat", color: "#FFFC00" },
  { name: "Twitter", color: "#1DA1F2" },
  { name: "Messenger", color: "#0084FF" },
];

const Tasks = () => {
  const navigate = useNavigate();
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [isWorking, setIsWorking] = useState(false);
  const [currentBrandIndex, setCurrentBrandIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [completedToday, setCompletedToday] = useState(0);
  const [todayEarnings, setTodayEarnings] = useState(0);

  const userLevel = profile?.level ?? 0;
  const isVip = profile?.is_vip ?? false;
  const levelConfig = getLevelConfig(userLevel, isVip);
  const maxTasks = getMaxTasks(userLevel, isVip);
  const rewardPerTask = getRewardPerTask(userLevel, isVip);
  const weekend = isWeekend();

  useEffect(() => {
    const fetchTodayStats = async () => {
      if (!profile?.user_id) return;
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("task_completions")
        .select("tasks_completed, earnings")
        .eq("user_id", profile.user_id)
        .eq("completed_at", today)
        .maybeSingle();
      if (data) {
        setCompletedToday(data.tasks_completed);
        setTodayEarnings(Number(data.earnings));
      }
    };
    fetchTodayStats();
  }, [profile?.user_id]);

  useEffect(() => {
    if (!isWorking) return;
    
    let progressValue = 0;
    const brandInterval = setInterval(
      () => setCurrentBrandIndex((p) => (p + 1) % brands.length),
      1500
    );
    
    const progressInterval = setInterval(() => {
      progressValue += 6.67;
      setProgress(progressValue);
      
      if (progressValue >= 100) {
        clearInterval(progressInterval);
        clearInterval(brandInterval);
        setIsWorking(false);
        setProgress(0);
        // Complete task after animation
        handleCompleteTask();
      }
    }, 1000);
    
    return () => {
      clearInterval(brandInterval);
      clearInterval(progressInterval);
    };
  }, [isWorking]);

  const handleCompleteTask = async () => {
    if (!profile?.user_id) return;
    
    try {
      const today = new Date().toISOString().split("T")[0];
      const newCompleted = completedToday + 1;
      const newEarnings = todayEarnings + rewardPerTask;

      // Update task_completions
      const { data: existing } = await supabase
        .from("task_completions")
        .select("id")
        .eq("user_id", profile.user_id)
        .eq("completed_at", today)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("task_completions")
          .update({ tasks_completed: newCompleted, earnings: newEarnings })
          .eq("id", existing.id);
      } else {
        await supabase.from("task_completions").insert({
          user_id: profile.user_id,
          completed_at: today,
          tasks_completed: newCompleted,
          earnings: newEarnings,
        });
      }

      // Update user profile balances
      await supabase
        .from("profiles")
        .update({
          available_balance: (profile.available_balance ?? 0) + rewardPerTask,
          total_balance: (profile.total_balance ?? 0) + rewardPerTask,
          today_commission: (profile.today_commission ?? 0) + rewardPerTask,
          total_revenue: (profile.total_revenue ?? 0) + rewardPerTask,
        })
        .eq("user_id", profile.user_id);

      // Distribute team commissions using the database function
      await supabase.rpc("distribute_team_commission", {
        _user_id: profile.user_id,
        _task_earnings: rewardPerTask,
      });

      setCompletedToday(newCompleted);
      setTodayEarnings(newEarnings);
      await refreshProfile();
      toast({ title: "Feladat kész!", description: `+${rewardPerTask.toFixed(2)} USDT` });
    } catch (error) {
      console.error("Task completion error:", error);
      toast({ title: "Hiba történt", variant: "destructive" });
    }
  };

  const handleStartWork = () => {
    if (completedToday >= maxTasks) {
      toast({ title: "Napi limit elérve", variant: "destructive" });
      return;
    }
    setIsWorking(true);
    setProgress(0);
  };

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative overflow-hidden pb-24">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-cyan-glow/10 blur-3xl" />
      </div>

      <div className="relative z-10 p-4">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Vissza</span>
        </motion.button>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-center mt-4 gradient-text"
        >
          FELADATOK
        </motion.h1>
      </div>

      {/* Day type indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 px-4 mb-4"
      >
        <div
          className={`glass-card p-3 flex items-center justify-center gap-2 ${
            weekend ? "border-amber-500/50" : "border-primary/50"
          }`}
        >
          <Calendar className={`w-5 h-5 ${weekend ? "text-amber-400" : "text-primary"}`} />
          <span className={`font-semibold ${weekend ? "text-amber-400" : "text-primary"}`}>
            {weekend ? "Hétvégi mód" : "Hétköznapi mód"}
          </span>
          <span className="text-muted-foreground text-sm">
            ({maxTasks} feladat / {rewardPerTask} USDT)
          </span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 px-4"
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card p-4 text-center">
            <span className="text-muted-foreground text-sm">Mai kereset</span>
            <p className="text-2xl font-bold text-foreground mt-1">
              {todayEarnings.toFixed(2)}
            </p>
            <span className="text-xs text-muted-foreground">USDT</span>
          </div>
          <div className="glass-card p-4 text-center">
            <span className="text-muted-foreground text-sm">Jutalom/feladat</span>
            <p className="text-2xl font-bold text-primary mt-1">
              {rewardPerTask.toFixed(2)}
            </p>
            <span className="text-xs text-muted-foreground">
              {levelConfig.name}
            </span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 px-4 mt-4"
      >
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold">Haladás</span>
            <span className="text-primary font-bold">
              {completedToday}/{maxTasks}
            </span>
          </div>
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-profit"
              animate={{
                width: isWorking
                  ? `${progress}%`
                  : `${(completedToday / maxTasks) * 100}%`,
              }}
            />
          </div>

          <AnimatePresence>
            {isWorking && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-6 text-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-primary border-t-transparent"
                />
                <p
                  className="text-lg font-semibold"
                  style={{ color: brands[currentBrandIndex].color === "#000000" ? "#fff" : brands[currentBrandIndex].color }}
                >
                  {brands[currentBrandIndex].name}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  APP promóció feldolgozás...
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            onClick={handleStartWork}
            disabled={isWorking || completedToday >= maxTasks}
            className="w-full mt-6 bg-gradient-to-r from-primary to-cyan-400 text-primary-foreground font-bold py-6 text-lg"
          >
            {isWorking ? (
              "Dolgozik..."
            ) : completedToday >= maxTasks ? (
              <span className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Mai feladatok kész!
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                INDÍTÁS
              </span>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Expected daily income */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 px-4 mt-4"
      >
        <div className="glass-card p-4 bg-gradient-to-r from-profit/10 to-primary/10 border-profit/30">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Várható napi bevétel:</span>
            <span className="text-xl font-bold text-profit">
              {(maxTasks * rewardPerTask).toFixed(2)} USDT
            </span>
          </div>
        </div>
      </motion.div>

      <BottomNav />
    </div>
  );
};

export default Tasks;
