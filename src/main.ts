import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import BaiduMap from 'vue-baidu-map-3x';

createApp(App).use(ElementPlus).use(BaiduMap,{
  ak:'O8y9cAkKuc7Sv7YrxSSTrUXlQ8kh6AZJ'
}).mount("#app");
