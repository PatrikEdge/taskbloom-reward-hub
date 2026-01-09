import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Users, Wallet, TrendingUp } from "lucide-react";
import BottomNav from "@/components/dashboard/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface TeamMember {
  id: string;
  email: string | null;
  level: number;
  total_commission: number;
  created_at: string;
}

const Team = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [activeLevel, setActiveLevel] = useState(1);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      if (!profile?.id) return;
      
      const { data } = await supabase
        .from("profiles")
        .select("id, email, level, total_commission, created_at")
        .eq("invited_by", profile.id);

      if (data) setTeamMembers(data as TeamMember[]);
      setLoading(false);
    };

    fetchTeam();
  }, [profile?.id]);

  const teamSize = teamMembers.length;
  const totalCommission = profile?.total_commission ?? 0;

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

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 px-4 mt-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-pink-400" />
              <span className="text-xs text-muted-foreground">Összes jutalék</span>
            </div>
            <span className="text-xl font-bold text-foreground">{totalCommission.toFixed(2)} USDT</span>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="w-5 h-5 text-emerald-400" />
              <span className="text-xs text-muted-foreground">Csapat méret</span>
            </div>
            <span className="text-xl font-bold text-foreground">{teamSize}</span>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="relative z-10 px-4 mt-4">
        <div className="flex gap-2">
          {[1, 2, 3].map((level) => (
            <button
              key={level}
              onClick={() => setActiveLevel(level)}
              className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                activeLevel === level ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" : "bg-secondary text-muted-foreground"
              }`}
            >
              Lv.{level}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="relative z-10 px-4 mt-4">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">Meghívottak</h3>
        {loading ? (
          <div className="glass-card p-8 text-center"><p className="text-muted-foreground">Betöltés...</p></div>
        ) : teamMembers.length === 0 ? (
          <div className="glass-card p-8 text-center"><p className="text-muted-foreground">Még nincsenek meghívottaid</p></div>
        ) : (
          <div className="space-y-2">
            {teamMembers.map((member) => (
              <div key={member.id} className="glass-card p-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold truncate max-w-[150px]">{member.email ?? "Ismeretlen"}</p>
                  <p className="text-xs text-muted-foreground">{new Date(member.created_at).toLocaleDateString("hu-HU")}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-primary">Lv.{member.level}</p>
                  <p className="text-xs text-profit">+{member.total_commission.toFixed(2)} USDT</p>
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
