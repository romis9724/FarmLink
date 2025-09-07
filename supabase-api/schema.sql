-- Farm Link Project Database Schema
-- Supabase 데이터베이스 테이블 생성 스크립트 (실제 구조)

-- 센서 데이터 테이블
CREATE TABLE IF NOT EXISTS sensor_data (
    id BIGSERIAL PRIMARY KEY,
    soil_moisture NUMERIC(5,2) NOT NULL,  -- 토양 수분 (%)
    light_intensity NUMERIC(5,2) NOT NULL, -- 조도 (ph)
    temperature NUMERIC(5,2) NOT NULL,     -- 온도 (°C)
    humidity NUMERIC(5,2) NOT NULL,        -- 습도 (%)
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

-- 센서 임계치 설정 테이블
CREATE TABLE IF NOT EXISTS sensor_threshold_configs (
    id BIGSERIAL PRIMARY KEY,
    device_id VARCHAR(50) NOT NULL,
    config_name VARCHAR(100) NOT NULL,
    temperature_threshold NUMERIC(5,2),
    humidity_threshold NUMERIC(5,2),
    soil_moisture_threshold NUMERIC(5,2),
    light_intensity_threshold NUMERIC(5,2),
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by VARCHAR(100) DEFAULT 'admin'
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_sensor_data_timestamp ON sensor_data(timestamp);
CREATE INDEX IF NOT EXISTS idx_sensor_data_device_id ON sensor_data(device_id);
CREATE INDEX IF NOT EXISTS idx_sensor_threshold_configs_device_id ON sensor_threshold_configs(device_id);
CREATE INDEX IF NOT EXISTS idx_sensor_threshold_configs_active ON sensor_threshold_configs(is_active);

-- RLS (Row Level Security) 정책 설정
ALTER TABLE sensor_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_threshold_configs ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 센서 데이터를 읽을 수 있도록 허용
CREATE POLICY "Allow read access to sensor_data" ON sensor_data
    FOR SELECT USING (true);

-- 모든 사용자가 센서 데이터를 삽입할 수 있도록 허용
CREATE POLICY "Allow insert access to sensor_data" ON sensor_data
    FOR INSERT WITH CHECK (true);

-- 모든 사용자가 디바이스 정보를 읽을 수 있도록 허용
CREATE POLICY "Allow read access to devices" ON devices
    FOR SELECT USING (true);

-- 모든 사용자가 디바이스 정보를 삽입할 수 있도록 허용
CREATE POLICY "Allow insert access to devices" ON devices
    FOR INSERT WITH CHECK (true);

-- 모든 사용자가 디바이스 정보를 업데이트할 수 있도록 허용
CREATE POLICY "Allow update access to devices" ON devices
    FOR UPDATE USING (true);

-- 센서 임계치 설정 테이블 RLS 정책
CREATE POLICY "Allow read access to sensor_threshold_configs" ON sensor_threshold_configs
    FOR SELECT USING (true);

CREATE POLICY "Allow insert access to sensor_threshold_configs" ON sensor_threshold_configs
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update access to sensor_threshold_configs" ON sensor_threshold_configs
    FOR UPDATE USING (true);

CREATE POLICY "Allow delete access to sensor_threshold_configs" ON sensor_threshold_configs
    FOR DELETE USING (true);

-- 초기 디바이스 데이터 삽입
INSERT INTO devices (id, name, location) 
VALUES ('farmlink-001', 'Farm Link Main Device', 'Greenhouse A')
ON CONFLICT (id) DO NOTHING;

-- 기본 센서 임계치 설정 데이터 삽입
INSERT INTO sensor_threshold_configs (
    device_id, 
    config_name, 
    temperature_threshold, 
    humidity_threshold, 
    soil_moisture_threshold, 
    light_intensity_threshold,
    is_active
) VALUES (
    'farmlink-001', 
    '기본 설정', 
    30.0, 
    70.0, 
    20.0, 
    60.0,
    true
)
ON CONFLICT DO NOTHING;