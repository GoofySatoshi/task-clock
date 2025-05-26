# 番茄时钟后端项目

## 项目结构

```
backend/
├── src/main/java/com/taskclock/
│   ├── config/           # 配置类
│   │   ├── WebConfig.java        # Web配置（CORS等）
│   │   ├── SwaggerConfig.java    # Swagger文档配置
│   │   └── SecurityConfig.java   # 安全配置
│   │
│   ├── controller/       # REST控制器
│   │   ├── TaskController.java           # 任务管理接口
│   │   └── GlobalExceptionHandler.java   # 全局异常处理
│   │
│   ├── dto/             # 数据传输对象
│   │   ├── TaskDTO.java          # 任务数据传输对象
│   │   ├── CreateTaskRequest.java # 创建任务请求
│   │   ├── UpdateTaskRequest.java # 更新任务请求
│   │   └── TaskResponse.java     # 任务响应对象
│   │
│   ├── entity/          # 实体类
│   │   └── Task.java    # 任务实体
│   │
│   ├── exception/       # 异常处理
│   │   ├── ResourceNotFoundException.java # 资源未找到异常
│   │   ├── ValidationException.java      # 验证异常
│   │   ├── BusinessException.java        # 业务异常
│   │   └── ErrorResponse.java           # 错误响应对象
│   │
│   ├── repository/      # 数据访问层
│   │   └── TaskRepository.java   # 任务数据访问接口
│   │
│   ├── service/         # 服务层
│   │   ├── TaskService.java      # 任务服务接口
│   │   └── TaskServiceImpl.java  # 任务服务实现
│   │
│   ├── util/            # 工具类
│   │   ├── DateUtils.java        # 日期工具类
│   │   ├── ValidationUtils.java  # 验证工具类
│   │   └── Constants.java        # 常量定义
│   │
│   └── TaskClockApplication.java # 主应用程序类
│
└── src/main/resources/
    └── application.yml  # 应用配置文件
```

## 技术栈

- Spring Boot 2.7.5
- Spring Data JPA
- SQLite
- Lombok
- Swagger/OpenAPI
- Maven

## 主要功能

1. 任务管理
   - 创建任务
   - 更新任务
   - 删除任务
   - 查询任务列表
   - 任务搜索和过滤
   - 任务标签管理

2. 番茄钟管理
   - 记录番茄钟完成情况
   - 任务进度跟踪
   - 统计信息

## 开发环境要求

- JDK 17+
- Maven 3.6+
- IDE（推荐使用 IntelliJ IDEA）

## 运行说明

1. 克隆项目
2. 进入项目目录
3. 执行构建：`mvn clean install`
4. 运行应用：`mvn spring-boot:run`

应用将在 http://localhost:8080/api 启动

## API文档

启动应用后，可以通过以下地址访问API文档：
- Swagger UI: http://localhost:8080/api/swagger-ui.html
- OpenAPI JSON: http://localhost:8080/api/api-docs 

# 番茄时钟后端开发文档

## 项目简介
本项目为"番茄时钟"应用的后端服务，基于 Spring Boot + SQLite 实现，提供任务管理与番茄钟计时等核心功能，支持前后端分离架构。

## 设计目标
- 简单易用：接口清晰，易于前端集成和二次开发
- 轻量高效：采用 SQLite 作为本地文件数据库，部署和维护成本低
- 可扩展性：代码结构分层，便于后续功能扩展
- 可靠性：基础的异常处理和日志输出，保证服务稳定运行
- 跨平台：支持 Windows、Linux 等主流操作系统

## 主要技术栈
- Java 17
- Spring Boot 2.7.5
- Spring Data JPA
- SQLite（本地文件数据库）
- Lombok
- Swagger/OpenAPI（接口文档）
- Maven

## 开发环境要求
- JDK 17+
- Maven 3.6+
- 推荐 IDE：IntelliJ IDEA 或 Eclipse

## 启动方式
1. 配置好 JDK 17 和 Maven 环境变量（JAVA_HOME、MAVEN_HOME）
2. 安装依赖并构建项目：
   ```shell
   mvn clean install -U
   ```
3. 启动服务：
   ```shell
   java -jar target/task-clock-backend-1.0.0.jar
   ```
4. 默认服务端口为 8081，接口前缀为 `/api`

## 数据库说明
- 使用 SQLite，数据库文件为 `taskclock.db`，自动生成在项目根目录
- 表结构由 JPA 自动维护（`hibernate.ddl-auto: update`）

## 接口文档与测试
- 启动后访问 [http://localhost:8081/api/swagger-ui.html](http://localhost:8081/api/swagger-ui.html) 查看接口文档
- 推荐使用 Postman、Apifox 等工具进行接口调试
- 提供 `/test/ping` 测试接口，返回服务状态

## 目录结构简述
- `controller/`：接口层，处理 HTTP 请求
- `service/`：业务逻辑层
- `repository/`：数据访问层
- `entity/`：实体类
- `dto/`：数据传输对象
- `exception/`：异常处理
- `config/`：配置类
- `util/`：工具类

## 设计建议
- 代码分层清晰，便于维护和扩展
- 业务逻辑尽量写在 service 层，controller 只做参数校验和响应封装
- 异常统一处理，便于前端识别错误
- 日志级别建议开发时为 DEBUG，生产环境为 INFO

---
如需详细设计文档或有其他开发问题，请联系项目维护者。 