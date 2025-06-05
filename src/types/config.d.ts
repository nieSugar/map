declare module '*/public/config.js' {
  interface Config {
    baseURL: string;
  }

  const config: Config;
  export default config;
}

// 设备相关类型定义
export interface DevicePoint {
  deviceId: string;
  position: {
    lng: number;
    lat: number;
  };
  status: number;
  lastUpdate: string;
  channel: string;
  address: string;
  data: {
    power: number;
  };
}

export interface WorkerMessage {
  deviceId: string;
  response: {
    deviceId: string;
    channel: string;
    address: string;
    lon: number;
    lat: number;
    power: number;
    state: number;
  } | string;
  timestamp: string;
}

// 设备状态枚举
export enum DeviceStatus {
  NORMAL = 0,
  ALARM = 1
}

// 地图相关类型
export interface MapCenter {
  lng: number;
  lat: number;
}

export interface MapIcon {
  url: string;
  size: {
    width: number;
    height: number;
  };
}

// API响应类型
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

export interface DeviceListItem {
  id: string;
  name: string;
  address: string;
  status: DeviceStatus;
  channels: string[];
}

// 设备数据存储结构
export interface DeviceData {
  deviceId: string;
  channels: Map<string, DevicePoint>;
  position: MapCenter;
  status: DeviceStatus;
  lastUpdate: string;
  address: string;
}

// 组件Props类型
export interface DeviceMarkerProps {
  deviceId: string;
  position: MapCenter;
  status: DeviceStatus;
  title?: string;
}

export interface DeviceInfoDialogProps {
  visible: boolean;
  deviceId: string | null;
  deviceData: DeviceData | null;
}
