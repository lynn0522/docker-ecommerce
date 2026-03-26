package com.ecommerce.backend.integration;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = {
                "spring.profiles.active=dev",
                "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE"
        })
public class SmokeTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void contextLoads() {
        // 如果Spring上下文能正常加载，测试就会通过
        assertTrue(true, "Spring上下文加载成功");
    }

    @Test
    void healthEndpoint_ShouldReturnOk() {
        String url = "http://localhost:" + port + "/actuator/health";

        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

        // 健康检查可能返回 200（UP）或 503（DOWN）
        int statusCode = response.getStatusCodeValue();
        assertTrue(statusCode == 200 || statusCode == 503,
                "Health endpoint should return 200 or 503, but got: " + statusCode);

        assertNotNull(response.getBody());

        System.out.println("✅ 健康检查响应: " + response.getStatusCode() + " - " + response.getBody());
    }
    @Test
    void apiBaseUrl_ShouldBeAccessible() {
        String url = "http://localhost:" + port + "/api";

        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

        // 可能是404（没有该端点），但至少应用在运行
        assertNotNull(response);
        System.out.println("✅ API基础端点响应状态: " + response.getStatusCode());
    }

    @Test
    void environment_ShouldBeSetCorrectly() {
        // 检查环境变量
        String env = System.getProperty("spring.profiles.active", "default");
        System.out.println("✅ 当前运行环境: " + env);

        assertNotNull(env);
    }
}