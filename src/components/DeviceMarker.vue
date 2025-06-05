<template>
  <bm-marker 
    :position="position" 
    :icon="markerIcon" 
    :title="markerTitle"
    @click="handleClick"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { generateDeviceIcon, formatDeviceTitle } from '../utils/deviceUtils';
import type { DeviceMarkerProps, MapIcon, DeviceStatus } from '../types/config';

interface Props {
  deviceId: string;
  position: {
    lng: number;
    lat: number;
  };
  status: DeviceStatus;
  title?: string;
}

interface Emits {
  (e: 'click', deviceId: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  title: ''
});

const emit = defineEmits<Emits>();

// 根据设备状态生成图标
const markerIcon = computed((): MapIcon => {
  return generateDeviceIcon(props.status);
});

// 生成标记标题
const markerTitle = computed((): string => {
  if (props.title) {
    return props.title;
  }
  return formatDeviceTitle(props.deviceId, props.status);
});

// 处理点击事件
const handleClick = (): void => {
  emit('click', props.deviceId);
};
</script>

<style scoped>
/* 如果需要自定义样式可以在这里添加 */
</style>
