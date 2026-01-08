import { motion } from "framer-motion";
import { Users, Receipt, ChevronRight, Star } from "lucide-react";

interface MenuItem {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: string;
}

const menuItems: MenuItem[] = [
  {
    icon: <Star className="w-6 h-6 text-yellow-400" />,
    title: "csapat",
    subtitle: "Saját tulajdonú kép\nBagi Balázs.",
  },
  {
    icon: <Receipt className="w-6 h-6 text-orange-400" />,
    title: "számla",
  },
];

const MenuSection = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="mx-4 mb-24"
    >
      <div className="space-y-3">
        {menuItems.map((item, index) => (
          <motion.button
            key={item.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.98 }}
            className="w-full glass-card p-4 flex items-center gap-4 hover:border-primary/30 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
              {item.icon}
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-lg font-semibold text-foreground">
                {item.title}
              </h3>
              {item.subtitle && (
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {item.subtitle}
                </p>
              )}
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default MenuSection;
