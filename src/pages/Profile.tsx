import { useNavigate } from "react-router-dom";
import Header from "@/components/dashboard/Header";
import BalanceCard from "@/components/dashboard/BalanceCard";
import BottomNav from "@/components/dashboard/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, ArrowDownCircle, ArrowUpCircle, Shield, History } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!data);
    };
    checkAdmin();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-cyan-glow/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-40 w-80 h-80 rounded-full bg-profit/10 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 pb-24">
        <Header />
        <BalanceCard
          totalBalance={profile?.total_balance ?? 0}
          availableBalance={profile?.available_balance ?? 0}
          lockedDeposit={profile?.locked_deposit ?? 0}
          todayCommission={profile?.today_commission ?? 0}
          totalCommission={profile?.total_commission ?? 0}
          totalWithdrawal={profile?.total_withdrawal ?? 0}
          totalRevenue={profile?.total_revenue ?? 0}
        />
        
        {/* Action buttons */}
        <div className="mx-4 mb-4 grid grid-cols-2 gap-3">
          <Button
            onClick={() => navigate("/deposit")}
            className="bg-gradient-to-r from-primary to-cyan-400 text-primary-foreground font-bold py-6"
          >
            <ArrowDownCircle className="w-5 h-5 mr-2" />
            Befizetés
          </Button>
          <Button
            onClick={() => navigate("/withdraw")}
            className="bg-gradient-to-r from-profit to-green-400 text-primary-foreground font-bold py-6"
          >
            <ArrowUpCircle className="w-5 h-5 mr-2" />
            Kivétel
          </Button>
        </div>

        {/* Transaction history button */}
        <div className="mx-4 mb-4">
          <Button
            variant="outline"
            className="w-full border-primary/50 text-primary hover:bg-primary/10"
            onClick={() => navigate("/transactions")}
          >
            <History className="w-4 h-4 mr-2" />
            Tranzakció történet
          </Button>
        </div>

        {/* Admin button */}
        {isAdmin && (
          <div className="mx-4 mb-4">
            <Button
              variant="outline"
              className="w-full border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
              onClick={() => navigate("/admin")}
            >
              <Shield className="w-4 h-4 mr-2" />
              Admin Panel
            </Button>
          </div>
        )}
        
        {/* Logout button */}
        <div className="mx-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Kijelentkezés
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
