import { ref, onUnmounted, type Ref } from 'vue';
import type { WorkerMessage } from '../types/config';

export interface SignalROptions {
  onMessage?: (message: WorkerMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
}

export function useSignalR(options: SignalROptions = {}) {
  const isConnected = ref<boolean>(false);
  const connectionError = ref<string | null>(null);
  const lastMessage = ref<WorkerMessage | null>(null);
  const worker = ref<Worker | null>(null);

  // 初始化Worker连接
  const initConnection = (): void => {
    try {
      worker.value = new Worker('/workers/unitySignalr.js');
      
      worker.value.onmessage = (event) => {
        try {
          const message = event.data as WorkerMessage;
          lastMessage.value = message;
          
          // 调用外部回调
          options.onMessage?.(message);
          
          // 如果是连接成功消息
          if (typeof message.response === 'string' && message.response.includes('连接成功')) {
            isConnected.value = true;
            connectionError.value = null;
            options.onConnect?.();
          }
        } catch (error) {
          console.error('处理SignalR消息时出错:', error);
          connectionError.value = '消息处理错误';
          options.onError?.(error);
        }
      };

      worker.value.onerror = (error) => {
        console.error('Worker错误:', error);
        isConnected.value = false;
        connectionError.value = 'Worker连接错误';
        options.onError?.(error);
      };

      worker.value.onmessageerror = (error) => {
        console.error('Worker消息错误:', error);
        connectionError.value = 'Worker消息错误';
        options.onError?.(error);
      };

    } catch (error) {
      console.error('初始化SignalR连接失败:', error);
      connectionError.value = '初始化连接失败';
      options.onError?.(error);
    }
  };

  // 断开连接
  const disconnect = (): void => {
    if (worker.value) {
      worker.value.terminate();
      worker.value = null;
    }
    isConnected.value = false;
    options.onDisconnect?.();
  };

  // 重新连接
  const reconnect = (): void => {
    disconnect();
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
    
    // 方法
    initConnection,
    disconnect,
    reconnect,
    sendMessage
  };
}
