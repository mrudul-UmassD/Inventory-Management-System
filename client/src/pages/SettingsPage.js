import React from 'react';
import { Container, Typography, TextField, Box, Button, useMediaQuery } from '@mui/material';
import { MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { useSettings } from '../context/SettingsContext';
import { Link } from 'react-router-dom';
import {
    ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';

const SettingsPage = () => {
    const { lowStockThreshold, setLowStockThreshold, currency, setCurrency, productName, setProductName } = useSettings();
    const isMobile = useMediaQuery('(max-width:600px)'); // Check if the screen width is less than 600px

    const handleSave = () => {
        alert('Settings saved successfully!');
    };

    const handleReset = () => {
        setLowStockThreshold(10); // Default low stock threshold
        setCurrency('$'); // Default currency
        setProductName('Inventora'); // Default product name
        alert('Settings reset to default values!');
    };

    return (
        <Container maxWidth="sm" sx={{ py: 4 }}>
            
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
                Settings
            </Typography>
            <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Low Stock Threshold
                </Typography>
                <TextField
                    type="number"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(parseInt(e.target.value) || 0)}
                    label="Low Stock Quantity"
                    fullWidth
                    variant="outlined"
                    sx={{ mb: 3 }}
                />
                <Typography variant="h6" gutterBottom>
                    Currency
                </Typography>
                <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel id="currency-label">Currency</InputLabel>
                    <Select
                        labelId="currency-label"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        label="Currency"
                    >
                        <MenuItem value="$">USD ($)</MenuItem>
                        <MenuItem value="€">Euro (€)</MenuItem>
                        <MenuItem value="£">Pound (£)</MenuItem>
                        <MenuItem value="₹">Rupee (₹)</MenuItem>
                    </Select>
                </FormControl>
                <Typography variant="h6" gutterBottom>
                    Set Product Name
                </Typography>
                <TextField
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    label="Product Name"
                    fullWidth
                    variant="outlined"
                    sx={{ mb: 3 }}
                />
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        gap: 2,
                    }}
                >
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSave}
                        fullWidth={isMobile}
                    >
                        Save Settings
                    </Button>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={handleReset}
                        fullWidth={isMobile}
                    >
                        Reset to Default
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default SettingsPage;