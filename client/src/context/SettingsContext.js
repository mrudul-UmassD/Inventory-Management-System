import React, { createContext, useContext, useState } from 'react';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    const [lowStockThreshold, setLowStockThreshold] = useState(10);
    const [currency, setCurrency] = useState('$'); // Add currency state
    const [productName, setProductName] = useState('Inventory Management'); // Add currency state

    return (
        <SettingsContext.Provider value={{ lowStockThreshold, setLowStockThreshold, currency, setCurrency, productName, setProductName }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);
