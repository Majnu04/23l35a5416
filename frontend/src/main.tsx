import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { logInfo, logError } from './loggerClient'

// Log application initialization
logInfo('app', 'React application initializing', {
  mode: 'StrictMode',
  environment: import.meta.env.MODE,
  timestamp: new Date().toISOString()
});

try {
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  logInfo('app', 'Creating React root element');
  
  createRoot(rootElement).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>,
  );

  logInfo('app', 'React application rendered successfully');
} catch (error) {
  logError('app', 'Failed to initialize React application', {
    error: error instanceof Error ? error.message : 'Unknown error'
  });
  throw error;
}
