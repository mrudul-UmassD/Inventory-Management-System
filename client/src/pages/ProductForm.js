import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    quantity: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditMode);

  useEffect(() => {
    if (isEditMode) {
      const fetchProduct = async () => {
        try {
          const res = await axios.get(`/api/products/${id}`);
          const product = res.data;
          setFormData({
            name: product.name,
            description: product.description || '',
            category: product.category || '',
            price: product.price,
            quantity: product.quantity
          });
        } catch (err) {
          console.error('Error fetching product:', err);
          alert('Error loading product data. Please try again.');
        } finally {
          setFetchLoading(false);
        }
      };

      fetchProduct();
    }
  }, [id, isEditMode]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.price || isNaN(formData.price) || Number(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }
    
    if (!formData.quantity || isNaN(formData.quantity) || !Number.isInteger(Number(formData.quantity)) || Number(formData.quantity) < 0) {
      newErrors.quantity = 'Quantity must be a non-negative integer';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const productData = {
        ...formData,
        price: Number(formData.price),
        quantity: Number(formData.quantity)
      };
      
      if (isEditMode) {
        await axios.put(`/api/products/${id}`, productData);
      } else {
        await axios.post('/api/products', productData);
      }
      
      navigate('/');
    } catch (err) {
      console.error('Error saving product:', err);
      alert(`Failed to ${isEditMode ? 'update' : 'create'} product. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return <p>Loading product data...</p>;
  }

  return (
    <div>
      <h2>{isEditMode ? 'Edit Product' : 'Add New Product'}</h2>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Product Name*</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'form-control is-invalid' : 'form-control'}
            />
            {errors.name && <div className="error-message">{errors.name}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-control"
              rows="3"
            ></textarea>
          </div>
          
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="form-control"
              placeholder="e.g. Electronics, Food, Clothing"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="price">Price*</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className={errors.price ? 'form-control is-invalid' : 'form-control'}
              min="0.01"
              step="0.01"
            />
            {errors.price && <div className="error-message">{errors.price}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="quantity">Quantity*</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className={errors.quantity ? 'form-control is-invalid' : 'form-control'}
              min="0"
              step="1"
            />
            {errors.quantity && <div className="error-message">{errors.quantity}</div>}
          </div>
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Product'}
            </button>
            <Link to="/" className="btn btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm; 