#!/usr/bin/env python3
"""
Farm Link Project - USB 데이터 전송 스크립트
ESP8266 연결이 안될 때 노트북 USB를 통한 Supabase 데이터 전송
"""

import serial
import requests
import json
import time
import sys
from datetime import datetime

# 시리얼 포트 설정 (Windows에서는 COM3, COM4 등으로 변경)
SERIAL_PORT = 'COM7'  # Arduino가 연결된 포트로 변경
BAUD_RATE = 9600

# API 서버 설정 (supabase-api를 통해 데이터 전송)
API_BASE_URL = "http://localhost:3000"

def connect_to_arduino():
    """Arduino와 시리얼 연결"""
    try:
        ser = serial.Serial(
            port=SERIAL_PORT, 
            baudrate=BAUD_RATE, 
            timeout=1,
            bytesize=serial.EIGHTBITS,
            parity=serial.PARITY_NONE,
            stopbits=serial.STOPBITS_ONE,
            xonxoff=False,
            rtscts=False,
            dsrdtr=False
        )
        print(f"Arduino 연결 성공: {SERIAL_PORT}")
        # 연결 후 잠시 대기
        time.sleep(2)
        return ser
    except serial.SerialException as e:
        print(f"Arduino 연결 실패: {e}")
        print("사용 가능한 포트를 확인하세요:")
        print("Windows: COM1, COM2, COM3, ...")
        print("Mac/Linux: /dev/ttyUSB0, /dev/ttyACM0, ...")
        return None

def parse_sensor_data(line):
    """시리얼 데이터에서 센서 값 파싱 (JSON 형태)"""
    try:
        # JSON 형태의 데이터인지 확인
        if line.startswith('{') and line.endswith('}'):
            data = json.loads(line)
            print(f"JSON 데이터 파싱 성공: {data}")
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

def send_to_api(data):
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
            f"{API_BASE_URL}/api/sensor-data",
            headers=headers,
            json=data,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print(f"✓ API 전송 성공: {data['soil_moisture']}% 수분, {data['temperature']}°C")
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

def main():
    """메인 실행 함수"""
    print("Farm Link USB 데이터 전송기 시작")
    print("=" * 40)
    
    # Arduino 연결
    ser = connect_to_arduino()
    if not ser:
        sys.exit(1)
    
    print("센서 데이터 수집 중... (Ctrl+C로 종료)")
    print("-" * 40)
    
    try:
        while True:
            # 시리얼 데이터 읽기
            if ser.in_waiting > 0:
                try:
                    # 바이트 데이터 읽기
                    raw_data = ser.readline()
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
                            print(f"수신된 데이터: {line}")
                            
                            # 데이터 파싱
                            sensor_data = parse_sensor_data(line)
                            
                            if sensor_data and len(sensor_data) >= 4:
                                # API 서버로 전송
                                if send_to_api(sensor_data):
                                    print(f"✓ 데이터 전송 완료: {sensor_data}")
                                else:
                                    print(f"✗ 데이터 전송 실패: {sensor_data}")
                            else:
                                print(f"✗ 데이터 파싱 실패: {line}")
                
                except Exception as e:
                    print(f"시리얼 데이터 읽기 오류: {e}")
                    continue
            
            time.sleep(0.1)  # CPU 사용량 줄이기
            
    except KeyboardInterrupt:
        print("\n프로그램을 종료합니다...")
    finally:
        ser.close()
        print("Arduino 연결이 종료되었습니다.")

if __name__ == "__main__":
    main()
