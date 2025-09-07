# Farm Link Arduino Project

스마트팜 키트를 사용한 센서 데이터 수집 및 API 서버를 통한 클라우드 연동 프로젝트입니다.

## 하드웨어 구성

- **Arduino UNO** + **ESP8266 모듈**
- **센서들:**
  - DHT11 온습도 센서 (핀 4)
  - 토양 수분 센서 (A0)
  - 조도 센서 (A1)
  - LCD I2C 디스플레이 (0x27 주소)
- **액추에이터들:**
  - 워터펌프 모터 (핀 9, 10)
  - 팬 모터 (핀 5, 6)
  - LED (핀 3)

## 파일 구성

### 1. farmlink_esp8266.ino
ESP8266 모듈을 통한 WiFi 연결 및 Supabase 데이터 전송 코드

**주요 기능:**
- 센서 데이터 수집 (온도, 습도, 토양수분, 조도)
- LCD 디스플레이 출력
- 자동 제어 로직 (워터펌프, 팬, LED)
- 30초마다 Supabase에 데이터 전송

**설정 필요:**
```cpp
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* supabaseUrl = "YOUR_SUPABASE_URL";
const char* supabaseKey = "YOUR_SUPABASE_ANON_KEY";
```

### 2. farmlink_controller.py (통합 제어 스크립트)
센서 데이터 수집과 원격 제어를 통합한 스크립트

**주요 기능:**
- Arduino 시리얼 통신으로 센서 데이터 수신 (JSON + 텍스트 형태)
- 자동 JSON 파싱 및 데이터 검증
- API 서버를 통한 실시간 데이터 전송
- 시리얼 통신을 통한 Arduino 제어
- 워터펌프, 팬, LED 제어
- API 서버를 통한 제어 로그 기록
- 대화형 모드 및 백그라운드 데이터 수집 지원

**사용법:**
```bash
# Python 패키지 설치
pip install pyserial requests

# 센서 데이터 수집 모드
python farmlink_controller.py --data-collection

# 대화형 모드
python farmlink_controller.py --interactive

# 제어 명령
python farmlink_controller.py --action water_pump --duration 5000

# 또는 배치 파일 실행 (Windows)
run_farmlink.bat data          # 데이터 수집 모드
run_farmlink.bat interactive   # 대화형 모드
run_farmlink.bat control water_pump 5000  # 제어 명령
```

**설정 필요:**
```python
port = 'COM7'  # Arduino 포트로 변경
api_base_url = "http://localhost:3000"  # API 서버 주소
```

**주의사항:**
- API 서버(supabase-api)가 실행 중이어야 합니다
- API 서버를 통해 Supabase에 데이터가 전송됩니다
- 하나의 시리얼 포트를 공유하므로 동시에 여러 스크립트를 실행하지 마세요

**지원하는 데이터 형식:**
- JSON: `{"soil_moisture":70,"light_intensity":15,"temperature":31.30,"humidity":62.00,"timestamp":472960}`
- 텍스트: `수분량: 70%  조도: 15ph  온도: 31.30°C  습도: 62.00%`

**대화형 모드 명령:**
- `start_data`: 센서 데이터 수집 시작
- `stop_data`: 센서 데이터 수집 중지
- `water_pump [시간]`: 워터펌프 작동
- `fan [시간]`: 팬 작동
- `led [시간]`: LED 작동
- `all_off`: 모든 장치 끄기
- `status`: 시스템 상태 확인
- `reset`: 시스템 리셋
- `defaults`: 기본값으로 복구
- `quit`: 종료

## 설치 및 설정

### 1. Arduino IDE 설정
1. ESP8266 보드 매니저 설치
2. 필요한 라이브러리 설치:
   - LiquidCrystal_I2C
   - DHT sensor library
   - ArduinoJson
   - ESP8266WiFi
   - ESP8266HTTPClient

### 2. 하드웨어 연결
```
DHT11 센서:
- VCC → 5V
- GND → GND
- DATA → 핀 4

토양 수분 센서:
- VCC → 5V
- GND → GND
- SIG → A0

조도 센서:
- VCC → 5V
- GND → GND
- SIG → A1

LCD I2C:
- VCC → 5V
- GND → GND
- SDA → A4
- SCL → A5

모터 드라이버:
- A_1A → 핀 10 (워터펌프)
- A_1B → 핀 9
- B_1A → 핀 5 (팬)
- B_1B → 핀 6
```

### 3. WiFi 및 Supabase 설정
1. `farmlink_esp8266.ino`에서 WiFi 정보 수정
2. Supabase URL과 API 키 설정
3. Arduino에 업로드

## 자동 제어 로직

### 워터펌프 제어
- 토양 수분이 20% 미만일 때 5초간 작동

### 팬 제어
- 온도 30°C 이상 또는 습도 70% 이상일 때 5초간 작동

### LED 제어
- 조도가 60ph 이상일 때 조도에 비례한 밝기로 점등

## 문제 해결

### ESP8266 연결 실패
1. WiFi 신호 강도 확인
2. SSID/비밀번호 확인
3. USB 데이터 전송 스크립트 사용

### 센서 데이터 오류
1. 센서 연결 상태 확인
2. 전원 공급 확인
3. 시리얼 모니터로 디버깅

### Supabase 연결 실패
1. 인터넷 연결 확인
2. Supabase URL/키 확인
3. 데이터베이스 테이블 구조 확인
