import { useEffect, useRef, useState } from 'react';

import { haptics } from '@/lib/haptics';
import { snoozeUntilTomorrow } from '@/lib/notifications';
import { useSettingsStore } from '@/store/useSettingsStore';

/**
 * 오늘의 total이 goal에 처음 도달하는 순간을 감지해
 * 1) 축하 오버레이를 트리거 (caller에서 표시)
 * 2) 오늘 남은 알림 슬롯을 cancel
 */
export const useGoalCelebration = (params: {
  date: string;
  total: number;
  goal: number;
}): {
  celebrating: boolean;
  dismiss: () => void;
} => {
  const { date, total, goal } = params;
  const [celebrating, setCelebrating] = useState(false);
  const lastTriggeredKeyRef = useRef<string | null>(null);

  const settings = useSettingsStore((s) => s.settings);
  const setScheduledIds = useSettingsStore((s) => s.setScheduledIds);

  useEffect(() => {
    const key = date;
    const reached = goal > 0 && total >= goal;
    if (!reached) return;
    if (lastTriggeredKeyRef.current === key) return;
    lastTriggeredKeyRef.current = key;

    setCelebrating(true);
    haptics.success();

    if (settings.reminderEnabled && settings.scheduledNotificationIds.length > 0) {
      void snoozeUntilTomorrow(settings.scheduledNotificationIds).then((ids) => {
        setScheduledIds(ids);
      });
    }
  }, [date, total, goal, settings.reminderEnabled, settings.scheduledNotificationIds, setScheduledIds]);

  return {
    celebrating,
    dismiss: () => setCelebrating(false),
  };
};
