import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Forçar reload se versão mudar (evita cache)
const BUILD_VERSION = import.meta.env.VITE_BUILD_VERSION || Date.now();
const STORAGE_KEY = 'sloth_build_version';

// Verificar se a versão mudou
const storedVersion = localStorage.getItem(STORAGE_KEY);
if (storedVersion && storedVersion !== BUILD_VERSION) {
  console.log('🔄 Nova versão detectada! Limpando cache...');
  localStorage.clear();
  sessionStorage.clear();
  // Limpar cache do service worker se existir
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => caches.delete(name));
    });
  }
}

// Salvar versão atual
localStorage.setItem(STORAGE_KEY, BUILD_VERSION);
console.log('✅ Versão do build:', BUILD_VERSION);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

