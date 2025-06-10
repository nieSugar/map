import type { App } from 'vue';
import { ElMessage, ElNotification } from 'element-plus';

// 错误类型枚举
export enum ErrorType {
  NETWORK = 'NETWORK',
  API = 'API',
  SIGNALR = 'SIGNALR',
  VALIDATION = 'VALIDATION',
  UNKNOWN = 'UNKNOWN'
}

// 错误信息接口
export interface ErrorInfo {
  type: ErrorType;
  message: string;
  code?: string | number;
  details?: any;
  timestamp: Date;
}

// 错误处理器类
class ErrorHandler {
  private errorQueue: ErrorInfo[] = [];
  private maxQueueSize = 100;

  // 记录错误
  logError(error: ErrorInfo): void {
    // 添加到错误队列
    this.errorQueue.unshift(error);
    
    // 限制队列大小
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue = this.errorQueue.slice(0, this.maxQueueSize);
    }

    // 控制台输出
    console.error(`[${error.type}] ${error.message}`, error.details);

    // 根据错误类型显示不同的用户提示
    this.showUserNotification(error);
  }

  // 显示用户通知
  private showUserNotification(error: ErrorInfo): void {
    const { type, message } = error;

    switch (type) {
      case ErrorType.NETWORK:
        ElMessage.error('网络连接失败，请检查网络设置');
        break;
      
      case ErrorType.API:
        ElMessage.error(message || 'API请求失败');
        break;
      
      case ErrorType.SIGNALR:
        ElNotification({
          title: 'SignalR连接异常',
          message: message || '实时连接中断，正在尝试重连...',
          type: 'warning',
          duration: 3000
        });
        break;
      
      case ErrorType.VALIDATION:
        ElMessage.warning(message || '数据验证失败');
        break;
      
      default:
        ElMessage.error('系统异常，请稍后重试');
    }
  }

  // 获取错误历史
  getErrorHistory(): ErrorInfo[] {
    return [...this.errorQueue];
  }

  // 清空错误历史
  clearErrorHistory(): void {
    this.errorQueue = [];
  }

  // 处理Promise拒绝
  handlePromiseRejection(event: PromiseRejectionEvent): void {
    const error: ErrorInfo = {
      type: ErrorType.UNKNOWN,
      message: event.reason?.message || 'Unhandled Promise Rejection',
      details: event.reason,
      timestamp: new Date()
    };
    
    this.logError(error);
    event.preventDefault();
  }

  // 处理JavaScript错误
  handleJavaScriptError(event: ErrorEvent): void {
    const error: ErrorInfo = {
      type: ErrorType.UNKNOWN,
      message: event.message || 'JavaScript Error',
      details: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      },
      timestamp: new Date()
    };
    
    this.logError(error);
  }
}

// 全局错误处理器实例
export const globalErrorHandler = new ErrorHandler();

// 设置Vue应用错误处理
export function setupErrorHandler(app: App): void {
  // Vue错误处理
  app.config.errorHandler = (err: any, instance, info) => {
    const error: ErrorInfo = {
      type: ErrorType.UNKNOWN,
      message: err?.message || 'Vue Error',
      details: { err, instance, info },
      timestamp: new Date()
    };
    
    globalErrorHandler.logError(error);
  };

  // 全局Promise拒绝处理
  window.addEventListener('unhandledrejection', (event) => {
    globalErrorHandler.handlePromiseRejection(event);
  });

  // 全局JavaScript错误处理
  window.addEventListener('error', (event) => {
    globalErrorHandler.handleJavaScriptError(event);
  });
}

// 便捷的错误记录函数
export function logError(type: ErrorType, message: string, details?: any): void {
  globalErrorHandler.logError({
    type,
    message,
    details,
    timestamp: new Date()
  });
}

// 网络错误处理
export function handleNetworkError(error: any): void {
  logError(ErrorType.NETWORK, '网络请求失败', error);
}

// API错误处理
export function handleApiError(error: any, endpoint?: string): void {
  const message = error?.response?.data?.message || error?.message || 'API请求失败';
  logError(ErrorType.API, message, { error, endpoint });
}

// SignalR错误处理
export function handleSignalRError(error: any): void {
  logError(ErrorType.SIGNALR, 'SignalR连接错误', error);
}

// 数据验证错误处理
export function handleValidationError(message: string, data?: any): void {
  logError(ErrorType.VALIDATION, message, data);
}
