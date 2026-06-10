import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

import { todayKey } from '@/lib/date';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useWaterStore } from '@/store/useWaterStore';

const CHECK_INTERVAL_MS = 60 * 1000;

export const useMidnightReset = (): void => {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastKeyRef = useRef<string>(todayKey());

  const rolloverIfNeeded = useWaterStore((s) => s.rolloverIfNeeded);
  const settingsHydrated = useSettingsStore((s) => s.isHydrated);
  const waterHydrated = useWaterStore((s) => s.isHydrated);

  useEffect(() => {
    if (!settingsHydrated || !waterHydrated) return;

    const check = async () => {
      const key = todayKey();
      if (key === lastKeyRef.current) return;
      lastKeyRef.current = key;
      const { dailyGoal } = useSettingsStore.getState().settings;
      const rolled = rolloverIfNeeded(dailyGoal);
      if (rolled) {
        await useSettingsStore.getState().applySchedule();
      }
    };

    intervalRef.current = setInterval(check, CHECK_INTERVAL_MS);
    const sub = AppState.addEventListener('change', (s: AppStateStatus) => {
      if (s === 'active') void check();
    });

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      sub.remove();
    };
  }, [rolloverIfNeeded, settingsHydrated, waterHydrated]);
};
