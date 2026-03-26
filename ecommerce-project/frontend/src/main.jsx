// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom'; // 唯一的Router
import { ProductProvider } from './context/ProductContext.jsx'; // 唯一的Provider
import App from './App.jsx';
import 'antd/dist/reset.css'; // 确保Antd样式加载

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 1. 唯一的Router（最外层） */}
    <Router>
      {/* 2. 唯一的ProductProvider */}
      <ProductProvider>
        <App />
      </ProductProvider>
    </Router>
  </React.StrictMode>
);