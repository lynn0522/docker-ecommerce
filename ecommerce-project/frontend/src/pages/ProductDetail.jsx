// import React, { useEffect } from 'react';
// import { useParams, Link, useNavigate } from 'react-router-dom';
// import { Card, Button, Descriptions, Image, Spin, message, Modal } from 'antd';
// import { EditOutlined, ArrowLeftOutlined, DeleteOutlined } from '@ant-design/icons';
// import { useProducts } from '../context/ProductContext.jsx';

// const ProductDetail = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { currentProduct, loading, error, fetchProduct, deleteProduct } = useProducts();

//   // 修复1：加边界判断，避免fetchProduct未定义时报错
//   useEffect(() => {
//     if (id && typeof fetchProduct === 'function') {
//       fetchProduct(id).catch(err => {
//         message.error(`加载产品失败：${err.message}`);
//       });
//     }
//   }, [id, fetchProduct]);

//   // 修复2：删除逻辑加边界判断，避免currentProduct为null时报错
//   const handleDelete = async () => {
//     if (!currentProduct) {
//       message.warning('产品数据未加载完成，无法删除');
//       return;
//     }
    
//     Modal.confirm({
//       title: '确认删除',
//       content: `是否确定删除产品「${currentProduct.name || '未知'}」？`,
//       onOk: async () => {
//         try {
//           const success = await deleteProduct(id);
//           if (success) {
//             message.success('产品删除成功');
//             navigate('/products'); // 修复3：跳转产品列表（原/指向首页，可能路由不匹配）
//           } else {
//             message.error('产品删除失败');
//           }
//         } catch (err) {
//           message.error(`删除失败：${err.message || '系统异常'}`);
//         }
//       },
//       onCancel: () => {},
//       okText: '确认删除',
//       cancelText: '取消'
//     });
//   };

//   // 修复4：优化加载/错误/空数据的展示样式，更友好
//   if (loading) {
//     return (
//       <div style={{ textAlign: 'center', padding: '100px 0' }}>
//         <Spin size="large" tip="正在加载产品详情..." />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div style={{ textAlign: 'center', padding: '50px 0', color: '#ff4d4f' }}>
//         <p>❌ 加载失败：{error}</p>
//         <Button type="primary" onClick={() => fetchProduct(id)} style={{ marginTop: 16 }}>
//           重试加载
//         </Button>
//       </div>
//     );
//   }

//   if (!currentProduct) {
//     return (
//       <div style={{ textAlign: 'center', padding: '100px 0' }}>
//         <p>📭 该产品不存在或已被删除</p>
//         <Button type="primary" onClick={() => navigate('/products')} style={{ marginTop: 16 }}>
//           返回产品列表
//         </Button>
//       </div>
//     );
//   }

//   // 修复5：字段名兼容（后端字段可能是下划线/小驼峰，做双重兜底）
//   const product = {
//     name: currentProduct.name || currentProduct.productName || '-',
//     description: currentProduct.description || currentProduct.desc || '-',
//     price: currentProduct.price || 0,
//     stock: currentProduct.stock || 0,
//     category: currentProduct.category || currentProduct.type || '未分类',
//     createdAt: currentProduct.createdAt || currentProduct.created_at || null,
//     updatedAt: currentProduct.updatedAt || currentProduct.updated_at || null,
//     imageUrl: currentProduct.imageUrl || currentProduct.image_url || 'https://picsum.photos/300/300?text=No+Image'
//   };

//   return (
//     <Card style={{ maxWidth: '1200px', margin: '20px auto', padding: '20px' }}>
//       <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center' }}>
//         <Button 
//           icon={<ArrowLeftOutlined />} 
//           onClick={() => navigate('/products')} // 修复6：返回产品列表（原/可能路由不匹配）
//           style={{ marginRight: 10 }}
//         >
//           返回列表
//         </Button>
//         {/* 修复7：编辑路由改为/products/edit/:id（和App.jsx配置一致） */}
//         <Link to={`/products/edit/${id}`}>
//           <Button type="primary" icon={<EditOutlined />} style={{ marginRight: 10 }}>
//             编辑产品
//           </Button>
//         </Link>
//         <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
//           删除产品
//         </Button>
//       </div>

//       <div style={{ display: 'flex', gap: 30, flexWrap: 'wrap' }}>
//         <div style={{ minWidth: '300px', flex: 1 }}>
//           <Image 
//             src={product.imageUrl} 
//             alt={product.name}
//             preview={true} // 修复8：开启图片预览，提升体验
//             style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: 8 }}
//           />
//         </div>
//         <div style={{ minWidth: '600px', flex: 2 }}>
//           <Descriptions 
//             title={<h2 style={{ margin: 0 }}>产品详情</h2>} 
//             column={1} 
//             bordered
//             size="middle"
//           >
//             <Descriptions.Item label="产品名称" style={{ fontSize: 14 }}>
//               <span style={{ fontWeight: 600 }}>{product.name}</span>
//             </Descriptions.Item>
//             <Descriptions.Item label="产品描述">{product.description}</Descriptions.Item>
//             <Descriptions.Item label="价格">
//               <span style={{ color: '#ff4d4f', fontWeight: 600 }}>¥ {product.price.toFixed(2)}</span>
//             </Descriptions.Item>
//             <Descriptions.Item label="库存">
//               {product.stock > 0 ? (
//                 <span style={{ color: '#52c41a' }}>{product.stock} 件（有货）</span>
//               ) : (
//                 <span style={{ color: '#ff4d4f' }}>缺货</span>
//               )}
//             </Descriptions.Item>
//             <Descriptions.Item label="分类">{product.category}</Descriptions.Item>
//             <Descriptions.Item label="创建时间">
//               {product.createdAt ? new Date(product.createdAt).toLocaleString() : '-'}
//             </Descriptions.Item>
//             <Descriptions.Item label="更新时间">
//               {product.updatedAt ? new Date(product.updatedAt).toLocaleString() : '-'}
//             </Descriptions.Item>
//           </Descriptions>
//         </div>
//       </div>
//     </Card>
//   );
// };

// export default ProductDetail;
import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, Button, Descriptions, Image, Spin, message, Modal, Typography } from 'antd';
import { EditOutlined, ArrowLeftOutlined, DeleteOutlined } from '@ant-design/icons';
import { useProducts } from '../context/ProductContext.jsx';

const { Title } = Typography; // 新增：统一使用Antd的Typography组件

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentProduct, loading, error, fetchProduct, deleteProduct } = useProducts();

  // 修复1：加边界判断，避免fetchProduct未定义时报错
  useEffect(() => {
    if (id && typeof fetchProduct === 'function') {
      fetchProduct(id).catch(err => {
        message.error(`加载产品失败：${err.message}`);
      });
    }
  }, [id, fetchProduct]);

  // 修复2：删除逻辑加边界判断 + 修复Modal废弃属性警告
  const handleDelete = async () => {
    if (!currentProduct) {
      message.warning('产品数据未加载完成，无法删除');
      return;
    }
    
    Modal.confirm({
      title: '确认删除',
      content: `是否确定删除产品「${currentProduct.name || '未知'}」？`,
      destroyOnHidden: true, // 修复：替换废弃的destroyOnClose为destroyOnHidden
      onOk: async () => {
        try {
          const success = await deleteProduct(id);
          if (success) {
            message.success('产品删除成功');
            navigate('/products'); // 修复：跳转产品列表（匹配路由）
          } else {
            message.error('产品删除失败');
          }
        } catch (err) {
          message.error(`删除失败：${err.message || '系统异常'}`);
        }
      },
      onCancel: () => {},
      okText: '确认删除',
      cancelText: '取消'
    });
  };

  // 修复3：Spin组件tip警告（改用嵌套模式，符合Antd规范）
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin 
          size="large" 
          tip="正在加载产品详情..." 
          wrapperClassName="product-detail-spin" // 新增：配合tip的嵌套模式
        >
          <div style={{ visibility: 'hidden' }}></div> {/* 必须有子元素，tip才生效 */}
        </Spin>
      </div>
    );
  }

  // 修复4：优化错误状态的样式和交互
  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0', maxWidth: '800px', margin: '0 auto' }}>
        <Title level={4} style={{ color: '#ff4d4f' }}>❌ 加载失败</Title>
        <p style={{ margin: '16px 0' }}>{error}</p>
        <Button type="primary" onClick={() => fetchProduct(id)}>
          重试加载
        </Button>
      </div>
    );
  }

  // 修复5：空数据状态优化
  if (!currentProduct) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0', maxWidth: '800px', margin: '0 auto' }}>
        <Title level={4} style={{ color: '#999' }}>📭 该产品不存在或已被删除</Title>
        <Button 
          type="primary" 
          onClick={() => navigate('/products')} 
          style={{ marginTop: 16 }}
        >
          返回产品列表
        </Button>
      </div>
    );
  }

  // 修复6：字段名兼容 + 数值安全处理（避免toFixed报错）
  const product = {
    name: currentProduct.name || currentProduct.productName || '-',
    description: currentProduct.description || currentProduct.desc || '-',
    price: typeof currentProduct.price === 'number' ? currentProduct.price : 0, // 安全兜底
    stock: typeof currentProduct.stock === 'number' ? currentProduct.stock : 0, // 安全兜底
    category: currentProduct.category || currentProduct.type || '未分类',
    createdAt: currentProduct.createdAt || currentProduct.created_at || null,
    updatedAt: currentProduct.updatedAt || currentProduct.updated_at || null,
    imageUrl: currentProduct.imageUrl || currentProduct.image_url || 'https://picsum.photos/300/300?text=No+Image'
  };

  return (
    <Card 
      style={{ maxWidth: '1200px', margin: '20px auto', padding: '20px' }}
      bordered={true} // 显式设置边框，样式更统一
    >
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center' }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/products')} 
          style={{ marginRight: 10 }}
        >
          返回列表
        </Button>
        {/* 修复7：编辑路由匹配 + 按钮样式优化 */}
        <Link to={`/products/edit/${id}`}>
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            style={{ marginRight: 10 }}
          >
            编辑产品
          </Button>
        </Link>
        <Button 
          danger 
          icon={<DeleteOutlined />} 
          onClick={handleDelete}
          // 新增：禁用状态（数据未加载时）
          disabled={!currentProduct}
        >
          删除产品
        </Button>
      </div>

      <div style={{ display: 'flex', gap: 30, flexWrap: 'wrap' }}>
        <div style={{ minWidth: '300px', flex: 1 }}>
          <Image 
            src={product.imageUrl} 
            alt={product.name}
            preview={true} 
            style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: 8 }}
            fallback="https://picsum.photos/300/300?text=No+Image" // 新增：图片加载失败兜底
          />
        </div>
        <div style={{ minWidth: '600px', flex: 2 }}>
          <Descriptions 
            title={<Title level={3} style={{ margin: 0 }}>产品详情</Title>} // 修复：统一使用Antd Title组件
            column={1} 
            bordered
            size="middle"
          >
            <Descriptions.Item label="产品名称" style={{ fontSize: 14 }}>
              <span style={{ fontWeight: 600 }}>{product.name}</span>
            </Descriptions.Item>
            <Descriptions.Item label="产品描述">{product.description}</Descriptions.Item>
            <Descriptions.Item label="价格">
              <span style={{ color: '#ff4d4f', fontWeight: 600 }}>¥ {product.price.toFixed(2)}</span>
            </Descriptions.Item>
            <Descriptions.Item label="库存">
              {product.stock > 0 ? (
                <span style={{ color: '#52c41a', fontWeight: 500 }}>{product.stock} 件（有货）</span>
              ) : (
                <span style={{ color: '#ff4d4f', fontWeight: 500 }}>缺货</span>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="分类">{product.category}</Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {product.createdAt ? new Date(product.createdAt).toLocaleString() : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间">
              {product.updatedAt ? new Date(product.updatedAt).toLocaleString() : '-'}
            </Descriptions.Item>
          </Descriptions>
        </div>
      </div>
    </Card>
  );
};

export default ProductDetail;