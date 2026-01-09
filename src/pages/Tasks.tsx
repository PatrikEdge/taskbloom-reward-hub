import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Play, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/dashboard/BottomNav";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const brands = [
  { name: "Google", color: "#4285F4" },
  { name: "AliExpress", color: "#FF4747" },
  { name: "Amazon", color: "#FF9900" },
  { name: "eBay", color: "#E53238" },
  { name: "Shopify", color: "#96BF48" },
  { name: "Temu", color: "#FB7701" },
];

const levelConfig: Record<number, { maxTasks: number; reward: number }> = {
  1: { maxTasks: 5, reward: 0.5 },
  2: { maxTasks: 10, reward: 1.0 },
  3: { maxTasks: 15, reward: 1.5 },
  4: { maxTasks: 20, reward: 2.0 },
  5: { maxTasks: 25, reward: 2.5 },
};

const Tasks = () => {
  const navigate = useNavigate();
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [isWorking, setIsWorking] = useState(false);
  const [currentBrandIndex, setCurrentBrandIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [completedToday, setCompletedToday] = useState(0);
  const [todayEarnings, setTodayEarnings] = useState(0);

  const userLevel = profile?.level ?? 1;
  const config = levelConfig[userLevel] ?? levelConfig[1];

  useEffect(() => {
    const fetchTodayStats = async () => {
      if (!profile?.user_id) return;
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase.from("task_completions").select("tasks_completed, earnings").eq("user_id", profile.user_id).eq("completed_at", today).maybeSingle();
      if (data) { setCompletedToday(data.tasks_completed); setTodayEarnings(Number(data.earnings)); }
    };
    fetchTodayStats();
  }, [profile?.user_id]);

  useEffect(() => {
    if (!isWorking) return;
    const brandInterval = setInterval(() => setCurrentBrandIndex((p) => (p + 1) % brands.length), 1500);
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) { clearInterval(progressInterval); clearInterval(brandInterval); completeTask(); return 100; }
        return prev + 8.33;
      });
    }, 1000);
    return () => { clearInterval(brandInterval); clearInterval(progressInterval); };
  }, [isWorking]);

  const completeTask = async () => {
    if (!profile?.user_id) return;
    const today = new Date().toISOString().split("T")[0];
    const newCompleted = completedToday + 1;
    const newEarnings = todayEarnings + config.reward;

    const { data: existing } = await supabase.from("task_completions").select("id").eq("user_id", profile.user_id).eq("completed_at", today).maybeSingle();
    if (existing) { await supabase.from("task_completions").update({ tasks_completed: newCompleted, earnings: newEarnings }).eq("id", existing.id); }
    else { await supabase.from("task_completions").insert({ user_id: profile.user_id, completed_at: today, tasks_completed: newCompleted, earnings: newEarnings }); }

    await supabase.from("profiles").update({
      available_balance: (profile.available_balance ?? 0) + config.reward,
      total_balance: (profile.total_balance ?? 0) + config.reward,
      today_commission: (profile.today_commission ?? 0) + config.reward,
      total_revenue: (profile.total_revenue ?? 0) + config.reward,
    }).eq("user_id", profile.user_id);

    setCompletedToday(newCompleted); setTodayEarnings(newEarnings); setIsWorking(false); setProgress(0);
    await refreshProfile();
    toast({ title: "Task kész!", description: `+${config.reward.toFixed(2)} USDT` });
  };

  const handleStartWork = () => {
    if (completedToday >= config.maxTasks) { toast({ title: "Napi limit elérve", variant: "destructive" }); return; }
    setIsWorking(true); setProgress(0);
  };

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative overflow-hidden pb-24">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-cyan-glow/10 blur-3xl" />
      </div>

      <div className="relative z-10 p-4">
        <motion.button initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} onClick={() => navigate("/")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-5 h-5" /><span>Vissza</span>
        </motion.button>
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold text-center mt-4 gradient-text">TASKOK</motion.h1>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 px-4 mt-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card p-4 text-center">
            <span className="text-muted-foreground text-sm">Mai kereset</span>
            <p className="text-2xl font-bold text-foreground mt-1">{todayEarnings.toFixed(2)}</p>
            <span className="text-xs text-muted-foreground">USDT</span>
          </div>
          <div className="glass-card p-4 text-center">
            <span className="text-muted-foreground text-sm">Jutalom/task</span>
            <p className="text-2xl font-bold text-primary mt-1">{config.reward.toFixed(2)}</p>
            <span className="text-xs text-muted-foreground">Lv.{userLevel}</span>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="relative z-10 px-4 mt-4">
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold">Haladás</span>
            <span className="text-primary font-bold">{completedToday}/{config.maxTasks}</span>
          </div>
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-primary to-profit" animate={{ width: isWorking ? `${progress}%` : `${(completedToday / config.maxTasks) * 100}%` }} />
          </div>

          <AnimatePresence>
            {isWorking && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-6 text-center">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-lg font-semibold" style={{ color: brands[currentBrandIndex].color }}>{brands[currentBrandIndex].name}</p>
                <p className="text-sm text-muted-foreground mt-2">Feldolgozás...</p>
              </motion.div>
            )}
          </AnimatePresence>

          <Button onClick={handleStartWork} disabled={isWorking || completedToday >= config.maxTasks} className="w-full mt-6 bg-gradient-to-r from-primary to-cyan-400 text-primary-foreground font-bold py-6 text-lg">
            {isWorking ? "Dolgozik..." : completedToday >= config.maxTasks ? (<span className="flex items-center gap-2"><CheckCircle className="w-5 h-5" />Kész!</span>) : (<span className="flex items-center gap-2"><Play className="w-5 h-5" />INDÍTÁS</span>)}
          </Button>
        </div>
      </motion.div>

      <BottomNav />
    </div>
  );
};

export default Tasks;
