import React, { createContext, useContext, useState } from 'react';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [lowStockThreshold, setLowStockThreshold] = useState(10);

  return (
    <SettingsContext.Provider value={{ lowStockThreshold, setLowStockThreshold }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
