// src/main/java/com/ecommerce/backend/controller/HealthController.java
package com.ecommerce.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Backend service is healthy");
    }

    @GetMapping("/api/health")
    public ResponseEntity<String> apiHealth() {
        return ResponseEntity.ok("API is working");
    }
}