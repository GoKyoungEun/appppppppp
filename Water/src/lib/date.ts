import { format, subDays, parseISO } from 'date-fns';

export const todayKey = (d: Date = new Date()): string => format(d, 'yyyy-MM-dd');

export const dayLabelShort = (key: string): string => {
  const date = parseISO(key);
  return format(date, 'EEE');
};

export const dayLabel = (key: string): string => {
  const date = parseISO(key);
  return format(date, 'M월 d일 (EEE)');
};

export const timeLabel = (timestamp: number): string => {
  return format(new Date(timestamp), 'HH:mm');
};

export const lastNDays = (n: number, from: Date = new Date()): string[] => {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    out.push(todayKey(subDays(from, i)));
  }
  return out;
};

export const parseHHMM = (s: string): { hour: number; minute: number } => {
  const [h, m] = s.split(':').map((v) => parseInt(v, 10));
  return {
    hour: Number.isFinite(h) ? h : 0,
    minute: Number.isFinite(m) ? m : 0,
  };
};

export const formatHHMM = (hour: number, minute: number): string => {
  const h = String(hour).padStart(2, '0');
  const m = String(minute).padStart(2, '0');
  return `${h}:${m}`;
};

export const minutesOfDay = (hour: number, minute: number): number => hour * 60 + minute;
