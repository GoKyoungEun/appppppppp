import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { useThemeColors } from '@/hooks/useThemeColors';
import { MAX_CUP, MIN_CUP } from '@/constants';
import { Surface, ThemedText } from './ThemedView';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (amount: number) => void;
  title?: string;
};

export const CustomAmountModal: React.FC<Props> = ({
  visible,
  onClose,
  onSubmit,
  title = '직접 입력',
}) => {
  const { colors } = useThemeColors();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    const n = parseInt(value, 10);
    if (!Number.isFinite(n) || n < MIN_CUP || n > MAX_CUP) {
      setError(`${MIN_CUP} ~ ${MAX_CUP}ml 사이로 입력해주세요.`);
      return;
    }
    onSubmit(n);
    setValue('');
    setError(null);
    onClose();
  };

  const handleClose = () => {
    setValue('');
    setError(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.backdrop, { backgroundColor: colors.overlay }]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        <Surface style={styles.card}>
          <ThemedText variant="heading">{title}</ThemedText>
          <ThemedText variant="caption" tone="secondary" style={{ marginTop: 4 }}>
            마시려는 물의 양을 ml 단위로 입력하세요.
          </ThemedText>
          <TextInput
            value={value}
            onChangeText={(t) => {
              setValue(t.replace(/[^0-9]/g, ''));
              setError(null);
            }}
            keyboardType="number-pad"
            placeholder="예: 250"
            placeholderTextColor={colors.textTertiary}
            style={[
              styles.input,
              {
                color: colors.text,
                borderColor: error ? colors.danger : colors.border,
                backgroundColor: colors.background,
              },
            ]}
            autoFocus
          />
          {error ? (
            <ThemedText variant="caption" tone="danger" style={{ marginTop: 6 }}>
              {error}
            </ThemedText>
          ) : null}
          <View style={styles.row}>
            <Pressable
              onPress={handleClose}
              style={({ pressed }) => [
                styles.btn,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <ThemedText variant="bodyStrong">취소</ThemedText>
            </Pressable>
            <Pressable
              onPress={handleSubmit}
              style={({ pressed }) => [
                styles.btn,
                {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <ThemedText variant="bodyStrong" style={{ color: colors.primaryContrast }}>
                추가
              </ThemedText>
            </Pressable>
          </View>
        </Surface>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 360, padding: 20 },
  input: {
    marginTop: 14,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 18,
  },
  row: { flexDirection: 'row', gap: 10, marginTop: 16 },
  btn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
});
