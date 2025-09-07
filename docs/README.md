# Farm Link Project

스마트팜 키트를 활용한 IoT 기반 농업 모니터링 및 자동 제어 시스템입니다.

## 프로젝트 개요

Farm Link은 Arduino UNO와 ESP8266 모듈을 사용하여 농장 환경을 실시간으로 모니터링하고, Supabase 클라우드 플랫폼을 통해 데이터를 저장하고 관리하는 시스템입니다.

### 주요 기능

- **실시간 센서 모니터링**: 온도, 습도, 토양 수분, 조도 측정
- **자동 제어 시스템**: 워터펌프, 팬, LED 자동 제어
- **클라우드 데이터 저장**: Supabase를 통한 센서 데이터 저장
- **웹 대시보드**: 실시간 데이터 시각화
- **알림 시스템**: 임계값 기반 알림

## 프로젝트 구조

```
FarmLink/
├── arduino-project/          # Arduino 프로젝트
│   ├── farmlink_esp8266.ino  # ESP8266 연동 코드
│   ├── usb_data_sender.py    # USB 대체 전송 스크립트
│   └── README.md             # Arduino 프로젝트 문서
├── supabase-api/             # Supabase API 서버
│   ├── server.js             # Express.js API 서버
│   ├── schema.sql            # 데이터베이스 스키마
│   ├── types.ts              # TypeScript 타입 정의
│   ├── supabase-client.ts    # Supabase 클라이언트
│   ├── package.json          # Node.js 의존성
│   └── README.md             # API 서버 문서
├── docs/                     # 프로젝트 문서
│   └── README.md             # 전체 프로젝트 문서
├── arduino.ino               # 원본 Arduino 코드
└── project.md                # 프로젝트 요구사항
```

## 하드웨어 구성

### 필요한 부품
- Arduino UNO
- ESP8266 WiFi 모듈
- DHT11 온습도 센서
- 토양 수분 센서
- 조도 센서 (CDS)
- LCD I2C 디스플레이 (16x2)
- 모터 드라이버 (L298N)
- 워터펌프 모터
- 팬 모터
- LED
- 점퍼 와이어
- 브레드보드

### 회로 연결

#### 센서 연결
- **DHT11**: VCC→5V, GND→GND, DATA→핀4
- **토양 수분 센서**: VCC→5V, GND→GND, SIG→A0
- **조도 센서**: VCC→5V, GND→GND, SIG→A1
- **LCD I2C**: VCC→5V, GND→GND, SDA→A4, SCL→A5

#### 액추에이터 연결
- **워터펌프**: 모터 드라이버 A_1A→핀10, A_1B→핀9
- **팬**: 모터 드라이버 B_1A→핀5, B_1B→핀6
- **LED**: 핀3

## 소프트웨어 구성

### 1. Arduino 프로젝트
- **farmlink_esp8266.ino**: ESP8266을 통한 WiFi 연결 및 Supabase 데이터 전송
- **usb_data_sender.py**: ESP8266 연결 실패 시 USB를 통한 대체 데이터 전송

### 2. Supabase API
- **server.js**: Express.js 기반 REST API 서버
- **schema.sql**: PostgreSQL 데이터베이스 스키마
- **types.ts**: TypeScript 타입 정의

## 설치 및 설정

### 1. Arduino IDE 설정
1. ESP8266 보드 매니저 설치
2. 필요한 라이브러리 설치:
   - LiquidCrystal_I2C
   - DHT sensor library
   - ArduinoJson
   - ESP8266WiFi
   - ESP8266HTTPClient

### 2. Supabase 프로젝트 설정
1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. `supabase-api/schema.sql` 실행하여 데이터베이스 스키마 생성
3. API 키 및 URL 확인

### 3. 환경 변수 설정
```bash
# supabase-api/.env 파일 생성
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Arduino 코드 설정
```cpp
// farmlink_esp8266.ino에서 수정
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* supabaseUrl = "YOUR_SUPABASE_URL";
const char* supabaseKey = "YOUR_SUPABASE_ANON_KEY";
```

## 사용법

### 1. Arduino 실행
1. Arduino IDE에서 `farmlink_esp8266.ino` 열기
2. WiFi 및 Supabase 설정 수정
3. Arduino에 업로드
4. 시리얼 모니터로 동작 확인

### 2. API 서버 실행
```bash
cd supabase-api
npm install
npm start
```

### 3. USB 대체 전송 (ESP8266 연결 실패 시)
```bash
cd arduino-project
python usb_data_sender.py
```

## 자동 제어 로직

### 워터펌프 제어
- **조건**: 토양 수분 < 20%
- **동작**: 5초간 워터펌프 작동
- **목적**: 토양 수분 자동 보충

### 팬 제어
- **조건**: 온도 ≥ 30°C 또는 습도 ≥ 70%
- **동작**: 5초간 팬 작동
- **목적**: 온습도 조절

### LED 제어
- **조건**: 조도 > 60ph
- **동작**: 조도에 비례한 밝기로 LED 점등
- **목적**: 조도 부족 시 보조 조명

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
curl "http://localhost:3000/api/sensor-data?limit=10"
```

### 센서 데이터 통계
```bash
curl "http://localhost:3000/api/sensor-data/stats"
```

## 문제 해결

### 일반적인 문제들

1. **ESP8266 연결 실패**
   - WiFi 신호 강도 확인
   - SSID/비밀번호 확인
   - USB 데이터 전송 스크립트 사용

2. **센서 데이터 오류**
   - 센서 연결 상태 확인
   - 전원 공급 확인
   - 시리얼 모니터로 디버깅

3. **Supabase 연결 실패**
   - 인터넷 연결 확인
   - Supabase URL/키 확인
   - 데이터베이스 테이블 구조 확인

4. **API 서버 오류**
   - 환경 변수 설정 확인
   - 포트 충돌 확인
   - 로그 파일 확인

## 확장 가능성

### 추가 센서
- pH 센서
- EC (전기전도도) 센서
- CO2 센서
- 토양 온도 센서

### 추가 기능
- 웹 대시보드
- 모바일 앱
- 머신러닝 기반 예측
- 자동 급수 시스템
- 원격 제어

### 클라우드 서비스
- AWS IoT
- Google Cloud IoT
- Azure IoT Hub
- Firebase

## 라이선스

MIT License

## 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 연락처

프로젝트 관련 문의: [이메일 주소]

프로젝트 링크: [GitHub Repository URL]
