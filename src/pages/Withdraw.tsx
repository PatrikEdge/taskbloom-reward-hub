import { motion } from "framer-motion";
import { ChevronLeft, Wallet, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/dashboard/BottomNav";

const MIN_WITHDRAWAL = 20;

const Withdraw = () => {
  const navigate = useNavigate();
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const availableBalance = profile?.available_balance ?? 0;

  const handleWithdraw = async () => {
    if (!profile?.user_id) return;
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount) || numAmount < MIN_WITHDRAWAL) {
      toast({ 
        title: "Minimum összeg", 
        description: `A minimum kivétel összeg $${MIN_WITHDRAWAL}`, 
        variant: "destructive" 
      });
      return;
    }

    if (numAmount > availableBalance) {
      toast({ 
        title: "Nincs elegendő egyenleg", 
        variant: "destructive" 
      });
      return;
    }

    if (!walletAddress.trim()) {
      toast({ 
        title: "Tárca cím szükséges", 
        variant: "destructive" 
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("transactions").insert({
        user_id: profile.user_id,
        type: "withdrawal",
        amount: numAmount,
        wallet_address: walletAddress.trim(),
      });

      if (error) throw error;

      toast({ 
        title: "Kivétel kérelem elküldve!", 
        description: "Az admin jóváhagyása után a kifizetés megtörténik." 
      });
      setAmount("");
      setWalletAddress("");
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
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-profit/10 blur-3xl" />
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
          className="text-2xl font-bold text-center mt-4 gradient-text-green"
        >
          KIVÉTEL
        </motion.h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 px-4 space-y-4"
      >
        {/* Balance card */}
        <div className="glass-card p-4 bg-profit/5 border-profit/30">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Elérhető egyenleg:</span>
            <span className="text-2xl font-bold text-profit">
              ${availableBalance.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Minimum info */}
        <div className="flex items-center gap-2 text-amber-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>Minimum kivétel: ${MIN_WITHDRAWAL} USDT</span>
        </div>

        {/* Wallet address input */}
        <div className="glass-card p-4">
          <label className="block text-sm font-medium mb-2">
            <Wallet className="w-4 h-4 inline mr-2" />
            Tárca cím (USDT TRC20)
          </label>
          <Input
            type="text"
            placeholder="TXyz..."
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
          />
        </div>

        {/* Amount input */}
        <div className="glass-card p-4">
          <label className="block text-sm font-medium mb-2">Kivételi összeg (USDT)</label>
          <Input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={MIN_WITHDRAWAL}
            max={availableBalance}
            className="text-lg"
          />
          
          {/* Quick amounts */}
          <div className="flex gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAmount(MIN_WITHDRAWAL.toString())}
              className="flex-1"
            >
              Min (${MIN_WITHDRAWAL})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAmount(Math.floor(availableBalance / 2).toString())}
              className="flex-1"
            >
              50%
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAmount(Math.floor(availableBalance).toString())}
              className="flex-1"
            >
              Max
            </Button>
          </div>
        </div>

        <Button
          onClick={handleWithdraw}
          disabled={loading || !amount || !walletAddress}
          className="w-full bg-gradient-to-r from-profit to-green-400 text-primary-foreground font-bold py-6 text-lg"
        >
          {loading ? "Feldolgozás..." : "Kivétel kérelem"}
        </Button>
      </motion.div>

      <BottomNav />
    </div>
  );
};

export default Withdraw;
