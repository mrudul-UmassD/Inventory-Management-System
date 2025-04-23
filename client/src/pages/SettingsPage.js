import React from 'react';
import { Container, Typography, TextField, Box, Button } from '@mui/material';
import { useSettings } from '../context/SettingsContext';

const SettingsPage = () => {
  const { lowStockThreshold, setLowStockThreshold } = useSettings();

  const handleSave = () => {
    alert('Settings saved successfully!');
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
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
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
        >
          Save Settings
        </Button>
      </Box>
    </Container>
  );
};

export default SettingsPage;