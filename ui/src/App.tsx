import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FileManagerProvider } from './contexts/FileManagerContext';
import { ToastProvider } from './contexts/ToastContext';
import { MainLayout } from './layouts/MainLayout';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <FileManagerProvider>
          <Router>
            <Routes>
              <Route path="/*" element={<MainLayout />} />
            </Routes>
          </Router>
        </FileManagerProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;