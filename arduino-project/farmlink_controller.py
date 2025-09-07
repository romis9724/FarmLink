#!/usr/bin/env python3
"""
Farm Link 통합 제어 스크립트
아두이노 센서 데이터 수집 및 원격 제어를 통합한 스크립트
"""

import serial
import time
import sys
import argparse
import json
import requests
import threading
from datetime import datetime

class FarmLinkController:
    def __init__(self, port='COM7', baudrate=9600):
        self.port = port
        self.baudrate = baudrate
        self.serial_conn = None
        self.api_base_url = "http://localhost:3000"
        self.data_collection_active = False
        self.data_thread = None
        self.threshold_sync_active = False
        self.threshold_sync_thread = None
        
    def connect(self):
        """시리얼 포트 연결"""
        try:
            self.serial_conn = serial.Serial(
                port=self.port, 
                baudrate=self.baudrate, 
                timeout=1,
                bytesize=serial.EIGHTBITS,
                parity=serial.PARITY_NONE,
                stopbits=serial.STOPBITS_ONE,
                xonxoff=False,
                rtscts=False,
                dsrdtr=False
            )
            time.sleep(2)  # 연결 안정화 대기
            print(f"✅ {self.port} 포트에 연결되었습니다.")
            return True
        except Exception as e:
            print(f"❌ 시리얼 포트 연결 실패: {e}")
            return False
    
    def disconnect(self):
        """시리얼 포트 연결 해제"""
        self.stop_data_collection()
        self.stop_threshold_sync()
        if self.serial_conn and self.serial_conn.is_open:
            self.serial_conn.close()
            print("🔌 시리얼 포트 연결이 해제되었습니다.")
    
    def get_active_threshold_config(self, device_id='farmlink-001'):
        """활성화된 임계치 설정 조회"""
        try:
            response = requests.get(
                f"{self.api_base_url}/api/threshold-configs/{device_id}/active",
                timeout=5
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get('success') and result.get('data'):
                    print(f"✅ 활성화된 임계치 설정 조회 성공: {result['data']['config_name']}")
                    return result['data']
                else:
                    print(f"⚠️ 활성화된 임계치 설정이 없습니다: {result.get('message', 'Unknown error')}")
                    return None
            else:
                print(f"⚠️ API 서버 오류: {response.status_code}")
                return None
                
        except requests.exceptions.RequestException as e:
            print(f"⚠️ 네트워크 오류: {e}")
            return None
        except Exception as e:
            print(f"⚠️ 임계치 설정 조회 오류: {e}")
            return None
    
    def send_threshold_config_to_arduino(self, device_id='farmlink-001'):
        """활성화된 임계치 설정을 아두이노에 전송"""
        # API에서 활성화된 임계치 설정 조회
        threshold_config = self.get_active_threshold_config(device_id)
        
        if not threshold_config:
            print("❌ 전송할 임계치 설정이 없습니다.")
            return False
        
        # 아두이노에 전송할 간단한 문자열 데이터 구성
        # 형식: "M:69,D:68,T:30,H:66//"
        soil_moisture = int(threshold_config.get('soil_moisture_threshold', 20))
        light_intensity = int(threshold_config.get('light_intensity_threshold', 60))
        temperature = int(threshold_config.get('temperature_threshold', 30.0))
        humidity = int(threshold_config.get('humidity_threshold', 70.0))
        
        threshold_string = f"M:{soil_moisture},D:{light_intensity},T:{temperature},H:{humidity}//"
        
        if not self.serial_conn or not self.serial_conn.is_open:
            print("❌ 시리얼 포트가 연결되지 않았습니다.")
            return False
        
        try:
            # 간단한 문자열 데이터를 시리얼로 전송
            command_bytes = threshold_string.encode('utf-8')
            self.serial_conn.write(command_bytes)
            print(f"📤 임계치 설정 전송: {threshold_config['config_name']}")
            print(f"📋 전송 데이터: {threshold_string}")
            
            # 응답 대기
            time.sleep(1)
            if self.serial_conn.in_waiting > 0:
                response = self.serial_conn.readline().decode('utf-8').strip()
                print(f"📥 아두이노 응답: {response}")
            
            return True
            
        except Exception as e:
            print(f"❌ 임계치 설정 전송 실패: {e}")
            return False
    
    def parse_sensor_data(self, line):
        """시리얼 데이터에서 센서 값 파싱 (JSON 형태)"""
        try:
            # JSON 형태의 데이터인지 확인
            if line.startswith('{') and line.endswith('}'):
                data = json.loads(line)
                return data
            else:
                # 기존 텍스트 형태의 데이터 처리 (백업)
                data = {}
                
                # 수분량 추출
                if "수분량:" in line:
                    moisture_start = line.find("수분량:") + 4
                    moisture_end = line.find("%", moisture_start)
                    data['soil_moisture'] = float(line[moisture_start:moisture_end].strip())
                
                # 조도 추출
                if "조도:" in line:
                    light_start = line.find("조도:") + 3
                    light_end = line.find("ph", light_start)
                    data['light_intensity'] = float(line[light_start:light_end].strip())
                
                # 온도 추출
                if "온도:" in line:
                    temp_start = line.find("온도:") + 3
                    temp_end = line.find("°C", temp_start)
                    data['temperature'] = float(line[temp_start:temp_end].strip())
                
                # 습도 추출
                if "습도:" in line:
                    humidity_start = line.find("습도:") + 3
                    humidity_end = line.find("%", humidity_start)
                    data['humidity'] = float(line[humidity_start:humidity_end].strip())
                
                return data if len(data) == 4 else None
                
        except (ValueError, IndexError, json.JSONDecodeError) as e:
            print(f"데이터 파싱 오류: {e}")
            return None
    
    def send_to_api(self, data):
        """API 서버를 통해 데이터 전송"""
        try:
            # 타임스탬프 처리
            if 'timestamp' in data:
                # 아두이노의 millis() 값이면 현재 시간으로 변환
                if isinstance(data['timestamp'], (int, float)):
                    data['timestamp'] = datetime.now().isoformat()
            else:
                # 타임스탬프가 없으면 현재 시간 추가
                data['timestamp'] = datetime.now().isoformat()
            
            # API 서버 호출
            headers = {
                'Content-Type': 'application/json'
            }
            
            response = requests.post(
                f"{self.api_base_url}/api/sensor-data",
                headers=headers,
                json=data,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    print(f"✓ API 전송 성공: {data.get('soil_moisture', 'N/A')}% 수분, {data.get('temperature', 'N/A')}°C")
                    return True
                else:
                    print(f"✗ API 전송 실패: {result.get('error', 'Unknown error')}")
                    return False
            else:
                print(f"✗ API 서버 오류: {response.status_code} - {response.text}")
                return False
                
        except requests.exceptions.RequestException as e:
            print(f"✗ 네트워크 오류: {e}")
            return False
        except Exception as e:
            print(f"✗ 예상치 못한 오류: {e}")
            return False
    
    def data_collection_worker(self):
        """데이터 수집 워커 스레드"""
        print("📊 센서 데이터 수집 시작...")
        
        while self.data_collection_active:
            try:
                if self.serial_conn and self.serial_conn.in_waiting > 0:
                    # 바이트 데이터 읽기
                    raw_data = self.serial_conn.readline()
                    if raw_data:
                        # 여러 인코딩 시도
                        line = None
                        for encoding in ['utf-8', 'latin-1', 'cp1252']:
                            try:
                                line = raw_data.decode(encoding).strip()
                                break
                            except UnicodeDecodeError:
                                continue
                        
                        # 모든 인코딩 실패 시 에러 무시하고 처리
                        if line is None:
                            line = raw_data.decode('utf-8', errors='ignore').strip()
                        
                        # JSON 데이터 또는 텍스트 데이터 처리
                        if line and (line.startswith('{') or "수분량:" in line):
                            print(f"📡 수신된 데이터: {line}")
                            
                            # 데이터 파싱
                            sensor_data = self.parse_sensor_data(line)
                            
                            if sensor_data and len(sensor_data) >= 4:
                                # API 서버로 전송
                                self.send_to_api(sensor_data)
                            else:
                                print(f"✗ 데이터 파싱 실패: {line}")
                
                time.sleep(5)  # 5초마다 데이터 수집
                
            except Exception as e:
                print(f"데이터 수집 오류: {e}")
                time.sleep(1)
    
    def start_data_collection(self):
        """데이터 수집 시작"""
        if not self.data_collection_active:
            self.data_collection_active = True
            self.data_thread = threading.Thread(target=self.data_collection_worker, daemon=True)
            self.data_thread.start()
            print("✅ 데이터 수집이 시작되었습니다.")
        else:
            print("⚠️ 데이터 수집이 이미 실행 중입니다.")
    
    def stop_data_collection(self):
        """데이터 수집 중지"""
        if self.data_collection_active:
            self.data_collection_active = False
            if self.data_thread:
                self.data_thread.join(timeout=1)
            print("⏹️ 데이터 수집이 중지되었습니다.")
    
    def threshold_sync_worker(self):
        """임계치 동기화 워커 스레드 (7초마다 실행)"""
        print("🔄 임계치 동기화 시작...")
        
        while self.threshold_sync_active:
            try:
                # 활성화된 임계치 설정 조회
                print("📋 활성화된 임계치 설정 조회 중...")
                config = self.get_active_threshold_config()
                
                if config:
                    # 아두이노에 임계치 설정 전송
                    print("📤 임계치 설정을 아두이노에 전송 중...")
                    self.send_threshold_config_to_arduino()
                else:
                    print("⚠️ 활성화된 임계치 설정이 없습니다.")
                
                # 7초 대기
                time.sleep(7)
                
            except Exception as e:
                print(f"❌ 임계치 동기화 오류: {e}")
                time.sleep(7)
    
    def start_threshold_sync(self):
        """임계치 동기화 시작"""
        if not self.threshold_sync_active:
            self.threshold_sync_active = True
            self.threshold_sync_thread = threading.Thread(target=self.threshold_sync_worker, daemon=True)
            self.threshold_sync_thread.start()
            print("✅ 임계치 동기화가 시작되었습니다.")
        else:
            print("⚠️ 임계치 동기화가 이미 실행 중입니다.")
    
    def stop_threshold_sync(self):
        """임계치 동기화 중지"""
        if self.threshold_sync_active:
            self.threshold_sync_active = False
            if self.threshold_sync_thread:
                self.threshold_sync_thread.join(timeout=1)
            print("⏹️ 임계치 동기화가 중지되었습니다.")
    

def main():
    parser = argparse.ArgumentParser(description='Farm Link 자동화 제어 시스템')
    parser.add_argument('--port', default='COM7', help='시리얼 포트 (기본: COM7)')
    parser.add_argument('--device-id', default='farmlink-001', help='장치 ID (기본: farmlink-001)')
    
    args = parser.parse_args()
    
    controller = FarmLinkController(port=args.port)
    
    if not controller.connect():
        sys.exit(1)
    
    try:
        # 자동화 모드
        print("🌱 Farm Link 자동화 시스템 시작")
        print("📊 센서 데이터 수집: 5초마다 실행")
        print("🔄 임계치 동기화: 7초마다 실행")
        print("Ctrl+C로 종료")
        print("-" * 50)
        
        # 데이터 수집 시작 (5초마다)
        controller.start_data_collection()
        
        # 임계치 동기화 시작 (7초마다)
        controller.start_threshold_sync()
        
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n프로그램을 종료합니다...")
    
    finally:
        controller.disconnect()

if __name__ == "__main__":
    main()
