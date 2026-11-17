import React from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';
import App from './App.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import { SmoothScroll } from './components/SmoothScroll.jsx';
import './styles/global.css';
import './styles/responsive.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SmoothScroll>
      <ErrorBoundary><App /></ErrorBoundary>
      <Toaster
        position="bottom-right"
        theme="dark"
        toastOptions={{
          style: {
            background: '#14101e',
            border: '1px solid rgba(168,85,247,.35)',
            color: '#f4f4f2',
          },
        }}
      />
    </SmoothScroll>
  </React.StrictMode>
);
