
import React from 'react';
import { createRoot } from 'react-dom/client';
import './app.css';
// Included in the entry stylesheet so prerendered city pages also work without JavaScript.
import './pages/CityPage.css';
import App from './App.tsx';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Always do a client mount to avoid hydration mismatch crashes from prerendered HTML.
rootElement.innerHTML = '';
rootElement.removeAttribute('data-static-page');
const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
