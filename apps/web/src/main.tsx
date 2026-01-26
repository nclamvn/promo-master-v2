import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App from './App';
import './styles/globals.css';

// ══════════════════════════════════════════════════════════════════════════════
// MOCK DATA CONFIGURATION
// Set to true to use mock data (no backend needed)
// Set to false to use real API
// ══════════════════════════════════════════════════════════════════════════════
const ENABLE_MOCKING = true;

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

// Enable MSW mocking in development
async function enableMocking() {
  if (import.meta.env.PROD || !ENABLE_MOCKING) {
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
