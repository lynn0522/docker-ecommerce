//// src/main/java/com/ecommerce/backend/entity/Product.java
//package com.ecommerce.backend.entity;
//
//import jakarta.persistence.*;
//import lombok.Data;
//import java.math.BigDecimal;
//import java.time.LocalDateTime;
//
//@Entity
//@Table(name = "products")
//@Data
//public class Product {
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @Column(nullable = false)
//    private String name;
//
//    private String description;
//
//    @Column(nullable = false)
//    private BigDecimal price;
//
//    private Integer stock;
//
//    private String category;
//
//    @Column(name = "image_url")
//    private String imageUrl;
//
//    @Column(name = "created_at")
//    private LocalDateTime createdAt;
//
//    @Column(name = "updated_at")
//    private LocalDateTime updatedAt;
//
//    @PrePersist
//    protected void onCreate() {
//        createdAt = LocalDateTime.now();
//        updatedAt = LocalDateTime.now();
//    }
//
//    @PreUpdate
//    protected void onUpdate() {
//        updatedAt = LocalDateTime.now();
//    }
//}




package com.ecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false)
    private Double price;

    // 修复：先设置nullable = false，默认值通过字段初始化（避免H2语法冲突）
    @Column(nullable = false)
    private Integer stock = 0;

    // 修复：默认值通过字段初始化，而非列定义（避免H2语法冲突）
    @Column(length = 50)
    private String category = "未分类";

    @Column(length = 500)
    private String description;

    @Column(length = 255)
    private String imageUrl;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}