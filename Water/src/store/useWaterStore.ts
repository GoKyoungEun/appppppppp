import { create } from 'zustand';

import { storage } from '@/lib/storage';
import { lastNDays, todayKey } from '@/lib/date';
import type { DayRecord, WaterLog, WeeklyStat } from '@/types';

type State = {
  records: Record<string, DayRecord>;
  todayDate: string;
  isHydrated: boolean;
  lastAddedLogId: string | null;
};

type Actions = {
  hydrate: (initial: Record<string, DayRecord>, todayGoal: number) => void;
  addWater: (amount: number, goal: number) => WaterLog;
  undoLast: () => void;
  clearLastAdded: () => void;
  ensureTodayRecord: (goal: number) => void;
  rolloverIfNeeded: (goal: number) => boolean;
  getToday: () => DayRecord | undefined;
  getWeeklyStats: (goal: number) => WeeklyStat[];
  getRecord: (date: string) => DayRecord | undefined;
  resetAll: () => void;
};

const persist = (records: Record<string, DayRecord>) => {
  void storage.saveRecords(records);
};

const makeId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const blankRecord = (date: string, goal: number): DayRecord => ({
  date,
  total: 0,
  goal,
  logs: [],
});

export const useWaterStore = create<State & Actions>((set, get) => ({
  records: {},
  todayDate: todayKey(),
  isHydrated: false,
  lastAddedLogId: null,

  hydrate: (initial, todayGoal) => {
    const today = todayKey();
    const next = { ...initial };
    if (!next[today]) next[today] = blankRecord(today, todayGoal);
    set({ records: next, todayDate: today, isHydrated: true });
  },

  addWater: (amount, goal) => {
    const today = todayKey();
    const records = { ...get().records };
    const current = records[today] ?? blankRecord(today, goal);
    const log: WaterLog = { id: makeId(), amount, timestamp: Date.now() };
    const updated: DayRecord = {
      ...current,
      total: current.total + amount,
      logs: [...current.logs, log],
    };
    records[today] = updated;
    set({ records, todayDate: today, lastAddedLogId: log.id });
    persist(records);
    return log;
  },

  undoLast: () => {
    const { lastAddedLogId, records, todayDate } = get();
    if (!lastAddedLogId) return;
    const day = records[todayDate];
    if (!day) return;
    const target = day.logs.find((l) => l.id === lastAddedLogId);
    if (!target) {
      set({ lastAddedLogId: null });
      return;
    }
    const updated: DayRecord = {
      ...day,
      total: Math.max(0, day.total - target.amount),
      logs: day.logs.filter((l) => l.id !== lastAddedLogId),
    };
    const nextRecords = { ...records, [todayDate]: updated };
    set({ records: nextRecords, lastAddedLogId: null });
    persist(nextRecords);
  },

  clearLastAdded: () => set({ lastAddedLogId: null }),

  ensureTodayRecord: (goal) => {
    const today = todayKey();
    const records = get().records;
    if (records[today]) return;
    const next = { ...records, [today]: blankRecord(today, goal) };
    set({ records: next, todayDate: today });
    persist(next);
  },

  rolloverIfNeeded: (goal) => {
    const today = todayKey();
    if (today === get().todayDate && get().records[today]) return false;
    const records = { ...get().records };
    if (!records[today]) records[today] = blankRecord(today, goal);
    set({ records, todayDate: today, lastAddedLogId: null });
    persist(records);
    return true;
  },

  getToday: () => {
    const { records, todayDate } = get();
    return records[todayDate];
  },

  getWeeklyStats: (goal) => {
    const days = lastNDays(7);
    const { records } = get();
    return days.map<WeeklyStat>((date) => {
      const r = records[date];
      const dayGoal = r?.goal ?? goal;
      const total = r?.total ?? 0;
      return { date, total, goal: dayGoal, reached: total >= dayGoal };
    });
  },

  getRecord: (date) => get().records[date],

  resetAll: () => {
    set({ records: {}, lastAddedLogId: null });
    persist({});
  },
}));
