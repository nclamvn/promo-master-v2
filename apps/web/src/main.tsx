import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App from './App';
import './styles/globals.css';

// ══════════════════════════════════════════════════════════════════════════════
// MOCK DATA CONFIGURATION
// Mocking is only enabled in development mode
// In production, always use real API
// ══════════════════════════════════════════════════════════════════════════════
const ENABLE_MOCKING = import.meta.env.DEV;

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: false, // Disable retry - use demo data on failure
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// Enable MSW mocking (only in development)
async function enableMocking() {
  // Only enable mocking in development mode
  // This check allows Vite to tree-shake the mock import in production
  if (import.meta.env.PROD) {
    return;
  }

  try {
    const { worker } = await import('./mocks/browser');
    await worker.start({
      onUnhandledRequest: 'bypass', // Don't warn about unhandled requests
    });
    console.log('[MSW] Mocking enabled ✅');
  } catch (error) {
    console.warn('[MSW] Failed to enable mocking:', error);
  }
}

// Start app with mocking
enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </React.StrictMode>
  );
});
