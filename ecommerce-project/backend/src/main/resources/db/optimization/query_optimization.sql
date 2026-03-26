-- 数据库查询优化配置

-- 1. 添加复合索引以提高查询性能
CREATE INDEX idx_products_category_status ON products(category, status);
CREATE INDEX idx_products_price_stock ON products(price, stock);

-- 2. 添加全文索引支持产品搜索（MySQL 5.6+）
-- 注意：需要确保表使用 MyISAM 或 InnoDB（MySQL 5.6+）
-- ALTER TABLE products ADD FULLTEXT INDEX ft_product_search (name, description);

-- 3. 视图：活跃产品视图
CREATE OR REPLACE VIEW active_products AS
SELECT 
    id, 
    name, 
    description, 
    price, 
    stock, 
    category,
    image_url,
    created_at
FROM products 
WHERE status = 'ACTIVE' AND stock > 0;

-- 4. 存储过程：更新产品库存
DELIMITER //
CREATE PROCEDURE UpdateProductStock(
    IN p_product_id BIGINT,
    IN p_quantity_change INT
)
BEGIN
    DECLARE current_stock INT;
    DECLARE new_stock INT;
    DECLARE new_status ENUM('ACTIVE', 'INACTIVE', 'OUT_OF_STOCK');
    
    -- 获取当前库存
    SELECT stock INTO current_stock 
    FROM products 
    WHERE id = p_product_id FOR UPDATE;
    
    -- 计算新库存
    SET new_stock = current_stock + p_quantity_change;
    
    -- 确定新状态
    IF new_stock <= 0 THEN
        SET new_status = 'OUT_OF_STOCK';
    ELSE
        SET new_status = 'ACTIVE';
    END IF;
    
    -- 更新产品和状态
    UPDATE products 
    SET 
        stock = new_stock,
        status = new_status,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_product_id;
    
    -- 返回结果
    SELECT 
        p_product_id AS product_id,
        current_stock AS old_stock,
        new_stock AS new_stock,
        new_status AS new_status;
END //
DELIMITER ;

-- 5. 触发器：自动更新 updated_at 时间戳
-- 注意：InnoDB 不支持同一表的 BEFORE UPDATE 触发器，这里提供示例代码
-- DELIMITER //
-- CREATE TRIGGER before_product_update
-- BEFORE UPDATE ON products
-- FOR EACH ROW
-- BEGIN
--     SET NEW.updated_at = CURRENT_TIMESTAMP;
-- END //
-- DELIMITER ;

-- 6. 定期清理任务配置（需要在 MySQL 事件调度器中启用）
-- SET GLOBAL event_scheduler = ON;
-- 
-- DELIMITER //
-- CREATE EVENT IF NOT EXISTS cleanup_inactive_products
-- ON SCHEDULE EVERY 1 DAY
-- DO
-- BEGIN
--     -- 将长期无库存且不活跃的产品标记为 INACTIVE
--     UPDATE products 
--     SET status = 'INACTIVE'
--     WHERE status = 'OUT_OF_STOCK' 
--     AND updated_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
-- END //
-- DELIMITER ;

-- 7. 查询性能分析示例
-- EXPLAIN SELECT * FROM products WHERE category = 'Electronics' AND status = 'ACTIVE';
-- 
-- EXPLAIN SELECT 
--     p.*,
--     (SELECT COUNT(*) FROM order_items oi WHERE oi.product_id = p.id) AS total_orders
-- FROM products p
-- WHERE p.stock > 0
-- ORDER BY p.created_at DESC
-- LIMIT 10;

-- 8. 优化建议
-- 建议定期运行 ANALYZE TABLE products; 更新统计信息
-- 建议定期运行 OPTIMIZE TABLE products; 整理表碎片（针对大量更新/删除的表）

-- 9. 分区表示例（适用于大数据量）
-- ALTER TABLE products 
-- PARTITION BY RANGE (YEAR(created_at)) (
--     PARTITION p2023 VALUES LESS THAN (2024),
--     PARTITION p2024 VALUES LESS THAN (2025),
--     PARTITION p2025 VALUES LESS THAN (2026),
--     PARTITION p_future VALUES LESS THAN MAXVALUE
-- );

-- 10. 监控查询
-- 慢查询日志已启用（见 my.cnf 配置）
-- 可以使用以下查询查看当前连接和查询状态：
-- SHOW PROCESSLIST;
-- SHOW STATUS LIKE 'Threads_connected';
-- SHOW STATUS LIKE 'Innodb_row_lock%';
