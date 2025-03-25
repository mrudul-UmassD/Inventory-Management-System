# Inventory Management System

A simple web application for managing inventory items, tracking quantities, and prices.

## Features

- Add, update, and delete products from the inventory
- Track product details including name, description, category, price, and quantity
- Search and filter inventory items by name, category, or quantity
- SQLite database for persistent data storage
- Responsive UI design

## Tech Stack

- **Frontend**: React, React Router, Axios
- **Backend**: Node.js, Express
- **Database**: SQLite

## Prerequisites

- Node.js (v12 or higher)
- npm (v6 or higher)

## Getting Started

Follow these steps to set up and run the application:

### 1. Clone the Repository

```bash
git clone <repository-url>
cd inventory-management-system
```

### 2. Install Dependencies

Install server dependencies:
```bash
cd server
npm install
```

Install client dependencies:
```bash
cd ../client
npm install
```

### 3. Start the Server

Start the backend server:
```bash
cd ../server
npm run dev
```

The server will run on http://localhost:5000 and automatically create an SQLite database file in the `server/data` directory if it doesn't exist.

### 4. Start the Client

In a new terminal, start the React client:
```bash
cd ../client
npm start
```

The client will run on http://localhost:3000 and should automatically open in your default browser.

## Usage

- **View Inventory**: The home page displays all inventory items
- **Add Product**: Click "Add New Product" button to create a new item
- **Edit Product**: Click "Edit" on any product to modify its details
- **Delete Product**: Click "Delete" on any product to remove it from inventory
- **Search Products**: Use the search form to filter products by name, category, or quantity

## Project Structure

```
├── client/                 # Frontend React application
│   ├── public/             # Public assets
│   └── src/                # React source files
│       ├── components/     # Reusable components
│       └── pages/          # Page components
├── server/                 # Backend Node.js application
│   ├── data/               # SQLite database folder (created at runtime)
│   └── src/                # Server source files
│       ├── routes/         # API routes
│       └── index.js        # Server entry point
└── README.md               # Project documentation
```

## License

This project is licensed under the MIT License.

## Acknowledgements

- React.js
- Express.js
- SQLite 