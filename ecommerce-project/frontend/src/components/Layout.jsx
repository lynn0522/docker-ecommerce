// src/components/Layout.jsx
import React from 'react';
import { Layout, Menu } from 'antd';
import { Link } from 'react-router-dom'; // Link现在在main.jsx的Router范围内

const { Header, Content, Footer } = Layout;

const AppLayout = ({ children }) => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 20px' }}>
        <Menu 
          mode="horizontal" 
          defaultSelectedKeys={['/products']}
          items={[
            {
              key: '/products',
              label: <Link to="/products">产品列表</Link>, // 现在Link有效
            },
            {
              key: '/products/new',
              label: <Link to="/products/new">新增产品</Link>,
            },
          ]}
        />
      </Header>
      <Content style={{ padding: '24px' }}>
        {children} {/* 渲染路由内容 */}
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        产品管理系统 ©{new Date().getFullYear()}
      </Footer>
    </Layout>
  );
};

export default AppLayout;