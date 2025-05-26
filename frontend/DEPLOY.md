# 番茄时钟前端部署文档

## 环境要求

- Node.js >= 16.0.0
- npm >= 7.0.0
- 现代浏览器（支持 ES6+）

## 本地开发环境部署

1. 克隆项目
```bash
git clone <项目地址>
cd task-clock/frontend
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```
开发服务器将在 http://localhost:5173 启动

## 生产环境部署

### 1. 构建项目

```bash
# 在 frontend 目录下执行
npm run build
```

构建完成后，会在 `frontend/dist` 目录下生成生产环境所需的静态文件。

### 2. 部署方式

#### 方式一：静态文件部署

1. 将 `dist` 目录下的所有文件复制到 Web 服务器的根目录
2. 配置 Web 服务器（以 Nginx 为例）：

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名

    root /path/to/dist;  # 替换为你的 dist 目录路径
    index index.html;

    # 处理单页应用路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location /assets {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }

    # 安全相关配置
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";
}
```

#### 方式二：Docker 部署

1. 创建 Dockerfile：

```dockerfile
# 构建阶段
FROM node:16-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 生产阶段
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

2. 创建 nginx.conf：

```nginx
server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }
}
```

3. 构建和运行 Docker 镜像：

```bash
# 构建镜像
docker build -t task-clock-frontend .

# 运行容器
docker run -d -p 80:80 task-clock-frontend
```

## 环境变量配置

项目使用 `.env` 文件管理环境变量。在生产环境中，需要创建 `.env.production` 文件：

```env
# API 地址
VITE_API_BASE_URL=https://api.your-domain.com

# 其他环境变量
VITE_APP_TITLE=番茄时钟
```

## 注意事项

1. **跨域配置**
   - 确保后端 API 已正确配置 CORS
   - 或在 Nginx 中配置代理：

```nginx
location /api {
    proxy_pass http://backend-server;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

2. **缓存策略**
   - 静态资源（js、css、图片等）建议配置长期缓存
   - index.html 建议配置不缓存或短期缓存

3. **性能优化**
   - 启用 gzip 压缩
   - 配置适当的缓存策略
   - 使用 CDN 加速静态资源

4. **安全配置**
   - 配置 HTTPS
   - 添加安全相关的 HTTP 头
   - 定期更新依赖包以修复安全漏洞

## 常见问题

1. **页面刷新 404**
   - 确保 Web 服务器配置了正确的路由重写规则
   - 检查 try_files 配置是否正确

2. **API 请求失败**
   - 检查 API 地址配置是否正确
   - 确认跨域配置是否生效
   - 验证网络连接是否正常

3. **静态资源加载失败**
   - 检查资源路径是否正确
   - 确认服务器文件权限
   - 验证 CDN 配置（如果使用）

## 维护建议

1. 定期更新依赖包：
```bash
npm update
```

2. 检查并修复安全漏洞：
```bash
npm audit
npm audit fix
```

3. 监控服务器状态和性能指标

4. 定期备份数据

## 技术支持

如遇到部署问题，请：
1. 查看项目文档
2. 检查错误日志
3. 提交 Issue 到项目仓库 