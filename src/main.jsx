import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Pokedex from './components/Pokedex.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Pokedex />
  </StrictMode>,
);
