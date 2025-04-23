import React from 'react';
import { Box, Typography, Container, Link } from '@mui/material';
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
                    © {new Date().getFullYear()} {productName}. All rights reserved.
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                    <Link href="/privacy-policy" color="inherit" underline="hover">
                        Privacy Policy
                    </Link>{' '}
                    |{' '}
                    <Link href="/terms-of-service" color="inherit" underline="hover">
                        Terms of Service
                    </Link>
                </Typography>
            </Container>
        </Box>
    );
};

export default Footer;
