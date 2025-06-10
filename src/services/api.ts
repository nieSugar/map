import axios, { type AxiosResponse, type AxiosError } from 'axios';
import { env } from '../config/env';
import { handleApiError, handleNetworkError } from '../utils/errorHandler';
import type { ApiResponse, DeviceListItem } from '../types/config';

// 创建axios实例
const api = axios.create({
    baseURL: env.API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 请求拦截器
api.interceptors.request.use(
    (config) => {
        // 在这里可以添加token等认证信息
        // const token = localStorage.getItem('token');
        // if (token) {
        //     config.headers.Authorization = `Bearer ${token}`;
        // }

        console.log('API请求:', config.method?.toUpperCase(), config.url);
        return config;
    },
    (error: AxiosError) => {
        console.error('请求拦截器错误:', error);
        handleApiError(error, 'request-interceptor');
        return Promise.reject(error);
    }
);

// 响应拦截器
api.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => {
        console.log('API响应:', response.status, response.config.url);

        // 如果后端返回的数据结构包含code字段，进行统一处理
        if (response.data && typeof response.data === 'object' && 'code' in response.data) {
            const { code, message, data } = response.data;
            if (code !== 200 && code !== 0) {
                console.error('API业务错误:', message);
                return Promise.reject(new Error(message || '请求失败'));
            }
            return data; // 返回实际数据
        }

        return response.data;
    },
    (error: AxiosError<ApiResponse>) => {
        console.error('API响应错误:', error);

        // 处理HTTP状态码错误
        if (error.response) {
            const { status, data } = error.response;
            let errorMessage = '请求失败';

            switch (status) {
                case 400:
                    errorMessage = '请求参数错误';
                    break;
                case 401:
                    errorMessage = '未授权，请重新登录';
                    break;
                case 403:
                    errorMessage = '拒绝访问';
                    break;
                case 404:
                    errorMessage = '请求的资源不存在';
                    break;
                case 500:
                    errorMessage = '服务器内部错误';
                    break;
                default:
                    errorMessage = data?.message || `请求失败 (${status})`;
            }

            return Promise.reject(new Error(errorMessage));
        } else if (error.request) {
            handleNetworkError(error);
            return Promise.reject(new Error('网络连接失败，请检查网络'));
        } else {
            handleApiError(error, 'request-config');
            return Promise.reject(new Error(error.message || '请求配置错误'));
        }
    }
);

// 设备相关API
export const deviceApi = {
    // 获取设备列表
    async getDeviceList(): Promise<DeviceListItem[]> {
        try {
            const response = await api.get<ApiResponse<DeviceListItem[]>>('/Device/GetList');
            return response as DeviceListItem[];
        } catch (error) {
            console.error('获取设备列表失败:', error);
            throw error;
        }
    },

    // 获取设备详情
    async getDeviceDetail(deviceId: string): Promise<DeviceListItem> {
        try {
            const response = await api.get<ApiResponse<DeviceListItem>>(`/Device/GetDetail/${deviceId}`);
            return response as DeviceListItem;
        } catch (error) {
            console.error('获取设备详情失败:', error);
            throw error;
        }
    },

    // 获取设备状态
    async getDeviceStatus(deviceId: string): Promise<{ status: number; lastUpdate: string }> {
        try {
            const response = await api.get<ApiResponse<{ status: number; lastUpdate: string }>>(`/Device/GetStatus/${deviceId}`);
            return response as { status: number; lastUpdate: string };
        } catch (error) {
            console.error('获取设备状态失败:', error);
            throw error;
        }
    },
};

export default api;
