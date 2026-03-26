import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // 新增useParams获取ID
import { Form, Input, InputNumber, Select, Button, message, Typography } from 'antd';
import { useProducts } from '../context/ProductContext.jsx';

const { Title } = Typography;
const { Option } = Select;

// 修改组件：支持接收initialData或通过ID加载数据
const ProductForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams(); // 获取URL中的产品ID（编辑时使用）
  const isEditMode = !!id; // 判断是否为编辑模式

  // 从上下文获取所需方法（新增+编辑）
  const { 
    createProduct, 
    updateProduct, 
    fetchProduct, // 新增：用于加载单个产品数据
    currentProduct, // 新增：从上下文获取当前产品数据
    loading: contextLoading // 新增：区分上下文上下文的加载状态
  } = useProducts();

  // 编辑模式：加载产品数据并回显到表单
  useEffect(() => {
    if (isEditMode && id) {
      fetchProduct(id); // 调用上下文上下文方法加载数据
    } else {
      form.resetFields(); // 非编辑模式重置表单
    }
  }, [isEditMode, id, fetchProduct, form]);

  // 当currentProduct更新时（编辑时），同步到表单
  useEffect(() => {
    if (isEditMode && currentProduct) {
      form.setFieldsValue({
        name: currentProduct.name || '',
        price: currentProduct.price || 0,
        stock: currentProduct.stock || 0,
        category: currentProduct.category || '未分类',
        description: currentProduct.description || ''
      });
    }
  }, [isEditMode, currentProduct, form]);

  // 统一处理提交（区分新增和编辑）
  const onFinish = async (values) => {
    setLoading(true);
    try {
      const productData = {
        name: values.name.trim(),
        price: Number(values.price),
        stock: Number(values.stock),
        category: values.category || '未分类',
        description: values.description?.trim() || ''
      };

      let result;
      if (isEditMode) {
        // 编辑模式：调用更新接口
        if (typeof updateProduct !== 'function') {
          throw new Error('更新产品函数未定义');
        }
        result = await updateProduct(id, productData);
      } else {
        // 新增模式：调用创建接口
        if (typeof createProduct !== 'function') {
          throw new Error('新增产品函数未定义');
        }
        result = await createProduct(productData);
      }

      if (result) {
        message.success(isEditMode ? '产品更新成功！' : '产品新增成功！');
        navigate('/products'); // 成功后返回列表页
      } else {
        message.error(isEditMode ? '更新失败' : '新增失败');
      }
    } catch (error) {
      console.error('操作失败详情：', error);
      message.error(`操作失败：${error.message || '系统异常'}`);
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    message.error(`表单校验失败：${errorInfo.errorFields[0]?.errors[0] || '请检查必填项'}`);
  };

  // 加载中状态（优先显示上下文的加载状态，如加载编辑数据时）
  if (contextLoading && isEditMode) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>加载产品数据中...</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '0 16px' }}>
      <Title level={4} style={{ marginBottom: '20px' }}>
        {isEditMode ? '编辑产品' : '新增产品'}
      </Title>
      <Form
        form={form}
        name={isEditMode ? "product_edit_form" : "product_create_form"}
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        initialValues={{
          category: '未分类',
          stock: 100
        }}
        validateMessages={{
          required: '${label}为必填项！',
          number: '${label}必须为数字！'
        }}
      >
        {/* 产品名称 */}
        <Form.Item
          name="name"
          label="产品名称"
          rules={[{ required: true, message: '请输入产品名称' }]}
        >
          <Input 
            placeholder="请输入产品名称" 
            maxLength={100}
          />
        </Form.Item>

        {/* 产品价格 */}
        <Form.Item
          name="price"
          label="产品价格（元）"
          rules={[{ required: true, type: 'number', min: 0, message: '请输入有效价格' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="请输入价格"
            precision={2}
            step={0.01}
            min={0}
          />
        </Form.Item>

        {/* 产品库存 */}
        <Form.Item
          name="stock"
          label="产品库存"
          rules={[{ required: true, type: 'number', min: 0, message: '请输入有效库存' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="请输入库存"
            min={0}
            step={1}
          />
        </Form.Item>

        {/* 产品分类 */}
        <Form.Item
          name="category"
          label="产品分类"
          rules={[{ required: true, message: '请选择产品分类' }]}
        >
          <Select placeholder="请选择分类">
            <Option value="手机">手机</Option>
            <Option value="电脑">电脑</Option>
            <Option value="平板">平板</Option>
            <Option value="配件">配件</Option>
            <Option value="其他">其他</Option>
          </Select>
        </Form.Item>

        {/* 产品描述 */}
        <Form.Item
          name="description"
          label="产品描述"
        >
          <Input.TextArea
            placeholder="请输入产品描述（选填）"
            rows={4}
            maxLength={500}
          />
        </Form.Item>

        {/* 提交按钮 */}
        <Form.Item style={{ marginTop: '20px' }}>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            style={{ marginRight: '10px' }}
          >
            {isEditMode ? '保存修改' : '提交新增'}
          </Button>
          <Button 
            type="default" 
            onClick={() => navigate('/products')}
          >
            取消
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ProductForm;