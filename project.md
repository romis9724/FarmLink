# Farm Link Project

스마트팜 키트를 활용한 IoT 기반 농업 모니터링 및 자동 제어 시스템입니다.

## 프로젝트 구성

### 1. Arduino 프로젝트 (`arduino-project/`)
- **farmlink_esp8266.ino**: ESP8266 모듈을 통한 WiFi 연결 및 Supabase 데이터 전송
- **usb_data_sender.py**: ESP8266 연결 실패 시 USB를 통한 대체 데이터 전송 스크립트
- **README.md**: Arduino 프로젝트 상세 문서

### 2. Supabase API 프로젝트 (`supabase-api/`)
- **server.js**: Express.js 기반 REST API 서버
- **schema.sql**: PostgreSQL 데이터베이스 스키마
- **types.ts**: TypeScript 타입 정의
- **supabase-client.ts**: Supabase 클라이언트 설정
- **README.md**: API 서버 상세 문서

### 3. 프로젝트 문서 (`docs/`)
- **README.md**: 전체 프로젝트 통합 문서

## 주요 기능

- **실시간 센서 모니터링**: 온도, 습도, 토양 수분, 조도 측정
- **자동 제어 시스템**: 워터펌프, 팬, LED 자동 제어
- **클라우드 데이터 저장**: Supabase를 통한 센서 데이터 저장
- **USB 대체 전송**: ESP8266 연결 실패 시 노트북 USB를 통한 데이터 전송

## 하드웨어 구성

- Arduino UNO + ESP8266 모듈
- DHT11 온습도 센서
- 토양 수분 센서
- 조도 센서 (CDS)
- LCD I2C 디스플레이
- 모터 드라이버 (워터펌프, 팬)
- LED

## 빠른 시작

1. **Arduino 설정**: `arduino-project/README.md` 참조
2. **Supabase 설정**: `supabase-api/README.md` 참조
3. **전체 문서**: `docs/README.md` 참조

## 프로젝트 상태

✅ Arduino 코드 작성 완료
✅ Supabase API 서버 작성 완료
✅ USB 대체 전송 스크립트 작성 완료
✅ 데이터베이스 스키마 설계 완료
✅ 프로젝트 문서화 완료

## 다음 단계

- [ ] 하드웨어 연결 및 테스트
- [ ] Supabase 프로젝트 설정
- [ ] 실제 센서 데이터 수집 테스트
- [ ] 웹 대시보드 개발 (선택사항)