import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [minQuantity, setMinQuantity] = useState('');
  const [maxQuantity, setMaxQuantity] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('/api/products/categories/all');
        setCategories(res.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ 
      name: searchTerm, 
      category, 
      minQuantity: minQuantity || undefined, 
      maxQuantity: maxQuantity || undefined
    });
  };

  const handleReset = () => {
    setSearchTerm('');
    setCategory('');
    setMinQuantity('');
    setMaxQuantity('');
    onSearch({}); // Clear filters
  };

  return (
    <div className="card">
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label htmlFor="searchTerm">Product Name</label>
            <input
              type="text"
              id="searchTerm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name..."
            />
          </div>
          
          <div style={{ flex: '1 1 150px' }}>
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat, index) => (
                <option key={index} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          
          <div style={{ flex: '1 1 100px' }}>
            <label htmlFor="minQuantity">Min Quantity</label>
            <input
              type="number"
              id="minQuantity"
              value={minQuantity}
              onChange={(e) => setMinQuantity(e.target.value)}
              min="0"
              placeholder="Min"
            />
          </div>
          
          <div style={{ flex: '1 1 100px' }}>
            <label htmlFor="maxQuantity">Max Quantity</label>
            <input
              type="number"
              id="maxQuantity"
              value={maxQuantity}
              onChange={(e) => setMaxQuantity(e.target.value)}
              min="0"
              placeholder="Max"
            />
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button type="submit" className="btn btn-primary">
            Search
          </button>
          <button type="button" onClick={handleReset} className="btn btn-secondary">
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchBar; 