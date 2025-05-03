// src/index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, createRoutesFromChildren, matchRoutes } from 'react-router-dom';
import './styles/App.css';
import App from './components/App';

const router = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
};

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <BrowserRouter {...router}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);