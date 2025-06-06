import React from 'react';
import { Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Add as AddIcon, Inventory as InventoryIcon, Settings as SettingsIcon } from '@mui/icons-material';
import { useSettings } from '../context/SettingsContext';

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { productName } = useSettings(); // Access product name

  return (
    <AppBar position="static" elevation={3} sx={{ 
      backgroundColor: 'white', 
      marginBottom: 4,
      borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
    }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
            <InventoryIcon sx={{ 
              color: theme.palette.primary.main,
              mr: 1,
              fontSize: isMobile ? '1.8rem' : '2.2rem'
            }} />
            <Typography
              variant={isMobile ? "h6" : "h5"}
              noWrap
              component="div"
              sx={{
                fontWeight: 700,
                letterSpacing: '.1rem',
                color: theme.palette.primary.main,
                textDecoration: 'none',
                display: 'inline-flex'
              }}
            >
              {productName} {/* Use product name */}
            </Typography>
          </Link>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              component={Link}
              to="/settings"
              variant="outlined"
              startIcon={<SettingsIcon />}
              sx={{
                fontWeight: 600,
                boxShadow: 1,
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 3,
                }
              }}
            >
              Settings
            </Button>
            <Button
              component={Link}
              to="/products/new"
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                fontWeight: 600,
                boxShadow: 2,
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4,
                }
              }}
            >
              {isMobile ? 'Add' : 'Add Product'}
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;