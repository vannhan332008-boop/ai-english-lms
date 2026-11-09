import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/ui/Toast';
import { RoleProvider } from './context/RoleContext';
import { TenantThemeProvider } from './context/TenantThemeContext';
import { PwaInstallPrompt } from './components/common/PwaInstallPrompt';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { AppRoutes } from './routes';

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <TenantThemeProvider>
            <RoleProvider>
              <BrowserRouter>
                <AppRoutes />
                <PwaInstallPrompt />
              </BrowserRouter>
            </RoleProvider>
          </TenantThemeProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
