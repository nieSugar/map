import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import BaiduMap from 'vue-baidu-map-3x';
import { env, validateEnv } from './config/env';
import { setupErrorHandler } from './utils/errorHandler';

// 验证环境变量
try {
  validateEnv();
  console.log('✅ 环境变量验证通过');
  if (env.isDev) {
    console.log('🔧 开发模式 - 环境变量状态:');
    console.log(`  - BAIDU_MAP_AK: ${env.BAIDU_MAP_AK ? '已配置' : '未配置'}`);
    console.log(`  - API_BASE_URL: ${env.API_BASE_URL}`);
  }
} catch (error) {
  console.error('❌ 环境变量验证失败:', error);
  // 在开发环境下，我们可以提供更友好的错误提示
  if (env.isDev) {
    alert('环境变量配置错误，请检查 .env 文件是否正确配置');
  }
  throw error;
}

const app = createApp(App);

// 设置全局错误处理
setupErrorHandler(app);

// 配置百度地图
app.use(BaiduMap, {
  ak: env.BAIDU_MAP_AK
});

app.mount("#app");
