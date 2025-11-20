import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import './index.css';
import { ToastProvider } from './components/Toast';

const root = document.getElementById('root')!;
ReactDOM.createRoot(root).render(
  <StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>,
);
