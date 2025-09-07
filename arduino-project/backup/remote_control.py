#!/usr/bin/env python3
"""
Farm Link 원격 제어 스크립트
아두이노에 제어 명령을 전송하는 스크립트
"""

import serial
import time
import sys
import argparse
import json
import requests

class FarmLinkController:
    def __init__(self, port='COM7', baudrate=9600):
        self.port = port
        self.baudrate = baudrate
        self.serial_conn = None
        self.api_base_url = "http://localhost:3000"
        
    def connect(self):
        """시리얼 포트 연결"""
        try:
            self.serial_conn = serial.Serial(self.port, self.baudrate, timeout=1)
            time.sleep(2)  # 연결 안정화 대기
            print(f"✅ {self.port} 포트에 연결되었습니다.")
            return True
        except Exception as e:
            print(f"❌ 시리얼 포트 연결 실패: {e}")
            return False
    
    def disconnect(self):
        """시리얼 포트 연결 해제"""
        if self.serial_conn and self.serial_conn.is_open:
            self.serial_conn.close()
            print("🔌 시리얼 포트 연결이 해제되었습니다.")
    
    def log_control_action(self, action, duration, triggered_by='manual'):
        """API 서버를 통해 제어 로그 기록"""
        try:
            log_data = {
                'device_id': 'farmlink-001',
                'action': action,
                'duration': duration,
                'triggered_by': triggered_by
            }
            
            response = requests.post(
                f"{self.api_base_url}/api/control-logs",
                json=log_data,
                timeout=5
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    print(f"📝 제어 로그 기록 완료: {action}")
                    return True
                else:
                    print(f"⚠️ 제어 로그 기록 실패: {result.get('error')}")
                    return False
            else:
                print(f"⚠️ API 서버 오류: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"⚠️ 제어 로그 기록 오류: {e}")
            return False
    
    def send_command(self, command):
        """아두이노에 명령 전송"""
        if not self.serial_conn or not self.serial_conn.is_open:
            print("❌ 시리얼 포트가 연결되지 않았습니다.")
            return False
        
        try:
            command_bytes = (command + '\n').encode('utf-8')
            self.serial_conn.write(command_bytes)
            print(f"📤 명령 전송: {command}")
            
            # 응답 대기
            time.sleep(0.5)
            if self.serial_conn.in_waiting > 0:
                response = self.serial_conn.readline().decode('utf-8').strip()
                print(f"📥 응답: {response}")
            
            return True
        except Exception as e:
            print(f"❌ 명령 전송 실패: {e}")
            return False
    
    def control_device(self, action, duration=5000):
        """장치 제어"""
        command = f"control:{action}:{duration}"
        success = self.send_command(command)
        
        # 제어 로그 기록
        if success and action != 'status':
            self.log_control_action(action, duration, 'manual')
        
        return success
    
    def get_status(self):
        """시스템 상태 조회"""
        return self.send_command("status")
    
    def reset_system(self):
        """시스템 리셋"""
        return self.send_command("reset")
    
    def restore_defaults(self):
        """기본값으로 복구"""
        return self.send_command("defaults")
    
    def turn_off_all(self):
        """모든 장치 끄기"""
        return self.send_command("control:all_off:0")

def main():
    parser = argparse.ArgumentParser(description='Farm Link 원격 제어')
    parser.add_argument('--port', default='COM7', help='시리얼 포트 (기본: COM7)')
    parser.add_argument('--action', choices=['water_pump', 'fan', 'led', 'all_off', 'status', 'reset', 'defaults'], 
                       help='제어 액션')
    parser.add_argument('--duration', type=int, default=5000, help='작동 시간 (밀리초, 기본: 5000)')
    parser.add_argument('--interactive', action='store_true', help='대화형 모드')
    
    args = parser.parse_args()
    
    controller = FarmLinkController(port=args.port)
    
    if not controller.connect():
        sys.exit(1)
    
    try:
        if args.interactive:
            # 대화형 모드
            print("\n🌱 Farm Link 원격 제어 대화형 모드")
            print("명령어:")
            print("  water_pump [시간] - 물펌프 작동")
            print("  fan [시간] - 팬 작동")
            print("  led [시간] - LED 작동")
            print("  all_off - 모든 장치 끄기")
            print("  status - 상태 조회")
            print("  reset - 시스템 리셋")
            print("  defaults - 기본값 복구")
            print("  quit - 종료")
            print("-" * 50)
            
            while True:
                try:
                    user_input = input("\n명령 입력: ").strip().split()
                    if not user_input:
                        continue
                    
                    command = user_input[0].lower()
                    
                    if command == 'quit':
                        break
                    elif command == 'status':
                        controller.get_status()
                    elif command == 'reset':
                        controller.reset_system()
                    elif command == 'defaults':
                        controller.restore_defaults()
                    elif command == 'all_off':
                        controller.turn_off_all()
                    elif command in ['water_pump', 'fan', 'led']:
                        duration = int(user_input[1]) if len(user_input) > 1 else 5000
                        controller.control_device(command, duration)
                    else:
                        print("❌ 알 수 없는 명령입니다.")
                
                except KeyboardInterrupt:
                    break
                except Exception as e:
                    print(f"❌ 오류: {e}")
        
        else:
            # 명령행 모드
            if args.action == 'status':
                controller.get_status()
            elif args.action == 'reset':
                controller.reset_system()
            elif args.action == 'defaults':
                controller.restore_defaults()
            elif args.action == 'all_off':
                controller.turn_off_all()
            else:
                controller.control_device(args.action, args.duration)
    
    finally:
        controller.disconnect()

if __name__ == "__main__":
    main()
