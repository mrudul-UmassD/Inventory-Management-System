import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Paper,
  Divider,
  CircularProgress,
  Alert,
  Stack,
  styled,
  Card,
  CardContent,
  Fade,
  Chip,
  Tooltip,
  InputAdornment
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  AddPhotoAlternate as AddPhotoIcon,
  ArrowBack as ArrowBackIcon,
  AttachMoney
} from '@mui/icons-material';

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  marginBottom: theme.spacing(4)
}));

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

const ImagePreviewContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  height: 280,
  borderRadius: theme.shape.borderRadius,
  border: '1px dashed #cccccc',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: 'rgba(0, 0, 0, 0.02)',
}));

const ImagePreview = styled('img')({
  maxWidth: '100%',
  maxHeight: '100%',
  objectFit: 'contain',
});

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1.2, 3),
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
}));

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    quantity: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

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

    // If in edit mode, fetch the product data
    if (isEditMode) {
      const fetchProduct = async () => {
        try {
          const res = await axios.get(`/api/products/${id}`);
          const { name, description, category, price, quantity, image_url } = res.data;
          
          setFormData({
            name,
            description: description || '',
            category: category || '',
            price: price.toString(),
            quantity: quantity.toString(),
            image: null
          });
          
          // Set image preview if product has an image
          if (image_url) {
            setImagePreview(image_url);
          }
          
          setError(null);
        } catch (err) {
          console.error('Error fetching product:', err);
          setError('Failed to load product data. Please try again.');
        } finally {
          setInitialLoading(false);
        }
      };

      fetchProduct();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prevState => ({
        ...prevState,
        image: file
      }));

      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setFormData(prevState => ({
      ...prevState,
      image: null
    }));
    setImagePreview(null);
    // Reset the file input
    const fileInput = document.getElementById('image-upload');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate data
      if (!formData.name || !formData.price || !formData.quantity) {
        setError('Name, price, and quantity are required fields.');
        setLoading(false);
        return;
      }

      // Create FormData object for file upload
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category);
      submitData.append('price', parseFloat(formData.price));
      submitData.append('quantity', parseInt(formData.quantity));
      
      // Only append image if a new one was selected
      if (formData.image) {
        submitData.append('image', formData.image);
      }

      let response;
      if (isEditMode) {
        response = await axios.put(`/api/products/${id}`, submitData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setSuccess('Product updated successfully!');
      } else {
        response = await axios.post('/api/products', submitData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setSuccess('Product created successfully!');
      }

      setTimeout(() => {
        navigate(`/products/${response.data.id}`);
      }, 2000);
    } catch (err) {
      console.error('Error saving product:', err);
      setError(err.response?.data?.error || 'Failed to save product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
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
          Loading product data...
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Fade in={true} timeout={600}>
        <Box>
          <Box sx={{ mb: 4 }}>
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
              {isEditMode ? 'Edit Product' : 'Add New Product'}
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              {isEditMode 
                ? 'Update the product information below' 
                : 'Fill in the details to add a new product to inventory'}
            </Typography>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} variant="filled">
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 3 }} variant="filled">
              {success}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <StyledPaper elevation={3}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Basic Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Product Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    variant="outlined"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="category-label">Category</InputLabel>
                    <Select
                      labelId="category-label"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      label="Category"
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {categories.map((category, index) => (
                        <MenuItem key={index} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AttachMoney fontSize="small" />
                        </InputAdornment>
                      ),
                      inputProps: { step: "0.01", min: 0 }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Quantity"
                    name="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={handleChange}
                    variant="outlined"
                    InputProps={{
                      inputProps: { min: 0 }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    multiline
                    rows={4}
                    variant="outlined"
                    placeholder="Enter product details, features, specifications, etc."
                  />
                </Grid>
              </Grid>
            </StyledPaper>
            
            <StyledPaper elevation={3}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Product Image
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                </Grid>
                
                <Grid item xs={12}>
                  <ImagePreviewContainer>
                    {imagePreview ? (
                      <ImagePreview
                        src={imagePreview}
                        alt="Product preview"
                      />
                    ) : (
                      <Box sx={{ textAlign: 'center', p: 2 }}>
                        <AddPhotoIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="body1" color="text.secondary">
                          No image selected
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Recommended size: 800x600 pixels
                        </Typography>
                      </Box>
                    )}
                  </ImagePreviewContainer>
                  
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
                    <Button
                      component="label"
                      variant="contained"
                      startIcon={<AddPhotoIcon />}
                      color="secondary"
                    >
                      {imagePreview ? 'Change Image' : 'Upload Image'}
                      <VisuallyHiddenInput
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </Button>
                    
                    {imagePreview && (
                      <Button variant="outlined" color="error" onClick={clearImage}>
                        Remove Image
                      </Button>
                    )}
                    
                    <Chip 
                      label="Max file size: 5MB" 
                      variant="outlined" 
                      size="small" 
                      color="default"
                      sx={{ ml: 'auto !important' }}
                    />
                  </Stack>
                </Grid>
              </Grid>
            </StyledPaper>
            
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
              <ActionButton
                component={Link}
                to="/"
                color="secondary"
                variant="outlined"
                startIcon={<CancelIcon />}
              >
                Cancel
              </ActionButton>
              
              <ActionButton
                type="submit"
                color="primary"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              >
                {loading ? 'Saving...' : isEditMode ? 'Update Product' : 'Create Product'}
              </ActionButton>
            </Box>
          </form>
        </Box>
      </Fade>
    </Container>
  );
};

export default ProductForm;