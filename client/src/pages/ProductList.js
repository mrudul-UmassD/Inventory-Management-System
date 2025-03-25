import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchBar from '../components/SearchBar';
import ProductItem from '../components/ProductItem';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    fetchProducts(filters);
  }, [filters]);

  const fetchProducts = async (filters) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.name) queryParams.append('name', filters.name);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.minQuantity) queryParams.append('minQuantity', filters.minQuantity);
      if (filters.maxQuantity) queryParams.append('maxQuantity', filters.maxQuantity);
      
      const url = `/api/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await axios.get(url);
      
      setProducts(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to fetch products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchFilters) => {
    setFilters(searchFilters);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/products/${id}`);
      setProducts(products.filter(product => product.id !== id));
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Failed to delete product. Please try again.');
    }
  };

  return (
    <div>
      <h2>Inventory Products</h2>
      <SearchBar onSearch={handleSearch} />
      
      {loading ? (
        <p>Loading products...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : products.length === 0 ? (
        <div className="card">
          <p>No products found. Try adjusting your search filters or add a new product.</p>
        </div>
      ) : (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <ProductItem
                  key={product.id}
                  product={product}
                  onDelete={handleDelete}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductList; 