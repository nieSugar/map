import { ref, onUnmounted, type Ref } from 'vue';
import type { WorkerMessage } from '../types/config';
import { handleSignalRError } from '../utils/errorHandler';
import { useLoading } from './useLoading';

export interface SignalROptions {
  onMessage?: (message: WorkerMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export function useSignalR(options: SignalROptions = {}) {
  const isConnected = ref<boolean>(false);
  const connectionError = ref<string | null>(null);
  const lastMessage = ref<WorkerMessage | null>(null);
  const worker = ref<Worker | null>(null);
  const reconnectAttempts = ref<number>(0);
  const reconnectTimer = ref<number | null>(null);

  // 配置选项
  const config = {
    autoReconnect: options.autoReconnect ?? true,
    reconnectInterval: options.reconnectInterval ?? 3000,
    maxReconnectAttempts: options.maxReconnectAttempts ?? 5,
    ...options
  };

  // 使用加载状态
  const { startLoading, stopLoading } = useLoading('signalr');

  // 清除重连定时器
  const clearReconnectTimer = (): void => {
    if (reconnectTimer.value) {
      clearTimeout(reconnectTimer.value);
      reconnectTimer.value = null;
    }
  };

  // 自动重连逻辑
  const attemptReconnect = (): void => {
    if (!config.autoReconnect || reconnectAttempts.value >= config.maxReconnectAttempts) {
      console.log('达到最大重连次数，停止重连');
      stopLoading();
      return;
    }

    reconnectAttempts.value++;
    console.log(`尝试第 ${reconnectAttempts.value} 次重连...`);

    reconnectTimer.value = window.setTimeout(() => {
      initConnection();
    }, config.reconnectInterval);
  };

  // 初始化Worker连接
  const initConnection = (): void => {
    try {
      startLoading({ message: '正在连接SignalR...' });

      worker.value = new Worker('/workers/unitySignalr.js');

      worker.value.onmessage = (event) => {
        try {
          const message = event.data as WorkerMessage;
          lastMessage.value = message;

          // 调用外部回调
          config.onMessage?.(message);

          // 如果是连接成功消息
          if (typeof message.response === 'string' && message.response.includes('连接成功')) {
            isConnected.value = true;
            connectionError.value = null;
            reconnectAttempts.value = 0; // 重置重连次数
            stopLoading();
            config.onConnect?.();
          }
        } catch (error) {
          console.error('处理SignalR消息时出错:', error);
          connectionError.value = '消息处理错误';
          handleSignalRError(error);
          config.onError?.(error);
        }
      };

      worker.value.onerror = (error) => {
        console.error('Worker错误:', error);
        isConnected.value = false;
        connectionError.value = 'Worker连接错误';
        stopLoading();
        handleSignalRError(error);
        config.onError?.(error);

        // 尝试自动重连
        attemptReconnect();
      };

      worker.value.onmessageerror = (error) => {
        console.error('Worker消息错误:', error);
        connectionError.value = 'Worker消息错误';
        handleSignalRError(error);
        config.onError?.(error);
      };

    } catch (error) {
      console.error('初始化SignalR连接失败:', error);
      connectionError.value = '初始化连接失败';
      stopLoading();
      handleSignalRError(error);
      config.onError?.(error);

      // 尝试自动重连
      attemptReconnect();
    }
  };

  // 断开连接
  const disconnect = (): void => {
    clearReconnectTimer();

    if (worker.value) {
      worker.value.terminate();
      worker.value = null;
    }

    isConnected.value = false;
    reconnectAttempts.value = 0;
    stopLoading();
    config.onDisconnect?.();
  };

  // 手动重新连接
  const reconnect = (): void => {
    disconnect();
    reconnectAttempts.value = 0; // 重置重连次数
    setTimeout(() => {
      initConnection();
    }, 1000);
  };

  // 发送消息到Worker（如果需要）
  const sendMessage = (message: any): void => {
    if (worker.value && isConnected.value) {
      worker.value.postMessage(message);
    } else {
      console.warn('SignalR未连接，无法发送消息');
    }
  };

  // 组件卸载时清理
  onUnmounted(() => {
    disconnect();
  });

  // 自动初始化连接
  initConnection();

  return {
    // 状态
    isConnected: isConnected as Ref<boolean>,
    connectionError: connectionError as Ref<string | null>,
    lastMessage: lastMessage as Ref<WorkerMessage | null>,
    reconnectAttempts: reconnectAttempts as Ref<number>,

    // 方法
    initConnection,
    disconnect,
    reconnect,
    sendMessage,
    clearReconnectTimer
  };
}
