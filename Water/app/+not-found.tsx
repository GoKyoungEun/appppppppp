import { Link, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText, ThemedView } from '@/components/ThemedView';

export default function NotFoundScreen() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title: '없는 화면' }} />
      <View style={styles.container}>
        <ThemedText variant="title">화면을 찾을 수 없어요</ThemedText>
        <Link href="/" style={{ marginTop: 12 }}>
          <ThemedText tone="primary">홈으로 돌아가기</ThemedText>
        </Link>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
});
