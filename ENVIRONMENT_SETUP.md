# 🔧 环境变量配置指南

## ✅ 问题已解决

**问题**: 缺少必要的环境变量 "BAIDU_MAP_AK"  
**解决方案**: 已修复环境变量读取机制，现在使用标准的Vite环境变量方式

## 🚀 快速开始

### 1. 配置环境变量

确保项目根目录下有 `.env` 文件：

```bash
# 检查 .env 文件是否存在
ls -la .env

# 如果不存在，从示例文件复制
cp .env.example .env
```

### 2. 验证 .env 文件内容

确保 `.env` 文件包含以下内容：

```bash
# 百度地图API密钥
VITE_BAIDU_MAP_AK=RB8eTKX9xgQzX0sKoUfAvWHxRg3haYon

# API基础URL
VITE_API_BASE_URL=http://139.196.243.9:5286/api

# 开发环境配置
VITE_APP_ENV=development
```

### 3. 启动项目

```bash
# 安装依赖（如果还没有安装）
npm install

# 启动开发服务器
npm run dev
```

## 🔍 故障排除

### 如果仍然报错 "缺少必要的环境变量"

1. **检查文件位置**：确保 `.env` 文件在项目根目录（与 `package.json` 同级）

2. **检查文件内容**：确保环境变量名称正确，以 `VITE_` 开头

3. **重启开发服务器**：修改 `.env` 文件后需要重启开发服务器

4. **检查文件编码**：确保 `.env` 文件使用 UTF-8 编码

### 环境变量命名规则

- ✅ 正确：`VITE_BAIDU_MAP_AK`
- ❌ 错误：`BAIDU_MAP_AK`（缺少 VITE_ 前缀）

### 调试环境变量

在开发模式下，控制台会显示环境变量状态：

```
✅ 环境变量验证通过
🔧 开发模式 - 环境变量状态:
  - BAIDU_MAP_AK: 已配置
  - API_BASE_URL: http://139.196.243.9:5286/api
```

## 📁 相关文件

- `.env` - 环境变量配置文件（不提交到Git）
- `.env.example` - 环境变量示例文件
- `src/config/env.ts` - 环境变量读取和验证
- `src/vite-env.d.ts` - TypeScript类型定义

## 🔒 安全注意事项

1. **不要提交 `.env` 文件**到版本控制系统
2. **生产环境**请使用不同的API密钥
3. **定期更换**API密钥以确保安全

## 🆘 如果问题仍然存在

1. 删除 `node_modules` 和重新安装：
   ```bash
   rm -rf node_modules
   npm install
   ```

2. 清除Vite缓存：
   ```bash
   rm -rf node_modules/.vite
   ```

3. 检查控制台错误信息，确认具体的错误原因

---

**最后更新**: 2024年12月  
**状态**: ✅ 已解决
