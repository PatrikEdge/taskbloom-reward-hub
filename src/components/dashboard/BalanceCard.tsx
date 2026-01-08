import { motion } from "framer-motion";
import { Wallet, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BalanceCardProps {
  totalBalance: number;
  availableBalance: number;
  lockedDeposit: number;
  todayCommission: number;
  totalCommission: number;
  totalWithdrawal: number;
  totalRevenue: number;
}

const BalanceCard = ({
  totalBalance = 238.18,
  availableBalance = 168.18,
  lockedDeposit = 880.0,
  todayCommission = 28,
  totalCommission = 953,
  totalWithdrawal = 1086,
  totalRevenue = 1263.18,
}: BalanceCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="mx-4 my-4"
    >
      <div className="glass-card p-6 glow-cyan animate-glow">
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <Wallet className="w-5 h-5 text-cyan-glow" />
          <h2 className="text-lg font-medium text-muted-foreground">
            a mérlegem
          </h2>
        </div>

        {/* Main balance */}
        <div className="text-center mb-6">
          <motion.p
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="text-4xl font-bold text-foreground"
          >
            {totalBalance.toFixed(2)}{" "}
            <span className="text-xl text-cyan-glow">USDT</span>
          </motion.p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <StatItem
            value={availableBalance}
            label="Rendelkezésre álló egyenleg"
            variant="default"
          />
          <StatItem
            value={lockedDeposit}
            label="lekötött betét"
            variant="accent"
          />
          <StatItem
            value={todayCommission}
            label="A mai jutalék"
            variant="default"
          />
          <StatItem
            value={totalCommission}
            label="Minden jutalék"
            variant="accent"
          />
          <StatItem
            value={totalWithdrawal}
            label="Az összes kivonás"
            variant="default"
          />
          <StatItem
            value={totalRevenue}
            label="Összes bevétel"
            variant="accent"
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-4">
          <Button variant="deposit" className="flex-1" size="lg">
            <ArrowDownCircle className="w-5 h-5" />
            Letét
          </Button>
          <Button variant="withdraw" className="flex-1" size="lg">
            <ArrowUpCircle className="w-5 h-5" />
            Pénzt felvenni
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

interface StatItemProps {
  value: number;
  label: string;
  variant: "default" | "accent";
}

const StatItem = ({ value, label, variant }: StatItemProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="text-center p-2"
    >
      <p
        className={`text-lg font-semibold ${
          variant === "accent" ? "text-profit" : "text-foreground"
        }`}
      >
        {value.toFixed(2)} USDT
      </p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </motion.div>
  );
};

export default BalanceCard;
