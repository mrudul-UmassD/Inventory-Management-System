import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <nav className="navbar">
          <h1>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              Inventory Management System
            </Link>
          </h1>
          <div>
            <Link to="/products/new">
              <button className="btn btn-primary">Add New Product</button>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header; 