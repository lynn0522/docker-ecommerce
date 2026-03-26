-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS ecommerce_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE ecommerce_db;

-- 创建产品表
CREATE TABLE IF NOT EXISTS products (
                                        id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                        name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    stock INT DEFAULT 0 CHECK (stock >= 0),
    category VARCHAR(100) NOT NULL,
    image_url VARCHAR(500),
    status ENUM('ACTIVE', 'INACTIVE', 'OUT_OF_STOCK') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 插入示例数据
INSERT INTO products (name, description, price, stock, category, image_url, status) VALUES
                                                                                        ('iPhone 15 Pro', '最新款苹果智能手机，A17 Pro芯片', 8999.00, 50, 'Electronics', '/images/iphone15.jpg', 'ACTIVE'),
                                                                                        ('MacBook Pro 16"', '苹果专业笔记本，M3 Max芯片', 19999.00, 20, 'Computers', '/images/macbook.jpg', 'ACTIVE'),
                                                                                        ('Nike Air Max', '舒适运动鞋，气垫设计', 899.00, 100, 'Shoes', '/images/nike.jpg', 'ACTIVE'),
                                                                                        ('Dyson V12', '无线吸尘器，激光探测技术', 3999.00, 15, 'Home Appliances', '/images/dyson.jpg', 'ACTIVE'),
                                                                                        ('Sony WH-1000XM5', '降噪耳机，30小时续航', 2499.00, 30, 'Electronics', '/images/sony.jpg', 'ACTIVE'),
                                                                                        ('Coffee Maker', '全自动咖啡机，15Bar压力', 1599.00, 25, 'Kitchen', '/images/coffee.jpg', 'ACTIVE'),
                                                                                        ('Yoga Mat', '防滑瑜伽垫，加厚设计', 199.00, 80, 'Fitness', '/images/yoga.jpg', 'ACTIVE'),
                                                                                        ('Winter Jacket', '保暖羽绒服，防水面料', 1299.00, 40, 'Clothing', '/images/jacket.jpg', 'ACTIVE');

-- 创建用户表（可选，为扩展准备）
CREATE TABLE IF NOT EXISTS users (
                                     id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                     username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    role ENUM('USER', 'ADMIN') DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username)
    ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 插入默认管理员用户（密码：admin123）
INSERT INTO users (username, email, password_hash, first_name, last_name, role) VALUES
    ('admin', 'admin@ecommerce.com', '$2a$10$YourHashedPasswordHere', 'System', 'Admin', 'ADMIN');