import { useNavigate } from "react-router-dom";
import Header from "@/components/dashboard/Header";
import BalanceCard from "@/components/dashboard/BalanceCard";
import BottomNav from "@/components/dashboard/BottomNav";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const Profile = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-cyan-glow/10 blur-3xl"
        />
        <motion.div
          animate={{
            opacity: [0.2, 0.4, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute -bottom-20 -left-40 w-80 h-80 rounded-full bg-profit/10 blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
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
        
        {/* Logout button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mx-4 mb-24"
        >
          <Button
            variant="outline"
            className="w-full"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Kijelentkezés
          </Button>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
