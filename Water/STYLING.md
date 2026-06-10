# 스타일 수정 가이드

이 프로젝트는 React Native + Expo로 작성됐기 때문에 별도의 `.css` 파일이 없습니다. 모든 스타일은 각 컴포넌트 파일 안의 `StyleSheet.create({...})`로 정의되어 있고, `expo start --web`은 React Native Web으로 동일한 코드를 그대로 렌더링합니다.

## 수정 위치 가이드

| 바꾸고 싶은 것 | 파일 |
| --- | --- |
| 색상 / 테마 (라이트·다크 한꺼번에) | [src/theme/colors.ts](src/theme/colors.ts) — `lightColors`, `darkColors` |
| 글자 크기 / 굵기 | [src/theme/typography.ts](src/theme/typography.ts) + [src/components/ThemedView.tsx](src/components/ThemedView.tsx)의 `sizeMap` |
| 물병 모양·크기·그라데이션 | [src/components/ProgressBottle.tsx](src/components/ProgressBottle.tsx) |
| 차트 (막대 색/간격/높이) | [src/components/StatsChart.tsx](src/components/StatsChart.tsx) |
| 홈 레이아웃 (간격, 정렬) | [app/(tabs)/index.tsx](app/(tabs)/index.tsx) 하단 `styles` |
| 통계 화면 레이아웃 | [app/(tabs)/stats.tsx](app/(tabs)/stats.tsx) 하단 `styles` |
| 설정 화면 레이아웃 | [app/(tabs)/settings.tsx](app/(tabs)/settings.tsx) 하단 `styles` |
| 탭바 | [app/(tabs)/_layout.tsx](app/(tabs)/_layout.tsx) `tabBarStyle` |
| 버튼 모양 | [src/components/WaterButton.tsx](src/components/WaterButton.tsx) `styles.button` |
| 카드/Surface 공통 | [src/components/ThemedView.tsx](src/components/ThemedView.tsx)의 `Surface` |
| 모달 (직접 입력) | [src/components/CustomAmountModal.tsx](src/components/CustomAmountModal.tsx) |
| 토스트 (Undo) | [src/components/UndoToast.tsx](src/components/UndoToast.tsx) |
| 축하 오버레이 | [src/components/CelebrationOverlay.tsx](src/components/CelebrationOverlay.tsx) |
| 온보딩 | [app/onboarding.tsx](app/onboarding.tsx) |

각 파일 맨 아래에 있는 `StyleSheet.create({...})` 블록이 CSS 역할을 합니다. 속성 이름은 CSS와 거의 같지만 camelCase입니다 — `padding`, `margin`, `borderRadius`, `flexDirection`, `gap` 등.

## 가장 흔한 케이스 — 색상만 바꾸고 싶다면

[src/theme/colors.ts](src/theme/colors.ts)의 다음 값들만 수정하면 물병/버튼/탭바 강조색이 한꺼번에 변경됩니다.

```ts
primary       // 버튼, 강조 텍스트, 탭바 활성 색
primaryMuted  // 선택 chip 배경, 아이콘 박스
primaryContrast // primary 위에 올라가는 텍스트/아이콘 색
water         // 물병 색상 (기본)
waterLight    // 물병 그라데이션 위쪽
waterDark     // 물병 그라데이션 아래쪽
```

`lightColors`와 `darkColors` 두 팔레트를 **각각** 수정해야 라이트/다크 모두 반영됩니다.

## 웹 전용 스타일이 필요한 경우

### 1) Platform 분기

```tsx
import { Platform } from 'react-native';

<Pressable
  style={[
    styles.btn,
    Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'opacity 0.2s',
    },
  ]}
/>
```

`cursor`, `transition`, `userSelect`, `boxShadow` 등 웹에만 있는 속성도 React Native Web이 그대로 받습니다.

### 2) 글로벌 CSS 파일

루트에 `global.css`를 만들고 [app/_layout.tsx](app/_layout.tsx) 상단에서 임포트하세요.

```tsx
import '../global.css';
```

Metro web bundler가 CSS import를 지원합니다. Tailwind / NativeWind를 도입할 때 이 방식을 씁니다.

### 3) HTML head 커스터마이즈

웹 빌드의 `<head>`(메타태그, 외부 폰트 link 등)를 바꾸려면 `app/+html.tsx`를 생성하세요. expo-router가 웹 빌드 시 이 컴포넌트로 HTML 셸을 렌더링합니다.

```tsx
// app/+html.tsx
import { type PropsWithChildren } from 'react';
import { ScrollViewStyleReset } from 'expo-router/html';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <ScrollViewStyleReset />
        {/* 추가 메타태그, 폰트 link 등 */}
      </head>
      <body>{children}</body>
    </html>
  );
}
```

## React Native StyleSheet 빠른 참고

| CSS | React Native |
| --- | --- |
| `background-color` | `backgroundColor` |
| `border-radius` | `borderRadius` |
| `font-size` | `fontSize` |
| `font-weight` | `fontWeight` |
| `padding`, `margin` | 동일 (단축 표기 OK) |
| `display: flex` | 기본값 (별도 지정 불필요) |
| `flex-direction` | `flexDirection` (기본 `column`) |
| `gap`, `row-gap`, `column-gap` | 동일 |
| `box-shadow` | `shadowColor`, `shadowOpacity`, `shadowOffset`, `shadowRadius` (iOS) / `elevation` (Android) |
| `transition` | `Animated` 또는 `react-native-reanimated` |
| `:hover` | 없음 → 웹은 Platform 분기로 별도 처리 |

## 길이 단위

React Native에서 길이는 **숫자**(point 단위)로 적습니다. `'px'` 같은 단위를 붙이지 않습니다.

```tsx
{ padding: 16 }          // OK
{ padding: '16px' }      // 안 됨
{ width: '100%' }        // 문자열 % 는 OK
```

## 동적 스타일은 배열로

조건부 스타일은 배열에 넣으면 뒤의 값이 앞을 덮어씁니다.

```tsx
<View style={[styles.card, isActive && { borderColor: colors.primary }]} />
```
