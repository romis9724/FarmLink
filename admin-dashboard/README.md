# Farm Link Admin Dashboard

Farm Link 프로젝트의 관리자 대시보드입니다. Material-UI와 React를 사용하여 구축되었습니다.

## 기능

### 📊 대시보드
- 실시간 센서 데이터 모니터링
- 센서 상태 시각화 (토양 수분, 온도, 습도, 조도)
- 디바이스 상태 확인
- 최근 제어 로그 표시
- 센서 데이터 추이 차트

### 📈 센서 데이터
- 센서 데이터 테이블 뷰
- 실시간 데이터 필터링 및 검색
- CSV 데이터 내보내기
- 디바이스별 데이터 필터링

### 🔧 디바이스 관리
- 디바이스 목록 관리
- 디바이스 상태 모니터링
- 디바이스 추가/편집/삭제

### 📋 제어 로그
- 제어 동작 로그 조회
- 동작별 필터링
- 트리거 타입별 분류 (자동/수동)
- CSV 로그 내보내기

### 🔔 알림 설정
- 알림 규칙 관리
- 임계값 설정
- 알림 활성화/비활성화

### ⚙️ 설정
- 시스템 설정 관리
- 알림 설정
- 데이터 보존 정책

## 기술 스택

- **Frontend**: React 18, TypeScript
- **UI Framework**: Material-UI (MUI) v5
- **Charts**: Recharts
- **Data Grid**: MUI X Data Grid
- **Database**: Supabase
- **Routing**: React Router v6

## 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
REACT_APP_SUPABASE_URL=your_supabase_url_here
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. 개발 서버 실행
```bash
npm start
```

브라우저에서 `http://localhost:3000`으로 접속하세요.

### 4. 프로덕션 빌드
```bash
npm run build
```

## 프로젝트 구조

```
src/
├── components/          # 재사용 가능한 컴포넌트
│   ├── Sidebar.tsx     # 사이드바 네비게이션
│   ├── SensorChart.tsx # 센서 데이터 차트
│   └── RecentLogs.tsx  # 최근 로그 컴포넌트
├── pages/              # 페이지 컴포넌트
│   ├── Dashboard.tsx   # 대시보드
│   ├── SensorData.tsx  # 센서 데이터 페이지
│   ├── Devices.tsx     # 디바이스 관리 페이지
│   ├── ControlLogs.tsx # 제어 로그 페이지
│   ├── Notifications.tsx # 알림 설정 페이지
│   └── Settings.tsx    # 설정 페이지
├── lib/                # 유틸리티 및 설정
│   └── supabase.ts     # Supabase 클라이언트 설정
├── App.tsx             # 메인 앱 컴포넌트
├── index.tsx           # 앱 진입점
└── index.css           # 글로벌 스타일
```

## 데이터베이스 스키마

이 대시보드는 다음 Supabase 테이블들을 사용합니다:

- `sensor_data`: 센서 측정 데이터
- `devices`: 디바이스 정보
- `control_logs`: 제어 동작 로그
- `notifications`: 알림 설정
- `sensor_thresholds`: 센서 임계값 설정

## 주요 기능

### 실시간 업데이트
- Supabase 실시간 구독을 통한 자동 데이터 업데이트
- 센서 데이터 변경 시 자동 새로고침

### 반응형 디자인
- 모바일, 태블릿, 데스크톱 지원
- Material-UI의 반응형 그리드 시스템 사용

### 데이터 시각화
- Recharts를 사용한 인터랙티브 차트
- 실시간 센서 데이터 추이 표시
- 시간 범위별 데이터 필터링

### 사용자 경험
- 직관적인 네비게이션
- 로딩 상태 표시
- 오류 처리 및 사용자 피드백

## 라이선스

MIT License
