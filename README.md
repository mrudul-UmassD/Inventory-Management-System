# Inventory Management System

A comprehensive web application for managing inventory items with advanced features for tracking, organizing, and analyzing product data.

## Features

- Add, update, and delete products from the inventory
- Upload and manage product images 
- Track product details including name, description, category, price, and quantity
- Advanced search and filtering with pagination
- Sort products by various attributes (name, price, quantity, date)
- Bulk import and export products via CSV
- Data visualization dashboard for inventory analytics
- SQLite database with indexing for improved performance
- Comprehensive logging system for debugging and auditing
- Rate limiting for API protection
- Responsive UI design optimized for mobile and desktop
- Material UI components for modern interface
- Settings page for application configuration

## Tech Stack

- **Frontend**: 
  - React 18, React Router 6
  - Material UI 5
  - Axios for API requests
  - Chart.js for data visualization
  - Responsive design with CSS Grid and Flexbox
- **Backend**: 
  - Node.js 16+, Express 4
  - Winston for structured logging
  - Multer for file uploads
  - Express Rate Limit
- **Database**: 
  - SQLite with optimized indexing
  - CSV import/export functionality

## Prerequisites

- Node.js (v14 or higher)
- npm (v7 or higher)

## Getting Started

Follow these steps to set up and run the application:

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Inventory-Management-System
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

### Product Management
- **View Products**: Browse paginated product list with sorting options
- **Add Product**: Create new products with images, descriptions, and categories
- **Edit Product**: Modify existing product details including image replacement
- **Delete Product**: Remove products from inventory with confirmation dialog

### Search and Filter
- **Basic Search**: Filter by product name or category
- **Advanced Filters**: Use price range sliders, date filters, quantity filters
- **Sorting**: Order products by name, price, quantity, or creation date
- **Pagination**: Navigate through large product lists with customizable page size

### Data Visualization
- **Inventory Overview**: View charts summarizing inventory status
- **Category Distribution**: Visualize product distribution by category
- **Stock Alerts**: Identify products with low stock levels
- **Value Analysis**: Analyze inventory value by product category

### Bulk Operations
- **Import Products**: Upload CSV file to add multiple products at once
- **Export Products**: Download current inventory as CSV for reporting or backup

### Image Management
- **Upload Images**: Add product images during creation or editing
- **Image Preview**: View thumbnails in product list and full images in details view

### Settings
- **Application Configuration**: Customize app behavior through the settings page
- **User Preferences**: Set default views and display options

## Project Structure

```
├── client/                 # Frontend React application
│   ├── public/             # Public assets
│   ├── build/              # Production build artifacts
│   └── src/                # React source files
│       ├── components/     # Reusable components
│       │   ├── Footer.js   # Page footer component
│       │   ├── Header.js   # Navigation header
│       │   ├── ProductItem.js # Product list item component
│       │   └── SearchBar.js # Advanced search component
│       ├── context/        # React context providers
│       │   └── SettingsContext.js # Application settings context
│       └── pages/          # Page components
│           ├── DataVis.js  # Data visualization dashboard
│           ├── ProductDetail.js # Product details view
│           ├── ProductForm.js # Create/edit product form
│           ├── ProductList.js # Main product listing page
│           └── SettingsPage.js # Application settings page
├── server/                 # Backend Node.js application
│   ├── data/               # SQLite database folder
│   │   └── inventory.sqlite # Database file
│   ├── logs/               # Server logs
│   │   ├── combined.log    # All logs
│   │   ├── error.log       # Error logs only
│   │   ├── exceptions.log  # Uncaught exceptions
│   │   └── rejections.log  # Unhandled promise rejections
│   ├── uploads/            # Product image storage
│   └── src/                # Server source files
│       ├── database.js     # Database connection and query helpers
│       ├── index.js        # Server entry point and middleware setup
│       ├── logger.js       # Winston logger configuration
│       └── routes/         # API routes
│           └── products.js # Product management endpoints
└── README.md               # Project documentation
```

## API Endpoints

### Products API
- `GET /api/products` - Get all products with filtering, pagination and sorting
- `GET /api/products/:id` - Get a specific product
- `POST /api/products` - Create a new product
- `PUT /api/products/:id` - Update an existing product
- `DELETE /api/products/:id` - Delete a product
- `GET /api/products/categories/all` - Get all unique categories
- `POST /api/products/bulk-import` - Import products from CSV
- `GET /api/products/export` - Export products to CSV

## Performance Optimizations

- Database indexes on frequently queried columns
- Pagination to handle large datasets
- Rate limiting to protect against API abuse
- Image size limits and validation
- Proper error handling and logging
- React memo and useCallback for component optimization
- Dynamic loading of visualization components

## Development

### Available Scripts

**Client:**
```bash
npm start     # Start development server
npm run build # Build for production
npm test      # Run tests
```

**Server:**
```bash
npm run dev   # Start server with nodemon for development
npm start     # Start server for production
npm test      # Run tests
```

### Environment Variables

Create a `.env` file in the server directory with these variables:
```
PORT=5000
NODE_ENV=development
FILE_UPLOAD_PATH=./uploads
MAX_FILE_SIZE=1000000
```

## Troubleshooting

Common issues and solutions:

- **Database connection errors**: Ensure the data directory exists and has proper permissions
- **Image upload issues**: Check that the uploads directory exists and is writable
- **API request failures**: Verify the server is running and check logs for errors

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgements

- React.js
- Material UI
- Express.js
- SQLite
- Winston Logger
- D3.js