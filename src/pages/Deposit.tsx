import { motion } from "framer-motion";
import { ChevronLeft, Copy, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/dashboard/BottomNav";

// Company wallet address for deposits
const DEPOSIT_WALLET = "TRC20: TXyz1234567890AbCdEfGhIjKlMnOpQrS";

const Deposit = () => {
  const navigate = useNavigate();
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const copyWallet = () => {
    navigator.clipboard.writeText(DEPOSIT_WALLET.replace("TRC20: ", ""));
    toast({ title: "Másolva!", description: "A tárca cím a vágólapra került" });
  };

  const handleDeposit = async () => {
    if (!profile?.user_id) return;
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({ title: "Hibás összeg", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("transactions").insert({
        user_id: profile.user_id,
        type: "deposit",
        amount: numAmount,
        wallet_address: DEPOSIT_WALLET,
      });

      if (error) throw error;

      toast({ 
        title: "Befizetés elküldve!", 
        description: "Kérelem feldolgozás alatt. Az admin jóváhagyása után jóváírásra kerül." 
      });
      setAmount("");
      await refreshProfile();
    } catch (error: any) {
      toast({ title: "Hiba", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative overflow-hidden pb-24">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-cyan-glow/10 blur-3xl" />
      </div>

      <div className="relative z-10 p-4">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/profile")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Vissza</span>
        </motion.button>
        
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-center mt-4 gradient-text"
        >
          BEFIZETÉS
        </motion.h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 px-4 space-y-4"
      >
        {/* Wallet address card */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Wallet className="w-5 h-5 text-primary" />
            <span className="font-semibold">Befizetési cím (USDT TRC20)</span>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3 flex items-center justify-between">
            <code className="text-sm text-foreground break-all">
              {DEPOSIT_WALLET}
            </code>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={copyWallet}
              className="p-2 hover:bg-secondary rounded-lg ml-2 flex-shrink-0"
            >
              <Copy className="w-4 h-4 text-primary" />
            </motion.button>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            Küldje el a USDT-t erre a címre, majd adja meg az összeget alább.
          </p>
        </div>

        {/* Amount input */}
        <div className="glass-card p-4">
          <label className="block text-sm font-medium mb-2">Befizetett összeg (USDT)</label>
          <Input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="text-lg"
          />
          
          {/* Quick amounts */}
          <div className="flex gap-2 mt-3">
            {[100, 500, 1000, 3000].map((val) => (
              <Button
                key={val}
                variant="outline"
                size="sm"
                onClick={() => setAmount(val.toString())}
                className="flex-1"
              >
                ${val}
              </Button>
            ))}
          </div>
        </div>

        {/* Level info */}
        <div className="glass-card p-4 bg-primary/5 border-primary/30">
          <p className="text-sm text-muted-foreground mb-2">Szint meghatározás befizetés alapján:</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span>LV1:</span>
              <span className="text-primary">$100+</span>
            </div>
            <div className="flex justify-between">
              <span>LV2:</span>
              <span className="text-primary">$500+</span>
            </div>
            <div className="flex justify-between">
              <span>LV3:</span>
              <span className="text-primary">$1,000+</span>
            </div>
            <div className="flex justify-between">
              <span>LV4:</span>
              <span className="text-primary">$3,000+</span>
            </div>
          </div>
        </div>

        <Button
          onClick={handleDeposit}
          disabled={loading || !amount}
          className="w-full bg-gradient-to-r from-primary to-cyan-400 text-primary-foreground font-bold py-6 text-lg"
        >
          {loading ? "Feldolgozás..." : "Befizetés kérelem"}
        </Button>
      </motion.div>

      <BottomNav />
    </div>
  );
};

export default Deposit;
