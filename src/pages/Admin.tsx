import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Users, ArrowDownCircle, ArrowUpCircle, CheckCircle, XCircle, Crown, ChevronDown, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getLevelConfig } from "@/lib/levelConfig";

interface Transaction {
  id: string;
  user_id: string;
  type: "deposit" | "withdrawal";
  amount: number;
  wallet_address: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  user_email?: string;
}

interface UserProfile {
  id: string;
  user_id: string;
  email: string | null;
  level: number;
  is_vip: boolean;
  total_balance: number;
  available_balance: number;
  locked_deposit: number;
  invite_code: string;
  invited_by: string | null;
  created_at: string;
}

interface TeamMember extends UserProfile {
  children?: TeamMember[];
}

const Admin = () => {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [teamStructure, setTeamStructure] = useState<Map<string, UserProfile[]>>(new Map());

  useEffect(() => {
    checkAdmin();
  }, [user]);

  const checkAdmin = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    
    if (data) {
      setIsAdmin(true);
      await Promise.all([fetchTransactions(), fetchUsers()]);
    }
    setLoading(false);
  };

  const fetchTransactions = async () => {
    const { data: txData } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (txData) {
      // Fetch emails for each transaction
      const txWithEmails = await Promise.all(
        txData.map(async (tx) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("email")
            .eq("user_id", tx.user_id)
            .maybeSingle();
          return { ...tx, user_email: profile?.email };
        })
      );
      setTransactions(txWithEmails as Transaction[]);
    }
  };

  const fetchUsers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) {
      setUsers(data as UserProfile[]);
      
      // Build team structure
      const structure = new Map<string, UserProfile[]>();
      data.forEach((user) => {
        if (user.invited_by) {
          const existing = structure.get(user.invited_by) || [];
          existing.push(user as UserProfile);
          structure.set(user.invited_by, existing);
        }
      });
      setTeamStructure(structure);
    }
  };

  const processTransaction = async (txId: string, type: "deposit" | "withdrawal", approved: boolean) => {
    try {
      const funcName = type === "deposit" ? "process_deposit" : "process_withdrawal";
      const { error } = await supabase.rpc(funcName, {
        _transaction_id: txId,
        _approved: approved,
      });

      if (error) throw error;

      toast({
        title: approved ? "Jóváhagyva" : "Elutasítva",
        description: `Tranzakció ${approved ? "sikeresen jóváhagyva" : "elutasítva"}`,
      });
      
      await fetchTransactions();
      await fetchUsers();
    } catch (error: any) {
      toast({ title: "Hiba", description: error.message, variant: "destructive" });
    }
  };

  const toggleUserExpand = (userId: string) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  const renderUserTeam = (user: UserProfile, depth: number = 0) => {
    const children = teamStructure.get(user.id) || [];
    const hasChildren = children.length > 0;
    const isExpanded = expandedUsers.has(user.id);
    const levelConfig = getLevelConfig(user.level, user.is_vip);

    return (
      <div key={user.id} style={{ marginLeft: depth * 20 }}>
        <div
          className={`flex items-center gap-2 p-2 rounded-lg ${depth === 0 ? "bg-secondary/50" : "bg-secondary/20"} mb-1`}
        >
          {hasChildren ? (
            <button onClick={() => toggleUserExpand(user.id)} className="p-1">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          ) : (
            <span className="w-6" />
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{user.email}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded ${user.is_vip ? "bg-amber-500/20 text-amber-400" : "bg-primary/20 text-primary"}`}>
                {user.is_vip && <Crown className="w-3 h-3 inline mr-1" />}
                {levelConfig.name}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              Egyenleg: ${user.total_balance.toFixed(2)} | Csapat: {children.length} fő
            </div>
          </div>
        </div>
        {isExpanded && children.map((child) => renderUserTeam(child, depth + 1))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Betöltés...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive text-lg mb-4">Nincs hozzáférésed az admin panelhez.</p>
          <Button onClick={() => navigate("/")}>Vissza a főoldalra</Button>
        </div>
      </div>
    );
  }

  const pendingDeposits = transactions.filter((t) => t.type === "deposit" && t.status === "pending");
  const pendingWithdrawals = transactions.filter((t) => t.type === "withdrawal" && t.status === "pending");
  const rootUsers = users.filter((u) => !u.invited_by);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Vissza</span>
        </motion.button>

        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold gradient-text mb-6"
        >
          ADMIN PANEL
        </motion.h1>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="glass-card p-4 text-center">
            <Users className="w-6 h-6 mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold">{users.length}</p>
            <p className="text-sm text-muted-foreground">Felhasználók</p>
          </div>
          <div className="glass-card p-4 text-center">
            <ArrowDownCircle className="w-6 h-6 mx-auto text-cyan-400 mb-2" />
            <p className="text-2xl font-bold">{pendingDeposits.length}</p>
            <p className="text-sm text-muted-foreground">Függő befizetés</p>
          </div>
          <div className="glass-card p-4 text-center">
            <ArrowUpCircle className="w-6 h-6 mx-auto text-profit mb-2" />
            <p className="text-2xl font-bold">{pendingWithdrawals.length}</p>
            <p className="text-sm text-muted-foreground">Függő kivétel</p>
          </div>
        </div>

        <Tabs defaultValue="deposits" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="deposits">
              Befizetések ({pendingDeposits.length})
            </TabsTrigger>
            <TabsTrigger value="withdrawals">
              Kivételek ({pendingWithdrawals.length})
            </TabsTrigger>
            <TabsTrigger value="users">Felhasználók</TabsTrigger>
            <TabsTrigger value="team">Csapat struktúra</TabsTrigger>
          </TabsList>

          <TabsContent value="deposits" className="space-y-3 mt-4">
            {pendingDeposits.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nincs függő befizetés</p>
            ) : (
              pendingDeposits.map((tx) => (
                <div key={tx.id} className="glass-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{tx.user_email}</span>
                    <span className="text-xl font-bold text-primary">${tx.amount}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    {new Date(tx.created_at).toLocaleString("hu-HU")}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => processTransaction(tx.id, "deposit", true)}
                      className="flex-1 bg-profit hover:bg-profit/80"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" /> Jóváhagy
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => processTransaction(tx.id, "deposit", false)}
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-1" /> Elutasít
                    </Button>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="withdrawals" className="space-y-3 mt-4">
            {pendingWithdrawals.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nincs függő kivétel</p>
            ) : (
              pendingWithdrawals.map((tx) => (
                <div key={tx.id} className="glass-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{tx.user_email}</span>
                    <span className="text-xl font-bold text-profit">${tx.amount}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Cím: {tx.wallet_address}
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    {new Date(tx.created_at).toLocaleString("hu-HU")}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => processTransaction(tx.id, "withdrawal", true)}
                      className="flex-1 bg-profit hover:bg-profit/80"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" /> Jóváhagy
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => processTransaction(tx.id, "withdrawal", false)}
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-1" /> Elutasít
                    </Button>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="users" className="mt-4">
            <div className="space-y-2">
              {users.map((user) => {
                const levelConfig = getLevelConfig(user.level, user.is_vip);
                return (
                  <div key={user.id} className="glass-card p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{user.email}</span>
                          <span className={`text-xs px-2 py-0.5 rounded ${user.is_vip ? "bg-amber-500/20 text-amber-400" : "bg-primary/20 text-primary"}`}>
                            {user.is_vip && <Crown className="w-3 h-3 inline mr-1" />}
                            {levelConfig.name}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Kód: {user.invite_code} | Regisztrált: {new Date(user.created_at).toLocaleDateString("hu-HU")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${user.total_balance.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">
                          Zárolva: ${user.locked_deposit.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="team" className="mt-4">
            <div className="glass-card p-4">
              {rootUsers.map((user) => renderUserTeam(user))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
