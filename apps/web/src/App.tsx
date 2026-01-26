import { BrowserRouter } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import AppRouter from './router';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppRouter />
        <Toaster />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
