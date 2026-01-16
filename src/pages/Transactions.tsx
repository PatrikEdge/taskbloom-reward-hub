import { useState, useEffect } from "react";
import { ChevronLeft, ArrowDownCircle, ArrowUpCircle, Clock, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "@/components/dashboard/BottomNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Transaction {
  id: string;
  type: "deposit" | "withdrawal";
  amount: number;
  wallet_address: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  processed_at: string | null;
}

const Transactions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setTransactions(data as Transaction[]);
    }
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-amber-400" />;
      case "approved":
        return <CheckCircle className="w-4 h-4 text-profit" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Függőben";
      case "approved":
        return "Jóváhagyva";
      case "rejected":
        return "Elutasítva";
      default:
        return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-500/20 text-amber-400";
      case "approved":
        return "bg-profit/20 text-profit";
      case "rejected":
        return "bg-destructive/20 text-destructive";
      default:
        return "bg-secondary text-muted-foreground";
    }
  };

  const deposits = transactions.filter((t) => t.type === "deposit");
  const withdrawals = transactions.filter((t) => t.type === "withdrawal");

  const renderTransactionList = (txList: Transaction[], type: "deposit" | "withdrawal") => {
    if (loading) {
      return (
        <div className="glass-card p-8 text-center">
          <div className="w-8 h-8 mx-auto mb-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground">Betöltés...</p>
        </div>
      );
    }

    if (txList.length === 0) {
      return (
        <div className="glass-card p-8 text-center">
          {type === "deposit" ? (
            <ArrowDownCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-50" />
          ) : (
            <ArrowUpCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-50" />
          )}
          <p className="text-muted-foreground">
            Még nincsenek {type === "deposit" ? "befizetéseid" : "kivételeid"}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {txList.map((tx) => (
          <div key={tx.id} className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {type === "deposit" ? (
                  <ArrowDownCircle className="w-5 h-5 text-cyan-400" />
                ) : (
                  <ArrowUpCircle className="w-5 h-5 text-profit" />
                )}
                <span className="font-semibold">
                  {type === "deposit" ? "Befizetés" : "Kivétel"}
                </span>
              </div>
              <span className={`text-lg font-bold ${type === "deposit" ? "text-cyan-400" : "text-profit"}`}>
                {type === "deposit" ? "+" : "-"}${tx.amount.toFixed(2)}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {new Date(tx.created_at).toLocaleString("hu-HU")}
              </span>
              <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusClass(tx.status)}`}>
                {getStatusIcon(tx.status)}
                {getStatusText(tx.status)}
              </span>
            </div>

            {type === "withdrawal" && (
              <div className="mt-2 pt-2 border-t border-border/50">
                <p className="text-xs text-muted-foreground">
                  Cím: <span className="font-mono">{tx.wallet_address}</span>
                </p>
              </div>
            )}

            {tx.processed_at && (
              <p className="text-xs text-muted-foreground mt-1">
                Feldolgozva: {new Date(tx.processed_at).toLocaleString("hu-HU")}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative overflow-hidden pb-24">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
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
          TRANZAKCIÓK
        </h1>
      </div>

      {/* Summary cards */}
      <div className="relative z-10 px-4 mb-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card p-4 text-center">
            <ArrowDownCircle className="w-6 h-6 mx-auto text-cyan-400 mb-2" />
            <p className="text-xl font-bold">{deposits.length}</p>
            <p className="text-xs text-muted-foreground">Befizetések</p>
          </div>
          <div className="glass-card p-4 text-center">
            <ArrowUpCircle className="w-6 h-6 mx-auto text-profit mb-2" />
            <p className="text-xl font-bold">{withdrawals.length}</p>
            <p className="text-xs text-muted-foreground">Kivételek</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 px-4">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              Összes ({transactions.length})
            </TabsTrigger>
            <TabsTrigger value="deposits">
              Befizetés ({deposits.length})
            </TabsTrigger>
            <TabsTrigger value="withdrawals">
              Kivétel ({withdrawals.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            {loading ? (
              <div className="glass-card p-8 text-center">
                <div className="w-8 h-8 mx-auto mb-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <p className="text-muted-foreground">Betöltés...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                <p className="text-muted-foreground">Még nincsenek tranzakcióid</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div key={tx.id} className="glass-card p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {tx.type === "deposit" ? (
                          <ArrowDownCircle className="w-5 h-5 text-cyan-400" />
                        ) : (
                          <ArrowUpCircle className="w-5 h-5 text-profit" />
                        )}
                        <span className="font-semibold">
                          {tx.type === "deposit" ? "Befizetés" : "Kivétel"}
                        </span>
                      </div>
                      <span className={`text-lg font-bold ${tx.type === "deposit" ? "text-cyan-400" : "text-profit"}`}>
                        {tx.type === "deposit" ? "+" : "-"}${tx.amount.toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {new Date(tx.created_at).toLocaleString("hu-HU")}
                      </span>
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusClass(tx.status)}`}>
                        {getStatusIcon(tx.status)}
                        {getStatusText(tx.status)}
                      </span>
                    </div>

                    {tx.type === "withdrawal" && (
                      <div className="mt-2 pt-2 border-t border-border/50">
                        <p className="text-xs text-muted-foreground">
                          Cím: <span className="font-mono">{tx.wallet_address}</span>
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="deposits" className="mt-4">
            {renderTransactionList(deposits, "deposit")}
          </TabsContent>

          <TabsContent value="withdrawals" className="mt-4">
            {renderTransactionList(withdrawals, "withdrawal")}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
};

export default Transactions;
