// 环境变量测试文件
import { env, validateEnv } from '../config/env';

// 简单的环境变量测试
export function testEnvironmentVariables() {
  console.log('🧪 测试环境变量配置...');
  
  try {
    // 验证环境变量
    validateEnv();
    
    console.log('✅ 环境变量验证通过');
    console.log('📋 当前环境变量配置:');
    console.log(`  - BAIDU_MAP_AK: ${env.BAIDU_MAP_AK ? '已配置' : '未配置'}`);
    console.log(`  - API_BASE_URL: ${env.API_BASE_URL}`);
    console.log(`  - NODE_ENV: ${env.NODE_ENV}`);
    console.log(`  - isDev: ${env.isDev}`);
    console.log(`  - isProd: ${env.isProd}`);
    
    return true;
  } catch (error) {
    console.error('❌ 环境变量验证失败:', error);
    return false;
  }
}

// 如果直接运行此文件，执行测试
if (import.meta.env.DEV) {
  testEnvironmentVariables();
}
