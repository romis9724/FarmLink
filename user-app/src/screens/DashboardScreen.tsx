import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Chip, FAB } from 'react-native-paper';
import Icon from '../components/Icon';
import { FarmLinkAPI, Device } from '../lib/api';
import SensorCard from '../components/SensorCard';

const DashboardScreen: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const deviceList = await FarmLinkAPI.getDevices();
      setDevices(deviceList);
    } catch (error) {
      console.error('디바이스 목록 조회 실패:', error);
      Alert.alert('오류', '디바이스 정보를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDevices();
    setLastUpdate(new Date());
    setRefreshing(false);
  };

  const formatLastUpdate = () => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
    
    if (diff < 60) return '방금 전';
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    return `${Math.floor(diff / 3600)}시간 전`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.titleContainer}>
              <Icon name="eco" size={32} color="#4CAF50" />
              <Text style={styles.title}>Farm Link</Text>
            </View>
            <View style={styles.updateInfo}>
              <View style={styles.updateIndicator} />
              <Text style={styles.updateText}>{formatLastUpdate()} 업데이트</Text>
            </View>
          </View>
        </View>

        {/* 센서 데이터 카드들 */}
        <View style={styles.sensorGrid}>
          <View style={styles.sensorCardWrapper}>
            <SensorCard
              title="토양 수분"
              icon="water-drop"
              valueKey="soil_moisture"
              unit="%"
              type="moisture"
              deviceId="farmlink-001"
              refreshInterval={5000}
            />
          </View>
          
          <View style={styles.sensorCardWrapper}>
            <SensorCard
              title="온도"
              icon="thermostat"
              valueKey="temperature"
              unit="°C"
              type="temperature"
              deviceId="farmlink-001"
              refreshInterval={5000}
            />
          </View>
          
          <View style={styles.sensorCardWrapper}>
            <SensorCard
              title="습도"
              icon="air"
              valueKey="humidity"
              unit="%"
              type="humidity"
              deviceId="farmlink-001"
              refreshInterval={5000}
            />
          </View>
          
          <View style={styles.sensorCardWrapper}>
            <SensorCard
              title="조도"
              icon="light-mode"
              valueKey="light_intensity"
              unit="ph"
              type="light"
              deviceId="farmlink-001"
              refreshInterval={5000}
            />
          </View>
        </View>

        {/* 디바이스 상태 */}
        <Card style={styles.deviceCard}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Icon name="device-hub" size={24} color="#1877F2" />
              <Text style={styles.cardTitle}>디바이스 상태</Text>
            </View>
            
            {devices.length > 0 ? (
              devices.map((device) => (
                <View key={device.id} style={styles.deviceItem}>
                  <View style={styles.deviceInfo}>
                    <Text style={styles.deviceName}>{device.name}</Text>
                    <Text style={styles.deviceLocation}>{device.location}</Text>
                  </View>
                  <Chip
                    mode="outlined"
                    textStyle={styles.chipText}
                    style={[
                      styles.statusChip,
                      {
                        borderColor: device.status === 'active' ? '#28a745' : '#dc3545'
                      }
                    ]}
                  >
                    {device.status === 'active' ? '정상' : '비활성'}
                  </Chip>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Icon name="device-unknown" size={48} color="#ccc" />
                <Text style={styles.emptyText}>등록된 디바이스가 없습니다</Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* 하단 여백 */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

        {/* 새로고침 FAB */}
      <FAB
        style={styles.fab}
        icon={() => <Icon name="refresh" size={24} color="#fff" />}
        onPress={onRefresh}
        disabled={refreshing}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingBottom: 60, // 탭바 높이만큼 하단 여백
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    elevation: 2,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1877F2',
    marginLeft: 8,
  },
  updateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  updateIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  updateText: {
    fontSize: 12,
    color: '#666',
  },
  sensorGrid: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sensorCardWrapper: {
    width: '48%',
    marginBottom: 16,
  },
  deviceCard: {
    margin: 16,
    elevation: 2,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: '#333',
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  deviceLocation: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statusChip: {
    marginLeft: 12,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#999',
  },
  bottomSpacer: {
    height: 20,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 80, // 탭 네비게이션 위에 위치하도록 조정
    backgroundColor: '#1877F2',
  },
});

export default DashboardScreen;
