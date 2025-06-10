import { ref, computed } from 'vue';
import { ElLoading } from 'element-plus';

// 加载状态类型
export interface LoadingState {
  isLoading: boolean;
  message?: string;
  target?: string | HTMLElement;
}

// 全局加载状态管理
class LoadingManager {
  private loadingStates = ref<Map<string, LoadingState>>(new Map());
  private loadingInstances = new Map<string, any>();

  // 开始加载
  startLoading(key: string, options?: {
    message?: string;
    target?: string | HTMLElement;
    background?: string;
  }): void {
    const state: LoadingState = {
      isLoading: true,
      message: options?.message || '加载中...',
      target: options?.target
    };

    this.loadingStates.value.set(key, state);

    // 如果指定了目标元素，创建局部加载
    if (options?.target) {
      const instance = ElLoading.service({
        target: options.target,
        text: options.message || '加载中...',
        background: options.background || 'rgba(0, 0, 0, 0.7)',
      });
      this.loadingInstances.set(key, instance);
    }
  }

  // 结束加载
  stopLoading(key: string): void {
    this.loadingStates.value.delete(key);
    
    // 关闭对应的加载实例
    const instance = this.loadingInstances.get(key);
    if (instance) {
      instance.close();
      this.loadingInstances.delete(key);
    }
  }

  // 检查是否正在加载
  isLoading(key: string): boolean {
    return this.loadingStates.value.get(key)?.isLoading || false;
  }

  // 获取加载状态
  getLoadingState(key: string): LoadingState | undefined {
    return this.loadingStates.value.get(key);
  }

  // 获取所有加载状态
  getAllLoadingStates(): Map<string, LoadingState> {
    return this.loadingStates.value;
  }

  // 检查是否有任何加载中的状态
  get hasAnyLoading(): boolean {
    return Array.from(this.loadingStates.value.values()).some(state => state.isLoading);
  }

  // 清空所有加载状态
  clearAll(): void {
    // 关闭所有加载实例
    this.loadingInstances.forEach(instance => instance.close());
    this.loadingInstances.clear();
    this.loadingStates.value.clear();
  }
}

// 全局加载管理器实例
const globalLoadingManager = new LoadingManager();

// 使用加载状态的组合式函数
export function useLoading(defaultKey?: string) {
  const currentKey = ref(defaultKey || 'default');

  // 开始加载
  const startLoading = (options?: {
    key?: string;
    message?: string;
    target?: string | HTMLElement;
    background?: string;
  }) => {
    const key = options?.key || currentKey.value;
    globalLoadingManager.startLoading(key, options);
  };

  // 结束加载
  const stopLoading = (key?: string) => {
    const loadingKey = key || currentKey.value;
    globalLoadingManager.stopLoading(loadingKey);
  };

  // 检查是否正在加载
  const isLoading = computed(() => {
    return globalLoadingManager.isLoading(currentKey.value);
  });

  // 获取加载状态
  const loadingState = computed(() => {
    return globalLoadingManager.getLoadingState(currentKey.value);
  });

  // 异步操作包装器
  const withLoading = async <T>(
    asyncFn: () => Promise<T>,
    options?: {
      key?: string;
      message?: string;
      target?: string | HTMLElement;
    }
  ): Promise<T> => {
    const key = options?.key || currentKey.value;
    
    try {
      startLoading({ ...options, key });
      const result = await asyncFn();
      return result;
    } finally {
      stopLoading(key);
    }
  };

  return {
    startLoading,
    stopLoading,
    isLoading,
    loadingState,
    withLoading,
    setKey: (key: string) => { currentKey.value = key; }
  };
}

// 全局加载状态组合式函数
export function useGlobalLoading() {
  const hasAnyLoading = computed(() => globalLoadingManager.hasAnyLoading);
  const allLoadingStates = computed(() => globalLoadingManager.getAllLoadingStates());

  return {
    hasAnyLoading,
    allLoadingStates,
    clearAll: () => globalLoadingManager.clearAll()
  };
}

// 页面级加载状态
export function usePageLoading() {
  return useLoading('page');
}

// API请求加载状态
export function useApiLoading() {
  return useLoading('api');
}

// 地图加载状态
export function useMapLoading() {
  return useLoading('map');
}
