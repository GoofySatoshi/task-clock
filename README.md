# Task Clock 番茄时钟项目

## 项目简介
Task Clock 是一个基于 Spring Boot（后端）和现代前端技术栈实现的番茄时钟与任务管理应用，支持任务的创建、管理、统计与番茄钟计时，适合个人效率提升和时间管理。

## 功能特性
- 任务管理（增删改查、标签、搜索、过滤）
- 番茄钟计时与完成记录
- 任务进度与统计信息
- RESTful API，支持前后端分离
- 跨平台部署，支持 SQLite 本地数据库

## 技术栈
- 后端：Java 17、Spring Boot 2.7.5、Spring Data JPA、SQLite、Lombok、Swagger/OpenAPI、Maven
- 前端：Node.js、Vite、Vue3（或 React）、ES6+、现代浏览器

## 目录结构
```
├── backend/                # 后端服务
│   ├── src/main/java/com/taskclock/
│   │   ├── config/        # 配置类
│   │   ├── controller/    # 控制器
│   │   ├── dto/           # 数据传输对象
│   │   ├── entity/        # 实体类
│   │   ├── exception/     # 异常处理
│   │   ├── repository/    # 数据访问
│   │   ├── service/       # 业务逻辑
│   │   ├── util/          # 工具类
│   │   └── TaskClockApplication.java # 启动类
│   └── src/main/resources/application.yml # 配置文件
│
├── frontend/               # 前端项目
│   ├── public/             # 静态资源
│   ├── src/                # 前端源码
│   ├── package.json        # 前端依赖
│   └── ...
│
└── README.md               # 项目说明
```

## 快速开始
### 后端启动
1. 安装 JDK 17+ 和 Maven 3.6+
2. 进入 backend 目录，执行：
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```
3. 默认端口：`http://localhost:8081/api`
4. Swagger 文档：`http://localhost:8081/api/swagger-ui.html`

### 前端启动
1. 安装 Node.js 16+ 和 npm 7+
2. 进入 frontend 目录，执行：
   ```bash
   npm install
   npm run dev
   ```
3. 默认端口：`http://localhost:5173`

### 生产部署
- 详见 `frontend/DEPLOY.md` 和 `backend/README.md`
- 支持 Docker、Nginx、静态文件等多种部署方式

## 数据库说明
- 使用 SQLite，数据库文件为 `taskclock.db`，自动生成在 backend 目录
- 表结构由 JPA 自动维护

## 贡献指南
1. Fork 本仓库并新建分支
2. 提交代码前请确保通过本地测试
3. 提交 Pull Request 并详细描述变更内容

## License
MIT

## 联系方式
如有问题或建议，请提交 Issue 或联系项目维护者。 