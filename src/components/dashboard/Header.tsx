import { Bell, Copy, Crown } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { getLevelConfig } from "@/lib/levelConfig";

const Header = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [countdown, setCountdown] = useState({
    days: 365,
    hours: 0,
    minutes: 0,
  });

  useEffect(() => {
    // Calculate countdown from contract start date (1 year)
    if (profile?.contract_start_date) {
      const startDate = new Date(profile.contract_start_date);
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 1);
      
      const updateCountdown = () => {
        const now = new Date();
        const diff = endDate.getTime() - now.getTime();
        
        if (diff > 0) {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          setCountdown({ days, hours, minutes });
        }
      };
      
      updateCountdown();
      const timer = setInterval(updateCountdown, 60000);
      return () => clearInterval(timer);
    }
  }, [profile?.contract_start_date]);

  const copyInviteCode = () => {
    if (profile?.invite_code) {
      navigator.clipboard.writeText(profile.invite_code);
      toast({
        title: "Másolva!",
        description: "A meghívó kód a vágólapra került",
      });
    }
  };

  const userLevel = profile?.level ?? 0;
  const isVip = profile?.is_vip ?? false;
  const levelConfig = getLevelConfig(userLevel, isVip);

  const getInitials = (email: string | null | undefined) => {
    if (!email) return "??";
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <header className="px-4 pt-4 pb-2">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-glow to-primary flex items-center justify-center glow-cyan">
            <span className="text-primary-foreground font-bold text-lg">T</span>
          </div>
          <span className="text-xl font-bold text-foreground">WTQ Mining</span>
        </div>
        <button className="relative p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-profit rounded-full" />
        </button>
      </div>

      {/* Profile section */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-glow to-primary p-0.5">
              <div className="w-full h-full rounded-full bg-navy-dark flex items-center justify-center">
                <span className="text-cyan-glow font-bold text-xl">
                  {getInitials(profile?.email)}
                </span>
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-profit rounded text-[10px] font-bold text-accent-foreground flex items-center gap-0.5">
              {isVip && <Crown className="w-2.5 h-2.5" />}
              {levelConfig.name}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-foreground truncate max-w-[140px]">
                {profile?.email ?? "..."}
              </span>
              <span className="text-muted-foreground">→</span>
              <span className={`font-semibold flex items-center gap-1 flex-shrink-0 ${isVip ? "text-amber-400" : "text-profit"}`}>
                {isVip && <Crown className="w-3 h-3" />}
                {levelConfig.name}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground">Meghívó kód:</span>
              <span className="text-sm text-foreground font-mono">
                {profile?.invite_code ?? "..."}
              </span>
              {profile?.invite_code && (
                <button
                  onClick={copyInviteCode}
                  className="p-1 hover:bg-secondary rounded"
                >
                  <Copy className="w-3.5 h-3.5 text-cyan-glow" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Countdown */}
        <div className="mt-4 pt-3 border-t border-border/50">
          <p className="text-center text-sm text-muted-foreground">
            Visszaszámlálás{" "}
            <span className="text-cyan-glow font-semibold">
              {countdown.days} Nap {countdown.hours.toString().padStart(2, "0")}{" "}
              Óra {countdown.minutes.toString().padStart(2, "0")} Perc
            </span>
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;
