@echo off
echo Farm Link USB 데이터 전송기 시작
echo ========================================
echo.
echo 1. 아두이노가 USB로 연결되어 있는지 확인하세요
echo 2. 올바른 COM 포트를 설정했는지 확인하세요
echo 3. 인터넷 연결이 되어 있는지 확인하세요
echo.
pause

python usb_data_sender.py

pause
