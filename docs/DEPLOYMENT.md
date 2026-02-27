# 部署指南

> 本文档说明生产构建产物的部署方式，重点涵盖 **VITE_COMPRESSION** 与 Nginx 压缩配置。

## 1. 构建产物与压缩

### 1.1 VITE_COMPRESSION 行为

当 `.env.production` 中 `VITE_COMPRESSION=gzip` 时，`build/compress.ts` 会为符合条件的文件生成 `.gz` 预压缩文件：

- **压缩类型**：`none | gzip | brotli | both`
- **压缩范围**：`js`、`mjs`、`json`、`css`、`html`、`svg`，且体积 > 1KB
- **输出**：在 `dist/` 中保留原文件，并额外生成同名 `.gz`（gzip）或 `.br`（brotli）文件

例如：`static/js/index-xxx.js` 会额外生成 `static/js/index-xxx.js.gz`。

### 1.2 部署目录

构建后，将 `dist/` 整个目录部署到 Web 服务器静态根目录即可。

---

## 2. Nginx 配置

### 2.1 预压缩优先（推荐）

当构建产物包含 `.gz` 时，Nginx 可使用 `gzip_static` 模块直接发送预压缩文件，避免实时压缩的 CPU 开销。

```nginx
server {
    listen 80;
    server_name example.com;
    root /path/to/dist;
    index index.html;

    # 启用预压缩：客户端支持 gzip 时，优先发送 .gz 文件
    gzip_static on;

    # SPA 路由（history 模式）：未匹配到的路径回退到 index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location /assets/ {
        add_header Cache-Control "public, max-age=31536000";
    }

    location /static/ {
        add_header Cache-Control "public, max-age=31536000";
    }
}
```

**依赖**：Nginx 需编译时加入 `--with-http_gzip_static_module`（多数发行版默认包含）。

### 2.2 实时压缩（兜底）

若未使用 `VITE_COMPRESSION` 或希望为未预压缩的文件也启用压缩，可开启 Nginx 实时 gzip：

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_proxied any;
gzip_types text/plain text/css application/json application/javascript application/x-javascript text/xml application/xml application/xml+rss text/javascript;
```

**注意**：`gzip_static on` 与 `gzip on` 可同时启用。存在 `.gz` 时优先使用 `gzip_static`，否则回退到 `gzip` 实时压缩。

### 2.3 Brotli（可选）

若 `VITE_COMPRESSION=both`，构建会生成 `.br` 文件。Nginx 需安装 [ngx_brotli](https://github.com/google/ngx_brotli) 模块：

```nginx
brotli_static on;
# 或同时启用 brotli 实时压缩
brotli on;
brotli_types text/plain text/css application/json application/javascript;
```

---

## 3. 配置检查清单

| 项目               | 说明                                                                 |
| ------------------ | -------------------------------------------------------------------- |
| `VITE_COMPRESSION` | `.env.production` 中为 `gzip` 或 `both` 时，构建会生成 `.gz` / `.br` |
| `gzip_static on`   | Nginx 优先发送预压缩文件，减少 CPU 消耗                              |
| `gzip on`          | 无预压缩文件时的兜底，按需启用                                       |
| `try_files`        | SPA history 路由必须配置 `try_files $uri $uri/ /index.html`          |
| `VITE_PUBLIC_PATH` | 非 `/` 时，需同步调整 Nginx `root` 或 `alias`                        |

---

## 4. 相关文档

- **环境变量**：`docs/ai-specs/ENV_AND_RUNTIME.md` §2.3 构建优化
- **压缩插件**：`build/compress.ts`、`docs/ai-specs/BUILD_SYSTEM.md` §1.1
