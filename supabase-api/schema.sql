-- Farm Link Project Database Schema
-- Supabase 데이터베이스 테이블 생성 스크립트

-- 센서 데이터 테이블
CREATE TABLE IF NOT EXISTS sensor_data (
    id BIGSERIAL PRIMARY KEY,
    soil_moisture DECIMAL(5,2) NOT NULL,  -- 토양 수분 (%)
    light_intensity DECIMAL(5,2) NOT NULL, -- 조도 (ph)
    temperature DECIMAL(5,2) NOT NULL,     -- 온도 (°C)
    humidity DECIMAL(5,2) NOT NULL,        -- 습도 (%)
    timestamp TIMESTAMPTZ DEFAULT NOW(),   -- 측정 시간
    device_id VARCHAR(50) DEFAULT 'farmlink-001', -- 디바이스 ID
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 디바이스 정보 테이블
CREATE TABLE IF NOT EXISTS devices (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active',
    last_seen TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 알림 설정 테이블
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    device_id VARCHAR(50) REFERENCES devices(id),
    notification_type VARCHAR(50) NOT NULL, -- 'low_moisture', 'high_temp', 'high_humidity'
    threshold_value DECIMAL(5,2) NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 센서 임계값 설정 테이블
CREATE TABLE IF NOT EXISTS sensor_thresholds (
    id BIGSERIAL PRIMARY KEY,
    device_id VARCHAR(50) REFERENCES devices(id),
    sensor_type VARCHAR(50) NOT NULL, -- 'soil_moisture', 'temperature', 'humidity', 'light_intensity'
    threshold_value DECIMAL(5,2) NOT NULL,
    control_action VARCHAR(50) NOT NULL, -- 'water_pump', 'fan', 'led'
    operator VARCHAR(10) NOT NULL, -- 'lt' (less than), 'gt' (greater than), 'eq' (equal)
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 제어 로그 테이블
CREATE TABLE IF NOT EXISTS control_logs (
    id BIGSERIAL PRIMARY KEY,
    device_id VARCHAR(50) REFERENCES devices(id),
    action VARCHAR(50) NOT NULL, -- 'water_pump', 'fan', 'led'
    duration INTEGER, -- 작동 시간 (초)
    triggered_by VARCHAR(50), -- 'auto', 'manual'
    sensor_data_id BIGINT REFERENCES sensor_data(id),
    threshold_id BIGINT REFERENCES sensor_thresholds(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_sensor_data_timestamp ON sensor_data(timestamp);
CREATE INDEX IF NOT EXISTS idx_sensor_data_device_id ON sensor_data(device_id);
CREATE INDEX IF NOT EXISTS idx_control_logs_device_id ON control_logs(device_id);
CREATE INDEX IF NOT EXISTS idx_control_logs_created_at ON control_logs(created_at);

-- RLS (Row Level Security) 정책 설정
ALTER TABLE sensor_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE control_logs ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 센서 데이터를 읽을 수 있도록 허용
CREATE POLICY "Allow read access to sensor_data" ON sensor_data
    FOR SELECT USING (true);

-- 모든 사용자가 센서 데이터를 삽입할 수 있도록 허용
CREATE POLICY "Allow insert access to sensor_data" ON sensor_data
    FOR INSERT WITH CHECK (true);

-- 모든 사용자가 디바이스 정보를 읽을 수 있도록 허용
CREATE POLICY "Allow read access to devices" ON devices
    FOR SELECT USING (true);

-- 모든 사용자가 제어 로그를 읽을 수 있도록 허용
CREATE POLICY "Allow read access to control_logs" ON control_logs
    FOR SELECT USING (true);

-- 모든 사용자가 제어 로그를 삽입할 수 있도록 허용
CREATE POLICY "Allow insert access to control_logs" ON control_logs
    FOR INSERT WITH CHECK (true);

-- 초기 디바이스 데이터 삽입
INSERT INTO devices (id, name, location) 
VALUES ('farmlink-001', 'Farm Link Main Device', 'Greenhouse A')
ON CONFLICT (id) DO NOTHING;

-- 기본 알림 설정
INSERT INTO notifications (device_id, notification_type, threshold_value) VALUES
('farmlink-001', 'low_moisture', 20.0),
('farmlink-001', 'high_temp', 30.0),
('farmlink-001', 'high_humidity', 70.0)
ON CONFLICT DO NOTHING;

-- 기본 센서 임계값 설정
INSERT INTO sensor_thresholds (device_id, sensor_type, threshold_value, control_action, operator) VALUES
('farmlink-001', 'soil_moisture', 20.0, 'water_pump', 'lt'),  -- 수분 20% 미만시 물펌프 작동
('farmlink-001', 'temperature', 30.0, 'fan', 'gt'),           -- 온도 30°C 초과시 팬 작동
('farmlink-001', 'humidity', 70.0, 'fan', 'gt'),              -- 습도 70% 초과시 팬 작동
('farmlink-001', 'light_intensity', 60.0, 'led', 'lt')        -- 조도 60ph 미만시 LED 작동
ON CONFLICT DO NOTHING;

-- 기본값 설정 테이블 생성
CREATE TABLE IF NOT EXISTS default_settings (
    id BIGSERIAL PRIMARY KEY,
    device_id VARCHAR(50) REFERENCES devices(id),
    setting_type VARCHAR(50) NOT NULL, -- 'sensor_threshold', 'control_duration', 'system_config'
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(device_id, setting_type, setting_key)
);

-- 기본값 설정 데이터 삽입
INSERT INTO default_settings (device_id, setting_type, setting_key, setting_value, description) VALUES
-- 센서 임계값 기본값
('farmlink-001', 'sensor_threshold', 'soil_moisture_water_pump', '20.0', '토양 수분 물펌프 작동 임계값'),
('farmlink-001', 'sensor_threshold', 'temperature_fan', '30.0', '온도 팬 작동 임계값'),
('farmlink-001', 'sensor_threshold', 'humidity_fan', '70.0', '습도 팬 작동 임계값'),
('farmlink-001', 'sensor_threshold', 'light_intensity_led', '60.0', '조도 LED 작동 임계값'),

-- 제어 시간 기본값
('farmlink-001', 'control_duration', 'water_pump', '5000', '물펌프 기본 작동 시간 (밀리초)'),
('farmlink-001', 'control_duration', 'fan', '5000', '팬 기본 작동 시간 (밀리초)'),
('farmlink-001', 'control_duration', 'led', '5000', 'LED 기본 작동 시간 (밀리초)'),

-- 시스템 설정 기본값
('farmlink-001', 'system_config', 'auto_control_enabled', 'true', '자동 제어 활성화'),
('farmlink-001', 'system_config', 'data_send_interval', '5000', '데이터 전송 간격 (밀리초)'),
('farmlink-001', 'system_config', 'sensor_read_interval', '1000', '센서 읽기 간격 (밀리초)'),
('farmlink-001', 'system_config', 'emergency_stop_threshold', '95.0', '비상 정지 임계값 (%)')
ON CONFLICT (device_id, setting_type, setting_key) DO NOTHING;

-- RLS 정책 추가
ALTER TABLE default_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to default_settings" ON default_settings
    FOR SELECT USING (true);

CREATE POLICY "Allow insert access to default_settings" ON default_settings
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update access to default_settings" ON default_settings
    FOR UPDATE USING (true);
