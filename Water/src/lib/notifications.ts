import * as Notifications from 'expo-notifications';
import { Linking, Platform } from 'react-native';

import {
  NOTIFICATION_CHANNEL_ID,
  NOTIFICATION_MESSAGES,
  NOTIFICATION_TITLE,
} from '@/constants';
import { minutesOfDay, parseHHMM } from '@/lib/date';
import type { ReminderConfig } from '@/types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const ensureAndroidChannel = async (): Promise<void> => {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
    name: '수분 보충 알림',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 150, 100, 150],
    lightColor: '#2196F3',
  });
};

export const getPermissionStatus = async (): Promise<Notifications.PermissionStatus> => {
  const res = await Notifications.getPermissionsAsync();
  return res.status;
};

export const hasPermission = async (): Promise<boolean> => {
  const status = await getPermissionStatus();
  return status === 'granted';
};

export const requestPermission = async (): Promise<boolean> => {
  await ensureAndroidChannel();
  const existing = await Notifications.getPermissionsAsync();
  if (existing.status === 'granted') return true;
  if (!existing.canAskAgain) return false;
  const res = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: false, allowSound: true },
  });
  return res.status === 'granted';
};

export const openSystemSettings = (): void => {
  void Linking.openSettings();
};

export const buildSlots = (
  startHour: number,
  startMinute: number,
  endHour: number,
  endMinute: number,
  intervalHours: number,
): { hour: number; minute: number }[] => {
  if (intervalHours <= 0) return [];
  const startMin = minutesOfDay(startHour, startMinute);
  const endMin = minutesOfDay(endHour, endMinute);
  if (endMin <= startMin) return [];
  const stepMin = Math.round(intervalHours * 60);
  const slots: { hour: number; minute: number }[] = [];
  for (let t = startMin; t <= endMin; t += stepMin) {
    slots.push({ hour: Math.floor(t / 60), minute: t % 60 });
  }
  return slots;
};

const pickMessage = (i: number): string =>
  NOTIFICATION_MESSAGES[i % NOTIFICATION_MESSAGES.length] ?? NOTIFICATION_MESSAGES[0];

export const cancelAll = async (ids: string[]): Promise<void> => {
  await Promise.all(
    ids.map((id) =>
      Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined),
    ),
  );
};

export const cancelAllSafe = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    /* noop */
  }
};

export const scheduleAll = async (config: ReminderConfig): Promise<string[]> => {
  if (!config.enabled) return [];
  await ensureAndroidChannel();
  const slots = buildSlots(
    config.startHour,
    config.startMinute,
    config.endHour,
    config.endMinute,
    config.intervalHours,
  );

  const ids: string[] = [];
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: NOTIFICATION_TITLE,
          body: pickMessage(i),
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: slot.hour,
          minute: slot.minute,
        },
      });
      ids.push(id);
    } catch (e) {
      console.warn('[notifications] schedule failed', e);
    }
  }
  return ids;
};

export const reschedule = async (
  previousIds: string[],
  config: ReminderConfig,
): Promise<string[]> => {
  await cancelAll(previousIds);
  if (!config.enabled) return [];
  return scheduleAll(config);
};

export const configFromSettings = (s: {
  reminderEnabled: boolean;
  reminderInterval: number;
  activeStart: string;
  activeEnd: string;
}): ReminderConfig => {
  const start = parseHHMM(s.activeStart);
  const end = parseHHMM(s.activeEnd);
  return {
    enabled: s.reminderEnabled,
    intervalHours: s.reminderInterval,
    startHour: start.hour,
    startMinute: start.minute,
    endHour: end.hour,
    endMinute: end.minute,
  };
};

/**
 * 목표 달성 시 오늘 남은 슬롯을 멈춘다.
 * DAILY 트리거는 즉시 재등록해도 오늘 다시 울리므로,
 * 여기서는 cancel만 하고 빈 배열을 돌려준다.
 * 자정 hook (useMidnightReset)이 새 날에 scheduleAll을 다시 호출한다.
 */
export const snoozeUntilTomorrow = async (
  scheduledIds: string[],
): Promise<string[]> => {
  await cancelAll(scheduledIds);
  return [];
};
