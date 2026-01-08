import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Award, ClipboardList, Users, User, Megaphone, Gift, TrendingUp, Shield } from "lucide-react";
import BottomNav from "@/components/dashboard/BottomNav";

interface QuickNavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  gradient: string;
}

const quickNavItems: QuickNavItem[] = [
  {
    icon: <ClipboardList className="w-7 h-7 text-white" />,
    label: "Taskok",
    path: "/tasks",
    gradient: "from-cyan-400 to-blue-500",
  },
  {
    icon: <Award className="w-7 h-7 text-white" />,
    label: "Szintek",
    path: "/levels",
    gradient: "from-amber-400 to-orange-500",
  },
  {
    icon: <Users className="w-7 h-7 text-white" />,
    label: "Csapatom",
    path: "/team",
    gradient: "from-purple-400 to-pink-500",
  },
  {
    icon: <User className="w-7 h-7 text-white" />,
    label: "Profil",
    path: "/profile",
    gradient: "from-emerald-400 to-teal-500",
  },
];

interface NewsItem {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  time: string;
  type: "announcement" | "reward" | "update" | "security";
}

const newsItems: NewsItem[] = [
  {
    id: 1,
    icon: <Gift className="w-5 h-5" />,
    title: "Új bónusz program!",
    description: "Regisztrálj most és kapj 50 USDT bónuszt az első befizetésedre!",
    time: "2 órája",
    type: "reward",
  },
  {
    id: 2,
    icon: <Megaphone className="w-5 h-5" />,
    title: "Rendszerkarbantartás",
    description: "Holnap 02:00-04:00 között karbantartást végzünk.",
    time: "5 órája",
    type: "announcement",
  },
  {
    id: 3,
    icon: <TrendingUp className="w-5 h-5" />,
    title: "Új szintek elérhetőek!",
    description: "Lv.6 és Lv.7 szintek mostantól elérhetőek nagyobb jutalmakkal.",
    time: "1 napja",
    type: "update",
  },
  {
    id: 4,
    icon: <Shield className="w-5 h-5" />,
    title: "Biztonsági frissítés",
    description: "Javítottuk a rendszer biztonságát. Kérjük frissítsd a jelszavad.",
    time: "2 napja",
    type: "security",
  },
];

const getTypeColor = (type: NewsItem["type"]) => {
  switch (type) {
    case "reward":
      return "text-amber-400 bg-amber-400/10";
    case "announcement":
      return "text-cyan-400 bg-cyan-400/10";
    case "update":
      return "text-emerald-400 bg-emerald-400/10";
    case "security":
      return "text-red-400 bg-red-400/10";
  }
};

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative overflow-hidden pb-24">
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

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 p-4 pt-6"
      >
        <h1 className="text-2xl font-bold gradient-text text-center">WTQ Task Mining</h1>
        <p className="text-muted-foreground text-center text-sm mt-1">Üdvözlünk vissza!</p>
      </motion.div>

      {/* Quick Navigation Circles */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 px-6 mt-6"
      >
        <div className="flex justify-between items-center">
          {quickNavItems.map((item, index) => (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center gap-2"
            >
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow`}>
                {item.icon}
              </div>
              <span className="text-xs font-medium text-foreground">{item.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* News Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 px-4 mt-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Hírek & Közlemények</h2>
          <span className="text-xs text-muted-foreground">Összes</span>
        </div>

        <div className="space-y-3">
          {newsItems.map((news, index) => (
            <motion.div
              key={news.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              whileHover={{ scale: 1.02, x: 5 }}
              className="glass-card p-4 cursor-pointer hover:border-primary/30 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getTypeColor(news.type)}`}>
                  {news.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-foreground text-sm truncate">{news.title}</h3>
                    <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">{news.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{news.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Promo Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="relative z-10 px-4 mt-6"
      >
        <div className="glass-card p-4 bg-gradient-to-r from-primary/20 to-profit/20 border-primary/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-profit flex items-center justify-center">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground">Hívd meg barátaidat!</h3>
              <p className="text-xs text-muted-foreground">Minden meghívás után 5% jutalékot kapsz.</p>
            </div>
          </div>
        </div>
      </motion.div>

      <BottomNav />
    </div>
  );
};

export default Index;
