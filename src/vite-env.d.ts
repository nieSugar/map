/// <reference types="vite/client" />

declare module '../public/config.js' {
    interface Config {
        baseURL: string;
    }
    const config: Config;
    export default config;
}
