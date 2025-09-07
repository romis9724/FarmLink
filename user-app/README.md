# Farm Link User App

Farm Link 사용자용 React Native 앱입니다. 스마트팜 센서 데이터를 실시간으로 모니터링할 수 있습니다.

## 주요 기능

- **실시간 센서 모니터링**: 토양 수분, 온도, 습도, 조도 데이터를 실시간으로 확인
- **직관적인 UI**: 사용자 친화적인 카드 형태의 데이터 표시
- **자동 새로고침**: 5초마다 자동으로 데이터 업데이트
- **상태 표시**: 각 센서의 상태를 색상과 텍스트로 표시
- **디바이스 상태**: 연결된 디바이스의 상태 확인

## 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 웹 브라우저에서 실행 (추천)
```bash
npm run web
```
브라우저에서 `http://localhost:5000`로 접속

### 3. Android 실행
```bash
npm run android
```

### 4. iOS 실행 (macOS만)
```bash
cd ios && pod install && cd ..
npm run ios
```

### 5. Expo로 실행
```bash
npm run expo:start
```

## 프로젝트 구조

```
user-app/
├── src/
│   ├── components/          # 재사용 가능한 컴포넌트
│   │   └── SensorCard.tsx   # 센서 데이터 카드
│   ├── lib/                 # 유틸리티 및 API
│   │   └── api.ts          # API 클라이언트
│   ├── navigation/          # 네비게이션 설정
│   │   └── AppNavigator.tsx
│   └── screens/            # 화면 컴포넌트
│       └── DashboardScreen.tsx
├── App.tsx                 # 메인 앱 컴포넌트
└── package.json
```

## API 연동

앱은 `supabase-api` 서버와 연동됩니다:

- **센서 데이터**: `/api/sensor-data`
- **디바이스 정보**: `/api/devices`
- **디바이스 상태**: `/api/device-status/:deviceId`

## 환경 설정

개발 환경에서는 `http://localhost:3000`을 사용하고, 실제 배포시에는 서버 IP를 설정해야 합니다.

`src/lib/api.ts`에서 `API_BASE_URL`을 수정하세요:

```typescript
const API_BASE_URL = __DEV__ ? 'http://localhost:3000' : 'http://your-server-ip:3000';
```

## 주요 컴포넌트

### SensorCard
센서 데이터를 표시하는 카드 컴포넌트입니다.

**Props:**
- `title`: 센서 이름
- `icon`: 아이콘 이름
- `valueKey`: 센서 데이터 키
- `unit`: 단위
- `type`: 센서 타입 (moisture, temperature, humidity, light)
- `deviceId`: 디바이스 ID
- `refreshInterval`: 새로고침 간격 (기본: 5000ms)

### DashboardScreen
메인 대시보드 화면입니다.

**기능:**
- 센서 데이터 카드들 표시
- 디바이스 상태 표시
- Pull-to-refresh 지원
- 자동 새로고침

## 개발 가이드

### 새로운 화면 추가
1. `src/screens/`에 새 화면 컴포넌트 생성
2. `src/navigation/AppNavigator.tsx`에 라우트 추가

### API 엔드포인트 추가
1. `src/lib/api.ts`에 새 메서드 추가
2. 필요한 타입 정의 추가

## 빌드 및 배포

### Android APK 빌드
```bash
cd android
./gradlew assembleRelease
```

### iOS 빌드 (macOS만)
```bash
cd ios
xcodebuild -workspace FarmLinkUserApp.xcworkspace -scheme FarmLinkUserApp -configuration Release
```

## 문제 해결

### 네트워크 연결 문제
- API 서버가 실행 중인지 확인
- 방화벽 설정 확인
- 올바른 IP 주소 설정 확인

### 빌드 오류
- `npm install` 재실행
- `node_modules` 삭제 후 재설치
- Metro 캐시 클리어: `npx react-native start --reset-cache`
