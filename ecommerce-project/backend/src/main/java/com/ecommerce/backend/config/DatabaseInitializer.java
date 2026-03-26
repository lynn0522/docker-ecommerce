package com.ecommerce.backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseInitializer.class);
    private final JdbcTemplate jdbcTemplate;

    public DatabaseInitializer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) throws Exception {
        logger.info("🚀 开始检查数据库状态...");

        try {
            // ✅ 核心修改：替换H2专属的H2VERSION()为MySQL兼容的VERSION()
            // 同时保留通用检查方案（SELECT 1），适配更多数据库类型
            String dbVersion;
            try {
                // 优先尝试MySQL版本查询
                dbVersion = jdbcTemplate.queryForObject("SELECT VERSION()", String.class);
                logger.info("✅ MySQL数据库连接成功，版本: {}", dbVersion);
            } catch (Exception e) {
                // 兼容其他数据库（如H2）的降级方案
                jdbcTemplate.execute("SELECT 1");
                dbVersion = "未知版本（非MySQL）";
                logger.info("✅ 数据库连接正常（{}）", dbVersion);
            }

        } catch (Exception e) {
            logger.error("❌ 数据库初始化失败: {}", e.getMessage());
            // 测试环境下忽略异常，生产环境终止启动
            if (!isTestEnvironment()) {
                throw new RuntimeException("数据库连接失败，应用启动终止", e);
            } else {
                logger.warn("⚠️ 测试环境下忽略数据库初始化错误，继续运行");
            }
        }
    }

    /**
     * 判断是否为测试环境
     */
    private boolean isTestEnvironment() {
        String activeProfile = System.getProperty("spring.profiles.active", "");
        String testFlag = System.getProperty("test", "");
        return activeProfile.contains("test") || "true".equals(testFlag);
    }
}