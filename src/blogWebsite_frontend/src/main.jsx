import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.scss';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      //  staleTime: 1000 * 60 * 60, // 1 hour in ms
      //  cacheTime: 1000 * 60 * 60, // 1 hour in ms
      refetchOnWindowFocus: false, // Disables automatic refetching when the browser window is focused
    },
  },
});


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
