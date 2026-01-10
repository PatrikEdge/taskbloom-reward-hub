// Level configuration based on PDF specification
// LV0 = Free tier (level 0), LV1-LV4 = Paid tiers

export interface LevelConfig {
  level: number;
  name: string;
  deposit: number; // USDT required to activate
  weekdayTasks: number;
  weekendTasks: number;
  rewardPerTask: number;
  dailyIncome: number;
  weekendIncome: number;
  vipRequiredTeam: number; // Level 1 team members needed for VIP
  color: string;
  gradient: string;
}

export interface VipLevelConfig extends LevelConfig {
  isVip: true;
}

// Regular levels (LV0-LV4)
export const regularLevels: LevelConfig[] = [
  {
    level: 0,
    name: "LV0",
    deposit: 0,
    weekdayTasks: 4,
    weekendTasks: 2,
    rewardPerTask: 1,
    dailyIncome: 4,
    weekendIncome: 2,
    vipRequiredTeam: 1,
    color: "from-slate-300 to-slate-500",
    gradient: "bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400",
  },
  {
    level: 1,
    name: "LV1",
    deposit: 200,
    weekdayTasks: 12,
    weekendTasks: 6,
    rewardPerTask: 0.5,
    dailyIncome: 6,
    weekendIncome: 3,
    vipRequiredTeam: 2,
    color: "from-sky-300 to-sky-500",
    gradient: "bg-gradient-to-br from-sky-200 via-sky-300 to-sky-400",
  },
  {
    level: 2,
    name: "LV2",
    deposit: 680,
    weekdayTasks: 20,
    weekendTasks: 10,
    rewardPerTask: 1,
    dailyIncome: 20,
    weekendIncome: 10,
    vipRequiredTeam: 3,
    color: "from-emerald-300 to-emerald-500",
    gradient: "bg-gradient-to-br from-emerald-200 via-emerald-300 to-emerald-400",
  },
  {
    level: 3,
    name: "LV3",
    deposit: 1560,
    weekdayTasks: 22,
    weekendTasks: 11,
    rewardPerTask: 2,
    dailyIncome: 44,
    weekendIncome: 22,
    vipRequiredTeam: 4,
    color: "from-amber-300 to-amber-500",
    gradient: "bg-gradient-to-br from-amber-200 via-amber-300 to-amber-400",
  },
  {
    level: 4,
    name: "LV4",
    deposit: 3600,
    weekdayTasks: 26,
    weekendTasks: 13,
    rewardPerTask: 4,
    dailyIncome: 104,
    weekendIncome: 52,
    vipRequiredTeam: 5,
    color: "from-purple-300 to-purple-500",
    gradient: "bg-gradient-to-br from-purple-200 via-purple-300 to-purple-400",
  },
];

// VIP levels (sLV0-sLV4)
export const vipLevels: LevelConfig[] = [
  {
    level: 0,
    name: "sLV0 (VIP)",
    deposit: 0,
    weekdayTasks: 5,
    weekendTasks: 3,
    rewardPerTask: 0.4,
    dailyIncome: 2,
    weekendIncome: 1,
    vipRequiredTeam: 0,
    color: "from-slate-400 to-slate-600",
    gradient: "bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500",
  },
  {
    level: 1,
    name: "sLV1 (VIP)",
    deposit: 200,
    weekdayTasks: 16,
    weekendTasks: 8,
    rewardPerTask: 0.5,
    dailyIncome: 8,
    weekendIncome: 4,
    vipRequiredTeam: 0,
    color: "from-sky-400 to-sky-600",
    gradient: "bg-gradient-to-br from-sky-300 via-sky-400 to-sky-500",
  },
  {
    level: 2,
    name: "sLV2 (VIP)",
    deposit: 680,
    weekdayTasks: 28,
    weekendTasks: 14,
    rewardPerTask: 1,
    dailyIncome: 28,
    weekendIncome: 14,
    vipRequiredTeam: 0,
    color: "from-emerald-400 to-emerald-600",
    gradient: "bg-gradient-to-br from-emerald-300 via-emerald-400 to-emerald-500",
  },
  {
    level: 3,
    name: "sLV3 (VIP)",
    deposit: 1560,
    weekdayTasks: 32,
    weekendTasks: 16,
    rewardPerTask: 2,
    dailyIncome: 64,
    weekendIncome: 32,
    vipRequiredTeam: 0,
    color: "from-amber-400 to-amber-600",
    gradient: "bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500",
  },
  {
    level: 4,
    name: "sLV4 (VIP)",
    deposit: 3600,
    weekdayTasks: 36,
    weekendTasks: 18,
    rewardPerTask: 4,
    dailyIncome: 144,
    weekendIncome: 72,
    vipRequiredTeam: 0,
    color: "from-purple-400 to-purple-600",
    gradient: "bg-gradient-to-br from-purple-300 via-purple-400 to-purple-500",
  },
];

// Helper functions
export const isWeekend = (): boolean => {
  const day = new Date().getDay();
  return day === 0 || day === 6; // Sunday = 0, Saturday = 6
};

export const getLevelConfig = (level: number, isVip: boolean): LevelConfig => {
  const levels = isVip ? vipLevels : regularLevels;
  return levels.find((l) => l.level === level) ?? regularLevels[0];
};

export const getMaxTasks = (level: number, isVip: boolean): number => {
  const config = getLevelConfig(level, isVip);
  return isWeekend() ? config.weekendTasks : config.weekdayTasks;
};

export const getRewardPerTask = (level: number, isVip: boolean): number => {
  const config = getLevelConfig(level, isVip);
  return config.rewardPerTask;
};

export const getDailyIncome = (level: number, isVip: boolean): number => {
  const config = getLevelConfig(level, isVip);
  return isWeekend() ? config.weekendIncome : config.dailyIncome;
};

// Commission percentages
export const COMMISSION_RATES = {
  level1: 0.03, // 3%
  level2: 0.02, // 2%
  level3: 0.01, // 1%
};

// VIP requirements - number of Level 1 team members needed
export const VIP_REQUIREMENTS: Record<number, number> = {
  0: 1,
  1: 2,
  2: 3,
  3: 4,
  4: 5,
};

// Time bonuses based on months worked (in USDT)
export const TIME_BONUSES: Record<number, Record<number, number>> = {
  // 2 months
  2: { 1: 300, 2: 400, 3: 500, 4: 500 },
  // 5 months
  5: { 1: 600, 2: 800, 3: 1000, 4: 1200 },
  // 8 months
  8: { 1: 1500, 2: 2000, 3: 2500, 4: 3000 },
  // 12 months
  12: { 1: 3500, 2: 4200, 3: 6000, 4: 7500 },
};
