import { Bell, Copy } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const Header = () => {
  const [countdown, setCountdown] = useState({
    days: 219,
    hours: 7,
    minutes: 54,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        let { days, hours, minutes } = prev;
        minutes--;
        if (minutes < 0) {
          minutes = 59;
          hours--;
        }
        if (hours < 0) {
          hours = 23;
          days--;
        }
        return { days, hours, minutes };
      });
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const copyInviteCode = () => {
    navigator.clipboard.writeText("619***73");
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="px-4 pt-4 pb-2"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-glow to-primary flex items-center justify-center glow-cyan">
            <span className="text-primary-foreground font-bold text-lg">T</span>
          </div>
          <span className="text-xl font-bold text-foreground">taskminer.io</span>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-profit rounded-full" />
        </motion.button>
      </div>

      {/* Profile section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="glass-card p-4"
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-glow to-primary p-0.5">
              <div className="w-full h-full rounded-full bg-navy-dark flex items-center justify-center">
                <span className="text-cyan-glow font-bold text-xl">SL</span>
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-profit rounded text-[10px] font-bold text-accent-foreground">
              v.2
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-foreground">
                367***99338
              </span>
              <span className="text-muted-foreground">→</span>
              <span className="text-profit font-semibold">slv.2</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground">Meghívó kód:</span>
              <span className="text-sm text-foreground">619***73</span>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={copyInviteCode}
                className="p-1 hover:bg-secondary rounded"
              >
                <Copy className="w-3.5 h-3.5 text-cyan-glow" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Countdown */}
        <div className="mt-4 pt-3 border-t border-border/50">
          <p className="text-center text-sm text-muted-foreground">
            Visszaszámlálás{" "}
            <span className="text-cyan-glow font-semibold">
              {countdown.days} Nap {countdown.hours.toString().padStart(2, "0")}{" "}
              Óra {countdown.minutes.toString().padStart(2, "0")} Perc
            </span>
          </p>
        </div>
      </motion.div>
    </motion.header>
  );
};

export default Header;
