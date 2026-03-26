#!/bin/bash

# 数据库备份脚本
BACKUP_DIR="./backups/db"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="ecommerce_db"

echo "🔧 开始备份数据库..."

# 创建备份目录
mkdir -p $BACKUP_DIR

# 使用 mysqldump 备份
docker exec ecommerce-mysql mysqldump \
    -u appuser \
    -papppassword123 \
    --single-transaction \
    --routines \
    --triggers \
    $DB_NAME > "$BACKUP_DIR/${DB_NAME}_backup_$DATE.sql"

# 压缩备份文件
gzip "$BACKUP_DIR/${DB_NAME}_backup_$DATE.sql"

echo "✅ 数据库备份完成: $BACKUP_DIR/${DB_NAME}_backup_$DATE.sql.gz"

# 保留最近7天的备份
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete
echo "🗑️  已清理7天前的备份文件"