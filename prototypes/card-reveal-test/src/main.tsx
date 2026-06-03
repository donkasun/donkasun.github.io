import React from 'react';
import { createRoot } from 'react-dom/client';
import { CardRevealTest } from './CardRevealTest';
import './styles.css';

function App() {
  return <CardRevealTest />;
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

