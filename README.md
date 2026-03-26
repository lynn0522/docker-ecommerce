## 电商数据管理系统 - 部署说明

## 项目简介
本项目基于 Docker Compose 实现电商数据管理系统的容器化部署，包含前端展示、后端 API、MySQL 数据库、监控（Prometheus+Grafana）等核心组件，遵循容器化最佳实践配置。

---

## 一、环境依赖
- Docker Desktop (20.10+)
- Docker Compose (v2+)
- 操作系统：Windows/Linux/macOS
- 端口要求：80/3300/8081/8084/9090/3000 端口未被占用

---

## 二、快速部署（核心步骤）
### 1. 进入部署目录
```bash
cd C:\DD\ecommerce-project\deploy
```

### 2. 启动所有服务
```bash
# 后台启动所有容器（首次启动会拉取镜像，需等待片刻）
docker-compose up -d

# 查看服务启动状态（所有服务 State 应为 Up/healthy）
docker-compose ps
```

### 3. 停止/重启服务（可选）
```bash
# 停止所有服务
docker-compose down

# 重启服务（修改配置后）
docker-compose restart
```

---

## 三、服务访问验证
| 服务类型 | 访问地址 | 验证内容 | 账号/密码 |
|--------|--------|----------|----------|
| 前端商品页面 | http://localhost | 展示 MySQL 中的商品数据 | - |
| 后端健康检查 | http://localhost:8084/actuator/health | 返回 {"status":"UP"} | - |
| MySQL 管理工具 | http://localhost:8081 | 查看 ecommerce 库数据 | root/123456 |
| Prometheus 监控 | http://localhost:9090/targets | 监控目标状态为 UP | - |
| Grafana 可视化 | http://localhost:3000 | 配置数据源查看面板 | admin/admin123 |

---

## 四、数据库说明
### 1. 核心配置
- 数据库名：ecommerce
- 核心表：products（电商商品表）
- 字符集：utf8mb4
- 时区：Asia/Shanghai

### 2. 数据初始化
启动 MySQL 容器时，自动执行 `deploy/mysql/init.sql` 脚本：
- 创建 products 表
- 插入 3 条测试商品数据

### 3. 数据验证
```bash
docker exec -it ecommerce-mysql mysql -uroot -p123456 ecommerce -e "SELECT * FROM products;"
```

---

## 五、容器化最佳实践
1. **资源限制**：所有服务配置 CPU/内存限制
2. **健康检查**：自动检测服务状态
3. **日志管理**：日志挂载到宿主机，方便排查
4. **数据持久化**：避免数据丢失
5. **环境变量**：适配不同部署环境
6. **网络隔离**：自定义网络，安全隔离

---

## 六、K8s 部署
```bash
kubectl apply -f deploy/k8s/
```

---

## 七、常见问题排查
1. **MySQL 容器重启**：检查 3306 端口是否被占用
2. **前端页面乱码**：确认编码为 UTF-8
3. **后端健康检查失败**：等待 60 秒启动时间
4. **端口冲突**：修改 docker-compose.yml 映射端口
