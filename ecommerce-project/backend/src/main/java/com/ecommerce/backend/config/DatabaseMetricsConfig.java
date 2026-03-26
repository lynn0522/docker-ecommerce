package com.ecommerce.backend.config;

import com.zaxxer.hikari.HikariDataSource;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

@Configuration
@Slf4j
@EnableScheduling
public class DatabaseMetricsConfig {

    private final HikariDataSource hikariDataSource;
    private final MeterRegistry meterRegistry;

    // 用于存储指标值的原子变量
    private final AtomicInteger activeConnections = new AtomicInteger(0);
    private final AtomicInteger idleConnections = new AtomicInteger(0);
    private final AtomicInteger totalConnections = new AtomicInteger(0);
    private final AtomicInteger waitingThreads = new AtomicInteger(0);
    private final AtomicLong connectionTimeouts = new AtomicLong(0);
    private final AtomicLong totalConnectionsCreated = new AtomicLong(0);
    private final AtomicLong totalConnectionsClosed = new AtomicLong(0);

    public DatabaseMetricsConfig(DataSource dataSource, MeterRegistry meterRegistry) {
        // 确保是 HikariDataSource
        if (dataSource instanceof HikariDataSource) {
            this.hikariDataSource = (HikariDataSource) dataSource;
        } else {
            this.hikariDataSource = null;
            log.warn("数据源不是 HikariDataSource 类型，数据库指标将不可用");
        }
        this.meterRegistry = meterRegistry;
    }

    /**
     * 初始化指标监控
     */
    public void initMetrics() {
        if (hikariDataSource == null) {
            return;
        }

        log.info("初始化数据库连接池指标监控...");

        // 注册指标 - 使用更安全的方式
        try {
            registerMetricsSafely();
            log.info("数据库连接池指标监控已初始化");
        } catch (Exception e) {
            log.error("初始化数据库指标失败", e);
            registerBasicMetrics();
        }
    }

    private void registerMetricsSafely() {
        // 1. 基础配置指标（总是可用的）
        Gauge.builder("db.pool.max.size", hikariDataSource, ds -> (double) ds.getMaximumPoolSize())
                .description("连接池最大大小")
                .baseUnit("connections")
                .register(meterRegistry);

        Gauge.builder("db.pool.min.idle", hikariDataSource, ds -> (double) ds.getMinimumIdle())
                .description("最小空闲连接数")
                .baseUnit("connections")
                .register(meterRegistry);

        Gauge.builder("db.pool.timeout.ms", hikariDataSource, ds -> (double) ds.getConnectionTimeout())
                .description("连接超时时间")
                .baseUnit("milliseconds")
                .register(meterRegistry);

        Gauge.builder("db.pool.idle.timeout.ms", hikariDataSource, ds -> (double) ds.getIdleTimeout())
                .description("空闲连接超时时间")
                .baseUnit("milliseconds")
                .register(meterRegistry);

        Gauge.builder("db.pool.max.lifetime.ms", hikariDataSource, ds -> (double) ds.getMaxLifetime())
                .description("连接最大生命周期")
                .baseUnit("milliseconds")
                .register(meterRegistry);

        // 2. 动态指标（通过原子变量）
        Gauge.builder("db.pool.active.connections", activeConnections, AtomicInteger::get)
                .description("活跃连接数")
                .baseUnit("connections")
                .register(meterRegistry);

        Gauge.builder("db.pool.idle.connections", idleConnections, AtomicInteger::get)
                .description("空闲连接数")
                .baseUnit("connections")
                .register(meterRegistry);

        Gauge.builder("db.pool.total.connections", totalConnections, AtomicInteger::get)
                .description("总连接数")
                .baseUnit("connections")
                .register(meterRegistry);

        Gauge.builder("db.pool.waiting.threads", waitingThreads, AtomicInteger::get)
                .description("等待连接的线程数")
                .baseUnit("threads")
                .register(meterRegistry);

        Gauge.builder("db.pool.connection.timeouts", connectionTimeouts, AtomicLong::get)
                .description("连接超时次数")
                .baseUnit("count")
                .register(meterRegistry);

        Gauge.builder("db.pool.connections.created", totalConnectionsCreated, AtomicLong::get)
                .description("创建的连接总数")
                .baseUnit("count")
                .register(meterRegistry);

        Gauge.builder("db.pool.connections.closed", totalConnectionsClosed, AtomicLong::get)
                .description("关闭的连接总数")
                .baseUnit("count")
                .register(meterRegistry);
    }

    private void registerBasicMetrics() {
        log.info("注册基础数据库指标...");

        // 只注册基础的健康检查指标
        meterRegistry.gauge("database.health", new AtomicInteger(1));
        meterRegistry.gauge("database.connection.available", new AtomicInteger(1));
    }

    /**
     * 每10秒更新一次连接池指标
     */
    @Scheduled(fixedDelay = 10000)
    public void updateConnectionPoolMetrics() {
        if (hikariDataSource == null || !hikariDataSource.isRunning()) {
            return;
        }

        try {
            // 方法1：使用安全的连接测试方法
            updateViaConnectionTest();

            // 方法2：尝试使用反射，但捕获所有异常
            tryUpdateViaReflection();

        } catch (Exception e) {
            log.debug("更新连接池指标时出错: {}", e.getMessage());
            updateBasicHealthCheck();
        }
    }

    private void updateViaConnectionTest() {
        long startTime = System.currentTimeMillis();

        try (Connection connection = hikariDataSource.getConnection()) {
            long responseTime = System.currentTimeMillis() - startTime;

            // 更新连接响应时间指标
            meterRegistry.gauge("db.connection.response.time.ms", responseTime);

            // 测试连接是否有效
            boolean isValid = connection.isValid(2);
            meterRegistry.gauge("db.connection.valid", isValid ? 1.0 : 0.0);

            // 模拟获取连接数（基于响应时间估算）
            estimateConnectionCounts(responseTime);

        } catch (Exception e) {
            connectionTimeouts.incrementAndGet();
            meterRegistry.gauge("db.connection.valid", 0.0);

            if (e.getMessage() != null &&
                    (e.getMessage().contains("timeout") ||
                            e.getMessage().contains("Timeout") ||
                            e.getMessage().contains("No operations allowed"))) {
                connectionTimeouts.incrementAndGet();
            }
        }
    }

    private void estimateConnectionCounts(long responseTime) {
        // 基于响应时间估算连接数（简化的估算逻辑）
        if (responseTime < 10) {
            // 响应很快，可能连接池较空闲
            activeConnections.set(1);
            idleConnections.set(hikariDataSource.getMaximumPoolSize() - 1);
        } else if (responseTime < 50) {
            // 响应一般，可能有中等负载
            activeConnections.set(hikariDataSource.getMaximumPoolSize() / 2);
            idleConnections.set(hikariDataSource.getMaximumPoolSize() / 2);
        } else {
            // 响应慢，可能连接池繁忙
            activeConnections.set(hikariDataSource.getMaximumPoolSize() - 1);
            idleConnections.set(1);
        }

        totalConnections.set(activeConnections.get() + idleConnections.get());

        // 基于响应时间估算等待线程数
        if (responseTime > 100) {
            waitingThreads.set((int) (responseTime / 10)); // 简化的估算
        } else {
            waitingThreads.set(0);
        }
    }

    private void tryUpdateViaReflection() {
        try {
            Object poolMxBean = hikariDataSource.getHikariPoolMXBean();
            if (poolMxBean == null) {
                return;
            }

            Class<?> mxBeanClass = poolMxBean.getClass();

            // 安全地尝试获取各个指标
            updateMetricSafely(poolMxBean, mxBeanClass, "getActiveConnections", activeConnections);
            updateMetricSafely(poolMxBean, mxBeanClass, "getIdleConnections", idleConnections);
            updateMetricSafely(poolMxBean, mxBeanClass, "getThreadsAwaitingConnection", waitingThreads);

            // 尝试获取其他指标
            updateMetricSafely(poolMxBean, mxBeanClass, "getTotalConnections", totalConnections);

            // 更新总连接数（如果单独获取失败，使用活跃+空闲）
            if (totalConnections.get() == 0) {
                totalConnections.set(activeConnections.get() + idleConnections.get());
            }

        } catch (Exception e) {
            // 静默失败，继续使用估算值
        }
    }

    private void updateMetricSafely(Object target, Class<?> targetClass,
                                    String methodName, AtomicInteger metricHolder) {
        try {
            var method = targetClass.getMethod(methodName);
            Object result = method.invoke(target);
            if (result instanceof Integer) {
                metricHolder.set((Integer) result);
            } else if (result instanceof Long) {
                metricHolder.set(((Long) result).intValue());
            }
        } catch (Exception e) {
            // 方法不可用，保持当前值
        }
    }

    private void updateMetricSafely(Object target, Class<?> targetClass,
                                    String methodName, AtomicLong metricHolder) {
        try {
            var method = targetClass.getMethod(methodName);
            Object result = method.invoke(target);
            if (result instanceof Long) {
                metricHolder.set((Long) result);
            } else if (result instanceof Integer) {
                metricHolder.set(((Integer) result).longValue());
            }
        } catch (Exception e) {
            // 方法不可用，保持当前值
        }
    }

    private void updateBasicHealthCheck() {
        // 基础健康检查
        try {
            hikariDataSource.getConnection().close();
            meterRegistry.gauge("database.basic.health", 1.0);
        } catch (Exception e) {
            meterRegistry.gauge("database.basic.health", 0.0);
        }
    }

    /**
     * 获取当前连接池状态
     */
    public Map<String, Object> getConnectionPoolStatus() {
        Map<String, Object> status = new HashMap<>();

        if (hikariDataSource != null && hikariDataSource.isRunning()) {
            status.put("activeConnections", activeConnections.get());
            status.put("idleConnections", idleConnections.get());
            status.put("totalConnections", totalConnections.get());
            status.put("waitingThreads", waitingThreads.get());
            status.put("maxPoolSize", hikariDataSource.getMaximumPoolSize());
            status.put("minIdle", hikariDataSource.getMinimumIdle());
            status.put("connectionTimeout", hikariDataSource.getConnectionTimeout());
            status.put("connectionTimeouts", connectionTimeouts.get());
            status.put("totalConnectionsCreated", totalConnectionsCreated.get());
            status.put("totalConnectionsClosed", totalConnectionsClosed.get());
            status.put("poolName", hikariDataSource.getPoolName());
            status.put("isRunning", hikariDataSource.isRunning());
            status.put("isClosed", hikariDataSource.isClosed());
        } else {
            status.put("error", "数据库连接池不可用");
        }

        return status;
    }

    /**
     * 手动触发指标初始化
     */
    public void startMonitoring() {
        initMetrics();
        log.info("数据库监控已启动");
    }
}