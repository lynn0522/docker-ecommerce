package com.ecommerce.backend.service;

import com.ecommerce.backend.entity.Product;
import com.ecommerce.backend.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductService productService;

    @Test
    void getAllProducts_ShouldReturnAllProducts() {
        Product product1 = createProduct(1L, "iPhone 15", new BigDecimal("999.99"), 10);
        Product product2 = createProduct(2L, "MacBook Pro", new BigDecimal("1999.99"), 5);

        List<Product> mockProducts = Arrays.asList(product1, product2);
        when(productRepository.findAll()).thenReturn(mockProducts);

        List<Product> result = productService.getAllProducts();

        assertEquals(2, result.size());
        assertEquals("iPhone 15", result.get(0).getName());
        // 使用 compareTo 比较 BigDecimal
        assertEquals(0, result.get(1).getPrice().compareTo(new BigDecimal("1999.99")));
        verify(productRepository, times(1)).findAll();
    }

    @Test
    void getProductById_WhenProductExists_ShouldReturnOptionalWithProduct() {
        Product mockProduct = createProduct(1L, "Test Product", new BigDecimal("99.99"), 50);

        when(productRepository.findById(1L)).thenReturn(Optional.of(mockProduct));

        Optional<Product> result = productService.getProductById(1L);

        assertTrue(result.isPresent());
        assertEquals(1L, result.get().getId());
        assertEquals("Test Product", result.get().getName());
    }

    @Test
    void getProductById_WhenProductNotExists_ShouldReturnEmptyOptional() {
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        Optional<Product> result = productService.getProductById(999L);

        assertTrue(result.isEmpty());
    }

    @Test
    void createProduct_ShouldSaveAndReturnProduct() {
        Product inputProduct = createProduct(null, "New Product", new BigDecimal("49.99"), 100);

        Product savedProduct = createProduct(10L, "New Product", new BigDecimal("49.99"), 100);

        when(productRepository.save(any(Product.class))).thenReturn(savedProduct);

        Product result = productService.createProduct(inputProduct);

        assertNotNull(result);
        assertEquals(10L, result.getId());
        assertEquals("New Product", result.getName());
        // 比较 BigDecimal 数值
        assertEquals(0, result.getPrice().compareTo(new BigDecimal("49.99")));
    }

    @Test
    void updateProduct_ShouldUpdateExistingProduct() {
        Product existingProduct = createProduct(1L, "Old Name", new BigDecimal("100.00"), 10);

        Product updateData = new Product();
        updateData.setName("Updated Name");
        updateData.setPrice(new BigDecimal("120.00"));
        updateData.setStock(20);

        when(productRepository.findById(1L)).thenReturn(Optional.of(existingProduct));
        when(productRepository.save(any(Product.class))).thenReturn(existingProduct);

        Product result = productService.updateProduct(1L, updateData);

        assertNotNull(result);
        assertEquals("Updated Name", result.getName());
        // 使用 compareTo 比较 BigDecimal
        assertEquals(0, result.getPrice().compareTo(new BigDecimal("120.00")));
        assertEquals(20, result.getStock());
    }

    @Test
    void updateProduct_WhenProductNotExists_ShouldThrowException() {
        Product updateData = new Product();
        updateData.setName("Updated Name");

        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            productService.updateProduct(999L, updateData);
        });

        assertEquals("Product not found with id: 999", exception.getMessage());
    }

    @Test
    void deleteProduct_ShouldCallRepository() {
        doNothing().when(productRepository).deleteById(1L);

        productService.deleteProduct(1L);

        verify(productRepository, times(1)).deleteById(1L);
    }

    @Test
    void getProductsByCategory_ShouldReturnFilteredProducts() {
        Product product1 = createProduct(1L, "iPhone", new BigDecimal("999.99"), 10);
        product1.setCategory("Electronics");

        Product product2 = createProduct(2L, "Headphones", new BigDecimal("99.99"), 20);
        product2.setCategory("Electronics");

        List<Product> electronicsProducts = Arrays.asList(product1, product2);
        when(productRepository.findByCategory("Electronics")).thenReturn(electronicsProducts);

        List<Product> result = productService.getProductsByCategory("Electronics");

        assertEquals(2, result.size());
        assertTrue(result.stream().allMatch(p -> "Electronics".equals(p.getCategory())));
    }

    @Test
    void searchProducts_ShouldReturnMatchingProducts() {
        Product product1 = createProduct(1L, "iPhone Pro", new BigDecimal("999.99"), 10);
        Product product2 = createProduct(2L, "iPhone Case", new BigDecimal("19.99"), 50);

        List<Product> searchResults = Arrays.asList(product1, product2);
        when(productRepository.findByNameContaining("iPhone")).thenReturn(searchResults);

        List<Product> result = productService.searchProducts("iPhone");

        assertEquals(2, result.size());
        assertTrue(result.stream().allMatch(p -> p.getName().contains("iPhone")));
    }

    @Test
    void testProductPriceCalculation() {
        // 测试纯业务逻辑
        BigDecimal price = new BigDecimal("100.0");
        BigDecimal tax = price.multiply(new BigDecimal("0.1"));  // 10.00
        BigDecimal total = price.add(tax);                       // 110.00

        // 方法1：使用 compareTo 比较数值（推荐）
        assertEquals(0, total.compareTo(new BigDecimal("110.0")),
                "数值应该相等: total=" + total + ", expected=110.0");

        // 方法2：转换为相同精度的 BigDecimal
        BigDecimal expected = new BigDecimal("110.0");
        BigDecimal scaledTotal = total.setScale(expected.scale(), RoundingMode.HALF_UP);
        assertEquals(expected, scaledTotal);

        // 方法3：验证数值在允许的误差范围内
        BigDecimal difference = total.subtract(new BigDecimal("110.0")).abs();
        assertTrue(difference.compareTo(new BigDecimal("0.01")) < 0,
                "误差应该在 0.01 以内");
    }

    // 辅助方法：创建Product对象
    private Product createProduct(Long id, String name, BigDecimal price, Integer stock) {
        Product product = new Product();
        product.setId(id);
        product.setName(name);
        product.setPrice(price);
        product.setStock(stock);
        return product;
    }
}