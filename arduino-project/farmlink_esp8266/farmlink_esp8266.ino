/* Farm Link Project - ESP8266 Supabase 연동 */
/* 스마트팜 키트 센서 데이터 수집 및 클라우드 저장 */

#include <Wire.h> 
#include <LiquidCrystal_I2C.h>
#include <DHT.h>
#include <SoftwareSerial.h>

// 센서 핀 정의
#define DHTPIN 4
#define DHTTYPE DHT11
#define A_1A 10
#define A_1B 9
#define B_1A 5
#define B_1B 6
#define SOIL_HUMI A0
#define cds_pin A1
#define cds_ledpin 3

// 시리얼 통신 핀 정의 (ESP8266 모듈과 연결)
#define RX_PIN 12  // 아두이노 RX → ESP8266 TX
#define TX_PIN 13  // 아두이노 TX → ESP8266 RX

// ESP8266 모듈과의 통신 설정 (주석처리)
// const unsigned long ESP_TIMEOUT = 5000; // 5초 타임아웃
// unsigned long lastESPCommand = 0;
// bool esp8266Ready = false;

// WiFi 설정 (주석처리)
// const char* ssid = "Kdh";
// const char* password = "abcd1234";

// Supabase 설정 (주석처리)
// const char* supabaseUrl = "https://ldzsievvxhaqepipzral.supabase.co";
// const char* supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkenNpZXZ2eGhhcWVwaXB6cmFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNDEwNjcsImV4cCI6MjA3MjcxNzA2N30.MPs7K-9mpNDYglAmLWnow9CeLY8Gs4SRN66iI-i6Tm0";

// LCD 및 센서 객체
LiquidCrystal_I2C lcd(0x27, 16, 2);
DHT dht(DHTPIN, DHTTYPE);
SoftwareSerial mySerial(RX_PIN, TX_PIN); // RX, TX

// 센서 데이터 변수
int soil;
int val;
int ledval;
float h, t;

// 임계치 설정 변수 (동적 설정 가능)
float temperature_threshold = 35.0;
float humidity_threshold = 70.0;
int soil_moisture_threshold = 80;
int light_intensity_threshold = 90;
String config_name = "기본 설정";


// 데이터 전송 간격 (밀리초)
const unsigned long SEND_INTERVAL = 5000; // 5초마다 시리얼로 전송
unsigned long lastSendTime = 0;

void setup() {
  Serial.begin(9600);
  mySerial.begin(9600); // 소프트웨어 시리얼 초기화
  
  // LCD 초기화
  lcd.init();
  lcd.clear();
  lcd.backlight();
  lcd.setCursor(0,0);
  lcd.print("Farm Link Start!");
  lcd.setCursor(0,1);
  lcd.print("Serial Mode...");
  delay(2000);
  
  // ESP8266 모듈 초기화 (주석처리)
  // initESP8266();
  
  // 센서 초기화
  dht.begin();
  
  // 모터 핀 설정
  pinMode(A_1A, OUTPUT);
  pinMode(A_1B, OUTPUT);
  pinMode(B_1A, OUTPUT);
  pinMode(B_1B, OUTPUT);
  pinMode(cds_ledpin, OUTPUT);
  
  // 초기값 설정
  digitalWrite(A_1A, LOW);
  digitalWrite(A_1B, LOW);
  digitalWrite(B_1A, LOW);
  digitalWrite(B_1B, LOW);
  
  // 센서 연결 상태 확인
  Serial.println("=== 센서 연결 상태 확인 ===");
  Serial.print("토양 수분 센서 (A0): ");
  Serial.println(analogRead(SOIL_HUMI));
  Serial.print("조도 센서 (A1): ");
  Serial.println(analogRead(cds_pin));
  Serial.println("=========================");
  
  Serial.println("Farm Link 시스템 시작!");
}

void loop() {
  // 시리얼로부터 임계치 설정 수신
  checkSerialForThresholds();
  
  // 센서 데이터 읽기
  readSensorData();
  
  // LCD에 데이터 표시
  displaySensorData();
  
  // 시리얼 모니터에 데이터 출력
  printSensorData();
  
  // 자동 제어 로직
  controlWaterPump();
  controlFan();
  controlLED();
  
  // 주기적으로 데이터 전송 (시리얼만 사용)
  if (millis() - lastSendTime >= SEND_INTERVAL) {
    // WiFi 비활성화로 시리얼만 사용
    // if (esp8266Ready) {
    //   sendDataToSupabase();
    // } else {
      sendDataToSerial();
    // }
    lastSendTime = millis();
  }
  
  delay(1000);
}

void readSensorData() {
  // 온습도 센서 읽기
  h = dht.readHumidity();
  t = dht.readTemperature();
  
  if (isnan(h) || isnan(t)) {
    Serial.println("DHT 센서 값 읽기 실패!");
    return;
  }
  
  // 토양 수분 센서 읽기
  soil = map(analogRead(SOIL_HUMI), 1023, 0, 0, 100);
  
  // 조도 센서 읽기
  val = analogRead(cds_pin);
  ledval = map(val, 0, 1023, 0, 100);
}

void displaySensorData() {
  lcd.clear();
  lcd.backlight();
  lcd.display();
  
  // 첫 번째 줄: 수분량, 조도
  lcd.setCursor(0,0);
  lcd.print("M: ");
  lcd.print(soil);
  lcd.print("%");
  lcd.setCursor(8,0);
  lcd.print("D: ");
  lcd.print(ledval);
  lcd.print("ph");
  
  // 두 번째 줄: 온도, 습도
  lcd.setCursor(0,1);
  lcd.print("T: ");
  lcd.print(t, 0);
  lcd.print("C");
  lcd.setCursor(8,1);
  lcd.print("H: ");
  lcd.print(h, 0);
  lcd.print("%");
}

void printSensorData() {
  Serial.print("수분량: ");
  Serial.print(soil);
  Serial.print("%  조도: ");
  Serial.print(ledval);
  Serial.print("ph  온도: ");
  Serial.print(t);
  Serial.print("°C  습도: ");
  Serial.print(h);
  Serial.println("%");
}

void controlWaterPump() {
  if (soil < soil_moisture_threshold) {
    Serial.println("펌프 켜짐! 수분량: " + String(soil));
    analogWrite(A_1A, 220);
    digitalWrite(A_1B, LOW);
    delay(5000);
    digitalWrite(A_1A, LOW);
    digitalWrite(A_1B, LOW);
    digitalWrite(B_1A, LOW);
    digitalWrite(B_1B, LOW);
  } else {
    digitalWrite(A_1A, LOW);
    digitalWrite(A_1B, LOW);
    Serial.println("펌프 꺼짐! 수분량: " + String(soil));
  }
}

void controlFan() {
  if (t >= temperature_threshold || h >= humidity_threshold) {
    Serial.println("팬 작동 시작! 온도: " + String(t) + "°C, 습도: " + String(h) + "%");
    delay(5000);
    analogWrite(B_1A, 220);
    digitalWrite(B_1B, LOW);
    Serial.println("팬 작동 중...");
    delay(5000);
    digitalWrite(B_1A, LOW);
    digitalWrite(B_1B, LOW);
    digitalWrite(A_1A, LOW);
    digitalWrite(A_1B, LOW);
    Serial.println("팬 작동 완료");
    mySerial.println("팬 작동 완료");
  } else {
    digitalWrite(B_1A, LOW);
    digitalWrite(B_1B, LOW);
  }
}

void controlLED() {
  if (ledval > light_intensity_threshold) {
    analogWrite(cds_ledpin, ledval);
    mySerial.println("LED 켜짐! 조도: " + String(ledval));
  } else {
    analogWrite(cds_ledpin, LOW);
    mySerial.println("LED 꺼짐! 조도: " + String(ledval));
  }
}


/*
void initESP8266() {
  Serial.println("ESP8266 모듈 초기화 중...");
  
  // ESP8266 리셋
  sendESPCommand("AT+RST", 2000);
  delay(1000);
  
  // ESP8266 모드 설정 (Station 모드)
  if (sendESPCommand("AT+CWMODE=1", 2000)) {
    Serial.println("ESP8266 모드 설정 완료");
  }
  
  // WiFi 연결
  String wifiCmd = "AT+CWJAP=\"" + String(ssid) + "\",\"" + String(password) + "\"";
  if (sendESPCommand(wifiCmd, 10000)) {
    esp8266Ready = true;
    lcd.clear();
    lcd.setCursor(0,0);
    lcd.print("WiFi Connected!");
    lcd.setCursor(0,1);
    lcd.print("ESP8266 Ready");
    Serial.println("WiFi 연결 성공!");
  } else {
    esp8266Ready = false;
    lcd.clear();
    lcd.setCursor(0,0);
    lcd.print("WiFi Failed!");
    lcd.setCursor(0,1);
    lcd.print("Using Serial");
    Serial.println("WiFi 연결 실패! 시리얼 통신 사용");
  }
  delay(2000);
}
*/

/*
bool sendESPCommand(String command, unsigned long timeout) {
  Serial.println("ESP8266 명령: " + String(command));
  mySerial.println(command);
  
  unsigned long startTime = millis();
  String response = "";
  
  while (millis() - startTime < timeout) {
    if (mySerial.available()) {
      char c = mySerial.read();
      response += c;
      
      if (response.indexOf("OK") != -1) {
        Serial.println("ESP8266 응답: " + String(response));
        return true;
      } else if (response.indexOf("ERROR") != -1) {
        Serial.println("ESP8266 오류: " + String(response));
        return false;
      }
    }
  }
  
  Serial.println("ESP8266 타임아웃");
  return false;
}
*/

/*
void sendDataToSupabase() {
  if (!esp8266Ready) {
    sendDataToSerial();
    return;
  }
  
  // 간단한 JSON 데이터 생성
  String jsonData = "{";
  jsonData += "\"soil_moisture\":" + String(soil);
  jsonData += ",\"light_intensity\":" + String(ledval);
  jsonData += ",\"temperature\":" + String(t);
  jsonData += ",\"humidity\":" + String(h);
  jsonData += "}";
  
  // HTTP POST 요청 전송
  String httpCmd = "AT+HTTPCLIENT=2,0,\"" + String(supabaseUrl) + "\",\"application/json\",\"" + jsonData + "\"";
  
  if (sendESPCommand(httpCmd, 10000)) {
    Serial.println("Supabase 전송 성공!");
  } else {
    Serial.println("Supabase 전송 실패! 시리얼로 백업 전송");
    sendDataToSerial();
  }
}
*/

void sendDataToSerial() {
  // JSON 형태로 시리얼 데이터 전송 (하드웨어 시리얼과 소프트웨어 시리얼 모두)
  String jsonData = "{\"soil_moisture\":" + String(soil) + 
                   ",\"light_intensity\":" + String(ledval) + 
                   ",\"temperature\":" + String(t) + 
                   ",\"humidity\":" + String(h) + 
                   ",\"timestamp\":" + String(millis()) + "}";

  String jsonThresholdData = "{\"soil_moisture_threshold\":" + String(soil_moisture_threshold) + 
                  ",\"light_intensity_threshold\":" + String(light_intensity_threshold) + 
                  ",\"temperature_threshold\":" + String(temperature_threshold) + 
                  ",\"humidity_threshold\":" + String(humidity_threshold) + "}";

  
  // 하드웨어 시리얼 (USB)로 전송
  Serial.println(jsonData);
  Serial.println(jsonThresholdData);
  
  // 소프트웨어 시리얼 (12, 13번 핀)로 전송
  mySerial.println(jsonData);
  mySerial.println(jsonThresholdData);
}

// 시리얼로부터 임계치 설정 수신 함수
void checkSerialForThresholds() {
  if (mySerial.available()) {
    String input = mySerial.readStringUntil('/');
    input.trim();
    
    // "//"로 끝나는 임계치 설정 데이터인지 확인
    if (input.length() > 0) {
      mySerial.println("수신된 임계치 데이터: " + input);
      parseThresholdData(input);
    }
  }
}

// 임계치 설정 데이터 파싱 함수
void parseThresholdData(String data) {
  Serial.println("=== 임계치 설정 데이터 수신 ===");
  Serial.println("수신된 데이터: " + data);
  
  // "M:69,D:68,T:30,H:66" 형식 파싱
  
  // 수분 임계값 파싱 (M:)
  if (data.indexOf("M:") != -1) {
    int start = data.indexOf("M:") + 2;
    int end = data.indexOf(",", start);
    if (end == -1) end = data.length();
    soil_moisture_threshold = data.substring(start, end).toInt();
  }
  
  // 조도 임계값 파싱 (D:)
  if (data.indexOf("D:") != -1) {
    int start = data.indexOf("D:") + 2;
    int end = data.indexOf(",", start);
    if (end == -1) end = data.length();
    light_intensity_threshold = data.substring(start, end).toInt();
  }
  
  // 온도 임계값 파싱 (T:)
  if (data.indexOf("T:") != -1) {
    int start = data.indexOf("T:") + 2;
    int end = data.indexOf(",", start);
    if (end == -1) end = data.length();
    temperature_threshold = data.substring(start, end).toFloat();
  }
  
  // 습도 임계값 파싱 (H:)
  if (data.indexOf("H:") != -1) {
    int start = data.indexOf("H:") + 2;
    int end = data.indexOf(",", start);
    if (end == -1) end = data.length();
    humidity_threshold = data.substring(start, end).toFloat();
  }
  
  // 임계치 설정 업데이트 확인
  Serial.println("=== 임계치 설정 업데이트 ===");
  Serial.println("수분 임계값: " + String(soil_moisture_threshold) + "%");
  Serial.println("조도 임계값: " + String(light_intensity_threshold) + "ph");
  Serial.println("온도 임계값: " + String(temperature_threshold) + "°C");
  Serial.println("습도 임계값: " + String(humidity_threshold) + "%");
  Serial.println("=========================");
}
