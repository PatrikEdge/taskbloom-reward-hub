import Header from "@/components/dashboard/Header";
import BalanceCard from "@/components/dashboard/BalanceCard";
import MenuSection from "@/components/dashboard/MenuSection";
import BottomNav from "@/components/dashboard/BottomNav";
import { motion } from "framer-motion";

const Index = () => {
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
          totalBalance={238.18}
          availableBalance={168.18}
          lockedDeposit={880.0}
          todayCommission={28}
          totalCommission={953}
          totalWithdrawal={1086}
          totalRevenue={1263.18}
        />
        <MenuSection />
      </div>

      <BottomNav />
    </div>
  );
};

export default Index;
