<script setup lang="ts">
import { computed, ref } from 'vue';
import InfoDialog from './infoDialog.vue';

const center = ref({ lng: 0, lat: 0 });
const zoom = ref(15);
const dialogVisible = ref(false);

const icon = computed(() => {
  return {
    url: errorCount.value > 0 ? '/red.svg' : '/green.svg',
    size: { width: 31, height: 40 }
  }
});

const errorCount = ref(0);
const normalCount = ref(3);

const label = computed(() => {
  return `
  <div >
    <div style="display:flex;align-items:baseline; color:lime">
      <div style="width:10px;height:10px;border-radius:50%;background-color:lime;margin-right:10px"></div>
      <span style="margin-right:5px">正常:</span>
      <span>${normalCount.value}</span>
    </div>
    <div style="display:flex;align-items:baseline; color:red">
      <div style="width:10px;height:10px;border-radius:50%;background-color:red;margin-right:10px"></div>
      <span style="margin-right:5px">异常:</span>
      <span>${errorCount.value}</span>
    </div>
  </div>
`
});

const handler = () => {
  center.value.lng = 121.40953;
  center.value.lat = 31.260756;
  zoom.value = 15;
}

const initDialog = () => {
  dialogVisible.value = true;
}

</script>

<template>
  <div class="title">
    <div class="subTitle"> 海仿智能电瓶车安全系统</div>
  </div>
  <div class="card">
    <baidu-map class="bm-view" :zoom="zoom" :center="center" @ready="handler">
      <bm-marker :position="{ lng: 121.40953, lat: 31.260756 }" :icon="icon" @click="initDialog">
        <bm-label :content="label" @click="initDialog"
          :labelStyle="{ fontSize: '12px', border: '1px solid #080808', borderRadius: '3px', padding: '7px', backgroundColor: '#080808B8', color: '#fff' }"
          :offset="{ width: -20, height: -55 }" />
      </bm-marker>
    </baidu-map>
    <InfoDialog v-if="dialogVisible" v-model="dialogVisible"></InfoDialog>
  </div>
</template>

<style scoped>
.bm-view {
  width: 100%;
  height: 100vh;
}

.title {
  background-image: url('/imgs/bg.png');
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

.echats {
  width: 400px;
  height: 300px;
}
</style>
