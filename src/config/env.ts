// 环境变量配置
export const env = {
  // 百度地图API密钥
  BAIDU_MAP_AK: import.meta.env.VITE_BAIDU_MAP_AK || '',

  // API基础URL
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://139.196.243.9:5286/api',

  // 当前环境
  NODE_ENV: import.meta.env.MODE,

  // 是否为开发环境
  isDev: import.meta.env.DEV,

  // 是否为生产环境
  isProd: import.meta.env.PROD,
} as const;

// 验证必要的环境变量
export function validateEnv() {
  const requiredVars = {
    BAIDU_MAP_AK: env.BAIDU_MAP_AK,
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    console.error('缺少必要的环境变量:', missingVars);
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}
