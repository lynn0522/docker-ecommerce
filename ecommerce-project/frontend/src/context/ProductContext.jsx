// src/context/ProductContext.jsx
import React, { createContext, useReducer, useContext, useCallback, useEffect } from 'react';
import { productApi } from '../api/productApi';

// 1. 上下文默认值
const ProductContext = createContext({
  products: [],
  loading: false,
  error: null,
  categories: [],
  currentProduct: null,
  fetchProducts: async () => [],
  createProduct: async () => false,
  updateProduct: async () => false,
  deleteProduct: async () => false,
  fetchProduct: async () => null,
  searchProducts: async () => [],
  filterByCategory: async () => [],
});

// 2. 初始状态
const initialState = {
  products: [],
  loading: false,
  error: null,
  categories: [],
  currentProduct: null,
};

// 3. Reducer
function productReducer(state, action) {
  switch (action.type) {
    case 'FETCH_START': return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS': return { ...state, products: action.payload, loading: false };
    case 'FETCH_PRODUCT_SUCCESS': return { ...state, currentProduct: action.payload, loading: false };
    case 'FETCH_ERROR': return { ...state, error: action.payload, loading: false };
    case 'SET_CATEGORIES': return { ...state, categories: action.payload };
    default: return state;
  }
}

// 4. Provider组件
export function ProductProvider({ children }) {
  const [state, dispatch] = useReducer(productReducer, initialState);

  // 核心：获取所有产品（修复res.data错误）
  const fetchProducts = useCallback(async () => {
    try {
      dispatch({ type: 'FETCH_START' });
      // 调用productApi的getAllProducts，直接获取数组
      const products = await productApi.getAllProducts(); 
      dispatch({ type: 'FETCH_SUCCESS', payload: Array.isArray(products) ? products : [] });
      // 提取分类（去重）
      const categories = [...new Set(products.map(p => p.category || '未分类'))];
      dispatch({ type: 'SET_CATEGORIES', payload: categories });
      return products; // ✅ 新增return，让组件能拿到结果
    } catch (err) {
      dispatch({ type: 'FETCH_ERROR', payload: err.message });
      console.error('加载产品失败：', err);
      throw err; // ✅ 抛出错误，让组件捕获
    }
  }, []);

  // 新增产品
  const createProduct = useCallback(async (product) => {
    try {
      dispatch({ type: 'FETCH_START' });
      const newProduct = await productApi.createProduct(product);
      if (newProduct) {
        await fetchProducts(); // 重新加载列表
        return true;
      }
      return false;
    } catch (err) {
      dispatch({ type: 'FETCH_ERROR', payload: err.message });
      console.error('新增产品失败：', err);
      return false;
    }
  }, [fetchProducts]);

  // 删除产品
  const deleteProduct = useCallback(async (id) => {
    try {
      dispatch({ type: 'FETCH_START' });
      await productApi.deleteProduct(id);
      await fetchProducts(); // 重新加载列表
      return true;
    } catch (err) {
      dispatch({ type: 'FETCH_ERROR', payload: err.message });
      console.error('删除产品失败：', err);
      return false;
    }
  }, [fetchProducts]);

  // 搜索产品（前端筛选，适配productApi）
  const searchProducts = useCallback(async (keyword) => {
    try {
      dispatch({ type: 'FETCH_START' });
      // 先获取所有产品，再前端筛选（如果后端没提供搜索接口）
      const allProducts = await productApi.getAllProducts();
      const filteredProducts = allProducts.filter(p => 
        p.name?.toLowerCase().includes(keyword.toLowerCase())
      );
      dispatch({ type: 'FETCH_SUCCESS', payload: filteredProducts });
      return filteredProducts;
    } catch (err) {
      dispatch({ type: 'FETCH_ERROR', payload: err.message });
      console.error('搜索产品失败：', err);
    }
  }, []);

  // 筛选分类（前端筛选，适配productApi）
  const filterByCategory = useCallback(async (category) => {
    try {
      dispatch({ type: 'FETCH_START' });
      // 先获取所有产品，再前端筛选
      const allProducts = await productApi.getAllProducts();
      const filteredProducts = allProducts.filter(p => 
        p.category === category
      );
      dispatch({ type: 'FETCH_SUCCESS', payload: filteredProducts });
      return filteredProducts;
    } catch (err) {
      dispatch({ type: 'FETCH_ERROR', payload: err.message });
      console.error('筛选分类失败：', err);
    }
  }, []);

  // 加载单个产品（编辑用）→ ✅ 替换8081→8084，改用productApi
  const fetchProduct = useCallback(async (id) => {
    try {
      dispatch({ type: 'FETCH_START' });
      // 改用productApi的getProductById，不再硬编码地址
      const product = await productApi.getProductById(id);
      dispatch({ type: 'FETCH_PRODUCT_SUCCESS', payload: product });
      return product;
    } catch (err) {
      dispatch({ type: 'FETCH_ERROR', payload: err.message });
      console.error('加载单个产品失败：', err);
      throw err;
    }
  }, []);

  // 更新产品（编辑用）→ ✅ 替换8081→8084，改用productApi
  const updateProduct = useCallback(async (id, product) => {
    try {
      dispatch({ type: 'FETCH_START' });
      // 改用productApi的updateProduct，不再硬编码地址
      const updatedProduct = await productApi.updateProduct(id, product);
      if (updatedProduct) {
        await fetchProducts(); // 重新加载列表
        return true;
      }
      return false;
    } catch (err) {
      dispatch({ type: 'FETCH_ERROR', payload: err.message });
      console.error('更新产品失败：', err);
      return false;
    }
  }, [fetchProducts]);

  // 初始化加载数据
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <ProductContext.Provider
      value={{
        ...state,
        fetchProducts,
        createProduct,
        updateProduct,
        deleteProduct,
        fetchProduct,
        searchProducts,
        filterByCategory,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

// 自定义Hook
export const useProducts = () => useContext(ProductContext);