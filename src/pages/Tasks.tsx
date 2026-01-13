import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Play, CheckCircle, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/dashboard/BottomNav";
import { useState, useEffect, useRef, useCallback } from "react";
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
  const [isCompleting, setIsCompleting] = useState(false);

  const userLevel = profile?.level ?? 0;
  const isVip = profile?.is_vip ?? false;
  const levelConfig = getLevelConfig(userLevel, isVip);
  const maxTasks = getMaxTasks(userLevel, isVip);
  const rewardPerTask = getRewardPerTask(userLevel, isVip);
  const weekend = isWeekend();

  // Use refs to store latest values for the callback
  const completedTodayRef = useRef(completedToday);
  const todayEarningsRef = useRef(todayEarnings);
  const profileRef = useRef(profile);
  const rewardPerTaskRef = useRef(rewardPerTask);

  useEffect(() => {
    completedTodayRef.current = completedToday;
  }, [completedToday]);

  useEffect(() => {
    todayEarningsRef.current = todayEarnings;
  }, [todayEarnings]);

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  useEffect(() => {
    rewardPerTaskRef.current = rewardPerTask;
  }, [rewardPerTask]);

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

  const handleCompleteTask = useCallback(async () => {
    const currentProfile = profileRef.current;
    if (!currentProfile?.user_id || isCompleting) return;

    setIsCompleting(true);
    
    try {
      const today = new Date().toISOString().split("T")[0];
      const reward = rewardPerTaskRef.current;
      const currentCompleted = completedTodayRef.current;
      const currentEarnings = todayEarningsRef.current;
      
      const newCompleted = currentCompleted + 1;
      const newEarnings = currentEarnings + reward;

      // Update task_completions
      const { data: existing } = await supabase
        .from("task_completions")
        .select("id")
        .eq("user_id", currentProfile.user_id)
        .eq("completed_at", today)
        .maybeSingle();

      if (existing) {
        const { error: updateError } = await supabase
          .from("task_completions")
          .update({ tasks_completed: newCompleted, earnings: newEarnings })
          .eq("id", existing.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase.from("task_completions").insert({
          user_id: currentProfile.user_id,
          completed_at: today,
          tasks_completed: newCompleted,
          earnings: newEarnings,
        });
        if (insertError) throw insertError;
      }

      // Update user profile balances
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          available_balance: (currentProfile.available_balance ?? 0) + reward,
          total_balance: (currentProfile.total_balance ?? 0) + reward,
          today_commission: (currentProfile.today_commission ?? 0) + reward,
          total_revenue: (currentProfile.total_revenue ?? 0) + reward,
        })
        .eq("user_id", currentProfile.user_id);
      
      if (profileError) throw profileError;

      // Distribute team commissions using the database function
      await supabase.rpc("distribute_team_commission", {
        _user_id: currentProfile.user_id,
        _task_earnings: reward,
      });

      setCompletedToday(newCompleted);
      setTodayEarnings(newEarnings);
      await refreshProfile();
      toast({ title: "Feladat kész!", description: `+${reward.toFixed(2)} USDT` });
    } catch (error) {
      console.error("Task completion error:", error);
      toast({ title: "Hiba történt", description: "Próbáld újra!", variant: "destructive" });
    } finally {
      setIsCompleting(false);
    }
  }, [refreshProfile, toast, isCompleting]);

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
  }, [isWorking, handleCompleteTask]);

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
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Vissza</span>
        </button>
        <h1 className="text-2xl font-bold text-center mt-4 gradient-text">
          FELADATOK
        </h1>
      </div>

      {/* Day type indicator */}
      <div className="relative z-10 px-4 mb-4">
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
      </div>

      <div className="relative z-10 px-4">
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
      </div>

      <div className="relative z-10 px-4 mt-4">
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold">Haladás</span>
            <span className="text-primary font-bold">
              {completedToday}/{maxTasks}
            </span>
          </div>
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-profit transition-all duration-300"
              style={{
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
            disabled={isWorking || isCompleting || completedToday >= maxTasks}
            className="w-full mt-6 bg-gradient-to-r from-primary to-cyan-400 text-primary-foreground font-bold py-6 text-lg"
          >
            {isWorking || isCompleting ? (
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
      </div>

      {/* Expected daily income */}
      <div className="relative z-10 px-4 mt-4">
        <div className="glass-card p-4 bg-gradient-to-r from-profit/10 to-primary/10 border-profit/30">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Várható napi bevétel:</span>
            <span className="text-xl font-bold text-profit">
              {(maxTasks * rewardPerTask).toFixed(2)} USDT
            </span>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Tasks;
