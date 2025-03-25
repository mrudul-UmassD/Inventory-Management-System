import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProductDetail = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/api/products/${id}`);
        setProduct(res.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to fetch product details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
      try {
        await axios.delete(`/api/products/${id}`);
        navigate('/');
      } catch (err) {
        console.error('Error deleting product:', err);
        alert('Failed to delete product. Please try again.');
      }
    }
  };

  if (loading) {
    return <p>Loading product details...</p>;
  }

  if (error || !product) {
    return (
      <div className="card">
        <p className="error-message">{error || 'Product not found'}</p>
        <Link to="/" className="btn btn-primary">
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2>Product Details</h2>
      <div className="card">
        <h3>{product.name}</h3>
        <div style={{ marginBottom: '20px' }}>
          <p><strong>Category:</strong> {product.category || 'N/A'}</p>
          <p><strong>Price:</strong> ${product.price.toFixed(2)}</p>
          <p><strong>Quantity:</strong> {product.quantity}</p>
          <p><strong>Description:</strong> {product.description || 'No description available'}</p>
          <p><strong>Created:</strong> {new Date(product.created_at).toLocaleDateString()}</p>
          <p><strong>Last Updated:</strong> {new Date(product.updated_at).toLocaleDateString()}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/" className="btn btn-secondary">
            Back to Products
          </Link>
          <Link to={`/products/edit/${product.id}`} className="btn btn-primary">
            Edit Product
          </Link>
          <button onClick={handleDelete} className="btn btn-danger">
            Delete Product
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 