import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Switch, Button, TextInput, DataTable, Chip, IconButton } from 'react-native-paper';
import { FarmLinkAPI, Device, ThresholdConfig } from '../lib/api';

interface ThresholdSettings {
  config_name: string;
  temperature_threshold: number;
  humidity_threshold: number;
  soil_moisture_threshold: number;
  light_intensity_threshold: number;
  is_active: boolean;
}

const ThresholdSettingsScreen: React.FC = () => {
  const [configs, setConfigs] = useState<ThresholdConfig[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deviceMenuVisible, setDeviceMenuVisible] = useState(false);
  const [dialog, setDialog] = useState<{ open: boolean; config: ThresholdConfig | null }>({
    open: false,
    config: null
  });
  const [formData, setFormData] = useState<Partial<ThresholdConfig>>({
    config_name: '',
    temperature_threshold: 30,
    humidity_threshold: 70,
    soil_moisture_threshold: 20,
    light_intensity_threshold: 60,
    is_active: false
  });

  // 장치 목록 조회
  const fetchDevices = async () => {
    try {
      setLoading(true);
      const deviceList = await FarmLinkAPI.getDevices();
      console.log('장치 목록:', deviceList);
      setDevices(deviceList);
      
      // 첫 번째 장치를 기본 선택
      if (deviceList.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(deviceList[0].id);
        console.log('기본 장치 선택:', deviceList[0].id);
      }
    } catch (error) {
      console.error('장치 목록 조회 실패:', error);
      Alert.alert('오류', '장치 목록을 불러올 수 없습니다. API 서버가 실행 중인지 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // 임계치 설정 목록 조회
  const fetchConfigs = async () => {
    if (!selectedDeviceId) return;
    
    try {
      setLoading(true);
      console.log('임계치 설정 조회 시작:', selectedDeviceId);
      const configList = await FarmLinkAPI.getThresholdConfigs(selectedDeviceId);
      console.log('임계치 설정 목록:', configList);
      setConfigs(configList);
    } catch (error) {
      console.error('임계치 설정 목록 조회 실패:', error);
      Alert.alert('오류', '임계치 설정 목록을 불러올 수 없습니다. API 서버가 실행 중인지 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // 설정 활성화/비활성화 토글
  const toggleActive = async (config: ThresholdConfig) => {
    try {
      const updatedConfig = { ...config, is_active: !config.is_active };
      const success = await FarmLinkAPI.saveThresholdConfig(selectedDeviceId, updatedConfig);
      
      if (success) {
        Alert.alert('성공', updatedConfig.is_active ? '설정이 활성화되었습니다.' : '설정이 비활성화되었습니다.');
        fetchConfigs();
      } else {
        Alert.alert('오류', '상태 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('상태 변경 오류:', error);
      Alert.alert('오류', '상태 변경에 실패했습니다.');
    }
  };

  // 설정 삭제
  const deleteConfig = async (id: number) => {
    Alert.alert(
      '설정 삭제',
      '이 설정을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await FarmLinkAPI.deleteThresholdConfig(id);
              if (success) {
                Alert.alert('성공', '설정이 삭제되었습니다.');
                fetchConfigs();
              } else {
                Alert.alert('오류', '삭제에 실패했습니다.');
              }
            } catch (error) {
              console.error('삭제 오류:', error);
              Alert.alert('오류', '삭제에 실패했습니다.');
            }
          }
        }
      ]
    );
  };

  // 새 설정 추가
  const addConfig = () => {
    setFormData({
      config_name: '',
      temperature_threshold: 30,
      humidity_threshold: 70,
      soil_moisture_threshold: 20,
      light_intensity_threshold: 60,
      is_active: false
    });
    setDialog({ open: true, config: null });
  };

  // 설정 편집
  const editConfig = (config: ThresholdConfig) => {
    setFormData({
      id: config.id, // ID 포함하여 편집 모드임을 표시
      config_name: config.config_name,
      temperature_threshold: config.temperature_threshold,
      humidity_threshold: config.humidity_threshold,
      soil_moisture_threshold: config.soil_moisture_threshold,
      light_intensity_threshold: config.light_intensity_threshold,
      is_active: config.is_active
    });
    setDialog({ open: true, config });
  };

  // 컴포넌트 마운트 시 장치 목록 조회
  useEffect(() => {
    console.log('컴포넌트 마운트됨, 장치 목록 조회 시작');
    fetchDevices();
  }, []);

  // 선택된 장치가 변경되면 임계치 설정 목록 조회
  useEffect(() => {
    console.log('selectedDeviceId 변경됨:', selectedDeviceId);
    if (selectedDeviceId) {
      fetchConfigs();
    }
  }, [selectedDeviceId]);

  // 설정 저장
  const saveConfig = async () => {
    try {
      setSaving(true);
      
      const configData = {
        ...formData,
        device_id: selectedDeviceId,
      };

      const success = await FarmLinkAPI.saveThresholdConfig(selectedDeviceId, configData);
      
      if (success) {
        Alert.alert('성공', configData.id ? '임계치 설정이 수정되었습니다.' : '임계치 설정이 추가되었습니다.');
        setDialog({ open: false, config: null });
        fetchConfigs();
      } else {
        Alert.alert('오류', '임계치 설정 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('임계치 설정 저장 실패:', error);
      Alert.alert('오류', '임계치 설정 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // 드롭다운 외부 클릭 시 닫기
  const handleContainerPress = () => {
    if (deviceMenuVisible) {
      setDeviceMenuVisible(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']} onStartShouldSetResponder={handleContainerPress}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>임계치 설정</Text>
          <Text style={styles.subtitle}>
            센서 값이 설정된 임계치를 초과하면 알림을 받을 수 있습니다.
          </Text>
        </View>

        {/* 장치 선택 및 새 설정 추가 */}
        <Card style={styles.controlCard}>
          <Card.Content>
            <View style={styles.controlRow}>
              <View style={styles.deviceSelectionContainer}>
                <Text style={styles.deviceSelectionLabel}>장치 선택</Text>
                <TouchableOpacity
                  style={styles.deviceButton}
                  onPress={() => setDeviceMenuVisible(!deviceMenuVisible)}
                >
                  <Text style={styles.deviceButtonText}>
                    {selectedDeviceId 
                      ? devices.find(d => d.id === selectedDeviceId)?.name || '장치 선택'
                      : '장치 선택'
                    }
                  </Text>
                  <Text style={styles.dropdownArrow}>
                    {deviceMenuVisible ? '▲' : '▼'}
                  </Text>
                </TouchableOpacity>
                
                {deviceMenuVisible && (
                  <View style={styles.dropdownMenu}>
                    {devices.map((device) => (
                      <TouchableOpacity
                        key={device.id}
                        style={[
                          styles.dropdownItem,
                          selectedDeviceId === device.id && styles.selectedDropdownItem
                        ]}
                        onPress={() => {
                          setSelectedDeviceId(device.id);
                          setDeviceMenuVisible(false);
                        }}
                      >
                        <Text style={[
                          styles.dropdownItemText,
                          selectedDeviceId === device.id && styles.selectedDropdownItemText
                        ]}>
                          {device.name} ({device.location})
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              
              <Button
                mode="contained"
                onPress={addConfig}
                disabled={!selectedDeviceId}
                style={styles.addButton}
                labelStyle={styles.addButtonLabel}
              >
                새 설정 추가
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* 설정 목록 카드 */}
        <View style={styles.configsContainer}>
          <View style={styles.configsHeader}>
            <Text style={styles.configsTitle}>⚙️ 임계치 설정 목록</Text>
            {selectedDeviceId && (
              <Text style={styles.configsCount}>
                {configs.length}개 설정
              </Text>
            )}
          </View>

          {!selectedDeviceId ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>장치를 선택해주세요.</Text>
              <Text style={styles.emptyStateSubtext}>상단에서 장치를 선택하세요.</Text>
            </View>
          ) : loading ? (
            <View style={styles.loadingState}>
              <Text style={styles.loadingText}>로딩 중...</Text>
              <Text style={styles.loadingSubtext}>장치: {selectedDeviceId}</Text>
            </View>
          ) : configs.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>설정이 없습니다.</Text>
              <Text style={styles.emptyStateSubtext}>새 설정을 추가해보세요.</Text>
            </View>
          ) : (
            <View style={styles.configsList}>
              {configs.map((config) => (
                <Card key={config.id} style={styles.configCard}>
                  <Card.Content>
                    <View style={styles.configHeader}>
                      <View style={styles.configTitleRow}>
                        <Text style={styles.configName}>{config.config_name}</Text>
                        <Chip 
                          mode="outlined"
                          textStyle={[
                            styles.chipText,
                            { color: config.is_active ? '#4CAF50' : '#666' }
                          ]}
                          style={[
                            styles.statusChip,
                            { borderColor: config.is_active ? '#4CAF50' : '#666' }
                          ]}
                        >
                          {config.is_active ? '활성' : '비활성'}
                        </Chip>
                      </View>
                    </View>

                    <View style={styles.configValues}>
                      <View style={styles.valueRow}>
                        <Text style={styles.valueLabel}>🌡️ 온도</Text>
                        <Text style={styles.valueText}>
                          {config.temperature_threshold ? `≥ ${config.temperature_threshold}°C` : '-'}
                        </Text>
                      </View>
                      <View style={styles.valueRow}>
                        <Text style={styles.valueLabel}>💨 습도</Text>
                        <Text style={styles.valueText}>
                          {config.humidity_threshold ? `≥ ${config.humidity_threshold}%` : '-'}
                        </Text>
                      </View>
                      <View style={styles.valueRow}>
                        <Text style={styles.valueLabel}>💧 수분량</Text>
                        <Text style={styles.valueText}>
                          {config.soil_moisture_threshold ? `< ${config.soil_moisture_threshold}%` : '-'}
                        </Text>
                      </View>
                      <View style={styles.valueRow}>
                        <Text style={styles.valueLabel}>☀️ 조도</Text>
                        <Text style={styles.valueText}>
                          {config.light_intensity_threshold ? `> ${config.light_intensity_threshold}ph` : '-'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.configActions}>
                      <Button
                        mode="outlined"
                        compact
                        onPress={() => toggleActive(config)}
                        style={[
                          styles.actionButton,
                          { borderColor: config.is_active ? '#FF9800' : '#4CAF50' }
                        ]}
                        labelStyle={[
                          styles.actionButtonLabel,
                          { color: config.is_active ? '#FF9800' : '#4CAF50' }
                        ]}
                      >
                        {config.is_active ? '비활성화' : '활성화'}
                      </Button>
                      <Button
                        mode="outlined"
                        compact
                        onPress={() => editConfig(config)}
                        style={[styles.actionButton, { borderColor: '#1877F2' }]}
                        labelStyle={[styles.actionButtonLabel, { color: '#1877F2' }]}
                      >
                        편집
                      </Button>
                      <Button
                        mode="outlined"
                        compact
                        onPress={() => deleteConfig(config.id!)}
                        style={[styles.actionButton, { borderColor: '#F44336' }]}
                        labelStyle={[styles.actionButtonLabel, { color: '#F44336' }]}
                      >
                        삭제
                      </Button>
                    </View>
                  </Card.Content>
                </Card>
              ))}
            </View>
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* 설정 편집 다이얼로그 */}
      <Modal
        visible={dialog.open}
        onRequestClose={() => setDialog({ open: false, config: null })}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {dialog.config?.id ? '임계치 설정 편집' : '새 임계치 설정 추가'}
            </Text>
            <IconButton
              icon="close"
              onPress={() => setDialog({ open: false, config: null })}
            />
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formContainer}>
              <TextInput
                label="설정명"
                value={formData.config_name || ''}
                onChangeText={(text) => setFormData(prev => ({ ...prev, config_name: text }))}
                mode="outlined"
                style={styles.formInput}
              />
              
              <TextInput
                label="온도 임계값 (≥)"
                value={formData.temperature_threshold && !isNaN(formData.temperature_threshold) ? formData.temperature_threshold.toString() : ''}
                onChangeText={(text) => setFormData(prev => ({ 
                  ...prev, 
                  temperature_threshold: text.trim() === '' ? undefined : parseFloat(text) 
                }))}
                keyboardType="numeric"
                mode="outlined"
                style={styles.formInput}
                helper="팬 작동 온도 (기본: 30°C)"
              />
              
              <TextInput
                label="습도 임계값 (≥)"
                value={formData.humidity_threshold && !isNaN(formData.humidity_threshold) ? formData.humidity_threshold.toString() : ''}
                onChangeText={(text) => setFormData(prev => ({ 
                  ...prev, 
                  humidity_threshold: text.trim() === '' ? undefined : parseFloat(text) 
                }))}
                keyboardType="numeric"
                mode="outlined"
                style={styles.formInput}
                helper="팬 작동 습도 (기본: 70%)"
              />
              
              <TextInput
                label="수분량 임계값 (<)"
                value={formData.soil_moisture_threshold && !isNaN(formData.soil_moisture_threshold) ? formData.soil_moisture_threshold.toString() : ''}
                onChangeText={(text) => setFormData(prev => ({ 
                  ...prev, 
                  soil_moisture_threshold: text.trim() === '' ? undefined : parseFloat(text) 
                }))}
                keyboardType="numeric"
                mode="outlined"
                style={styles.formInput}
                helper="펌프 작동 수분량 (기본: 20%)"
              />
              
              <TextInput
                label="조도 임계값 (>)"
                value={formData.light_intensity_threshold && !isNaN(formData.light_intensity_threshold) ? formData.light_intensity_threshold.toString() : ''}
                onChangeText={(text) => setFormData(prev => ({ 
                  ...prev, 
                  light_intensity_threshold: text.trim() === '' ? undefined : parseFloat(text) 
                }))}
                keyboardType="numeric"
                mode="outlined"
                style={styles.formInput}
                helper="LED 작동 조도 (기본: 60ph)"
              />
              
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>
                  활성화 (활성화 시 다른 설정들은 자동으로 비활성화됩니다)
                </Text>
                <Switch
                  value={formData.is_active || false}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, is_active: value }))}
                  color="#1877F2"
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setDialog({ open: false, config: null })}
              style={styles.modalButton}
            >
              취소
            </Button>
            <Button
              mode="contained"
              onPress={saveConfig}
              loading={saving}
              disabled={saving || !formData.config_name}
              style={[styles.modalButton, styles.saveButton]}
            >
              {saving ? '저장 중...' : '저장'}
            </Button>
          </View>
        </View>
      </Modal>
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
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1877F2',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  controlCard: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
    borderRadius: 12,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 16,
  },
  deviceSelectionContainer: {
    flex: 1,
  },
  deviceSelectionLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  deviceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  deviceButtonText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    zIndex: 1000,
    elevation: 5,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedDropdownItem: {
    backgroundColor: '#e6f2ff',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  selectedDropdownItemText: {
    color: '#1877F2',
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#1877F2',
  },
  addButtonLabel: {
    color: '#fff',
  },
  configsContainer: {
    margin: 16,
    marginTop: 8,
  },
  configsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  configsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1877F2',
  },
  configsCount: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  configsList: {
    gap: 12,
  },
  configCard: {
    elevation: 2,
    borderRadius: 12,
    marginBottom: 8,
  },
  configHeader: {
    marginBottom: 12,
  },
  configTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  configName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  statusChip: {
    marginLeft: 8,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  configValues: {
    gap: 8,
    marginBottom: 16,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  valueLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  valueText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  configActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  actionButton: {
    minWidth: 60,
  },
  actionButtonLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
  },
  loadingState: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1877F2',
  },
  modalContent: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
    gap: 16,
  },
  formInput: {
    marginBottom: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    marginRight: 16,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  modalButton: {
    flex: 1,
  },
  saveButton: {
    backgroundColor: '#1877F2',
  },
  bottomSpacer: {
    height: 20,
  },
});

export default ThresholdSettingsScreen;
