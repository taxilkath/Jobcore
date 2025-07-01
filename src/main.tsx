import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { StagewiseToolbar } from '@stagewise/toolbar-react';
import { ReactPlugin } from '@stagewise-plugins/react';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <StagewiseToolbar config={{ plugins: [ReactPlugin] }} />
    <App />
  </BrowserRouter>
);
