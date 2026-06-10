export type WaterLog = {
  id: string;
  amount: number;
  timestamp: number;
};

export type DayRecord = {
  date: string;
  total: number;
  goal: number;
  logs: WaterLog[];
};

export type ThemeMode = 'system' | 'light' | 'dark';

export type Settings = {
  dailyGoal: number;
  cupSizes: [number, number, number];
  reminderEnabled: boolean;
  reminderInterval: number;
  activeStart: string;
  activeEnd: string;
  themeMode: ThemeMode;
  onboardingCompleted: boolean;
  scheduledNotificationIds: string[];
};

export type ReminderConfig = {
  enabled: boolean;
  intervalHours: number;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
};

export type WeeklyStat = {
  date: string;
  total: number;
  goal: number;
  reached: boolean;
};
