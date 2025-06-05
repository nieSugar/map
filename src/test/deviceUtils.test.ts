// 简单的测试文件，用于验证工具函数
import { 
  generateDeviceIcon, 
  getStatusText, 
  formatDeviceTitle,
  isValidCoordinate,
  calculateDistance,
  formatTimestamp,
  deepClone,
  isEmpty
} from '../utils/deviceUtils';
import type { DeviceStatus } from '../types/config';

// 测试设备图标生成
console.log('=== 测试设备图标生成 ===');
const normalIcon = generateDeviceIcon(0 as DeviceStatus);
const alarmIcon = generateDeviceIcon(1 as DeviceStatus);
console.log('正常状态图标:', normalIcon);
console.log('报警状态图标:', alarmIcon);

// 测试状态文本
console.log('\n=== 测试状态文本 ===');
console.log('正常状态文本:', getStatusText(0 as DeviceStatus));
console.log('报警状态文本:', getStatusText(1 as DeviceStatus));

// 测试设备标题格式化
console.log('\n=== 测试设备标题格式化 ===');
console.log('正常设备标题:', formatDeviceTitle('DEV001', 0 as DeviceStatus));
console.log('报警设备标题:', formatDeviceTitle('DEV002', 1 as DeviceStatus));

// 测试坐标验证
console.log('\n=== 测试坐标验证 ===');
console.log('有效坐标 (121.4, 31.2):', isValidCoordinate(121.4, 31.2));
console.log('无效坐标 (200, 100):', isValidCoordinate(200, 100));

// 测试距离计算
console.log('\n=== 测试距离计算 ===');
const point1 = { lng: 121.4, lat: 31.2 };
const point2 = { lng: 121.5, lat: 31.3 };
console.log('两点距离:', calculateDistance(point1, point2));

// 测试时间格式化
console.log('\n=== 测试时间格式化 ===');
console.log('当前时间:', formatTimestamp(new Date()));
console.log('时间戳:', formatTimestamp(Date.now()));

// 测试深拷贝
console.log('\n=== 测试深拷贝 ===');
const original = {
  id: 'test',
  data: { value: 123 },
  list: [1, 2, 3]
};
const cloned = deepClone(original);
cloned.data.value = 456;
console.log('原始对象:', original);
console.log('克隆对象:', cloned);

// 测试空值检查
console.log('\n=== 测试空值检查 ===');
console.log('空字符串:', isEmpty(''));
console.log('空数组:', isEmpty([]));
console.log('空对象:', isEmpty({}));
console.log('null:', isEmpty(null));
console.log('undefined:', isEmpty(undefined));
console.log('非空字符串:', isEmpty('test'));
console.log('非空数组:', isEmpty([1, 2, 3]));
console.log('非空对象:', isEmpty({ a: 1 }));

console.log('\n=== 所有测试完成 ===');
