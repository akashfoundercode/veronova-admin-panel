import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { FarmProvider } from './context/FarmContext';
import { AppRoutes } from './routes/AppRoutes';
import { DemoDrawer } from './components/common/DemoDrawer';

export const App = () => {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <FarmProvider>
            <div className="font-sans antialiased text-ink min-h-screen">
              <AppRoutes />
              <DemoDrawer />
            </div>
          </FarmProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
};

export default App;
