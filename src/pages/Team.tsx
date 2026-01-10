import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Users, TrendingUp, Copy, Crown } from "lucide-react";
import BottomNav from "@/components/dashboard/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { COMMISSION_RATES } from "@/lib/levelConfig";

interface TeamMember {
  id: string;
  email: string | null;
  level: number;
  is_vip: boolean;
  total_commission: number;
  created_at: string;
}

interface TeamStats {
  level1Count: number;
  level2Count: number;
  level3Count: number;
  totalTeam: number;
}

const Team = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [activeLevel, setActiveLevel] = useState(1);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStats>({
    level1Count: 0,
    level2Count: 0,
    level3Count: 0,
    totalTeam: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      if (!profile?.id) return;

      // Fetch Level 1 team members (direct invitees)
      const { data: level1 } = await supabase
        .from("profiles")
        .select("id, email, level, is_vip, total_commission, created_at")
        .eq("invited_by", profile.id);

      const level1Members = (level1 ?? []) as TeamMember[];
      const level1Ids = level1Members.map((m) => m.id);

      // Fetch Level 2 team members
      let level2Members: TeamMember[] = [];
      if (level1Ids.length > 0) {
        const { data: level2 } = await supabase
          .from("profiles")
          .select("id, email, level, is_vip, total_commission, created_at")
          .in("invited_by", level1Ids);
        level2Members = (level2 ?? []) as TeamMember[];
      }

      const level2Ids = level2Members.map((m) => m.id);

      // Fetch Level 3 team members
      let level3Members: TeamMember[] = [];
      if (level2Ids.length > 0) {
        const { data: level3 } = await supabase
          .from("profiles")
          .select("id, email, level, is_vip, total_commission, created_at")
          .in("invited_by", level2Ids);
        level3Members = (level3 ?? []) as TeamMember[];
      }

      setTeamStats({
        level1Count: level1Members.length,
        level2Count: level2Members.length,
        level3Count: level3Members.length,
        totalTeam: level1Members.length + level2Members.length + level3Members.length,
      });

      // Set members based on active level
      if (activeLevel === 1) setTeamMembers(level1Members);
      else if (activeLevel === 2) setTeamMembers(level2Members);
      else setTeamMembers(level3Members);

      setLoading(false);
    };

    fetchTeam();
  }, [profile?.id, activeLevel]);

  const copyInviteCode = () => {
    if (profile?.invite_code) {
      navigator.clipboard.writeText(profile.invite_code);
      toast({
        title: "Másolva!",
        description: "A meghívó kód a vágólapra került",
      });
    }
  };

  const getCommissionRate = (level: number) => {
    if (level === 1) return COMMISSION_RATES.level1 * 100;
    if (level === 2) return COMMISSION_RATES.level2 * 100;
    return COMMISSION_RATES.level3 * 100;
  };

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative overflow-hidden pb-24">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 p-4">
        <div className="flex items-center justify-between">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
          <h1 className="text-xl font-bold">Csapatom</h1>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      {/* Invite code banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 px-4 mb-4"
      >
        <div className="glass-card p-4 bg-gradient-to-r from-primary/20 to-profit/20 border-primary/30">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-muted-foreground">Meghívó kódod:</span>
              <p className="text-xl font-mono font-bold text-foreground">
                {profile?.invite_code ?? "..."}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={copyInviteCode}
              className="p-3 rounded-lg bg-primary/20 hover:bg-primary/30 transition-colors"
            >
              <Copy className="w-5 h-5 text-primary" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Commission stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 px-4"
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-pink-400" />
              <span className="text-xs text-muted-foreground">Lv1 jutalék</span>
            </div>
            <span className="text-lg font-bold text-foreground">
              {(profile?.level1_commission ?? 0).toFixed(2)} USDT
            </span>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <span className="text-xs text-muted-foreground">Lv2 jutalék</span>
            </div>
            <span className="text-lg font-bold text-foreground">
              {(profile?.level2_commission ?? 0).toFixed(2)} USDT
            </span>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <span className="text-xs text-muted-foreground">Lv3 jutalék</span>
            </div>
            <span className="text-lg font-bold text-foreground">
              {(profile?.level3_commission ?? 0).toFixed(2)} USDT
            </span>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="w-5 h-5 text-emerald-400" />
              <span className="text-xs text-muted-foreground">Össz. csapat</span>
            </div>
            <span className="text-lg font-bold text-foreground">{teamStats.totalTeam}</span>
          </div>
        </div>
      </motion.div>

      {/* Level tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
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
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              <div className="flex flex-col items-center">
                <span>Lv.{level}</span>
                <span className="text-xs opacity-75">
                  ({level === 1 ? teamStats.level1Count : level === 2 ? teamStats.level2Count : teamStats.level3Count})
                </span>
              </div>
            </button>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-2">
          {getCommissionRate(activeLevel)}% jutalék az {activeLevel}. szintű meghívottaktól
        </p>
      </motion.div>

      {/* Team members list */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 px-4 mt-4"
      >
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">
          {activeLevel}. szintű meghívottak
        </h3>
        {loading ? (
          <div className="glass-card p-8 text-center">
            <p className="text-muted-foreground">Betöltés...</p>
          </div>
        ) : teamMembers.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-50" />
            <p className="text-muted-foreground">
              Még nincsenek {activeLevel}. szintű meghívottaid
            </p>
            {activeLevel === 1 && (
              <p className="text-sm text-primary mt-2">
                Oszd meg a meghívó kódodat, hogy csapatot építs!
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="glass-card p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {member.email?.charAt(0).toUpperCase() ?? "?"}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold truncate max-w-[120px]">
                        {member.email ?? "Ismeretlen"}
                      </p>
                      {member.is_vip && (
                        <Crown className="w-4 h-4 text-amber-400" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(member.created_at).toLocaleDateString("hu-HU")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-primary">
                    {member.is_vip ? "sLV" : "LV"}
                    {member.level}
                  </p>
                  <p className="text-xs text-profit">
                    +{member.total_commission.toFixed(2)} USDT
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <BottomNav />
    </div>
  );
};

export default Team;
