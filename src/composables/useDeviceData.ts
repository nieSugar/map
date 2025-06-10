import { ref, computed, type Ref } from 'vue';
import { formatTimestamp } from '../utils/deviceUtils';
import type { DevicePoint, DeviceData, WorkerMessage, DeviceStatus } from '../types/config';

export function useDeviceData() {
  // 优化后的数据结构：扁平化存储，提高查询效率
  const deviceDataMap = ref<Map<string, DeviceData>>(new Map());
  const channelDataMap = ref<Map<string, DevicePoint>>(new Map()); // channelId -> DevicePoint
  
  // 生成通道唯一ID
  const generateChannelId = (deviceId: string, channel: string): string => {
    return `${deviceId}_${channel}`;
  };

  // 获取设备状态（如果任一通道报警，则设备报警）
  const getDeviceStatus = (deviceId: string): DeviceStatus => {
    const deviceData = deviceDataMap.value.get(deviceId);
    if (!deviceData) return 0;

    for (const channelData of deviceData.channels.values()) {
      if (channelData.status === 1) {
        return 1;
      }
    }
    return 0;
  };

  // 获取设备位置（使用第一个通道的位置）
  const getDevicePosition = (deviceId: string) => {
    const deviceData = deviceDataMap.value.get(deviceId);
    if (!deviceData) return { lng: 0, lat: 0 };
    return deviceData.position;
  };

  // 获取设备地址（使用第一个通道的地址）
  const getDeviceAddress = (deviceId: string): string => {
    const deviceData = deviceDataMap.value.get(deviceId);
    if (!deviceData) return '';
    return deviceData.address;
  };

  // 获取设备的所有通道数据
  const getDeviceChannels = (deviceId: string): DevicePoint[] => {
    const deviceData = deviceDataMap.value.get(deviceId);
    if (!deviceData) return [];
    return Array.from(deviceData.channels.values());
  };

  // 获取排序后的通道列表（报警通道在前）
  const getSortedChannels = (deviceId: string): DevicePoint[] => {
    const channels = getDeviceChannels(deviceId);
    return channels.sort((a, b) => {
      if (a.status !== b.status) {
        return b.status - a.status; // 报警状态在前
      }
      return a.channel.localeCompare(b.channel); // 通道号排序
    });
  };

  // 更新设备数据
  const updateDeviceData = (message: WorkerMessage): void => {
    if (typeof message.response !== 'object' || message.response === null) {
      return;
    }

    const { deviceId } = message;
    const { channel, address, lon, lat, power, state } = message.response;
    
    const channelId = generateChannelId(deviceId, channel);
    const position = { lng: lon, lat: lat };

    // 创建通道数据
    const channelData: DevicePoint = {
      deviceId,
      position,
      status: state,
      lastUpdate: formatTimestamp(new Date()),
      channel,
      address,
      data: { power }
    };

    // 更新通道数据映射
    channelDataMap.value.set(channelId, channelData);

    // 更新或创建设备数据
    let deviceData = deviceDataMap.value.get(deviceId);
    if (!deviceData) {
      deviceData = {
        deviceId,
        channels: new Map(),
        position,
        status: state,
        lastUpdate: formatTimestamp(new Date()),
        address
      };
      deviceDataMap.value.set(deviceId, deviceData);
    }

    // 更新设备的通道数据
    deviceData.channels.set(channel, channelData);
    deviceData.position = position; // 更新位置
    deviceData.address = address; // 更新地址
    deviceData.status = getDeviceStatus(deviceId); // 重新计算设备状态
    deviceData.lastUpdate = formatTimestamp(new Date());
  };

  // 获取所有设备ID列表
  const deviceIds = computed(() => Array.from(deviceDataMap.value.keys()));

  // 获取设备总数
  const deviceCount = computed(() => deviceDataMap.value.size);

  // 获取报警设备数量
  const alarmDeviceCount = computed(() => {
    return Array.from(deviceDataMap.value.values()).filter(
      device => device.status === 1
    ).length;
  });

  // 获取正常设备数量
  const normalDeviceCount = computed(() => deviceCount.value - alarmDeviceCount.value);

  // 清空所有数据
  const clearAllData = (): void => {
    deviceDataMap.value.clear();
    channelDataMap.value.clear();
  };

  // 移除指定设备
  const removeDevice = (deviceId: string): void => {
    const deviceData = deviceDataMap.value.get(deviceId);
    if (deviceData) {
      // 移除所有相关通道数据
      for (const channel of deviceData.channels.keys()) {
        const channelId = generateChannelId(deviceId, channel);
        channelDataMap.value.delete(channelId);
      }
      // 移除设备数据
      deviceDataMap.value.delete(deviceId);
    }
  };

  // 获取设备数据
  const getDeviceData = (deviceId: string): DeviceData | null => {
    return deviceDataMap.value.get(deviceId) || null;
  };

  return {
    // 数据
    deviceDataMap: deviceDataMap as Ref<Map<string, DeviceData>>,
    channelDataMap: channelDataMap as Ref<Map<string, DevicePoint>>,
    
    // 计算属性
    deviceIds,
    deviceCount,
    alarmDeviceCount,
    normalDeviceCount,
    
    // 方法
    updateDeviceData,
    getDeviceStatus,
    getDevicePosition,
    getDeviceAddress,
    getDeviceChannels,
    getSortedChannels,
    getDeviceData,
    clearAllData,
    removeDevice
  };
}
