import type { DeviceStatus, MapIcon } from '../types/config';

/**
 * 根据设备状态生成对应的图标配置
 * @param status 设备状态
 * @returns 图标配置对象
 */
export function generateDeviceIcon(status: DeviceStatus): MapIcon {
  return {
    url: status > 0 ? "/red.gif" : "/green.svg",
    size: { width: 31, height: 40 }
  };
}

/**
 * 获取设备状态的文本描述
 * @param status 设备状态
 * @returns 状态文本
 */
export function getStatusText(status: DeviceStatus): string {
  return status === 1 ? '报警' : '正常';
}

/**
 * 获取设备状态的CSS类名
 * @param status 设备状态
 * @returns CSS类名
 */
export function getStatusClass(status: DeviceStatus): string {
  return status === 1 ? 'alarm' : 'normal';
}

/**
 * 格式化设备标题
 * @param deviceId 设备ID
 * @param status 设备状态
 * @returns 格式化后的标题
 */
export function formatDeviceTitle(deviceId: string, status: DeviceStatus): string {
  return `设备: ${deviceId} | 状态: ${getStatusText(status)}`;
}

/**
 * 验证经纬度坐标是否有效
 * @param lng 经度
 * @param lat 纬度
 * @returns 是否有效
 */
export function isValidCoordinate(lng: number, lat: number): boolean {
  return lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
}

/**
 * 计算两点之间的距离（简单的欧几里得距离）
 * @param point1 第一个点
 * @param point2 第二个点
 * @returns 距离
 */
export function calculateDistance(
  point1: { lng: number; lat: number },
  point2: { lng: number; lat: number }
): number {
  const dx = point1.lng - point2.lng;
  const dy = point1.lat - point2.lat;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 防抖函数
 * @param func 要防抖的函数
 * @param wait 等待时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func.apply(null, args);
    }, wait);
  };
}

/**
 * 节流函数
 * @param func 要节流的函数
 * @param wait 等待时间（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let lastTime = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastTime >= wait) {
      lastTime = now;
      func.apply(null, args);
    }
  };
}

/**
 * 格式化时间戳
 * @param timestamp 时间戳或日期字符串
 * @returns 格式化后的时间字符串
 */
export function formatTimestamp(timestamp: string | number | Date): string {
  const date = new Date(timestamp);
  
  if (isNaN(date.getTime())) {
    return '无效时间';
  }
  
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * 深拷贝对象
 * @param obj 要拷贝的对象
 * @returns 拷贝后的对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as T;
  }
  
  if (typeof obj === 'object') {
    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
  
  return obj;
}

/**
 * 生成唯一ID
 * @returns 唯一ID字符串
 */
export function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * 检查对象是否为空
 * @param obj 要检查的对象
 * @returns 是否为空
 */
export function isEmpty(obj: any): boolean {
  if (obj === null || obj === undefined) {
    return true;
  }
  
  if (typeof obj === 'string' || Array.isArray(obj)) {
    return obj.length === 0;
  }
  
  if (typeof obj === 'object') {
    return Object.keys(obj).length === 0;
  }
  
  return false;
}
