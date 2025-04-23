import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import ProductItem from '../components/ProductItem';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Alert,
  Button,
  Box,
  Card,
  CardContent,
  Grid,
  Fade,
  Zoom,
  styled,
  Divider,
  Stack,
  Tooltip,
  TableSortLabel
} from '@mui/material';
import { 
  CloudUpload, 
  FileDownload, 
  Add, 
  Upload, 
  InsertDriveFile,
  UploadFile,
  CloudDownload,
  AutoGraph
} from '@mui/icons-material';

// Styled components
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
  '& .MuiTableHead-root': {
    '& .MuiTableCell-root': {
      backgroundColor: 'rgba(0, 0, 0, 0.02)',
      fontWeight: 600,
    }
  }
}));

const AnimatedCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.06)',
  }
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  }
}));

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    sortBy: 'name',
    sortOrder: 'asc',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  });
  const [csvFile, setCsvFile] = useState(null);
  const [importStatus, setImportStatus] = useState(null);
  const [bulkImportErrors, setBulkImportErrors] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    fetchProducts(filters);
  }, [filters]);

  const fetchProducts = async (filters) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      
      // Add all filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value);
        }
      });
      
      const url = `/api/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await axios.get(url);
      
      if (response.data.data) {
        // New API response format with pagination
        setProducts(response.data.data);
        setPagination(response.data.pagination);
      } else {
        // Fallback for old API format
        setProducts(response.data);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.response?.data?.error || 'Failed to fetch products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchFilters) => {
    setFilters({ 
      ...filters, 
      ...searchFilters,
      page: 1 // Reset to first page on new search
    });
  };

  const handlePageChange = (event, newPage) => {
    setFilters({
      ...filters,
      page: newPage + 1 // MUI pagination is 0-indexed, our API is 1-indexed
    });
  };

  const handleRowsPerPageChange = (event) => {
    setFilters({
      ...filters,
      limit: parseInt(event.target.value),
      page: 1 // Reset to first page when changing rows per page
    });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/products/${id}`);
      setProducts(products.filter(product => product.id !== id));
      
      // If we deleted the last item on the current page, go to previous page
      if (products.length === 1 && pagination.page > 1) {
        setFilters({
          ...filters,
          page: pagination.page - 1
        });
      } else {
        // Otherwise, just refresh the current page
        fetchProducts(filters);
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      const errorMsg = err.response?.data?.error || 'Failed to delete product. Please try again.';
      setError(errorMsg);
    }
  };

  const handleCsvFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Make sure it's a CSV file
      if (file.name.endsWith('.csv') || file.type === 'text/csv') {
        setCsvFile(file);
      } else {
        setImportStatus({
          success: false,
          message: 'Please select a valid CSV file'
        });
        e.target.value = null;
      }
    }
  };

  const handleBulkImport = async () => {
    if (!csvFile) {
      setImportStatus({
        success: false,
        message: 'Please select a CSV file to import'
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', csvFile);
    
    setLoading(true);
    setImportStatus(null);
    setBulkImportErrors(null);
    
    try {
      const response = await axios.post('/api/products/bulk-import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setImportStatus({
        success: true,
        message: response.data.message,
        count: response.data.successfulImports
      });
      
      if (response.data.errors && response.data.errors.length > 0) {
        setBulkImportErrors(response.data.errors);
      }
      
      // Refresh products list
      fetchProducts(filters);
    } catch (err) {
      console.error('Error importing products:', err);
      setImportStatus({
        success: false,
        message: err.response?.data?.error || 'Failed to import products'
      });
    } finally {
      setLoading(false);
      setCsvFile(null);
      // Clear the file input
      document.getElementById('csv-upload').value = '';
    }
  };

  const handleExportCsv = async () => {
    setExportLoading(true);
    try {
      const response = await axios({
        url: '/api/products/export',
        method: 'GET',
        responseType: 'blob', // Important for file download
      });
      
      // Create a link and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `products-export-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting products:', err);
      setError('Failed to export products. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  const handleSort = (field) => {
    const isAsc = filters.sortBy === field && filters.sortOrder === 'asc';
    setFilters({
      ...filters,
      sortBy: field,
      sortOrder: isAsc ? 'desc' : 'asc',
      page: 1 // Reset to first page on sort change
    });
  };

  return (
    <Container maxWidth="xl" sx={{ pb: 8 }}>
      <Fade in={true} timeout={800}>
        <Box>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} mb={3}>
            <Typography variant="h4" component="h1" fontWeight={700}>
              Inventory Products
            </Typography>
            
            <Stack direction="row" spacing={2}>
              <Tooltip title="Add New Product" arrow placement="top">
                <StyledButton
                  component={Link}
                  to="/products/new"
                  variant="contained"
                  color="primary"
                  startIcon={<Add />}
                >
                  Add New
                </StyledButton>
              </Tooltip>

              <Tooltip title="Add New Product" arrow placement="top">
                <StyledButton
                  component={Link}
                  to="/products/data-vis"
                  variant="contained"
                  color="primary"
                  startIcon={< AutoGraph />}
                >
                  Analyze Data
                </StyledButton>
              </Tooltip>
              
              <Tooltip title="Export Products to CSV" arrow placement="top">
                <StyledButton 
                  variant="outlined" 
                  color="primary" 
                  onClick={handleExportCsv}
                  startIcon={exportLoading ? <CircularProgress size={20} /> : <CloudDownload />}
                  disabled={exportLoading || products.length === 0}
                >
                  Export CSV
                </StyledButton>
              </Tooltip>
            </Stack>
          </Stack>
          
          <SearchBar onSearch={handleSearch} />
          
          {/* Bulk Import Section */}
          <AnimatedCard sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Upload fontSize="small" /> Bulk Import Products
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<UploadFile />}
                      color="secondary"
                    >
                      Select CSV File
                      <VisuallyHiddenInput 
                        id="csv-upload" 
                        type="file" 
                        accept=".csv" 
                        onChange={handleCsvFileChange} 
                      />
                    </Button>
                    
                    {csvFile && (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        gap: 1, 
                        py: 1, 
                        px: 2, 
                        bgcolor: 'action.hover', 
                        borderRadius: 2
                      }}>
                        <InsertDriveFile color="primary" fontSize="small" />
                        <Typography variant="body2" sx={{ fontWeight: 500, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {csvFile.name}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <StyledButton
                    variant="contained"
                    color="secondary"
                    onClick={handleBulkImport}
                    disabled={!csvFile || loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CloudUpload />}
                    fullWidth={false}
                  >
                    {loading ? 'Importing...' : 'Import Products'}
                  </StyledButton>
                </Grid>
                
                {importStatus && (
                  <Grid item xs={12}>
                    <Zoom in={importStatus !== null}>
                      <Alert severity={importStatus.success ? "success" : "error"} sx={{ mt: 1 }}>
                        {importStatus.message}
                        {importStatus.count && ` (${importStatus.count} products imported successfully)`}
                      </Alert>
                    </Zoom>
                    
                    {bulkImportErrors && bulkImportErrors.length > 0 && (
                      <Fade in={bulkImportErrors.length > 0}>
                        <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: 'rgba(244, 67, 54, 0.08)' }}>
                          <Typography variant="subtitle2" color="error" fontWeight={600}>
                            {bulkImportErrors.length} errors occurred:
                          </Typography>
                          <Box component="ul" sx={{ mt: 1, pl: 2, maxHeight: 120, overflowY: 'auto' }}>
                            {bulkImportErrors.map((error, index) => (
                              <Typography component="li" key={index} variant="body2">
                                {error.row ? `Row ${error.row}: ` : ''}{error.error || error.product}
                              </Typography>
                            ))}
                          </Box>
                        </Box>
                      </Fade>
                    )}
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </AnimatedCard>
          
          {loading && products.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
              <CircularProgress size={60} thickness={4} />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ my: 2 }} variant="filled">
              {error}
            </Alert>
          ) : products.length === 0 ? (
            <Card sx={{ py: 8 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  No products found
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  Try adjusting your search filters or add a new product.
                </Typography>
                <Button
                  component={Link}
                  to="/products/new"
                  variant="contained"
                  color="primary"
                  startIcon={<Add />}
                >
                  Add First Product
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Zoom in={!loading} style={{ transitionDelay: loading ? '0ms' : '300ms' }}>
              <Paper sx={{ width: '100%', borderRadius: 3, overflow: 'hidden' }} elevation={3}>
                <StyledTableContainer>
                  <Table stickyHeader aria-label="products table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Image</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>
                          <TableSortLabel
                            active={filters.sortBy === 'price'}
                            direction={filters.sortBy === 'price' ? filters.sortOrder : 'asc'}
                            onClick={() => handleSort('price')}
                          >
                            Price
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>
                          <TableSortLabel
                            active={filters.sortBy === 'quantity'}
                            direction={filters.sortBy === 'quantity' ? filters.sortOrder : 'asc'}
                            onClick={() => handleSort('quantity')}
                          >
                            Quantity
                          </TableSortLabel>
                        </TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {products.map((product) => (
                        <ProductItem
                          key={product.id}
                          product={product}
                          onDelete={handleDelete}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </StyledTableContainer>
                
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  component="div"
                  count={pagination.total}
                  rowsPerPage={pagination.limit}
                  page={pagination.page - 1} // Convert 1-indexed to 0-indexed for MUI
                  onPageChange={handlePageChange}
                  onRowsPerPageChange={handleRowsPerPageChange}
                />
              </Paper>
            </Zoom>
          )}
        </Box>
      </Fade>
    </Container>
  );
};

export default ProductList;