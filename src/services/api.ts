import axios from 'axios';
import config from '/public/config.js';

// 创建axios实例
const api = axios.create({
    baseURL: config.baseURL,
    timeout: 10000,
});

// 请求拦截器
api.interceptors.request.use(
    (config) => {
        // 在这里可以添加token等认证信息
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 响应拦截器
api.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 设备相关API
export const deviceApi = {
    // 获取设备列表
    getDeviceList() {
        return api.get('/Device/GetList');
    },
};

export default api; 
