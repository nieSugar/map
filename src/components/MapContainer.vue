<template>
  <div class="map-container">
    <div class="title">
      <div class="subTitle">海仿智能安全用电卫士系统</div>
    </div>
    
    <div class="card">
      <baidu-map 
        class="bm-view" 
        :zoom="zoom" 
        :center="center" 
        @ready="handleMapReady"
      >
        <!-- 动态渲染所有设备标记点 -->
        <DeviceMarker
          v-for="deviceId in deviceIds"
          :key="deviceId"
          :device-id="deviceId"
          :position="getDevicePosition(deviceId)"
          :status="getDeviceStatus(deviceId)"
          @click="handleDeviceClick"
        />

        <!-- 默认标记点（当没有设备数据时显示） -->
        <bm-marker 
          v-if="deviceIds.length === 0" 
          :position="defaultPosition" 
          :icon="defaultIcon"
          @click="handleDefaultMarkerClick" 
          title="默认位置"
        />
      </baidu-map>
    </div>

    <!-- 设备信息弹窗 -->
    <DeviceInfoDialog
      v-model:visible="dialogVisible"
      :device-id="selectedDeviceId"
      :device-data="selectedDeviceData"
      @close="handleDialogClose"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import DeviceMarker from './DeviceMarker.vue';
import DeviceInfoDialog from './DeviceInfoDialog.vue';
import { useDeviceData } from '../composables/useDeviceData';
import { useSignalR } from '../composables/useSignalR';
import { deviceApi } from '../services/api';
import { generateDeviceIcon } from '../utils/deviceUtils';
import type { MapCenter, MapIcon } from '../types/config';

// 地图配置
const center = ref<MapCenter>({ lng: 121.40953, lat: 31.260756 });
const zoom = ref<number>(15);
const defaultPosition: MapCenter = { lng: 121.40953, lat: 31.260756 };

// 默认图标
const defaultIcon: MapIcon = {
  url: "/green.svg",
  size: { width: 31, height: 40 }
};

// 弹窗状态
const dialogVisible = ref<boolean>(false);
const selectedDeviceId = ref<string | null>(null);

// 使用设备数据管理
const {
  deviceIds,
  updateDeviceData,
  getDeviceStatus,
  getDevicePosition,
  getDeviceData
} = useDeviceData();

// 获取选中设备的数据
const selectedDeviceData = computed(() => {
  if (!selectedDeviceId.value) return null;
  return getDeviceData(selectedDeviceId.value);
});

// 使用SignalR连接
const { isConnected, connectionError } = useSignalR({
  onMessage: (message) => {
    updateDeviceData(message);
  },
  onConnect: () => {
    console.log('SignalR连接成功');
  },
  onDisconnect: () => {
    console.log('SignalR连接断开');
  },
  onError: (error) => {
    console.error('SignalR连接错误:', error);
  }
});

// 地图准备就绪处理
const handleMapReady = (): void => {
  center.value = { lng: 121.40953, lat: 31.260756 };
  zoom.value = 15;
};

// 设备标记点击处理
const handleDeviceClick = (deviceId: string): void => {
  selectedDeviceId.value = deviceId;
  dialogVisible.value = true;
};

// 默认标记点击处理
const handleDefaultMarkerClick = (): void => {
  selectedDeviceId.value = null;
  dialogVisible.value = true;
};

// 弹窗关闭处理
const handleDialogClose = (): void => {
  selectedDeviceId.value = null;
  dialogVisible.value = false;
};

// 获取设备列表
const fetchDevices = async (): Promise<void> => {
  try {
    const devices = await deviceApi.getDeviceList();
    console.log('设备列表:', devices);
  } catch (error) {
    console.error('获取设备列表失败:', error);
  }
};

// 组件挂载时初始化
onMounted(() => {
  fetchDevices();
});
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100vh;
  position: relative;
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

.card {
  width: 100%;
  height: 100%;
}

.bm-view {
  width: 100%;
  height: 100%;
}
</style>
