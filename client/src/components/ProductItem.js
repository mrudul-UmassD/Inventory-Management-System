import React from 'react';
import { Link } from 'react-router-dom';

const ProductItem = ({ product, onDelete }) => {
  const handleDelete = (e) => {
    e.preventDefault();
    if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
      onDelete(product.id);
    }
  };

  return (
    <tr>
      <td>{product.name}</td>
      <td>{product.category || 'N/A'}</td>
      <td>${product.price.toFixed(2)}</td>
      <td>{product.quantity}</td>
      <td>
        <Link to={`/products/${product.id}`} className="btn btn-secondary" style={{ marginRight: '8px' }}>
          View
        </Link>
        <Link to={`/products/edit/${product.id}`} className="btn btn-primary" style={{ marginRight: '8px' }}>
          Edit
        </Link>
        <button onClick={handleDelete} className="btn btn-danger">
          Delete
        </button>
      </td>
    </tr>
  );
};

export default ProductItem; 