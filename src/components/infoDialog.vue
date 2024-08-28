<script setup lang="ts">
import * as echarts from "echarts";
import { EChartsType } from "echarts";
import { nextTick, ref } from "vue";

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

const visible = defineModel('visible', { type: Boolean, default: false });
const imgUrl = ref("https://img.lifesugar.top/file/e263760fdddffb5d134f9.jpg");
const status = ref(0);
const visibleDetail = ref(false);

const errorCount = ref(0);
const normalCount = ref(3);

const name = ref('');

let work = new Worker('/workers/unitySignalr.js');

work.onmessage = (ev) => {
  mapEchartsData(ev.data as EchartData);
  status.value = ev.data.response.state;
  if (status.value === 1) {
    errorCount.value = 1;
    normalCount.value = 2;
  } else {
    errorCount.value = 0;
    normalCount.value = 3;
  }
}

const powerEchartElement = ref<HTMLDivElement | null>(null);
const zimagEchartElement = ref<HTMLDivElement | null>(null);
const zrealEchartElement = ref<HTMLDivElement | null>(null);
const statusElement = ref<HTMLDivElement | null>(null);

let powerEchart: EChartsType | null;
let zimagEchart: EChartsType | null;
let zrealEchart: EChartsType | null;
let statusEchart: EChartsType | null;


let timeDatas: Array<string> = [];
let powerDatas: Array<number> = [];
let zimagDatas: Array<number> = [];
let zrealDatas: Array<number> = [];
let stateDatas: Array<number> = [];

function itemClick(itemName: string) {
  visibleDetail.value = true;
  name.value = itemName;
  initEcharts();
}

function initEcharts() {
  nextTick(() => {
    powerEchart = echarts.init(powerEchartElement.value as HTMLDivElement);
    powerEchart.setOption({
      title: {
        text: '功率',
        left: 'center'
      },
      grid: {
        bottom: 20,
        left: 50,
        top: 35
      },
      tooltip: {},
      xAxis: {
        type: 'category',
        data: timeDatas,
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          data: powerDatas,
          type: 'line'
        }
      ]
    });

    zimagEchart = echarts.init(zimagEchartElement.value as HTMLDivElement);
    zimagEchart.setOption({
      title: {
        text: '阻抗虚部',
        left: 'center'
      },
      grid: {
        bottom: 20,
        left: 50,
        top: 35
      },
      tooltip: {},
      xAxis: {
        type: 'category',
        data: timeDatas,
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          data: zimagDatas,
          type: 'line'
        }
      ]
    });

    zrealEchart = echarts.init(zrealEchartElement.value as HTMLDivElement);
    zrealEchart.setOption({
      title: {
        text: '阻抗实部',
        left: 'center'
      },
      grid: {
        bottom: 20,
        left: 50,
        top: 35
      },
      tooltip: {},
      xAxis: {
        type: 'category',
        data: timeDatas,
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          data: zrealDatas,
          type: 'line'
        }
      ]
    });

    statusEchart = echarts.init(statusElement.value as HTMLDivElement);
    statusEchart.setOption({
      title: {
        text: '状态',
        left: 'center'
      },
      grid: {
        bottom: 20,
        left: 50,
        top: 35
      },
      tooltip: {},
      xAxis: {
        type: 'category',
        data: timeDatas,
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 1,
        interval: 1,
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

function mapEchartsData(data: EchartData) {
  const { min, max, response } = data;
  const { power, state, zimag, zreal } = response;
  const lent = power.length;
  if (lent === 0) {
    return;
  }
  const minTime = new Date(min).getTime();
  const maxTime = new Date(max).getTime();
  const times = getTimes(minTime, maxTime, lent);

  timeDatas.push(...times.map(time => new Date(time).toLocaleTimeString()));
  powerDatas.push(...power);
  zimagDatas.push(...zimag);
  zrealDatas.push(...zreal);
  stateDatas.push(...Array(lent).fill(state));

  if (timeDatas.length > 12) {
    const len = timeDatas.length - 12;
    timeDatas.splice(0, len);
    powerDatas.splice(0, len);
    zimagDatas.splice(0, len);
    zrealDatas.splice(0, len);
  }
  if (visibleDetail) {
    updateEcartOptionData(powerEchart!, powerDatas, timeDatas);
    updateEcartOptionData(zimagEchart!, zimagDatas, timeDatas);
    updateEcartOptionData(zrealEchart!, zrealDatas, timeDatas);
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

function getTimes(min: number, max: number, n: number): Array<number> {
  const val = max - min;
  const step = Math.floor(val / n);
  const numbers: Array<number> = [];
  for (let i = 1; i <= n; i++) {
    numbers.push(i * step + min);
  }
  return numbers;
}

function titleClick() {
  name.value = '';
  visibleDetail.value = false;
}

</script>

<template>
  <el-dialog v-model="visible" title="海仿智能电瓶车安全系统" width="58%" top="2%">
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
    <div class="title">
      <div class="title-row">
        <div class="title-name" @click="titleClick()">1201号</div>
        <div v-if="name">
          <span style="margin: 0 8px;"> > </span>
          <span> {{ name }}</span>
        </div>
      </div>
    </div>
    <div class="body" v-if="!visibleDetail">
      <div class="info-type">
        <div class="info-title">
          <label>异常: <span style="color: red; font-size: 2rem;">{{ errorCount }} </span> 户 </label>
        </div>
        <div class="info-row">
          <el-button v-show="status" type="danger" plain class="info-item" @click="itemClick('A001')">A001</el-button>
        </div>
      </div>
      <div class="info-type">
        <div class="info-title">
          <label>正常: <span style="color: #7BA2DC; font-size: 2rem;">{{ normalCount }} </span> 户 </label>
        </div>
        <div class="info-row">
          <el-button v-if="!status" type="info" plain class="info-item" @click="itemClick('A001')">A001</el-button>
          <el-button type="info" plain class="info-item">A002</el-button>
          <el-button type="info" plain class="info-item">A003</el-button>
        </div>
      </div>
    </div>
    <div class="body" v-else>
      <div>
        <div class="detail-echarts">
          <div ref="statusElement" class="echats"></div>
          <!-- <div ref="powerEchartElement" class="echats"></div> -->
        </div>
        <!-- <div class="detail-echarts">
          <div ref="zimagEchartElement" class="echats"></div>
          <div ref="zrealEchartElement" class="echats"></div>
        </div> -->
      </div>
    </div>
  </el-dialog>
</template>

<style scoped>
.main {
  display: flex;
}

.img {
  border-radius: 10px;
  width: 500px;
  height: 250px;
}

.title-info {
  padding-left: 4rem;
  display: grid;
  align-items: center;
  width: calc(100% - 500px - 4rem);
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
  font-size: 1.25rem;
}

.info-val {
  min-width: calc(100% - 300px);
  display: inline-block;
}

.info-type {
  margin-top: 1rem;
  margin-left: 0.25rem;
}

.info-title {
  font-size: 1.125rem;
}

.info-row {
  display: flex;
  padding-top: 1rem;
  padding-left: 0.5rem;
}

.info-item {
  min-width: 5rem;
  height: 3rem;
  margin-right: 0.70rem;
}

.detail-echarts {
  display: flex;
  word-wrap: inherit;
  gap: 1%;
  padding-top: 0.5rem;
}

.echats {
  width: 48%;
  height: 200px;
}

.title {
  background-image: url('/imgs/title.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
  height: 42px;
}

.title-row {
  display: flex;
  padding-left: 1rem;
  line-height: 42px;
  color: #FFFFFF;
  font-size: 16px;
  font-weight: 600;
}

.title-name:hover {
  cursor: pointer;
}
</style>
