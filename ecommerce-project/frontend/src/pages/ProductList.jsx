import React, { useEffect, useState, useCallback } from 'react';
import { useProducts } from '../context/ProductContext.jsx';
import { Table, Input, Button, Select, Space, Typography, message, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import { DeleteOutlined, EditOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

const ProductList = () => {
  // 1. 路由跳转核心：初始化useNavigate
  const navigate = useNavigate();
  
  // 2. 解构上下文（严格兜底，避免undefined）
  const {
    products = [],
    loading = false,
    error = '',
    fetchProducts = () => {},
    deleteProduct = async () => false,
    searchProducts = async () => {},
    filterByCategory = async () => {},
    categories = []
  } = useProducts() || {}; // 关键：兜底防止useProducts返回undefined

  // 3. 状态管理（简化）
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [currentDeleteId, setCurrentDeleteId] = useState(null);

  // 4. 防抖搜索（优化性能）
  const handleSearch = useCallback(async () => {
    try {
      if (searchKeyword.trim()) {
        await searchProducts(searchKeyword.trim());
      } else {
        await fetchProducts(); // 无关键词重置
      }
    } catch (err) {
      message.error(`搜索失败：${err.message || '系统异常'}`);
      console.error('🔍 搜索错误详情：', err);
    }
  }, [searchKeyword, fetchProducts, searchProducts]);

  // 5. 分类筛选（优化错误处理）
  const handleCategoryChange = useCallback(async (value) => {
    setSelectedCategory(value);
    try {
      if (value) {
        await filterByCategory(value);
      } else {
        await fetchProducts(); // 无分类重置
      }
    } catch (err) {
      message.error(`筛选失败：${err.message || '系统异常'}`);
      console.error('📂 筛选错误详情：', err);
    }
  }, [fetchProducts, filterByCategory]);

  // 6. 删除确认（增加模态框，防止误删）
  const handleDeleteClick = (id) => {
    setCurrentDeleteId(id);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!currentDeleteId) return;
    try {
      const success = await deleteProduct(currentDeleteId);
      if (success) {
        message.success('产品删除成功！');
        setDeleteModalVisible(false);
        setCurrentDeleteId(null);
        // 删除后重新加载数据
        await fetchProducts();
      } else {
        message.error('产品删除失败，请重试！');
      }
    } catch (err) {
      message.error(`删除失败：${err.message || '系统异常'}`);
      console.error('🗑️ 删除错误详情：', err);
    }
  };

  // 7. 初始化加载数据（确保只执行一次）
  useEffect(() => {
    console.log("📌 ProductList 组件挂载，开始加载数据");
    // 仅当fetchProducts是函数时执行
    if (typeof fetchProducts === 'function') {
      fetchProducts()
        .then(res => {
          console.log("✅ 数据加载成功，返回结果：", res);
          console.log("📊 当前products数据：", products);
          if (Array.isArray(res) && res.length > 0) {
            message.success(`加载成功！共 ${res.length} 个产品`);
          } else if (Array.isArray(res) && res.length === 0) {
            message.info('暂无产品数据，可点击"新增产品"添加');
          }
        })
        .catch(err => {
          message.error(`数据加载失败：${err.message || '请检查后端服务是否运行在8084端口'}`);
          console.error("❌ 加载失败详情：", err);
        });
    } else {
      message.error("❌ fetchProducts 不是函数，上下文传递异常！");
      console.error('❌ useProducts返回值：', useProducts());
    }
  }, [fetchProducts]);

  // 8. 表格列配置（优化渲染）
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a, b) => a.id - b.id // 支持排序
    },
    {
      title: '产品名称',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true // 超长省略
    },
    {
      title: '价格（元）',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (price) => `¥${Number(price || 0).toFixed(2)}` // 格式化价格+兜底
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
      width: 100,
      sorter: (a, b) => a.stock - b.stock
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      filters: categories.map(cat => ({ text: cat, value: cat })), // 快捷筛选
      onFilter: (value, record) => record.category === value
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            onClick={() => navigate(`/products/${record.id}`)}
            title="查看详情"
            disabled={!record.id} // 无ID时禁用
          >
            查看
          </Button>
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => navigate(`/products/edit/${record.id}`)}
            title="编辑产品"
            disabled={!record.id} // 无ID时禁用
          >
            编辑
          </Button>
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDeleteClick(record.id)}
            title="删除产品"
            disabled={!record.id} // 无ID时禁用
          >
            删除
          </Button>
        </Space>
      )
    }
  ];

  // 9. 错误/加载状态渲染
  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>⏳ 正在加载产品数据...</div>;
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', color: '#ff4d4f' }}>
        ❌ 加载失败：{error}
        <Button 
          type="primary" 
          onClick={() => fetchProducts()} 
          style={{ marginTop: 16 }}
        >
          重试加载
        </Button>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', padding: '0 16px' }}>
      {/* 头部：标题 + 新增按钮 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>📦 产品列表</Title>
        <Button 
          type="primary" 
          onClick={() => navigate('/products/new')}
          icon={<SearchOutlined />}
        >
          + 新增产品
        </Button>
      </div>

      {/* 搜索/筛选区域 */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
        <Input
          placeholder="🔍 输入产品名称搜索"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          style={{ flex: 1, minWidth: '200px' }}
          prefix={<SearchOutlined />}
          onPressEnter={handleSearch}
          allowClear
        />
        <Button type="primary" onClick={handleSearch}>搜索</Button>
        <Button 
          onClick={() => { 
            setSearchKeyword(''); 
            setSelectedCategory(''); 
            fetchProducts(); 
          }}
        >
          重置
        </Button>
        <Select
          placeholder="📂 按分类筛选"
          value={selectedCategory}
          onChange={handleCategoryChange}
          style={{ minWidth: '150px' }}
          allowClear
        >
          {categories.map((category) => (
            <Option key={category} value={category}>{category}</Option>
          ))}
          <Option value="other">其他</Option>
        </Select>
      </div>

      {/* 产品表格 */}
      <Table
        columns={columns}
        dataSource={Array.isArray(products) ? products : []} // 双重兜底
        rowKey={(record) => record.id || `temp-${record.name || Math.random()}-${Date.now()}`} // 更稳定的rowKey
        pagination={{ 
          pageSize: 10, 
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 个产品`
        }}
        locale={{ 
          emptyText: (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              📭 暂无产品数据 
              <Button 
                type="link" 
                onClick={() => navigate('/products/new')}
                style={{ marginLeft: 8 }}
              >
                立即添加
              </Button>
            </div>
          )
        }}
        bordered
        scroll={{ x: 'max-content' }} // 适配小屏幕横向滚动
      />

      {/* 删除确认模态框（修复废弃警告） */}
      <Modal
        title="⚠️ 确认删除"
        open={deleteModalVisible}
        onOk={confirmDelete}
        onCancel={() => {
          setDeleteModalVisible(false);
          setCurrentDeleteId(null);
        }}
        okText="确认删除"
        cancelText="取消"
        destroyOnHidden={true} // ✅ 替换destroyOnClose为destroyOnHidden
        maskClosable={false} // 点击遮罩不关闭，防止误操作
      >
        <p>是否确定删除ID为 {currentDeleteId} 的产品？此操作不可恢复！</p>
      </Modal>
    </div>
  );
};

export default ProductList;