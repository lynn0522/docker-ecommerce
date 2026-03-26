
// // 核心修改：指向后端K8s Service暴露的NodePort端口（30082）
// // const baseUrl = "http://localhost:30082/api/products"; 
// const baseUrl = '/api/products'; 
// // 通用请求函数
// async function request(url, options = {}) {
//   try {
//     const fullUrl = `${baseUrl}${url}`;
//     const defaultOptions = {
//       headers: { "Content-Type": "application/json;charset=utf-8" },
//      // credentials: "include", // 跨域携带Cookie
//     };
//     const mergedOptions = { ...defaultOptions, ...options };
    
//     // POST/PUT请求处理body
//     if (mergedOptions.body) {
//       mergedOptions.body = JSON.stringify(mergedOptions.body);
//     }

//     const response = await fetch(fullUrl, mergedOptions);
//     // 处理空响应
//     if (response.status === 204 || (response.status === 200 && response.body === null)) {
//       return [];
//     }
//     // 处理错误状态码
//     if (!response.ok) {
//       throw new Error(`HTTP错误：${response.status} ${response.statusText}`);
//     }
//     return await response.json();
//   } catch (error) {
//     console.error("请求失败：", error);
//     throw error; // 抛出错误让上层处理
//   }
// }

// // 商品接口封装（覆盖Context所有调用）
// export const productApi = {
//   // 获取所有商品
//   getAllProducts: () => request("", { method: "GET" }),
//   // 获取单个商品
//   getProductById: (id) => request(`/${id}`, { method: "GET" }),
//   // 新增商品
//   createProduct: (product) => request("", { method: "POST", body: product }),
//   // 修改商品
//   updateProduct: (id, product) => request(`/${id}`, { method: "PUT", body: product }),
//   // 删除商品
//   deleteProduct: (id) => request(`/${id}`, { method: "DELETE" }),
//   // 搜索商品（前端筛选用，这里先返回所有，Context里再筛选）
//   searchProducts: (keyword) => productApi.getAllProducts(),
//   // 按分类筛选（前端筛选用）
//   getProductsByCategory: (category) => productApi.getAllProducts(),
// };

// 1. 基础路径只到/api（通用，方便扩展其他接口）
const baseUrl = '/api'; 
// 2. 商品接口的固定路径（单独抽离，便于维护）
const productPath = '/products';

// 通用请求函数（适配所有接口，更灵活）
async function request(url, options = {}) {
  try {
    const fullUrl = `${baseUrl}${url}`; // 拼接基础路径+接口路径
    const defaultOptions = {
      headers: { "Content-Type": "application/json;charset=utf-8" },
      // credentials: "include", // 跨域需携带Cookie时打开（当前无需）
    };
    const mergedOptions = { ...defaultOptions, ...options };
    
    // POST/PUT请求处理body（保持不变）
    if (mergedOptions.body) {
      mergedOptions.body = JSON.stringify(mergedOptions.body);
    }

    const response = await fetch(fullUrl, mergedOptions);
    // 处理空响应（保持不变）
    if (response.status === 204 || (response.status === 200 && response.body === null)) {
      return [];
    }
    // 处理错误状态码（保持不变）
    if (!response.ok) {
      throw new Error(`HTTP错误：${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("请求失败：", error);
    throw error; // 抛出错误让上层处理
  }
}

// 商品接口封装（路径拼接更清晰）
export const productApi = {
  // 获取所有商品 → /api/products
  getAllProducts: () => request(productPath, { method: "GET" }),
  // 获取单个商品 → /api/products/1
  getProductById: (id) => request(`${productPath}/${id}`, { method: "GET" }),
  // 新增商品 → /api/products
  createProduct: (product) => request(productPath, { method: "POST", body: product }),
  // 修改商品 → /api/products/1
  updateProduct: (id, product) => request(`${productPath}/${id}`, { method: "PUT", body: product }),
  // 删除商品 → /api/products/1
  deleteProduct: (id) => request(`${productPath}/${id}`, { method: "DELETE" }),
  // 搜索商品（前端筛选）
  searchProducts: (keyword) => productApi.getAllProducts(),
  // 按分类筛选（前端筛选）
  getProductsByCategory: (category) => productApi.getAllProducts(),
};