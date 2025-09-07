@echo off
echo Farm Link 통합 제어기 시작
echo ================================

echo.
echo 사용법:
echo   데이터 수집 모드: run_farmlink.bat data
echo   대화형 모드: run_farmlink.bat interactive
echo   제어 명령: run_farmlink.bat control [action] [duration]
echo.

if "%1"=="data" (
    echo 센서 데이터 수집 모드 시작...
    python farmlink_controller.py --data-collection
) else if "%1"=="interactive" (
    echo 대화형 모드 시작...
    python farmlink_controller.py --interactive
) else if "%1"=="control" (
    if "%2"=="" (
        echo 제어 액션을 지정하세요: water_pump, fan, led, all_off, status, reset, defaults
        echo 예: run_farmlink.bat control water_pump 5000
    ) else (
        echo 제어 명령 실행: %2 %3
        python farmlink_controller.py --action %2 --duration %3
    )
) else (
    echo 대화형 모드로 시작합니다...
    python farmlink_controller.py --interactive
)

pause
