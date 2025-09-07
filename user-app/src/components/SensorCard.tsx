import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Card, Chip } from 'react-native-paper';
import Icon from './Icon';
import { FarmLinkAPI, SensorData } from '../lib/api';

interface SensorCardProps {
  title: string;
  icon: string;
  valueKey: keyof SensorData;
  unit: string;
  type: 'moisture' | 'temperature' | 'humidity' | 'light';
  deviceId: string;
  refreshInterval?: number;
  iconColor?: string;
}

const SensorCard: React.FC<SensorCardProps> = ({
  title,
  icon,
  valueKey,
  unit,
  type,
  deviceId,
  refreshInterval = 5000,
  iconColor,
}) => {
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  const getStatusColor = (value: number, type: string): 'success' | 'warning' | 'error' => {
    switch (type) {
      case 'moisture':
        return value < 20 ? 'error' : value < 40 ? 'warning' : 'success';
      case 'temperature':
        return value > 30 ? 'error' : value > 25 ? 'warning' : 'success';
      case 'humidity':
        return value > 70 ? 'error' : value > 50 ? 'warning' : 'success';
      case 'light':
        return value < 30 ? 'error' : value < 50 ? 'warning' : 'success';
      default:
        return 'success';
    }
  };

  const getStatusText = (value: number, type: string): string => {
    switch (type) {
      case 'moisture':
        return value < 20 ? '매우 건조' : value < 40 ? '건조' : '적정';
      case 'temperature':
        return value > 30 ? '높음' : value > 25 ? '보통' : '적정';
      case 'humidity':
        return value > 70 ? '높음' : value > 50 ? '보통' : '적정';
      case 'light':
        return value < 30 ? '어둠' : value < 50 ? '보통' : '밝음';
      default:
        return '정상';
    }
  };

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const data = await FarmLinkAPI.getLatestSensorData(deviceId);
      
      if (data) {
        setSensorData(data);
        // 페이드 인 애니메이션
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      } else {
        setError('데이터를 불러올 수 없습니다');
      }
    } catch (err) {
      setError('데이터 로딩 실패');
      console.error('센서 데이터 로딩 오류:', err);
    } finally {
      setLoading(false);
    }
  }, [deviceId, fadeAnim]);

  useEffect(() => {
    fetchData();
    
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  const getCardColor = () => {
    // admin-dashboard와 동일하게 흰색 배경 고정
    return '#ffffff';
  };

  const getIconColor = () => {
    // admin-dashboard와 동일한 고정 색상 사용
    if (iconColor) return iconColor;
    
    if (loading || error) return '#666';
    
    const value = sensorData?.[valueKey] as number;
    if (typeof value !== 'number') return '#666';
    
    const status = getStatusColor(value, type);
    switch (status) {
      case 'success': return '#28a745';
      case 'warning': return '#ffc107';
      case 'error': return '#dc3545';
      default: return '#666';
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#1877F2" />
          <Text style={styles.loadingText}>로딩 중...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={24} color="#dc3545" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    const value = sensorData?.[valueKey] as number;
    const status = typeof value === 'number' ? getStatusColor(value, type) : 'success';
    const statusText = typeof value === 'number' ? getStatusText(value, type) : '정상';

    return (
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.valueContainer}>
          <Text style={styles.value}>
            {typeof value === 'number' ? value.toFixed(1) : '--'}
          </Text>
          <Text style={styles.unit}>{unit}</Text>
        </View>
        <Chip 
          mode="outlined" 
          textStyle={styles.chipText}
          style={[
            styles.chip,
            {
              borderColor: status === 'success' ? '#28a745' : 
                          status === 'warning' ? '#ffc107' : '#dc3545'
            }
          ]}
        >
          {statusText}
        </Chip>
      </Animated.View>
    );
  };

  return (
    <Card style={[styles.card, { backgroundColor: getCardColor() }]}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Icon name={icon} size={24} color={getIconColor()} />
            <Text style={styles.title}>{title}</Text>
            {loading && (
              <ActivityIndicator size="small" color="#1877F2" style={styles.loadingIndicator} />
            )}
          </View>
        </View>
        {renderContent()}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 0,
    elevation: 2,
    borderRadius: 8,
    // admin-dashboard와 동일한 호버 효과
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: '#333',
  },
  loadingIndicator: {
    marginLeft: 8,
  },
  content: {
    alignItems: 'center',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  value: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1877F2',
  },
  unit: {
    fontSize: 18,
    color: '#666',
    marginLeft: 4,
  },
  chip: {
    marginTop: 4,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 8,
    color: '#dc3545',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default SensorCard;
