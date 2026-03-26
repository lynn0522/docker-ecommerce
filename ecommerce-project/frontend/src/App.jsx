// src/App.jsx
import React from 'react';
import AppLayout from './components/Layout.jsx';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProductList from "./pages/ProductList.jsx"; 
import ProductForm from "./components/ProductForm.jsx";
import ProductDetail from "./pages/ProductDetail.jsx"; 


function App() {
  console.log("===== App组件渲染 =====");
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/products" replace />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/new" element={<ProductForm />} />
        <Route path="/products/edit/:id" element={<ProductForm />} />
        
        <Route path="/products/:id" element={<ProductDetail />} /> 
        <Route path="*" element={<div>404 页面不存在</div>} />
      </Routes>
    </AppLayout>
  );
}

export default App;