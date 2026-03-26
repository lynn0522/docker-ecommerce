package com.ecommerce.backend.controller;

import com.ecommerce.backend.entity.Product;
import com.ecommerce.backend.service.ProductService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProductController.class)
public class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProductService productService;

    private ObjectMapper objectMapper;
    private Product product1;
    private Product product2;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        product1 = new Product();
        product1.setId(1L);
        product1.setName("iPhone 15");
        product1.setDescription("智能手机");
        product1.setPrice(new BigDecimal("999.99"));
        product1.setStock(50);
        product1.setCategory("Electronics");

        product2 = new Product();
        product2.setId(2L);
        product2.setName("MacBook Pro");
        product2.setDescription("笔记本电脑");
        product2.setPrice(new BigDecimal("1999.99"));
        product2.setStock(20);
        product2.setCategory("Computers");
    }

    @Test
    void getAllProducts_ShouldReturnProductList() throws Exception {
        List<Product> products = Arrays.asList(product1, product2);
        when(productService.getAllProducts()).thenReturn(products);

        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("iPhone 15"))
                .andExpect(jsonPath("$[1].name").value("MacBook Pro"))
                // 修复：BigDecimal转Double匹配JSON数值
                .andExpect(jsonPath("$[0].price").value(product1.getPrice().doubleValue()))
                .andExpect(jsonPath("$[1].price").value(product2.getPrice().doubleValue()));
    }

    @Test
    void getProductById_WhenProductExists_ShouldReturnProduct() throws Exception {
        when(productService.getProductById(1L)).thenReturn(Optional.of(product1));

        mockMvc.perform(get("/api/products/{id}", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.name").value("iPhone 15"))
                // 修复：BigDecimal转Double匹配
                .andExpect(jsonPath("$.price").value(product1.getPrice().doubleValue()));
    }

    @Test
    void getProductById_WhenProductNotExists_ShouldReturn404() throws Exception {
        when(productService.getProductById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/products/{id}", 999L))
                .andExpect(status().isNotFound());
    }

    @Test
    void createProduct_WithValidData_ShouldCreateProduct() throws Exception {
        // 修复：JSON中price用字符串（匹配BigDecimal，避免精度丢失）
        String productJson = """
            {
                "name": "iPad Air",
                "description": "平板电脑",
                "price": "599.99",
                "stock": 30,
                "category": "Tablets"
            }
            """;

        Product savedProduct = new Product();
        savedProduct.setId(3L);
        savedProduct.setName("iPad Air");
        savedProduct.setDescription("平板电脑");
        savedProduct.setPrice(new BigDecimal("599.99"));
        savedProduct.setStock(30);
        savedProduct.setCategory("Tablets");

        when(productService.createProduct(any(Product.class))).thenReturn(savedProduct);

        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(productJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(3L))
                .andExpect(jsonPath("$.name").value("iPad Air"))
                // 修复：BigDecimal转Double匹配
                .andExpect(jsonPath("$.price").value(savedProduct.getPrice().doubleValue()));
    }

    @Test
    void updateProduct_ShouldUpdateAndReturnProduct() throws Exception {
        // 修复：JSON中price用字符串
        String updateJson = """
            {
                "name": "iPhone 15 Pro",
                "price": "1099.99"
            }
            """;

        Product updatedProduct = new Product();
        updatedProduct.setId(1L);
        updatedProduct.setName("iPhone 15 Pro");
        updatedProduct.setDescription("智能手机");
        updatedProduct.setPrice(new BigDecimal("1099.99"));
        updatedProduct.setStock(50);
        updatedProduct.setCategory("Electronics");

        when(productService.updateProduct(eq(1L), any(Product.class))).thenReturn(updatedProduct);

        mockMvc.perform(put("/api/products/{id}", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("iPhone 15 Pro"))
                // 修复：BigDecimal转Double匹配
                .andExpect(jsonPath("$.price").value(updatedProduct.getPrice().doubleValue()));
    }

    @Test
    void deleteProduct_ShouldReturnNoContent() throws Exception {
        mockMvc.perform(delete("/api/products/{id}", 1L))
                .andExpect(status().isNoContent());
    }

    @Test
    void getProductsByCategory_ShouldReturnFilteredProducts() throws Exception {
        List<Product> electronics = Arrays.asList(product1);
        when(productService.getProductsByCategory("Electronics")).thenReturn(electronics);

        mockMvc.perform(get("/api/products/category/{category}", "Electronics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].category").value("Electronics"))
                // 修复：BigDecimal转Double匹配
                .andExpect(jsonPath("$[0].price").value(product1.getPrice().doubleValue()));
    }
}