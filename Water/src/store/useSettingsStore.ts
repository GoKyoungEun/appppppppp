import { create } from 'zustand';

import { DEFAULT_SETTINGS } from '@/constants';
import { storage } from '@/lib/storage';
import {
  configFromSettings,
  reschedule,
  cancelAll,
} from '@/lib/notifications';
import type { Settings, ThemeMode } from '@/types';

type State = {
  settings: Settings;
  isHydrated: boolean;
};

type Actions = {
  hydrate: (s: Settings) => void;
  setDailyGoal: (goal: number) => void;
  setCupSizes: (sizes: [number, number, number]) => void;
  setReminderEnabled: (enabled: boolean) => Promise<void>;
  setReminderInterval: (hours: number) => Promise<void>;
  setActiveWindow: (start: string, end: string) => Promise<void>;
  setThemeMode: (mode: ThemeMode) => void;
  completeOnboarding: () => void;
  setScheduledIds: (ids: string[]) => void;
  applySchedule: () => Promise<void>;
  cancelSchedule: () => Promise<void>;
  resetAll: () => Promise<void>;
};

const persist = (s: Settings) => {
  void storage.saveSettings(s);
};

const updateAndPersist = (
  get: () => State & Actions,
  set: (partial: Partial<State>) => void,
  patch: Partial<Settings>,
) => {
  const next = { ...get().settings, ...patch };
  set({ settings: next });
  persist(next);
  return next;
};

export const useSettingsStore = create<State & Actions>((set, get) => ({
  settings: { ...DEFAULT_SETTINGS },
  isHydrated: false,

  hydrate: (s) => set({ settings: s, isHydrated: true }),

  setDailyGoal: (goal) => updateAndPersist(get, set, { dailyGoal: goal }),

  setCupSizes: (sizes) => updateAndPersist(get, set, { cupSizes: sizes }),

  setReminderEnabled: async (enabled) => {
    const current = get().settings;
    const next: Settings = { ...current, reminderEnabled: enabled };
    set({ settings: next });
    persist(next);
    if (enabled) {
      const ids = await reschedule(
        current.scheduledNotificationIds,
        configFromSettings(next),
      );
      const final = { ...next, scheduledNotificationIds: ids };
      set({ settings: final });
      persist(final);
    } else {
      await cancelAll(current.scheduledNotificationIds);
      const final = { ...next, scheduledNotificationIds: [] };
      set({ settings: final });
      persist(final);
    }
  },

  setReminderInterval: async (hours) => {
    const next = updateAndPersist(get, set, { reminderInterval: hours });
    await get().applySchedule();
    void next;
  },

  setActiveWindow: async (start, end) => {
    updateAndPersist(get, set, { activeStart: start, activeEnd: end });
    await get().applySchedule();
  },

  setThemeMode: (mode) => updateAndPersist(get, set, { themeMode: mode }),

  completeOnboarding: () => updateAndPersist(get, set, { onboardingCompleted: true }),

  setScheduledIds: (ids) =>
    updateAndPersist(get, set, { scheduledNotificationIds: ids }),

  applySchedule: async () => {
    const current = get().settings;
    if (!current.reminderEnabled) return;
    const ids = await reschedule(
      current.scheduledNotificationIds,
      configFromSettings(current),
    );
    const next = { ...current, scheduledNotificationIds: ids };
    set({ settings: next });
    persist(next);
  },

  cancelSchedule: async () => {
    const current = get().settings;
    await cancelAll(current.scheduledNotificationIds);
    const next = { ...current, scheduledNotificationIds: [] };
    set({ settings: next });
    persist(next);
  },

  resetAll: async () => {
    await cancelAll(get().settings.scheduledNotificationIds);
    set({ settings: { ...DEFAULT_SETTINGS } });
    persist({ ...DEFAULT_SETTINGS });
  },
}));
