# 构建阶段：复用极狐GitLab镜像
FROM registry.jihulab.com/zhangzhimin715-group/zhangzhimin715-project/maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests -Dmaven.test.skip=true

# 运行阶段：复用极狐GitLab精简镜像
FROM registry.jihulab.com/zhangzhimin715-group/zhangzhimin715-project/eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar

# ========== 补充Prometheus环境变量（和配置文件对应） ==========
ENV MANAGEMENT_ENDPOINTS_WEB_EXPOSURE_INCLUDE=health,info,metrics,env,beans,prometheus
ENV MANAGEMENT_METRICS_TAGS_APPLICATION=ecommerce-backend
ENV MANAGEMENT_METRICS_EXPORT_PROMETHEUS_ENABLED=true

# Actuator环境变量（补充健康检查）
ENV MANAGEMENT_ENDPOINTS_WEB_EXPOSURE_INCLUDE=health,info
ENV MANAGEMENT_ENDPOINT_HEALTH_SHOW_DETAILS=always

# 安装curl（健康检查依赖）
RUN apk add --no-cache curl

# 非root用户（安全增强）
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# 健康检查（适配8084端口）
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -f http://localhost:8084/actuator/health || exit 1

# 暴露8083端口（和application.properties一致）
EXPOSE 8083

# 启动命令
ENTRYPOINT ["java", "-jar", "app.jar"]