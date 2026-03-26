# 电商数据管理系统 - Docker容器化项目

## 项目概述
基于Docker容器化技术的电商数据管理系统，包含前端服务、后端API服务、数据库服务。

## 技术栈
- 后端：Spring Boot 3.2.0 + JDK 21
- 数据库：MySQL 8.0
- 容器：Docker + Docker Compose
- 构建工具：Maven

## 项目结构
ecommerce-backend/
├── src/ # 源代码
├── Dockerfile # Docker构建文件
├── Dockerfile.multistage # 多阶段构建
├── docker-compose.yml # 服务编排
├── pom.xml # Maven配置
└── README.md # 项目文档

## 快速开始

### 1. 本地开发
```bash
mvn clean package
java -jar target/backend-1.0.0.jar