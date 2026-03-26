import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Spin, Typography, message } from 'antd';
import ProductForm from '../components/ProductForm';
import { useProducts } from '../context/ProductContext.jsx';

const { Title } = Typography;

const ProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;
  
  const { currentProduct, loading, error, fetchProduct, createProduct, updateProduct, categories } = useProducts();

  useEffect(() => {
    if (!isNew && id) {
      fetchProduct(id);
    }
  }, [id, isNew, fetchProduct]);

  const handleSubmit = async (productData) => {
    try {
      if (isNew) {
        await createProduct(productData);
        message.success('产品创建成功');
      } else {
        await updateProduct(id, productData);
        message.success('产品更新成功');
      }
      navigate('/');
    } catch (err) {
      message.error(`操作失败：${error || '未知错误'}`);
    }
  };

  if (loading && !isNew) return <Spin size="large" style={{ display: 'block', margin: '50px auto' }} />;
  if (error) return <div style={{ textAlign: 'center', margin: '50px auto', color: 'red' }}>错误：{error}</div>;

  return (
    <Card>
      <Title level={4} style={{ marginBottom: 20 }}>{isNew ? '添加新产品' : '编辑产品'}</Title>
      <ProductForm
        initialData={isNew ? null : currentProduct}
        onSubmit={handleSubmit}
        categories={categories}
      />
    </Card>
  );
};

export default ProductEdit;