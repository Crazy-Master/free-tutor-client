import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './store/auth';
import './index.css';
import App from './App.tsx';
import { ThemeProvider } from './lib/theme';
import { UserProvider } from "./store/user";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
  <BrowserRouter>
    <AuthProvider>
      <ThemeProvider>
        <UserProvider>
        <App />
        </UserProvider>
      </ThemeProvider>
    </AuthProvider>
  </BrowserRouter>
</StrictMode>
);
