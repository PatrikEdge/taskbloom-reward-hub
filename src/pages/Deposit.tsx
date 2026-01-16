import { ChevronLeft, Copy, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/dashboard/BottomNav";

// Company wallet address for deposits
const DEPOSIT_WALLET = "TXyz1234567890AbCdEfGhIjKlMnOpQrS";

const Deposit = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const copyWallet = () => {
    navigator.clipboard.writeText(DEPOSIT_WALLET);
    toast({ title: "Másolva!", description: "A tárca cím a vágólapra került" });
  };

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative overflow-hidden pb-24">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-cyan-glow/10 blur-3xl" />
      </div>

      <div className="relative z-10 p-4">
        <button
          onClick={() => navigate("/profile")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Vissza</span>
        </button>
        
        <h1 className="text-2xl font-bold text-center mt-4 gradient-text">
          BEFIZETÉS
        </h1>
      </div>

      <div className="relative z-10 px-4 space-y-4">
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
            <button
              onClick={copyWallet}
              className="p-2 hover:bg-secondary rounded-lg ml-2 flex-shrink-0"
            >
              <Copy className="w-4 h-4 text-primary" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            Küldje el a USDT-t erre a címre. A befizetés automatikusan jóváírásra kerül az admin jóváhagyása után.
          </p>
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

        <div className="glass-card p-4 bg-amber-500/10 border-amber-500/30">
          <p className="text-sm text-center text-amber-400">
            ⚠️ Csak USDT TRC20 hálózaton fogadunk befizetést!
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Deposit;
