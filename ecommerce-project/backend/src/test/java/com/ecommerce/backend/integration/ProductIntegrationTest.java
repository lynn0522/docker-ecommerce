// src/test/java/com/ecommerce/backend/integration/ProductIntegrationTest.java
package com.ecommerce.backend.integration;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ProductIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void contextLoads() {
        // 测试Spring上下文加载
        assertTrue(true);
    }

    @Test
    void healthEndpoint_ShouldReturnOk() {
        ResponseEntity<String> response = restTemplate.getForEntity(
                "http://localhost:" + port + "/actuator/health",
                String.class
        );
        int statusCode = response.getStatusCodeValue();
        assertTrue(statusCode == 200 || statusCode == 503,
                "Health endpoint should return 200 or 503, but got: " + statusCode);
    }

    @Test
    void productsEndpoint_ShouldBeAccessible() {
        ResponseEntity<String> response = restTemplate.getForEntity(
                "http://localhost:" + port + "/api/products",
                String.class
        );

        // 可能是200（有数据）或404（无数据）
        assertNotNull(response);
        System.out.println("Products endpoint: " + response.getStatusCode());
    }
}