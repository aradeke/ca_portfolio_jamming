import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/globals.css';

console.log('index.tsx loaded'); // <- Testlog


const rootContainer = document.getElementById('root') as HTMLElement;
if (!rootContainer) {
  throw new Error("Root element with id 'root' not found. Check public/index.html");
}
const root =  createRoot(rootContainer)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
