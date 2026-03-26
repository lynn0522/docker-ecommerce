#!/bin/bash

echo "🔍 数据库配置验证脚本"
echo "===================="

# 1. 检查数据库连接
echo "1. 测试数据库连接..."
if curl -f http://localhost:8080/actuator/health > /dev/null 2>&1; then
    echo "   ✅ 应用健康检查通过"
else
    echo "   ❌ 应用无法访问"
fi

# 2. 检查MySQL容器
echo "2. 检查MySQL容器状态..."
if docker ps | grep -q ecommerce-mysql; then
    echo "   ✅ MySQL容器运行中"

    # 检查MySQL健康状态
    if docker exec ecommerce-mysql mysqladmin ping -u appuser -papppassword123 > /dev/null 2>&1; then
        echo "   ✅ MySQL服务响应正常"
    else
        echo "   ❌ MySQL服务无响应"
    fi
else
    echo "   ❌ MySQL容器未运行"
fi

# 3. 检查数据库表
echo "3. 检查数据库表结构..."
docker exec ecommerce-mysql mysql -u appuser -papppassword123 -e "
    USE ecommerce_db;
    SHOW TABLES;
    SELECT
        TABLE_NAME,
        TABLE_ROWS,
        DATA_LENGTH/1024/1024 as 'Size(MB)'
    FROM information_schema.tables
    WHERE table_schema = 'ecommerce_db';
" 2>/dev/null || echo "   ❌ 无法连接数据库"

# 4. 检查数据
echo "4. 检查数据完整性..."
docker exec ecommerce-mysql mysql -u appuser -papppassword123 -e "
    USE ecommerce_db;
    SELECT '产品数量' as '项目', COUNT(*) as '数量' FROM products
    UNION
    SELECT '活跃产品', COUNT(*) FROM products WHERE status = 'ACTIVE'
    UNION
    SELECT '缺货产品', COUNT(*) FROM products WHERE status = 'OUT_OF_STOCK';
" 2>/dev/null || echo "   ❌ 无法查询数据"

echo "✅ 验证完成！"