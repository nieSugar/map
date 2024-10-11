import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import BaiduMap from 'vue-baidu-map-3x';

createApp(App).use(ElementPlus).use(BaiduMap,{
  ak:'RB8eTKX9xgQzX0sKoUfAvWHxRg3haYon'
}).mount("#app");
