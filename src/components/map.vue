<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import BJD1 from "../assets/bjd1.png?url";
import BJD2 from "../assets/bjd2.png?url";
import { deviceApi } from "../services/api";

const center = ref({ lng: 121.40953, lat: 31.260756 });
const zoom = ref(15);
const dialogVisible = ref(false);

const icon = computed(() => {
  return {
    url: status.value > 0 ? "/red.gif" : "/green.svg",
    size: { width: 31, height: 40 },
  };
});

// 为每个设备生成图标的函数
const getDeviceIcon = (deviceStatus: number) => {
  return {
    url: deviceStatus > 0 ? "/red.gif" : "/green.svg",
    size: { width: 31, height: 40 },
  };
};

// 当前选中的设备
const selectedDevice = ref<string | null>(null); // 存储设备ID
const selectedDeviceChannels = ref<DevicePoint[]>([]); // 存储选中设备的所有通道数据

const status = ref(0);

const handler = () => {
  center.value.lng = 121.40953;
  center.value.lat = 31.260756;
  zoom.value = 15;
};

const initDialog = () => {
  dialogVisible.value = true;
};

// 处理设备点击事件
const handleDeviceClick = (deviceId: string) => {
  console.log("点击设备:", deviceId);
  selectedDevice.value = deviceId;

  // 获取该设备的所有通道数据
  const deviceChannelsMap = devicePoints.value.get(deviceId);
  if (deviceChannelsMap) {
    selectedDeviceChannels.value = Array.from(deviceChannelsMap.values());
    // 设置设备状态为该设备的综合状态
    status.value = getDeviceStatus(deviceId);
  } else {
    selectedDeviceChannels.value = [];
    status.value = 0;
  }

  dialogVisible.value = true;
};

// 获取设备地址（使用第一个通道的地址，因为同一设备所有通道地址相同）
const getDeviceAddress = (deviceId: string): string => {
  const deviceChannels = devicePoints.value.get(deviceId);
  if (!deviceChannels) return '';

  const firstChannel = Array.from(deviceChannels.values())[0];
  return firstChannel ? firstChannel.address : '';
};



// #region  数据接口定义

interface WorkerMessage {
  deviceId: string;
  response: {
    deviceId: string;
    channel: string;
    address: string;
    lon: number;
    lat: number;
    power: number;
    state: number;
  } | string; // 可能是字符串消息（如系统连接消息）
  timestamp: string;
}

interface DevicePoint {
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

let work = new Worker("/workers/unitySignalr.js");

// 存储设备点位数据 - 改为两层结构：设备ID -> 通道 -> 设备数据
const devicePoints = ref<Map<string, Map<string, DevicePoint>>>(new Map());
const pointsData = ref<Array<any>>([]);

// 获取设备的综合状态（如果任一通道报警，则设备报警）
const getDeviceStatus = (deviceId: string): number => {
  const deviceChannels = devicePoints.value.get(deviceId);
  if (!deviceChannels) return 0;

  for (const channelData of deviceChannels.values()) {
    if (channelData.status === 1) {
      return 1; // 有任一通道报警，设备状态为报警
    }
  }
  return 0; // 所有通道正常
};

// 获取设备的位置（使用第一个通道的位置）
const getDevicePosition = (deviceId: string) => {
  const deviceChannels = devicePoints.value.get(deviceId);
  if (!deviceChannels) return null;

  const firstChannel = Array.from(deviceChannels.values())[0];
  return firstChannel ? firstChannel.position : null;
};

work.onmessage = (ev) => {
  try {
    const data = ev.data as WorkerMessage;
    if (typeof data.response === 'object' && data.response !== null) {
      const deviceId = data.deviceId;
      const channel = data.response.channel;
      console.log("处理设备ID:", deviceId, "通道:", channel);
      console.log("消息时间戳:", data.timestamp);

      // 获取设备位置坐标（优先使用response中的坐标）
      const position = {
        lng: data.response.lon,
        lat: data.response.lat
      };

      // 创建或更新设备点位数据
      const devicePoint: DevicePoint = {
        deviceId: deviceId,
        position: position,
        status: data.response.state,
        lastUpdate: new Date().toLocaleString(),
        channel: data.response.channel,
        address: data.response.address,
        data: {
          power: data.response.power
        }
      };

      // 确保设备存在于Map中
      if (!devicePoints.value.has(deviceId)) {
        devicePoints.value.set(deviceId, new Map<string, DevicePoint>());
      }

      // 获取设备的通道Map并更新特定通道的数据
      const deviceChannelsMap = devicePoints.value.get(deviceId)!;
      deviceChannelsMap.set(channel, devicePoint);

      // 如果当前选中的是这个设备，更新选中设备的通道数据和状态
      if (selectedDevice.value === deviceId) {
        selectedDeviceChannels.value = Array.from(deviceChannelsMap.values());
        // 更新设备的综合状态
        status.value = getDeviceStatus(deviceId);
      } else {
        // 更新全局状态（使用最新接收到的设备状态）
        status.value = data.response.state;
      }

      // 添加到历史数据数组（用于调试和历史记录）
      const historyData = {
        deviceId: deviceId,
        timestamp: new Date().toLocaleString(),
        state: data.response.state,
        power: data.response.power,
        channel: data.response.channel,
        address: data.response.address,
        position: position
      };

      pointsData.value.push(historyData);

      // 限制历史数据数组大小
      if (pointsData.value.length > 1000) {
        const removeCount = pointsData.value.length - 1000;
        pointsData.value.splice(0, removeCount);
      }

    } else if (typeof data.response === 'string') {
      // 处理系统消息（如连接状态等）
      console.log("收到系统消息:", data.response);
    } else {
      console.warn("数据中没有有效的response字段");
    }
  } catch (error) {
    console.error("处理worker消息时出错:", error);
  }
};

// #endregion

async function fetchDevices() {
  try {
    const devices = await deviceApi.getDeviceList();
    console.log(devices);
  } catch (error) {
    console.error("获取设备列表失败:", error);
  }
}

onMounted(() => {
  fetchDevices();
});
</script>

<template>
  <div class="title">
    <div class="subTitle">海仿智能安全用电卫士系统</div>
  </div>
  <div class="card">
    <baidu-map class="bm-view" :zoom="zoom" :center="center" @ready="handler">
      <!-- 动态渲染所有设备点位 -->
      <bm-marker v-for="[deviceId] in devicePoints" :key="deviceId"
        :position="getDevicePosition(deviceId)"
        :icon="getDeviceIcon(getDeviceStatus(deviceId))"
        @click="() => handleDeviceClick(deviceId)"
        :title="`设备: ${deviceId} | 状态: ${getDeviceStatus(deviceId) === 1 ? '报警' : '正常'}`">
      </bm-marker>

      <!-- 如果没有设备数据，显示默认标记 -->
      <bm-marker v-if="devicePoints.size === 0" :position="{ lng: 121.40953, lat: 31.260756 }" :icon="icon"
        @click="initDialog" title="默认位置">
      </bm-marker>
    </baidu-map>
    <el-dialog v-model="dialogVisible" width="30%" :class="{ 'error-shadow': status === 1 }">
      <template #header>
        <div class="header">设备信息</div>
      </template>
      <div class="dialog-content">
        <!-- 基本信息 -->
        <div class="basic-info">
          <div class="info-row">
            <span class="label">设备ID:</span>
            <span class="value">{{ selectedDevice || '未选择设备' }}</span>
          </div>
          <div class="info-row">
            <span class="label">状态:</span>
            <span class="value status" :class="{ 'alarm': selectedDevice && getDeviceStatus(selectedDevice) === 1 }">
              <img class="status-icon" :src="selectedDevice && getDeviceStatus(selectedDevice) === 1 ? BJD1 : BJD2" alt="" />
              {{ selectedDevice && getDeviceStatus(selectedDevice) === 1 ? '报警' : '正常' }}
            </span>
          </div>
          <div class="info-row" v-if="selectedDevice">
            <span class="label">地址:</span>
            <span class="value">{{ getDeviceAddress(selectedDevice) }}</span>
          </div>
        </div>

        <!-- 通道列表 -->
        <div v-if="selectedDevice && selectedDeviceChannels.length > 0" class="channels-section">
          <h4>通道列表 ({{ selectedDeviceChannels.length }}个)</h4>
          <div class="channel-list">
            <div
              v-for="channel in selectedDeviceChannels"
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

        <!-- 没有数据时显示 -->
        <div v-else class="no-data">
          暂无设备数据
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<style>
/* 添加动画 渐渐扩散的阴影 */
@keyframes shadow {
  0% {
    box-shadow: 0 0 0 0 rgba(112, 43, 43, 0.7);
  }

  50% {
    box-shadow: 0 0 8px 8px rgba(255, 0, 0, 0.7);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(112, 43, 43, 0.7);
  }
}

.error-shadow {
  animation: shadow 1.5s infinite;
}
</style>

<style scoped>
@keyframes blink {
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}

.blink {
  animation: blink 1s infinite;
}

.header {
  font-size: 1.25rem;
  font-weight: bold;
  transform: skew(-10deg);
}

.bm-view {
  width: 100%;
  height: 100vh;
}

.title {
  background-image: url("/imgs/bg.png");
  background-repeat: no-repeat;
  background-position: center;
  position: absolute;
  top: 0;
  left: 0;
  height: 60px;
  width: 100%;
  z-index: 1;
}

.subTitle {
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 10px;
  font-size: 2.5rem;
  color: #fff;
}

/* 弹窗内容样式 */
.dialog-content {
  padding: 1rem 0;
}

.basic-info {
  margin-bottom: 1.5rem;
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  font-weight: 600;
  color: #333;
  min-width: 80px;
  margin-right: 1rem;
}

.value {
  color: #666;
  flex: 1;
}

.value.status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.value.status.alarm {
  color: #ff4d4f;
}

.status-icon {
  width: 1.2rem;
  height: 1.2rem;
}

/* 通道部分样式 */
.channels-section {
  margin-top: 1rem;
}

.channels-section h4 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.1rem;
  font-weight: 600;
}

.channel-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 300px;
  overflow-y: auto;
}

.channel-item {
  padding: 0.75rem;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  background-color: #fafafa;
}

.channel-item.alarm {
  border-color: #ff4d4f;
  background-color: #fff2f0;
}

.channel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.channel-name {
  font-weight: 600;
  color: #333;
}

.channel-status {
  font-size: 0.85rem;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  background-color: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.channel-status.alarm {
  background-color: #fff2f0;
  color: #ff4d4f;
  border-color: #ffccc7;
}

.channel-details {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: #666;
}

.no-data {
  text-align: center;
  color: #999;
  padding: 2rem;
  font-style: italic;
}


</style>
