import type { Settings } from '@/types';

export const STORAGE_KEYS = {
  RECORDS: '@water/records',
  SETTINGS: '@water/settings',
  VERSION: '@water/version',
} as const;

export const SCHEMA_VERSION = 1;

export const DEFAULT_SETTINGS: Settings = {
  dailyGoal: 2000,
  cupSizes: [200, 350, 500],
  reminderEnabled: false,
  reminderInterval: 2,
  activeStart: '09:00',
  activeEnd: '22:00',
  themeMode: 'system',
  onboardingCompleted: false,
  scheduledNotificationIds: [],
};

export const NOTIFICATION_TITLE = '수분 보충 알림';

export const NOTIFICATION_MESSAGES = [
  '물 마실 시간입니다.',
  '수분 보충을 권장합니다.',
  '한 잔의 물을 마셔보세요.',
  '오늘의 목표까지 꾸준히 채워봅시다.',
  '지금 한 모금이 컨디션을 지킵니다.',
];

export const NOTIFICATION_CHANNEL_ID = 'water-reminders';

export const INTERVAL_OPTIONS = [1, 2, 3] as const;

export const MIN_GOAL = 500;
export const MAX_GOAL = 5000;
export const MIN_CUP = 50;
export const MAX_CUP = 2000;
