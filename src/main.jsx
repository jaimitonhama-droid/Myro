import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';
import './index.css';
import App      from './App.jsx';
import AdminApp from './admin/AdminApp.jsx';

// Regista o Service Worker para transformar o site numa PWA
registerSW({ immediate: true });

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Site público */}
        <Route path="/" element={<App />} />
        {/* Painel de administração */}
        <Route path="/admin/*" element={<AdminApp />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);

