import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_SETTINGS, SCHEMA_VERSION, STORAGE_KEYS } from '@/constants';
import type { DayRecord, Settings, WaterLog } from '@/types';

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const isLog = (v: unknown): v is WaterLog =>
  isObject(v) &&
  typeof v.id === 'string' &&
  typeof v.amount === 'number' &&
  typeof v.timestamp === 'number';

const isRecord = (v: unknown): v is DayRecord =>
  isObject(v) &&
  typeof v.date === 'string' &&
  typeof v.total === 'number' &&
  typeof v.goal === 'number' &&
  Array.isArray(v.logs) &&
  v.logs.every(isLog);

const sanitizeSettings = (raw: unknown): Settings => {
  if (!isObject(raw)) return { ...DEFAULT_SETTINGS };
  const merged: Settings = { ...DEFAULT_SETTINGS };

  if (typeof raw.dailyGoal === 'number' && raw.dailyGoal > 0) merged.dailyGoal = raw.dailyGoal;
  if (
    Array.isArray(raw.cupSizes) &&
    raw.cupSizes.length === 3 &&
    raw.cupSizes.every((n) => typeof n === 'number' && n > 0)
  ) {
    merged.cupSizes = raw.cupSizes as [number, number, number];
  }
  if (typeof raw.reminderEnabled === 'boolean') merged.reminderEnabled = raw.reminderEnabled;
  if (typeof raw.reminderInterval === 'number' && raw.reminderInterval > 0) {
    merged.reminderInterval = raw.reminderInterval;
  }
  if (typeof raw.activeStart === 'string') merged.activeStart = raw.activeStart;
  if (typeof raw.activeEnd === 'string') merged.activeEnd = raw.activeEnd;
  if (raw.themeMode === 'system' || raw.themeMode === 'light' || raw.themeMode === 'dark') {
    merged.themeMode = raw.themeMode;
  }
  if (typeof raw.onboardingCompleted === 'boolean') {
    merged.onboardingCompleted = raw.onboardingCompleted;
  }
  if (
    Array.isArray(raw.scheduledNotificationIds) &&
    raw.scheduledNotificationIds.every((s) => typeof s === 'string')
  ) {
    merged.scheduledNotificationIds = raw.scheduledNotificationIds;
  }
  return merged;
};

const sanitizeRecords = (raw: unknown): Record<string, DayRecord> => {
  if (!isObject(raw)) return {};
  const out: Record<string, DayRecord> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (isRecord(value)) out[key] = value;
  }
  return out;
};

export const storage = {
  async loadSettings(): Promise<Settings> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!raw) return { ...DEFAULT_SETTINGS };
      return sanitizeSettings(JSON.parse(raw));
    } catch (e) {
      console.warn('[storage] loadSettings failed', e);
      return { ...DEFAULT_SETTINGS };
    }
  },

  async saveSettings(settings: Settings): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('[storage] saveSettings failed', e);
    }
  },

  async loadRecords(): Promise<Record<string, DayRecord>> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.RECORDS);
      if (!raw) return {};
      return sanitizeRecords(JSON.parse(raw));
    } catch (e) {
      console.warn('[storage] loadRecords failed', e);
      return {};
    }
  },

  async saveRecords(records: Record<string, DayRecord>): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
    } catch (e) {
      console.warn('[storage] saveRecords failed', e);
    }
  },

  async ensureVersion(): Promise<void> {
    try {
      const v = await AsyncStorage.getItem(STORAGE_KEYS.VERSION);
      if (v !== String(SCHEMA_VERSION)) {
        await AsyncStorage.setItem(STORAGE_KEYS.VERSION, String(SCHEMA_VERSION));
      }
    } catch (e) {
      console.warn('[storage] ensureVersion failed', e);
    }
  },

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.RECORDS,
        STORAGE_KEYS.SETTINGS,
        STORAGE_KEYS.VERSION,
      ]);
    } catch (e) {
      console.warn('[storage] clearAll failed', e);
    }
  },
};
