import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Grid,
  Button,
  Box,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Fade,
  Zoom,
  styled,
  Stack,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Category as CategoryIcon,
  ShoppingCart as ShoppingCartIcon,
  CalendarToday as CalendarIcon,
  Info as InfoIcon
} from '@mui/icons-material';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    boxShadow: '0 6px 25px rgba(0, 0, 0, 0.12)',
  }
}));

const ProductImage = styled(CardMedia)(({ theme }) => ({
  height: '100%',
  minHeight: 450,
  objectFit: 'contain',
  backgroundColor: 'rgba(0, 0, 0, 0.01)',
  borderRight: '1px solid rgba(0, 0, 0, 0.06)',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.02)',
  }
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  }
}));

const InfoItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2)
}));

const StatsChip = styled(Chip)(({ theme }) => ({
  fontWeight: 600,
  paddingLeft: theme.spacing(0.5),
  paddingRight: theme.spacing(0.5),
  borderRadius: theme.shape.borderRadius,
  height: 'auto',
  '& .MuiChip-label': {
    paddingTop: 4,
    paddingBottom: 4
  }
}));

const ProductDetail = () => {
  const theme = useTheme();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
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

  const handleDeleteClick = () => {
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`/api/products/${id}`);
      setOpenDialog(false);
      navigate('/');
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Failed to delete product. Please try again.');
    }
  };

  // Default image if no product image is available
  const defaultImage = "https://placehold.co/400x300?text=No+Image+Available";

  // Quantity status configuration
  const getQuantityStatus = (qty) => {
    if (qty > 10) {
      return {
        label: 'In Stock',
        color: 'success',
        icon: <InfoIcon fontSize="small" />,
        description: 'Ready for order'
      };
    } else if (qty > 0) {
      return {
        label: 'Low Stock',
        color: 'warning',
        icon: <InfoIcon fontSize="small" />,
        description: 'Order soon, limited availability'
      };
    } else {
      return {
        label: 'Out of Stock',
        color: 'error',
        icon: <InfoIcon fontSize="small" />,
        description: 'Currently unavailable'
      };
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="body1" color="text.secondary">
          Loading product details...
        </Typography>
      </Box>
    );
  }

  if (error || !product) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4, mb: 2 }}>
          <Button
            component={Link}
            to="/"
            startIcon={<ArrowBackIcon />}
            variant="outlined"
            sx={{ mb: 2 }}
          >
            Back to Products
          </Button>
        </Box>
        <Alert severity="error" sx={{ my: 3 }} variant="filled">
          {error || 'Product not found'}
        </Alert>
      </Container>
    );
  }

  const quantityStatus = getQuantityStatus(product.quantity);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Fade in={true} timeout={600}>
        <Box>
          <Box sx={{ mb: 3 }}>
            <Button
              component={Link}
              to="/"
              startIcon={<ArrowBackIcon />}
              variant="outlined"
              sx={{ mb: 3 }}
            >
              Back to Products
            </Button>
            
            <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
              Product Details
            </Typography>
          </Box>
          
          <StyledCard elevation={3}>
            <Grid container>
              {/* Product Image */}
              <Grid item size={6} xs={12} md={6} sx={{ position: 'relative' }}>
                <ProductImage
                  component="img"
                  image={product.image_url || defaultImage}
                  alt={product.name}
                />
                {product.category && (
                  <Chip 
                    label={product.category}
                    color="primary"
                    size="small"
                    variant="filled"
                    sx={{ 
                      position: 'absolute', 
                      top: 16, 
                      left: 16,
                      fontWeight: 600,
                      px: 1
                    }}
                  />
                )}
              </Grid>
              
              {/* Product Details */}
              <Grid item xs={12} md={6}>
                <CardContent sx={{ height: '100%', p: 4, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h4" component="h2" gutterBottom fontWeight={700}>
                        {product.name}
                      </Typography>
                      
                      <Typography 
                        variant="h5" 
                        color="primary.main" 
                        fontWeight={700} 
                        sx={{ 
                          display: 'inline-flex',
                          alignItems: 'center',
                          bgcolor: 'primary.main + 10',
                          px: 2,
                          py: 1,
                          borderRadius: 2
                        }}
                      >
                        ${product.price.toFixed(2)}
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ mb: 3 }} />
                    
                    {/* Product Attributes */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={12} sm={6}>
                        <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', borderRadius: theme.shape.borderRadius * 1.5 }}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <CategoryIcon color="primary" />
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Category
                              </Typography>
                              <Typography variant="body1" fontWeight={600}>
                                {product.category || 'Uncategorized'}
                              </Typography>
                            </Box>
                          </Stack>
                        </Paper>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', borderRadius: theme.shape.borderRadius * 1.5 }}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <ShoppingCartIcon color={quantityStatus.color} />
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Inventory Status
                              </Typography>
                              <Typography variant="body1" fontWeight={600}>
                                {product.quantity} units 
                                <StatsChip
                                  size="small"
                                  label={quantityStatus.label}
                                  color={quantityStatus.color}
                                  sx={{ ml: 1 }}
                                />
                              </Typography>
                            </Box>
                          </Stack>
                        </Paper>
                      </Grid>
                    </Grid>
                    
                    {/* Product Description */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" gutterBottom fontWeight={600}>
                        Description
                      </Typography>
                      <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line', color: 'text.secondary' }}>
                        {product.description || 'No description available for this product.'}
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ mb: 2 }} />
                    
                    {/* Timestamps */}
                    <Grid container spacing={1} sx={{ mb: 3 }}>
                      <Grid item xs={6}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <CalendarIcon fontSize="small" color="action" />
                          <Typography variant="caption" color="text.secondary">
                            Created: {new Date(product.created_at).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric'
                            })}
                          </Typography>
                        </Stack>
                      </Grid>
                      <Grid item xs={6}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <CalendarIcon fontSize="small" color="action" />
                          <Typography variant="caption" color="text.secondary">
                            Updated: {new Date(product.updated_at).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric'
                            })}
                          </Typography>
                        </Stack>
                      </Grid>
                    </Grid>
                  </Box>
                  
                  {/* Actions */}
                  <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                    <ActionButton
                      component={Link}
                      to={`/products/edit/${product.id}`}
                      variant="contained"
                      color="primary"
                      startIcon={<EditIcon />}
                      fullWidth
                    >
                      Edit Product
                    </ActionButton>
                    
                    <ActionButton
                      onClick={handleDeleteClick}
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      fullWidth
                    >
                      Delete
                    </ActionButton>
                  </Box>
                </CardContent>
              </Grid>
            </Grid>
          </StyledCard>
          
          {/* Delete Confirmation Dialog */}
          <Dialog
            open={openDialog}
            onClose={handleDialogClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            PaperProps={{
              elevation: 3,
              sx: { borderRadius: theme.shape.borderRadius * 1.5 }
            }}
          >
            <DialogTitle id="alert-dialog-title" sx={{ pb: 1 }}>
              <Typography variant="h6" fontWeight={600} color="error">Delete Product</Typography>
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                Are you sure you want to delete "{product.name}"? This action cannot be undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={handleDialogClose} variant="outlined">
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmDelete} 
                color="error" 
                variant="contained"
                startIcon={<DeleteIcon />}
                autoFocus
              >
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Fade>
    </Container>
  );
};

export default ProductDetail;