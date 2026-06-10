import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Switch, View } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

import { INTERVAL_OPTIONS } from '@/constants';
import { useThemeColors } from '@/hooks/useThemeColors';
import { formatHHMM, parseHHMM } from '@/lib/date';
import { openSystemSettings } from '@/lib/notifications';
import { Surface, ThemedText } from './ThemedView';

type Props = {
  enabled: boolean;
  interval: number;
  activeStart: string;
  activeEnd: string;
  permissionDenied: boolean;
  onToggle: (enabled: boolean) => void;
  onIntervalChange: (hours: number) => void;
  onWindowChange: (start: string, end: string) => void;
};

type PickerTarget = 'start' | 'end' | null;

export const ReminderSettings: React.FC<Props> = ({
  enabled,
  interval,
  activeStart,
  activeEnd,
  permissionDenied,
  onToggle,
  onIntervalChange,
  onWindowChange,
}) => {
  const { colors } = useThemeColors();
  const [picker, setPicker] = useState<PickerTarget>(null);

  const startHM = parseHHMM(activeStart);
  const endHM = parseHHMM(activeEnd);

  const buildDate = (hour: number, minute: number): Date => {
    const d = new Date();
    d.setHours(hour, minute, 0, 0);
    return d;
  };

  const handlePicked = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') setPicker(null);
    if (event.type === 'dismissed' || !date) return;
    const hour = date.getHours();
    const minute = date.getMinutes();
    const formatted = formatHHMM(hour, minute);
    if (picker === 'start') onWindowChange(formatted, activeEnd);
    else if (picker === 'end') onWindowChange(activeStart, formatted);
  };

  return (
    <Surface style={styles.card}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <ThemedText variant="heading">리마인더</ThemedText>
          <ThemedText variant="caption" tone="secondary" style={{ marginTop: 2 }}>
            설정한 시간대에 일정 간격으로 알림을 보냅니다.
          </ThemedText>
        </View>
        <Switch
          value={enabled}
          onValueChange={onToggle}
          disabled={permissionDenied}
          trackColor={{ false: colors.border, true: colors.primaryMuted }}
          thumbColor={enabled ? colors.primary : colors.surface}
        />
      </View>

      {permissionDenied ? (
        <View
          style={[
            styles.warn,
            { backgroundColor: colors.primaryMuted, borderColor: colors.primary },
          ]}
        >
          <Ionicons name="information-circle" size={18} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <ThemedText variant="caption" style={{ color: colors.primary }}>
              알림 권한이 거부되어 있습니다.
            </ThemedText>
            <Pressable onPress={openSystemSettings} style={{ marginTop: 4 }}>
              <ThemedText variant="bodyStrong" tone="primary">
                시스템 설정 열기 →
              </ThemedText>
            </Pressable>
          </View>
        </View>
      ) : null}

      <View style={styles.section}>
        <ThemedText variant="bodyStrong">알림 간격</ThemedText>
        <View style={styles.row}>
          {INTERVAL_OPTIONS.map((h) => {
            const selected = interval === h;
            return (
              <Pressable
                key={h}
                onPress={() => onIntervalChange(h)}
                disabled={!enabled}
                style={({ pressed }) => [
                  styles.chip,
                  {
                    borderColor: selected ? colors.primary : colors.border,
                    backgroundColor: selected ? colors.primaryMuted : 'transparent',
                    opacity: !enabled ? 0.5 : pressed ? 0.85 : 1,
                  },
                ]}
              >
                <ThemedText
                  variant="bodyStrong"
                  style={{ color: selected ? colors.primary : colors.textSecondary }}
                >
                  {h}시간
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText variant="bodyStrong">활동 시간대</ThemedText>
        <View style={styles.row}>
          <Pressable
            onPress={() => setPicker('start')}
            disabled={!enabled}
            style={({ pressed }) => [
              styles.timeBtn,
              {
                borderColor: colors.border,
                backgroundColor: colors.background,
                opacity: !enabled ? 0.5 : pressed ? 0.85 : 1,
              },
            ]}
          >
            <ThemedText variant="caption" tone="tertiary">
              시작
            </ThemedText>
            <ThemedText variant="bodyStrong">{activeStart}</ThemedText>
          </Pressable>
          <ThemedText variant="body" tone="tertiary">
            ~
          </ThemedText>
          <Pressable
            onPress={() => setPicker('end')}
            disabled={!enabled}
            style={({ pressed }) => [
              styles.timeBtn,
              {
                borderColor: colors.border,
                backgroundColor: colors.background,
                opacity: !enabled ? 0.5 : pressed ? 0.85 : 1,
              },
            ]}
          >
            <ThemedText variant="caption" tone="tertiary">
              종료
            </ThemedText>
            <ThemedText variant="bodyStrong">{activeEnd}</ThemedText>
          </Pressable>
        </View>
      </View>

      {picker !== null ? (
        <DateTimePicker
          mode="time"
          value={
            picker === 'start'
              ? buildDate(startHM.hour, startHM.minute)
              : buildDate(endHM.hour, endHM.minute)
          }
          is24Hour
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handlePicked}
        />
      ) : null}
    </Surface>
  );
};

const styles = StyleSheet.create({
  card: { padding: 16, gap: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  warn: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    borderWidth: 1,
    borderRadius: 10,
  },
  section: { gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 999,
  },
  timeBtn: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
  },
});
