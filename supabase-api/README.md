# Farm Link Supabase API

Farm Link 프로젝트의 백엔드 API 서버입니다. Supabase를 사용하여 센서 데이터를 저장하고 관리합니다.

## 주요 기능

- **센서 데이터 저장**: Arduino에서 수집된 센서 데이터를 실시간으로 저장
- **데이터 조회**: 센서 데이터 조회 및 통계 제공
- **디바이스 관리**: 연결된 디바이스 정보 관리
- **제어 로그**: 자동 제어 시스템의 동작 로그 저장
- **실시간 알림**: 임계값 기반 알림 시스템

## API 엔드포인트

### 센서 데이터
- `POST /api/sensor-data` - 센서 데이터 저장
- `GET /api/sensor-data` - 센서 데이터 조회
- `GET /api/sensor-data/stats` - 센서 데이터 통계

### 디바이스 관리
- `GET /api/devices` - 디바이스 목록 조회

### 제어 로그
- `POST /api/control-logs` - 제어 로그 저장
- `GET /api/control-logs` - 제어 로그 조회

### 시스템
- `GET /health` - 헬스 체크

## 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
```bash
cp env.example .env
# .env 파일을 편집하여 실제 값으로 변경
```

### 3. 데이터베이스 설정
```bash
# Supabase 프로젝트에서 schema.sql 실행
npm run setup-db
```

### 4. 서버 실행
```bash
# 개발 모드
npm run dev

# 프로덕션 모드
npm start
```

## 환경 변수

| 변수명 | 설명 | 필수 |
|--------|------|------|
| `SUPABASE_URL` | Supabase 프로젝트 URL | ✅ |
| `SUPABASE_ANON_KEY` | Supabase 익명 키 | ✅ |
| `PORT` | 서버 포트 (기본값: 3000) | ❌ |
| `NODE_ENV` | 실행 환경 (development/production) | ❌ |

## 데이터베이스 스키마

### sensor_data 테이블
센서에서 수집된 데이터를 저장합니다.

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| id | BIGSERIAL | 기본키 |
| soil_moisture | DECIMAL(5,2) | 토양 수분 (%) |
| light_intensity | DECIMAL(5,2) | 조도 (ph) |
| temperature | DECIMAL(5,2) | 온도 (°C) |
| humidity | DECIMAL(5,2) | 습도 (%) |
| timestamp | TIMESTAMPTZ | 측정 시간 |
| device_id | VARCHAR(50) | 디바이스 ID |
| created_at | TIMESTAMPTZ | 생성 시간 |

### devices 테이블
연결된 디바이스 정보를 관리합니다.

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| id | VARCHAR(50) | 디바이스 ID (기본키) |
| name | VARCHAR(100) | 디바이스 이름 |
| location | VARCHAR(100) | 설치 위치 |
| status | VARCHAR(20) | 상태 (active/inactive/maintenance) |
| last_seen | TIMESTAMPTZ | 마지막 연결 시간 |
| created_at | TIMESTAMPTZ | 생성 시간 |
| updated_at | TIMESTAMPTZ | 수정 시간 |

### control_logs 테이블
자동 제어 시스템의 동작 로그를 저장합니다.

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| id | BIGSERIAL | 기본키 |
| device_id | VARCHAR(50) | 디바이스 ID |
| action | VARCHAR(50) | 동작 (water_pump/fan/led) |
| duration | INTEGER | 작동 시간 (초) |
| triggered_by | VARCHAR(50) | 트리거 (auto/manual) |
| sensor_data_id | BIGINT | 관련 센서 데이터 ID |
| created_at | TIMESTAMPTZ | 생성 시간 |

## API 사용 예시

### 센서 데이터 저장
```bash
curl -X POST http://localhost:3000/api/sensor-data \
  -H "Content-Type: application/json" \
  -d '{
    "soil_moisture": 45.5,
    "light_intensity": 30.2,
    "temperature": 25.8,
    "humidity": 60.3,
    "device_id": "farmlink-001"
  }'
```

### 센서 데이터 조회
```bash
curl "http://localhost:3000/api/sensor-data?limit=10&device_id=farmlink-001"
```

### 센서 데이터 통계
```bash
curl "http://localhost:3000/api/sensor-data/stats?start_date=2024-01-01&end_date=2024-01-31"
```

## 보안

- **Rate Limiting**: API 요청 제한 (15분당 1000회)
- **CORS**: Cross-Origin 요청 허용
- **Helmet**: 보안 헤더 설정
- **Row Level Security**: Supabase RLS 정책 적용

## 모니터링

- **헬스 체크**: `/health` 엔드포인트로 서버 상태 확인
- **로깅**: 모든 API 요청 로그 기록
- **에러 핸들링**: 상세한 에러 메시지 제공

## 개발

### 코드 스타일
```bash
npm run lint
```

### 테스트
```bash
npm test
```

### 데이터베이스 마이그레이션
```bash
npm run setup-db
```

## 문제 해결

### 일반적인 문제들

1. **Supabase 연결 실패**
   - 환경 변수 확인
   - Supabase 프로젝트 상태 확인
   - 네트워크 연결 확인

2. **데이터베이스 오류**
   - 스키마가 올바르게 생성되었는지 확인
   - RLS 정책 확인
   - 테이블 권한 확인

3. **API 응답 오류**
   - 요청 데이터 형식 확인
   - 필수 필드 누락 확인
   - Rate limit 초과 확인

## 라이선스

MIT License
