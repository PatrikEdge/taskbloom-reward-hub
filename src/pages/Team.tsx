import { useState, useEffect, useCallback } from "react";
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
  created_at: string;
}

interface TeamData {
  level1: TeamMember[];
  level2: TeamMember[];
  level3: TeamMember[];
}

const Team = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [activeLevel, setActiveLevel] = useState(1);
  const [teamData, setTeamData] = useState<TeamData>({
    level1: [],
    level2: [],
    level3: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchTeam = useCallback(async () => {
    if (!profile?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Fetch Level 1 team members (direct invitees) - using secure view
      const { data: level1, error: l1Error } = await supabase
        .from("team_members_public")
        .select("id, email, level, is_vip, created_at")
        .eq("invited_by", profile.id);

      if (l1Error) throw l1Error;

      const level1Members = (level1 ?? []) as TeamMember[];
      const level1Ids = level1Members.map((m) => m.id);

      // Fetch Level 2 team members
      let level2Members: TeamMember[] = [];
      if (level1Ids.length > 0) {
        const { data: level2, error: l2Error } = await supabase
          .from("team_members_public")
          .select("id, email, level, is_vip, created_at")
          .in("invited_by", level1Ids);
        if (l2Error) throw l2Error;
        level2Members = (level2 ?? []) as TeamMember[];
      }

      const level2Ids = level2Members.map((m) => m.id);

      // Fetch Level 3 team members
      let level3Members: TeamMember[] = [];
      if (level2Ids.length > 0) {
        const { data: level3, error: l3Error } = await supabase
          .from("team_members_public")
          .select("id, email, level, is_vip, created_at")
          .in("invited_by", level2Ids);
        if (l3Error) throw l3Error;
        level3Members = (level3 ?? []) as TeamMember[];
      }

      setTeamData({
        level1: level1Members,
        level2: level2Members,
        level3: level3Members,
      });
    } catch (error) {
      console.error("Error fetching team:", error);
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

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

  const getCurrentMembers = () => {
    if (activeLevel === 1) return teamData.level1;
    if (activeLevel === 2) return teamData.level2;
    return teamData.level3;
  };

  const teamStats = {
    level1Count: teamData.level1.length,
    level2Count: teamData.level2.length,
    level3Count: teamData.level3.length,
    totalTeam: teamData.level1.length + teamData.level2.length + teamData.level3.length,
  };

  const teamMembers = getCurrentMembers();

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative overflow-hidden pb-24">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Csapatom</h1>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      {/* Invite code banner */}
      <div className="relative z-10 px-4 mb-4">
        <div className="glass-card p-4 bg-gradient-to-r from-primary/20 to-profit/20 border-primary/30">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-muted-foreground">Meghívó kódod:</span>
              <p className="text-xl font-mono font-bold text-foreground">
                {profile?.invite_code || "Nincs"}
              </p>
            </div>
            <button
              onClick={copyInviteCode}
              disabled={!profile?.invite_code}
              className="p-3 rounded-lg bg-primary/20 hover:bg-primary/30 transition-colors disabled:opacity-50"
            >
              <Copy className="w-5 h-5 text-primary" />
            </button>
          </div>
        </div>
      </div>

      {/* Commission stats */}
      <div className="relative z-10 px-4">
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
      </div>

      {/* Level tabs */}
      <div className="relative z-10 px-4 mt-4">
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
      </div>

      {/* Team members list */}
      <div className="relative z-10 px-4 mt-4">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">
          {activeLevel}. szintű meghívottak
        </h3>
        {loading ? (
          <div className="glass-card p-8 text-center">
            <div className="w-8 h-8 mx-auto mb-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Team;
