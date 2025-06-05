<template>
  <el-dialog
    v-model="dialogVisible"
    width="30%"
    :class="{ 'error-shadow': deviceStatus === 1 }"
    @close="handleClose"
  >
    <template #header>
      <div class="header">设备信息</div>
    </template>
    
    <div class="dialog-content">
      <!-- 基本信息 -->
      <div class="basic-info">
        <div class="info-row">
          <span class="label">设备ID:</span>
          <span class="value">{{ deviceId || '未选择设备' }}</span>
        </div>
        <div class="info-row">
          <span class="label">状态:</span>
          <span class="value status" :class="{ 'alarm': deviceStatus === 1 }">
            <img class="status-icon" :src="deviceStatus === 1 ? BJD1 : BJD2" alt="" />
            {{ deviceStatus === 1 ? '报警' : '正常' }}
          </span>
        </div>
        <div class="info-row">
          <span class="label">地址:</span>
          <span class="value">{{ deviceAddress || '未知地址' }}</span>
        </div>
      </div>

      <!-- 通道列表 -->
      <div v-if="deviceId && sortedChannels.length > 0" class="channels-section">
        <h4>通道列表 ({{ sortedChannels.length }}个)</h4>
        <div class="channel-list">
          <div 
            v-for="channel in sortedChannels" 
            :key="channel.channel"
            :class="['channel-item', { 'alarm': channel.status === 1 }]"
          >
            <div class="channel-header">
              <span class="channel-name">通道 {{ channel.channel }}</span>
              <span class="channel-status" :class="{ 'alarm': channel.status === 1 }">
                {{ channel.status === 1 ? '报警' : '正常' }}
              </span>
            </div>
            <div class="channel-details">
              <span>功率: {{ channel.data.power }}W</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 无数据提示 -->
      <div v-else-if="deviceId" class="no-data">
        <p>暂无通道数据</p>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BJD1 from "../assets/bjd1.png?url";
import BJD2 from "../assets/bjd2.png?url";
import type { DevicePoint, DeviceData, DeviceStatus } from '../types/config';

interface Props {
  visible: boolean;
  deviceId: string | null;
  deviceData: DeviceData | null;
}

interface Emits {
  (e: 'update:visible', visible: boolean): void;
  (e: 'close'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 双向绑定对话框显示状态
const dialogVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value)
});

// 设备状态
const deviceStatus = computed((): DeviceStatus => {
  if (!props.deviceData) return 0;
  return props.deviceData.status;
});

// 设备地址
const deviceAddress = computed((): string => {
  if (!props.deviceData) return '';
  return props.deviceData.address;
});

// 排序后的通道列表
const sortedChannels = computed((): DevicePoint[] => {
  if (!props.deviceData) return [];
  
  const channels = Array.from(props.deviceData.channels.values());
  return channels.sort((a, b) => {
    // 报警状态优先
    if (a.status !== b.status) {
      return b.status - a.status;
    }
    // 通道号排序
    return a.channel.localeCompare(b.channel);
  });
});

// 处理关闭事件
const handleClose = (): void => {
  emit('close');
};


</script>

<style scoped>
.header {
  font-size: 1.25rem;
  font-weight: bold;
  transform: skew(-10deg);
  color: #333;
}

.dialog-content {
  padding: 10px 0;
}

.basic-info {
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  font-weight: 600;
  color: #666;
  min-width: 80px;
}

.value {
  color: #333;
  flex: 1;
  text-align: right;
}

.value.status {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  font-weight: 600;
}

.status.alarm {
  color: #f56c6c;
  font-weight: bold;
}

.status-icon {
  width: 1.2rem;
  height: 1.2rem;
}

.channels-section h4 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 16px;
}

.channel-list {
  max-height: 300px;
  overflow-y: auto;
}

.channel-item {
  padding: 12px;
  margin-bottom: 8px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background-color: #f9f9f9;
  transition: all 0.3s ease;
}

.channel-item.alarm {
  border-color: #f56c6c;
  background-color: #fef0f0;
}

.channel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.channel-name {
  font-weight: 600;
  color: #333;
}

.channel-status {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  background-color: #67c23a;
  color: white;
}

.channel-status.alarm {
  background-color: #f56c6c;
}

.channel-details {
  color: #666;
  font-size: 14px;
}

.no-data {
  text-align: center;
  color: #999;
  padding: 40px 0;
}


</style>


