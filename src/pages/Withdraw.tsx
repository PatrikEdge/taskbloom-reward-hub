import { motion } from "framer-motion";
import { ChevronLeft, Wallet, AlertCircle, Clock, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/dashboard/BottomNav";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  wallet_address: string;
  created_at: string;
}

const MIN_WITHDRAWAL = 20;

const Withdraw = () => {
  const navigate = useNavigate();
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const availableBalance = profile?.available_balance ?? 0;

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!profile?.user_id) return;
      const { data } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", profile.user_id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (data) setTransactions(data);
    };
    fetchTransactions();
  }, [profile?.user_id]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4 text-profit" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Clock className="w-4 h-4 text-amber-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "Jóváhagyva";
      case "rejected":
        return "Elutasítva";
      default:
        return "Függőben";
    }
  };

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

        {/* Transaction History */}
        {transactions.length > 0 && (
          <div className="glass-card p-4 mt-6">
            <h3 className="font-semibold mb-4">Tranzakció előzmények</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(tx.status)}
                    <div>
                      <p className="text-sm font-medium">
                        {tx.type === "deposit" ? "Befizetés" : "Kivétel"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString("hu-HU")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${tx.type === "deposit" ? "text-profit" : "text-foreground"}`}>
                      {tx.type === "deposit" ? "+" : "-"}${tx.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">{getStatusText(tx.status)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      <BottomNav />
    </div>
  );
};

export default Withdraw;
