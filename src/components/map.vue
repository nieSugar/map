<script setup lang="ts">
import { EChartsType } from 'echarts';
import { computed, nextTick, ref } from 'vue';
import * as echarts from "echarts";

const center = ref({ lng: 0, lat: 0 });
const zoom = ref(15);
const dialogVisible = ref(false);

const icon = computed(() => {
  return {
    url: status.value > 0 ? '/red.gif' : '/green.svg',
    size: { width: 31, height: 40 }
  }
});

const imgUrl = ref("https://img.lifesugar.top/file/86478f0582c74c7dd8941.jpg");
const status = ref(0);

const handler = () => {
  center.value.lng = 121.40953;
  center.value.lat = 31.260756;
  zoom.value = 15;
}

const initDialog = () => {
  dialogVisible.value = true;
  initEcharts();
}

function initEcharts() {
  nextTick(() => {
    statusEchart = echarts.init(statusElement.value as HTMLDivElement);
    statusEchart.setOption({
      title: {
        text: '状态',
        left: 'center'
      },
      grid: {
        bottom: 20,
        left: 80,
        top: 35
      },
      tooltip: {
        show: false
      },
      xAxis: {
        type: 'category',
        data: timeDatas,
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 1,
        interval: 1,
        axisLabel: {
          formatter: (value: number) => {
            return value === 1 ? '充电' : '正常';
          }
        }
      },
      series: [
        {
          data: stateDatas,
          type: 'line'
        }
      ]
    });
  });
}

// #region  弹窗

interface EchartData {
  min: number;
  max: number;
  response: {
    power: Array<number>;
    state: number;
    zimag: Array<number>;
    zreal: Array<number>;
  };
}

const statusElement = ref<HTMLDivElement | null>(null);
let timeDatas: Array<string> = [];
let stateDatas: Array<number> = [];
let statusEchart: EChartsType | null;
let work = new Worker('/workers/unitySignalr.js');

work.onmessage = (ev) => {
  mapEchartsData(ev.data as EchartData);
}

function mapEchartsData(data: EchartData) {
  const { max, response } = data;
  const { power, state } = response;
  console.log(data);

  const lent = power.length;
  if (lent === 0) {
    return;
  }
  timeDatas.push(new Date(max).toLocaleTimeString());
  status.value = state;
  stateDatas.push(state);

  if (timeDatas.length > 30) {
    const len = timeDatas.length - 30;
    timeDatas.splice(0, len);
  }
  if (dialogVisible.value) {
    updateEcartOptionData(statusEchart!, stateDatas, timeDatas);
  }
}

function updateEcartOptionData(item: EChartsType, data: Array<number>, time: Array<string>) {
  item?.setOption({
    xAxis: {
      data: time,
    },
    series: [
      {
        data: data,
        type: 'line'
      }
    ]
  });
}

// #endregion

</script>

<template>
  <div class="title">
    <div class="subTitle"> 海仿智能电瓶车安全系统</div>
  </div>
  <div class="card">
    <baidu-map class="bm-view" :zoom="zoom" :center="center" @ready="handler">
      <bm-marker :position="{ lng: 121.40953, lat: 31.260756 }" :icon="icon" @click="initDialog">
      </bm-marker>
    </baidu-map>
    <el-dialog v-model="dialogVisible" width="40%" :class="{ 'error-shadow': status === 1 }">
      <template #header>
        <div class="header">
          海仿智能电瓶车安全系统
        </div>
      </template>
      <div class="main">
        <div>
          <el-image class="img" fit="contain" :src="imgUrl"></el-image>
        </div>
        <div class="title-info">
          <div class="title-info-row">
            <label class="lable">小区: </label><span class="lable">塔普合欢苑小区东区</span>
          </div>
          <div class="title-info-row">
            <label class="lable">
              地址:
            </label>
            <span class="lable">上海市普陀区桃浦新村合欢苑121号6楼-601</span>
          </div>
        </div>
      </div>
      <div class="body">
        <div class="detail-echarts">
          <div ref="statusElement" class="echats"></div>
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

.main {
  display: flex;
}

.img {
  border-radius: 10px;
  width: 300px;
  height: 150px;
}

.title-info {
  padding-left: 5px;
  display: grid;
  align-items: center;
  width: calc(100% - 300px - 4rem);
  grid-gap: 20px;
}

.title-info-row {
  display: flex;
}

.title-info-row>label {
  min-width: 3rem;
}

.lable,
.val {
  font-size: 1rem;
}

.detail-echarts {
  display: flex;
  justify-content: center;
  gap: 1%;
  padding-top: 0.5rem;
}

.echats {
  width: 90%;
  height: 200px;
}
</style>
