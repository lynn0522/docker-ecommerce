package com.ecommerce.backend.config;

import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.util.concurrent.atomic.AtomicReference;

@Component
public class DatabaseHealthConfig implements HealthIndicator {

    private final JdbcTemplate jdbcTemplate;
    private final AtomicReference<Health> healthCache = new AtomicReference<>();

    public DatabaseHealthConfig(DataSource dataSource) {
        this.jdbcTemplate = new JdbcTemplate(dataSource);
        // 初始健康检查
        checkDatabaseHealth();
    }

    @Scheduled(fixedDelay = 30000) // 每30秒检查一次
    public void checkDatabaseHealth() {
        try {
            Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            if (result != null && result == 1) {
                // 获取数据库信息
                String dbVersion = jdbcTemplate.queryForObject(
                        "SELECT VERSION()", String.class
                );

                int productCount = jdbcTemplate.queryForObject(
                        "SELECT COUNT(*) FROM products WHERE status = 'ACTIVE'",
                        Integer.class
                );

                healthCache.set(Health.up()
                        .withDetail("database", "MySQL")
                        .withDetail("version", dbVersion)
                        .withDetail("active_products", productCount)
                        .withDetail("connection", "established")
                        .build());
            }
        } catch (Exception e) {
            healthCache.set(Health.down()
                    .withDetail("database", "MySQL")
                    .withDetail("error", e.getMessage())
                    .build());
        }
    }

    @Override
    public Health health() {
        return healthCache.get() != null ?
                healthCache.get() :
                Health.unknown().withDetail("database", "checking...").build();
    }
}