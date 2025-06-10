# 海仿智能安全用电卫士系统

基于 Vue 3 + TypeScript + Vite 构建的智能设备监控地图系统。

## 🚀 技术栈

- **前端框架**: Vue 3 (Composition API)
- **开发语言**: TypeScript
- **构建工具**: Vite
- **UI组件库**: Element Plus
- **地图服务**: 百度地图 (vue-baidu-map-3x)
- **HTTP客户端**: Axios
- **实时通信**: SignalR (Web Worker)

## 📁 项目结构

```
src/
├── components/           # 组件目录
│   ├── MapContainer.vue     # 地图容器组件
│   ├── DeviceMarker.vue     # 设备标记组件
│   ├── DeviceInfoDialog.vue # 设备信息弹窗组件
│   └── map.vue             # 主地图组件（入口）
├── composables/          # 组合式函数
│   ├── useDeviceData.ts    # 设备数据管理
│   └── useSignalR.ts       # SignalR连接管理
├── services/             # 服务层
│   └── api.ts              # API接口封装
├── types/                # 类型定义
│   └── config.d.ts         # 全局类型定义
├── utils/                # 工具函数
│   └── deviceUtils.ts      # 设备相关工具函数
├── assets/               # 静态资源
├── App.vue              # 根组件
├── main.ts              # 应用入口
└── style.css            # 全局样式
```

## 🎯 主要功能

- **实时设备监控**: 通过SignalR实时接收设备状态数据
- **地图可视化**: 在百度地图上显示设备位置和状态
- **设备详情**: 点击设备标记查看详细信息和通道数据
- **状态区分**: 不同颜色图标区分正常/报警状态
- **响应式设计**: 适配不同屏幕尺寸

## 🔧 优化特性

### 🔒 安全性优化
- **环境变量管理**: API密钥和敏感配置通过环境变量管理
- **配置文件保护**: 敏感信息不再硬编码在源码中
- **类型安全**: 完整的TypeScript类型定义和严格检查

### ⚡ 性能优化
- **按需导入**: Element Plus组件按需导入，减少包体积
- **代码分割**: 自动代码分割，优化加载性能
- **Tree Shaking**: 移除未使用的代码
- **压缩优化**: 生产环境代码压缩和优化

### 🛠️ 开发体验
- **全局错误处理**: 统一的错误处理和用户提示机制
- **加载状态管理**: 完善的加载状态指示和管理
- **自动重连**: SignalR连接自动重连机制
- **类型提示**: 完整的TypeScript类型提示

### 🏗️ 架构优化
- **组件化设计**: 职责单一的组件设计
- **数据结构优化**: 扁平化数据结构提高查询效率
- **状态管理**: 响应式状态管理和缓存机制
- **错误边界**: 完善的错误捕获和处理

## 🛠️ 开发指南

### 环境配置
1. 复制环境变量示例文件：
```bash
cp .env.example .env
```

2. 编辑 `.env` 文件，填入实际的配置值：
```bash
# 百度地图API密钥
VITE_BAIDU_MAP_AK=your_baidu_map_api_key_here

# API基础URL
VITE_API_BASE_URL=http://your-api-server:port/api
```

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

### 类型检查
```bash
npm run type-check
```

### 构建生产版本
```bash
npm run build
```

### 预览构建结果
```bash
npm run preview
```

## 📝 配置说明

### 地图配置
在 `src/main.ts` 中配置百度地图API密钥：
```typescript
.use(BaiduMap, {
  ak: 'YOUR_BAIDU_MAP_API_KEY'
})
```

### API配置
在 `public/config.js` 中配置后端API地址：
```javascript
const config = {
  baseURL: 'http://your-api-server:port/api',
};
```

### SignalR配置
在 `public/workers/unitySignalr.js` 中配置SignalR连接地址。

## 🔍 类型定义

项目使用完整的TypeScript类型定义，主要类型包括：

- `DevicePoint`: 设备点位数据
- `DeviceData`: 设备完整数据结构
- `WorkerMessage`: SignalR消息格式
- `ApiResponse`: API响应格式
- `MapCenter`: 地图中心点坐标
- `MapIcon`: 地图图标配置

## 🚦 状态管理

使用Composition API进行状态管理：

- `useDeviceData`: 设备数据状态管理
- `useSignalR`: SignalR连接状态管理

## 🎨 样式规范

- 使用scoped样式避免样式污染
- 响应式设计适配移动端
- 统一的颜色和间距规范

## 📈 性能监控

- 实时连接状态监控
- 错误处理和日志记录
- 内存使用优化

## 🔒 安全考虑

- API请求拦截和错误处理
- 输入数据验证
- XSS防护

## 📞 技术支持

如有问题请联系开发团队或查看项目文档。
