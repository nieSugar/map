/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BAIDU_MAP_AK: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_ENV: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '../public/config.js' {
    interface Config {
        baseURL: string;
    }
    const config: Config;
    export default config;
}
