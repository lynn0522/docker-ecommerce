-- 初始化电商商品表
CREATE DATABASE IF NOT EXISTS ecommerce DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ecommerce;

-- 商品表
CREATE TABLE IF NOT EXISTS products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '商品ID',
    name VARCHAR(255) NOT NULL COMMENT '商品名称',
    price DECIMAL(10,2) NOT NULL COMMENT '商品价格',
    stock INT NOT NULL DEFAULT 0 COMMENT '商品库存',
    description TEXT COMMENT '商品描述',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='电商商品表';

-- 插入测试数据
INSERT INTO products (name, price, stock, description) VALUES
('华为Mate60 Pro', 6999.00, 100, '鸿蒙系统，卫星通信'),
('苹果iPhone 15', 5999.00, 200, 'A16芯片，iOS系统'),
('小米14', 3999.00, 300, '骁龙8 Gen3，MIUI系统');