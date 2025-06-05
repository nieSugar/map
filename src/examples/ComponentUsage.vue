<template>
  <div class="component-usage-demo">
    <h2>组件使用示例</h2>
    
    <!-- 设备数据管理示例 -->
    <div class="section">
      <h3>设备数据管理</h3>
      <div class="stats">
        <div class="stat-item">
          <span class="label">设备总数:</span>
          <span class="value">{{ deviceCount }}</span>
        </div>
        <div class="stat-item">
          <span class="label">报警设备:</span>
          <span class="value alarm">{{ alarmDeviceCount }}</span>
        </div>
        <div class="stat-item">
          <span class="label">正常设备:</span>
          <span class="value normal">{{ normalDeviceCount }}</span>
        </div>
      </div>
      
      <div class="device-list">
        <h4>设备列表</h4>
        <div v-for="deviceId in deviceIds" :key="deviceId" class="device-item">
          <span class="device-id">{{ deviceId }}</span>
          <span :class="['device-status', getStatusClass(getDeviceStatus(deviceId))]">
            {{ getStatusText(getDeviceStatus(deviceId)) }}
          </span>
          <span class="device-address">{{ getDeviceAddress(deviceId) }}</span>
        </div>
      </div>
    </div>

    <!-- SignalR连接状态示例 -->
    <div class="section">
      <h3>连接状态</h3>
      <div class="connection-status">
        <div class="status-indicator" :class="{ connected: isConnected, disconnected: !isConnected }">
          {{ isConnected ? '已连接' : '未连接' }}
        </div>
        <div v-if="connectionError" class="error-message">
          错误: {{ connectionError }}
        </div>
        <div v-if="lastMessage" class="last-message">
          最后消息: {{ formatTimestamp(lastMessage.timestamp) }}
        </div>
      </div>
      
      <div class="connection-actions">
        <button @click="reconnect" :disabled="isConnected">重新连接</button>
        <button @click="disconnect" :disabled="!isConnected">断开连接</button>
      </div>
    </div>

    <!-- 工具函数示例 -->
    <div class="section">
      <h3>工具函数示例</h3>
      <div class="utils-demo">
        <div class="demo-item">
          <span class="demo-label">正常设备图标:</span>
          <img :src="generateDeviceIcon(0).url" :style="iconStyle" alt="正常" />
        </div>
        <div class="demo-item">
          <span class="demo-label">报警设备图标:</span>
          <img :src="generateDeviceIcon(1).url" :style="iconStyle" alt="报警" />
        </div>
        <div class="demo-item">
          <span class="demo-label">当前时间:</span>
          <span>{{ formatTimestamp(new Date()) }}</span>
        </div>
        <div class="demo-item">
          <span class="demo-label">坐标验证:</span>
          <span>{{ isValidCoordinate(121.4, 31.2) ? '有效' : '无效' }}</span>
        </div>
      </div>
    </div>

    <!-- 模拟数据按钮 -->
    <div class="section">
      <h3>测试操作</h3>
      <div class="test-actions">
        <button @click="addMockDevice">添加模拟设备</button>
        <button @click="clearAllData">清空所有数据</button>
        <button @click="simulateAlarm">模拟报警</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDeviceData } from '../composables/useDeviceData';
import { useSignalR } from '../composables/useSignalR';
import { 
  generateDeviceIcon, 
  getStatusText, 
  getStatusClass,
  formatTimestamp,
  isValidCoordinate,
  generateUniqueId
} from '../utils/deviceUtils';
import type { WorkerMessage, DeviceStatus } from '../types/config';

// 使用设备数据管理
const {
  deviceIds,
  deviceCount,
  alarmDeviceCount,
  normalDeviceCount,
  updateDeviceData,
  getDeviceStatus,
  getDeviceAddress,
  clearAllData
} = useDeviceData();

// 使用SignalR连接
const {
  isConnected,
  connectionError,
  lastMessage,
  reconnect,
  disconnect
} = useSignalR({
  onMessage: (message) => {
    updateDeviceData(message);
  }
});

// 图标样式
const iconStyle = computed(() => ({
  width: '24px',
  height: '30px'
}));

// 添加模拟设备
const addMockDevice = () => {
  const deviceId = `DEV${generateUniqueId().slice(-3)}`;
  const mockMessage: WorkerMessage = {
    deviceId,
    response: {
      deviceId,
      channel: 'CH01',
      address: '测试地址' + Math.floor(Math.random() * 100),
      lon: 121.4 + (Math.random() - 0.5) * 0.1,
      lat: 31.2 + (Math.random() - 0.5) * 0.1,
      power: Math.floor(Math.random() * 1000),
      state: Math.random() > 0.7 ? 1 : 0
    },
    timestamp: new Date().toISOString()
  };
  
  updateDeviceData(mockMessage);
};

// 模拟报警
const simulateAlarm = () => {
  if (deviceIds.value.length === 0) {
    addMockDevice();
    return;
  }
  
  const randomDeviceId = deviceIds.value[Math.floor(Math.random() * deviceIds.value.length)];
  const mockMessage: WorkerMessage = {
    deviceId: randomDeviceId,
    response: {
      deviceId: randomDeviceId,
      channel: 'CH01',
      address: '报警测试地址',
      lon: 121.4,
      lat: 31.2,
      power: 999,
      state: 1
    },
    timestamp: new Date().toISOString()
  };
  
  updateDeviceData(mockMessage);
};
</script>

<style scoped>
.component-usage-demo {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fafafa;
}

.section h3 {
  margin-top: 0;
  color: #333;
}

.stats {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.stat-item .label {
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
}

.stat-item .value {
  font-size: 18px;
  font-weight: bold;
}

.value.alarm {
  color: #ff4d4f;
}

.value.normal {
  color: #52c41a;
}

.device-list {
  margin-top: 20px;
}

.device-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  margin-bottom: 8px;
  background: white;
  border-radius: 4px;
  border-left: 4px solid #e0e0e0;
}

.device-status.alarm {
  color: #ff4d4f;
  font-weight: bold;
}

.device-status.normal {
  color: #52c41a;
}

.connection-status {
  margin-bottom: 15px;
}

.status-indicator {
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  display: inline-block;
  margin-bottom: 10px;
}

.status-indicator.connected {
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.status-indicator.disconnected {
  background: #fff2f0;
  color: #ff4d4f;
  border: 1px solid #ffccc7;
}

.error-message {
  color: #ff4d4f;
  font-size: 14px;
  margin-bottom: 10px;
}

.last-message {
  color: #666;
  font-size: 14px;
}

.connection-actions,
.test-actions {
  display: flex;
  gap: 10px;
}

.connection-actions button,
.test-actions button {
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
}

.connection-actions button:hover,
.test-actions button:hover {
  border-color: #40a9ff;
  color: #40a9ff;
}

.connection-actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.utils-demo {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.demo-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  background: white;
  border-radius: 4px;
}

.demo-label {
  min-width: 120px;
  font-weight: 500;
}
</style>
