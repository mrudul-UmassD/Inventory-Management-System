import React from 'react';
import { Link } from 'react-router-dom';
import { 
  TableRow, 
  TableCell, 
  IconButton, 
  Avatar,
  Box,
  Tooltip,
  Zoom,
  Typography,
  styled
} from '@mui/material';
import { 
  Visibility, 
  Edit, 
  Delete, 
  CheckCircle, 
  Warning, 
  Error 
} from '@mui/icons-material';
import { useSettings } from '../context/SettingsContext';

// Styled components for animations and effects
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  transition: 'all 0.2s',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    transform: 'translateY(-1px)',
    boxShadow: '0 3px 5px 0 rgba(0, 0, 0, 0.05)',
  },
}));

const ActionIconButton = styled(IconButton)(({ theme }) => ({
  transition: 'all 0.2s',
  margin: theme.spacing(0.5),
  '&:hover': {
    transform: 'scale(1.1)',
  },
}));

const ProductImage = styled(Avatar)(({ theme }) => ({
  width: 60,
  height: 60,
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  border: '1px solid rgba(0, 0, 0, 0.08)',
  transition: 'transform 0.2s',
  objectFit: 'contain',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const ProductItem = ({ product, onDelete }) => {
  const { lowStockThreshold, currency } = useSettings(); // Access currency

  const handleDelete = (e) => {
    e.preventDefault();
    if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
      onDelete(product.id);
    }
  };

  // Default image if no product image is available
  const defaultImage = "https://via.placeholder.com/60x60?text=No+Image";
  
  // Quantity status configuration
  const getQuantityStatus = (qty) => {
    if (qty > lowStockThreshold) {
      return {
        icon: <CheckCircle fontSize="small" />,
        label: 'In Stock',
        color: '#4caf50',
        bgColor: '#e8f5e9'
      };
    } else if (qty > 0) {
      return {
        icon: <Warning fontSize="small" />,
        label: 'Low Stock',
        color: '#ff9800',
        bgColor: '#fff3e0'
      };
    } else {
      return {
        icon: <Error fontSize="small" />,
        label: 'Out of Stock',
        color: '#f44336',
        bgColor: '#ffebee'
      };
    }
  };
  
  const quantityStatus = getQuantityStatus(product.quantity);

  return (
    <StyledTableRow>
      <TableCell>
        <ProductImage 
          src={product.image_url || defaultImage}
          alt={product.name}
          variant="square"
        />
      </TableCell>
      <TableCell>
        <Typography variant="subtitle2" fontWeight={600} component="div" noWrap>
          {product.name}
        </Typography>
        {product.description && (
          <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 250 }}>
            {product.description.length > 40 
              ? `${product.description.substring(0, 40)}...` 
              : product.description}
          </Typography>
        )}
      </TableCell>
      <TableCell>
        {product.category || 
          <Typography variant="body2" color="text.secondary">N/A</Typography>
        }
      </TableCell>
      <TableCell>
        <Typography fontWeight={600} color="primary.main">
          {currency}{product.price.toFixed(2)} {/* Use currency */}
        </Typography>
      </TableCell>
      <TableCell>
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          px: 1.5, 
          py: 0.75, 
          borderRadius: 2,
          backgroundColor: quantityStatus.bgColor,
          color: quantityStatus.color,
          width: 'fit-content'
        }}>
          {quantityStatus.icon}
          <Typography variant="body2" fontWeight={600}>
            {product.quantity}
          </Typography>
        </Box>
      </TableCell>
      <TableCell align="right">
        <Box>
          <Tooltip title="View Details" arrow TransitionComponent={Zoom} placement="top">
            <ActionIconButton 
              component={Link} 
              to={`/products/${product.id}`}
              color="info"
              size="small"
            >
              <Visibility fontSize="small" />
            </ActionIconButton>
          </Tooltip>
          
          <Tooltip title="Edit Product" arrow TransitionComponent={Zoom} placement="top">
            <ActionIconButton 
              component={Link} 
              to={`/products/edit/${product.id}`}
              color="primary"
              size="small"
            >
              <Edit fontSize="small" />
            </ActionIconButton>
          </Tooltip>
          
          <Tooltip title="Delete Product" arrow TransitionComponent={Zoom} placement="top">
            <ActionIconButton 
              onClick={handleDelete}
              color="error"
              size="small"
            >
              <Delete fontSize="small" />
            </ActionIconButton>
          </Tooltip>
        </Box>
      </TableCell>
    </StyledTableRow>
  );
};

export default ProductItem;