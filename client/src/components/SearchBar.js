import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  TextField, 
  MenuItem, 
  Grid, 
  Button, 
  Typography, 
  Card, 
  CardContent,
  Slider,
  Box,
  FormControl,
  InputLabel,
  Select,
  IconButton,
  Collapse,
  Chip,
  Stack,
  Fade,
  InputAdornment,
  Divider,
  styled
} from '@mui/material';
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  Search,
  FilterList,
  Clear,
  SortByAlpha,
  AttachMoney,
  CalendarMonth
} from '@mui/icons-material';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  transition: 'all 0.3s ease',
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'visible',
  marginBottom: theme.spacing(4)
}));

const ExpandButton = styled(IconButton)(({ theme }) => ({
  transition: 'all 0.3s ease',
  backgroundColor: theme.palette.primary.main + '10',
  '&:hover': {
    backgroundColor: theme.palette.primary.main + '20',
  },
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transform: 'translateY(-1px)'
  }
}));

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [minQuantity, setMinQuantity] = useState('');
  const [maxQuantity, setMaxQuantity] = useState('');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);

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

  useEffect(() => {
    // Update active filters display
    const newFilters = [];
    
    if (searchTerm) newFilters.push({ label: `Search: ${searchTerm}`, key: 'searchTerm' });
    if (category) newFilters.push({ label: `Category: ${category}`, key: 'category' });
    if (minQuantity) newFilters.push({ label: `Min Qty: ${minQuantity}`, key: 'minQuantity' });
    if (maxQuantity) newFilters.push({ label: `Max Qty: ${maxQuantity}`, key: 'maxQuantity' });
    if (priceRange[0] > 0) newFilters.push({ label: `Min Price: $${priceRange[0]}`, key: 'minPrice' });
    if (priceRange[1] < 1000) newFilters.push({ label: `Max Price: $${priceRange[1]}`, key: 'maxPrice' });
    if (fromDate) newFilters.push({ label: `From: ${fromDate}`, key: 'fromDate' });
    if (toDate) newFilters.push({ label: `To: ${toDate}`, key: 'toDate' });
    if (sortBy !== 'name' || sortOrder !== 'asc') {
      newFilters.push({ 
        label: `Sort: ${sortBy.charAt(0).toUpperCase() + sortBy.slice(1)} (${sortOrder === 'asc' ? '↑' : '↓'})`, 
        key: 'sort' 
      });
    }
    
    setActiveFilters(newFilters);
  }, [searchTerm, category, minQuantity, maxQuantity, priceRange, sortBy, sortOrder, fromDate, toDate]);

  const handlePriceChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const filters = {
      name: searchTerm, 
      category, 
      minQuantity: minQuantity || undefined, 
      maxQuantity: maxQuantity || undefined,
      minPrice: priceRange[0] || undefined,
      maxPrice: priceRange[1] || undefined,
      sortBy,
      sortOrder,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined
    };
    
    onSearch(filters);
  };

  const handleReset = () => {
    setSearchTerm('');
    setCategory('');
    setMinQuantity('');
    setMaxQuantity('');
    setPriceRange([0, 1000]);
    setSortBy('name');
    setSortOrder('asc');
    setFromDate('');
    setToDate('');
    
    onSearch({
      sortBy: 'name',
      sortOrder: 'asc'
    });
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const handleRemoveFilter = (key) => {
    switch(key) {
      case 'searchTerm': 
        setSearchTerm('');
        break;
      case 'category':
        setCategory('');
        break;
      case 'minQuantity':
        setMinQuantity('');
        break;
      case 'maxQuantity':
        setMaxQuantity('');
        break;
      case 'minPrice':
        setPriceRange([0, priceRange[1]]);
        break;
      case 'maxPrice':
        setPriceRange([priceRange[0], 1000]);
        break;
      case 'fromDate':
        setFromDate('');
        break;
      case 'toDate':
        setToDate('');
        break;
      case 'sort':
        setSortBy('name');
        setSortOrder('asc');
        break;
      default:
        break;
    }
  };

  return (
    <StyledCard elevation={2}>
      <CardContent>
        <form onSubmit={handleSubmit}>
          {/* Basic Search */}
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                variant="outlined"
                label="Search by product name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Search color="action" /></InputAdornment>,
                  sx: { borderRadius: 2 }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  id="category"
                  value={category}
                  label="Category"
                  onChange={(e) => setCategory(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((cat, index) => (
                    <MenuItem key={index} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  type="submit" 
                  sx={{ 
                    borderRadius: 2,
                    flex: 1,
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 4
                    }
                  }}
                  startIcon={<Search />}
                >
                  Search
                </Button>
                
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  onClick={handleReset}
                  sx={{ 
                    borderRadius: 2,
                    transition: 'all 0.2s'
                  }}
                  startIcon={<Clear />}
                >
                  Reset
                </Button>
                
                <ExpandButton onClick={toggleExpanded} color="primary" size="small">
                  <FilterList />
                  {expanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                </ExpandButton>
              </Box>
            </Grid>
            
            {/* Active Filters */}
            {activeFilters.length > 0 && (
              <Grid item xs={12}>
                <Fade in={activeFilters.length > 0}>
                  <Box sx={{ mt: 1 }}>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mr: 1 }}>
                        Active filters:
                      </Typography>
                      {activeFilters.map((filter, index) => (
                        <StyledChip
                          key={index}
                          label={filter.label}
                          size="small"
                          onDelete={() => handleRemoveFilter(filter.key)}
                          color={filter.key === 'sort' ? 'primary' : 'default'}
                          variant={filter.key === 'sort' ? 'outlined' : 'filled'}
                        />
                      ))}
                    </Stack>
                  </Box>
                </Fade>
              </Grid>
            )}
          </Grid>
          
          {/* Advanced Search Options */}
          <Collapse in={expanded}>
            <Box sx={{ mt: 3 }}>
              <Divider sx={{ mb: 2 }}>
                <Chip icon={<FilterList />} label="Advanced Filters" />
              </Divider>
              
              <Grid container spacing={3}>
                {/* Quantity Range */}
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Min Quantity"
                    variant="outlined"
                    value={minQuantity}
                    onChange={(e) => setMinQuantity(e.target.value)}
                    inputProps={{ min: 0 }}
                    sx={{ borderRadius: 2 }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Max Quantity"
                    variant="outlined"
                    value={maxQuantity}
                    onChange={(e) => setMaxQuantity(e.target.value)}
                    inputProps={{ min: 0 }}
                    sx={{ borderRadius: 2 }}
                  />
                </Grid>
                
                {/* Date Range */}
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    id="fromDate"
                    label="From Date"
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ borderRadius: 2 }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><CalendarMonth fontSize="small" /></InputAdornment>
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    id="toDate"
                    label="To Date"
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ borderRadius: 2 }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><CalendarMonth fontSize="small" /></InputAdornment>
                    }}
                  />
                </Grid>
                
                {/* Price Range Slider */}
                <Grid item xs={12}>
                  <Box sx={{ px: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        <AttachMoney fontSize="small" /> Price Range
                      </Typography>
                      <Typography variant="body2">
                        ${priceRange[0]} - ${priceRange[1]}
                      </Typography>
                    </Box>
                    <Slider
                      value={priceRange}
                      onChange={handlePriceChange}
                      valueLabelDisplay="auto"
                      min={0}
                      max={1000}
                      step={10}
                    />
                  </Box>
                </Grid>
                
                {/* Sorting Options */}
                <Grid item xs={12}>
                  <Divider sx={{ mb: 2 }}>
                    <Chip icon={<SortByAlpha />} label="Sorting Options" />
                  </Divider>
                </Grid>
                
                <Grid item xs={12} sm={6} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id="sortby-label">Sort By</InputLabel>
                    <Select
                      labelId="sortby-label"
                      id="sortBy"
                      value={sortBy}
                      label="Sort By"
                      onChange={(e) => setSortBy(e.target.value)}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="name">Name</MenuItem>
                      <MenuItem value="price">Price</MenuItem>
                      <MenuItem value="quantity">Quantity</MenuItem>
                      <MenuItem value="created_at">Date Created</MenuItem>
                      <MenuItem value="category">Category</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id="order-label">Sort Order</InputLabel>
                    <Select
                      labelId="order-label"
                      id="sortOrder"
                      value={sortOrder}
                      label="Sort Order"
                      onChange={(e) => setSortOrder(e.target.value)}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="asc">Ascending</MenuItem>
                      <MenuItem value="desc">Descending</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        </form>
      </CardContent>
    </StyledCard>
  );
};

export default SearchBar;