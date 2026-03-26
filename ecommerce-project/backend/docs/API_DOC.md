# API接口文档

## 基础信息
- 基础URL: `http://localhost:8080`
- 内容类型: `application/json`
- 字符编码: `UTF-8`

## 健康检查
### 获取服务健康状态
GET /health

**响应示例:**
```json
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP",
      "details": {
        "database": "MySQL",
        "validationQuery": "isValid()"
      }
    }
  }
}