# Water Tracker

물 마시기를 간단하게 추적하는 React Native + Expo 앱입니다. 서버 없이 모든 데이터는 기기 내 AsyncStorage에 저장됩니다.

## 주요 기능

- 일일 목표량 설정 (기본 2,000ml)
- 빠른 추가 버튼 3개 (커스텀 가능) + 직접 입력
- 물병 채워지는 진행률 애니메이션
- 마지막 기록 5초 동안 되돌리기 토스트
- 최근 7일 막대그래프 + 일별 히스토리
- 자정 자동 롤오버 (이전 기록 보존)
- 로컬 알림 리마인더 (간격/활동 시간대 설정)
- 목표 달성 시 그날 남은 알림 자동 중지
- 다크모드 (시스템 / 라이트 / 다크)
- 햅틱 피드백

## 기술 스택

- React Native 0.76 + Expo SDK 52
- TypeScript (strict)
- expo-router (파일 기반 네비게이션)
- Zustand (상태 관리)
- AsyncStorage (로컬 저장)
- expo-notifications (로컬 알림)
- expo-haptics
- react-native-reanimated (애니메이션)
- react-native-svg (물병, 차트)

## 디렉토리 구조

```
app/                    expo-router 라우트
  _layout.tsx           루트 (hydrate, 자정 hook, 라우트 가드)
  (tabs)/
    _layout.tsx
    index.tsx           홈 (오늘 추적)
    stats.tsx           통계
    settings.tsx        설정
  onboarding.tsx        최초 실행 시 1~2화면

src/
  components/           UI 컴포넌트
  hooks/                useThemeColors, useMidnightReset, useGoalCelebration
  lib/                  storage, notifications, date, haptics
  store/                useWaterStore, useSettingsStore
  theme/                colors, typography
  types/                타입 정의
  constants/            기본값, 알림 메시지 풀
```

## 실행 방법

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버

```bash
npx expo start
```

QR을 Expo Go(iOS/Android)로 스캔하거나, `i` / `a`로 시뮬레이터/에뮬레이터에서 실행합니다.

### 3. 타입 체크

```bash
npm run typecheck
```

## 알림 권한 안내

- 최초 실행 시 온보딩 2단계에서 "알림 허용하고 시작" 버튼으로 권한을 요청합니다.
- 거부하면 설정 탭의 리마인더 토글이 비활성화되고, 안내 배너에서 시스템 설정으로 바로 이동할 수 있습니다.
- iOS는 한 번 거부하면 앱에서 다시 묻는 다이얼로그를 띄울 수 없으므로 반드시 시스템 설정에서 직접 허용해야 합니다.

### 알림 스케줄링 동작 방식

1. `활동 시간대 09:00 ~ 22:00`, `간격 2시간` 같은 설정에서 슬롯 배열을 만듭니다. 예: `[09:00, 11:00, 13:00, 15:00, 17:00, 19:00, 21:00]`
2. 각 슬롯에 대해 `expo-notifications`의 DAILY trigger로 알림을 등록합니다(매일 같은 시각에 반복).
3. 등록된 ID 배열을 AsyncStorage에 저장합니다.
4. 설정이 바뀌면 모두 cancel 후 재등록합니다.
5. 오늘 목표를 달성하면 등록된 ID를 전부 cancel합니다 (DAILY trigger는 같은 날 다시 등록해도 또 울리므로 비워두는 방식). 자정에 `useMidnightReset` hook이 새 날을 감지해 `scheduleAll`을 다시 호출합니다.

## Expo Go 제약 및 development build

Expo SDK 53부터 Expo Go는 **푸시 알림(remote push)**을 차단하지만, 이 앱이 사용하는 **로컬 알림(scheduleNotificationAsync)**은 Expo Go에서 동작합니다. 다만 일부 trigger 동작이나 백그라운드 정확도는 환경에 따라 차이가 있을 수 있습니다.

가장 안정적인 알림 동작을 원한다면 development build를 사용하세요.

### development build 만들기

```bash
# 1. dev client 설치
npx expo install expo-dev-client

# 2. EAS CLI (전역 또는 npx)
npm i -g eas-cli

# 3. EAS 로그인 후 빌드
eas login
eas build --profile development --platform ios
# 또는
eas build --profile development --platform android
```

빌드된 앱을 기기에 설치한 뒤 `npx expo start --dev-client`로 개발 서버에 연결해 실행합니다.

## 데이터 저장 형식

AsyncStorage 키:

- `@water/records` — 일별 기록 `Record<DateString, DayRecord>`
- `@water/settings` — 사용자 설정 (목표, 컵 사이즈, 알림, 테마 등)
- `@water/version` — 스키마 버전 (마이그레이션용)

모든 데이터는 로드 시 타입 가드로 검증되며, 파싱 실패 시 기본값으로 폴백합니다.

## 라이선스

MIT
