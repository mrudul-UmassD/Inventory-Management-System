import React from 'react';
import { Box, Typography, Container, Link, Divider } from '@mui/material';
import { useSettings } from '../context/SettingsContext';

const Footer = () => {
    const { productName } = useSettings(); // Access product name

    return (
        <Box
            component="footer"
            sx={{
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                py: 3,
                mt: 4,
                borderTop: '1px solid rgba(0, 0, 0, 0.12)',
            }}
        >
            <Container maxWidth="lg">
                <Typography variant="body2" color="text.secondary" align="center">
                 Product: {productName}. 
                 <Divider sx={{ my: 2 }} />
                 Developed by: Aditya Sahu and Mrudul Panchal.
                </Typography>
            </Container>
        </Box>
    );
};

export default Footer;
